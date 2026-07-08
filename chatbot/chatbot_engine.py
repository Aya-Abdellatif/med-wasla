# -*- coding: utf-8 -*-

import re

from core.router import keyword_route

from core.loader import initialize_model
from core.classifier import classify_question

from preprocessing.gibberish import is_gibberish
from preprocessing.spell_checker import clean_query
from preprocessing.sensitive_guard import is_sensitive_request, REFUSAL_MESSAGE
from preprocessing.write_action_guard import (
    get_requested_action,
    get_requested_info,
    build_action_guard_message,
    is_unrecognized_offer_confirmation,
    GENERIC_NO_ACTION_MESSAGE
)

from memory.memory import add_message, get_history
from memory.chitchat import get_chitchat_response
from memory.session import (
    get_user,
    set_last_specialist_name,
    get_last_specialist_name,
    mark_offer_fulfilled,
    get_fulfilled_offers
)

from core.retrieval import retrieve_documents
from core.prompt_builder import (
    build_combined_prompt,
    build_chitchat_prompt,
    build_database_prompt
)
from core.ollama_client import generate_response

from database.services.chatbot_service import get_user_context
from database.services.database_classifier import extract_specialization
from database.services.database_formatter import _format_slots, _safe_date
from database.collections.specialist_queries import (
    get_specialist_by_name,
    get_specialists_by_specialization
)
from database.collections.appointment_queries import get_patient_upcoming_appointments

from config import SIMILARITY_THRESHOLD, ENABLE_DATABASE

# The only three next-step offers WaslaBot can actually follow through
# on (see prompt_builder.build_database_prompt rule 8). Rebuilding this
# line ourselves — instead of trusting the small local model to phrase
# and format it correctly every time — guarantees it always starts
# with "- " (so the frontend highlights it like every other follow-up
# question) and is never repeated once fulfilled.
#
# NOTE: deliberately avoid the words "profile"/"phone number"/
# "address"/"photo" here — those are the exact trigger words
# write_action_guard._OFFERED_ACTION_PATTERNS["profile"] looks for in
# WaslaBot's own last message, so a "more details about X's profile?"
# offer would make the guard mistake the user's next "yes" for
# confirming a profile *update* instead of an info lookup.
_OFFER_TEMPLATES = {
    "more_details": "Would you like more details about {name}?",
    "available_times": "Would you like to know {name}'s available appointment times?",
    "book": "Would you like the steps to book an appointment with {name}?",
}
_OFFER_ORDER = ["more_details", "available_times", "book"]

# Strips whatever offer-shaped line the LLM tried to end its answer
# with (correctly "- "-prefixed or not), so it can be replaced with the
# deterministic one below instead of ending up duplicated or malformed.
_TRAILING_OFFER_LINE_RE = re.compile(
    r"\n*[-•\s]*\b(would you like|do you want)\b[^\n]*\?\s*$",
    re.IGNORECASE
)


def _display_name(name):
    return name if re.match(r"^dr\.?\s", name, re.IGNORECASE) else f"Dr. {name}"


def _next_offer_line(chat_id, specialist_name):

    if not specialist_name:
        return ""

    fulfilled = get_fulfilled_offers(chat_id, specialist_name)

    for offer_type in _OFFER_ORDER:
        if offer_type not in fulfilled:
            template = _OFFER_TEMPLATES[offer_type]
            return f"\n\n- {template.format(name=_display_name(specialist_name))}"

    return ""


def _finalize_specialist_answer(answer, chat_id, specialist_name):
    """
    Drops any next-step question the LLM drafted and appends the
    correct, deterministically-formatted one instead — see
    _TRAILING_OFFER_LINE_RE / _next_offer_line above.
    """

    if not specialist_name:
        return answer

    return _TRAILING_OFFER_LINE_RE.sub("", answer).rstrip() + _next_offer_line(chat_id, specialist_name)


def _build_info_answer(offer_type, doc):
    """
    Builds the "more details" / "available times" answer directly from
    the specialist record instead of asking the LLM to compose it.

    The local model was leaking available-time data into "more
    details" answers (both were drawn from the same full-detail blob)
    and, separately, dropping slots when asked to list them back out —
    the same faithfulness problem write_action_guard exists to guard
    against elsewhere. Scoping the data AND building the sentence
    ourselves avoids both.
    """

    name = _display_name(doc.get("name") or "This specialist")

    if offer_type == "available_times":
        slots = doc.get("availableSlots") or []

        if not slots:
            return f"{name} doesn't have any available appointment times listed yet."

        return f"{name}'s available appointment times: {_format_slots(slots)}."

    rating = doc.get("rating", 0)
    fee = doc.get("consultationFee", "N/A")
    specialization = doc.get("specialization", "N/A")
    bio = doc.get("bio")

    answer = f"{name} is a {specialization} specialist rated {rating}/5, with a consultation fee of {fee}."

    if bio:
        answer += f" {bio}"

    return answer


def _handle_book_guidance(user_query, chat_id):
    """
    "Book an appointment" is never a dead end: if the user hasn't named
    a specialty yet, ask for it; once we know it, show the top-rated
    matches with real data and point at the actual Book Appointment
    button, instead of an immediate "I can't do that".
    """

    specialization = (
        extract_specialization(user_query)
        or extract_specialization(get_history(chat_id))
    )

    if not specialization:
        return (
            "- I can't book it myself, but I can help you find the right "
            "specialist first. Which specialty are you looking for (e.g. "
            "cardiology, dermatology, pediatrics)?"
        )

    matches = get_specialists_by_specialization(specialization)

    if not matches:
        return f"I couldn't find any approved {specialization} specialists right now."

    top = matches[:3]
    top_name = top[0].get("name", "the top specialist")
    set_last_specialist_name(chat_id, top_name)

    lines = "\n".join(
        f"- **{doc.get('name', 'Unknown')}** — rating {doc.get('rating', 0)}, "
        f"fee {doc.get('consultationFee', 'N/A')}"
        for doc in top
    )

    # Giving these steps here IS fulfilling the "book" offer — never
    # ask it again for this specialist in this conversation.
    mark_offer_fulfilled(chat_id, top_name, "book")

    answer = (
        f"Here are the top-rated {specialization} specialists:\n{lines}\n\n"
        "Once you've picked one, open their profile and use the **Book "
        "Appointment** button to choose an available date and time."
    )

    return answer + _next_offer_line(chat_id, top_name)


def _handle_existing_appointment_guidance(action, chat_id):
    """
    Cancel/reschedule are about an appointment the user already has —
    show them what's upcoming first so they know which one, then the
    real steps, instead of a bare "I can't do that".
    """

    user_id = get_user(chat_id)

    if not user_id:
        return build_action_guard_message(action, logged_in=False)

    upcoming = get_patient_upcoming_appointments(user_id)

    if not upcoming:
        verb = "cancel" if action == "cancel" else "reschedule"
        return f"You don't have any upcoming appointments to {verb}."

    lines = "\n".join(
        f"- **{appt.get('specialistName') or 'Unknown'}** "
        f"({appt.get('specialization', 'N/A')}) — {_safe_date(appt.get('date'))}, "
        f"status {appt.get('status', 'unknown')}"
        for appt in upcoming
    )

    return (
        f"Here are your upcoming appointments:\n{lines}\n\n"
        + build_action_guard_message(action, logged_in=True)
    )


def predict(user_query, chat_id="default_session"):
    """
    Main chatbot pipeline
    """

    # -------------------------
    # init model
    # -------------------------
    initialize_model()

    # -------------------------
    # clean input
    # -------------------------
    processed_query = clean_query(user_query)

    # -------------------------
    # gibberish check (on raw input — spell-correction can turn
    # nonsense like "gvh" into a real word like "get" and hide it)
    # -------------------------
    if is_gibberish(user_query, chat_id):

        answer = "I couldn't understand your message. Could you rephrase it?"

        add_message(chat_id, "user", user_query)
        add_message(chat_id, "assistant", answer)

        return {
            "answer": answer,
            "sources": [],
            "confidence": 0.0
        }

    # -------------------------
    # save user message
    # -------------------------
    add_message(chat_id, "user", user_query)

    # -------------------------
    # sensitive info guard — refuse before touching the database at all
    # -------------------------
    if is_sensitive_request(user_query):

        add_message(chat_id, "assistant", REFUSAL_MESSAGE)

        return {
            "answer": REFUSAL_MESSAGE,
            "sources": [],
            "confidence": 1.0
        }

    # -------------------------
    # write action guard — the chatbot has no write access to the
    # database at all (no booking, cancelling, rescheduling, password/
    # email/profile changes); never let the LLM pretend it did one
    # -------------------------
    requested_action = get_requested_action(processed_query, chat_id)

    if requested_action == "book":

        answer = _handle_book_guidance(processed_query, chat_id)

        add_message(chat_id, "assistant", answer)

        return {
            "answer": answer,
            "sources": ["MongoDB"],
            "confidence": 1.0
        }

    if requested_action in ("cancel", "reschedule"):

        answer = _handle_existing_appointment_guidance(requested_action, chat_id)

        add_message(chat_id, "assistant", answer)

        return {
            "answer": answer,
            "sources": ["MongoDB"],
            "confidence": 1.0
        }

    if requested_action:

        user_id = get_user(chat_id)

        answer = build_action_guard_message(requested_action, logged_in=bool(user_id))

        add_message(chat_id, "assistant", answer)

        return {
            "answer": answer,
            "sources": ["Med-Wasla"],
            "confidence": 1.0
        }

    # -------------------------
    # the user confirmed a "more details" / "available times" offer
    # WaslaBot made about a specialist it already named — unlike the
    # write actions above, this IS something we can actually fetch.
    # -------------------------
    requested_info = get_requested_info(processed_query, chat_id)

    if requested_info:

        specialist_name = get_last_specialist_name(chat_id)
        doc = get_specialist_by_name(specialist_name) if specialist_name else None

        if not doc:
            answer = (
                "I don't have a specific specialist in mind anymore — "
                "which doctor did you mean?"
            )
        else:
            answer = _build_info_answer(requested_info, doc)

            mark_offer_fulfilled(chat_id, specialist_name, requested_info)
            answer = _finalize_specialist_answer(answer, chat_id, specialist_name)

        add_message(chat_id, "assistant", answer)

        return {
            "answer": answer,
            "sources": ["MongoDB"],
            "confidence": 1.0
        }

    # -------------------------
    # any other made-up offer the LLM confirmed — e.g. "would you like
    # to see more details?" -> "yes" -> model hallucinates having
    # emailed/sent/notified something. Catch it even though we don't
    # recognize the specific offer.
    # -------------------------
    if is_unrecognized_offer_confirmation(processed_query, chat_id):

        add_message(chat_id, "assistant", GENERIC_NO_ACTION_MESSAGE)

        return {
            "answer": GENERIC_NO_ACTION_MESSAGE,
            "sources": [],
            "confidence": 1.0
        }

    # -------------------------
    # routing
    # -------------------------
    question_type = keyword_route(processed_query)

    if question_type is None:
        question_type = classify_question(processed_query)

    print(f"Question Type: {question_type}")

    # -------------------------
    # chitchat (predefined exact-match responses)
    # -------------------------
    chitchat_answer = get_chitchat_response(processed_query)

    if chitchat_answer:

        add_message(chat_id, "assistant", chitchat_answer)

        return {
            "answer": chitchat_answer,
            "sources": [],
            "confidence": 1.0
        }

    # -------------------------
    # chitchat (classified as CHITCHAT but no exact-match phrase)
    # -------------------------
    if question_type == "CHITCHAT":

        history = get_history(chat_id)

        prompt = build_chitchat_prompt(processed_query, history)

        try:
            answer = generate_response(prompt)
        except Exception as e:
            print("Chitchat Error:", e)
            answer = "Hello! How can I help you today?"

        add_message(chat_id, "assistant", answer)

        return {
            "answer": answer,
            "sources": [],
            "confidence": 1.0
        }

    # -------------------------
    # general / off-topic
    # -------------------------
    if question_type == "GENERAL":

        answer = "It looks like your question is not related to Med-Wasla or health."

        add_message(chat_id, "assistant", answer)

        return {
            "answer": answer,
            "sources": [],
            "confidence": 0.0
        }

    # =========================
    # DATABASE CONTEXT (only if enabled)
    # =========================
    user_context = None
    context_specialist_name = None

    if ENABLE_DATABASE:
        user_id = get_user(chat_id)

        try:
            user_context, context_specialist_name = get_user_context(processed_query, user_id, chat_id)
        except Exception as e:
            print("Database Error:", e)

    # =========================
    # DATABASE RESPONSE
    # =========================
    if question_type == "DATABASE":

        history = get_history(chat_id)

        prompt = build_database_prompt(
            user_query=user_query,
            history_buffer=history,
            user_context=user_context
        )

        try:
            answer = generate_response(prompt)
            answer = _finalize_specialist_answer(answer, chat_id, context_specialist_name)
        except Exception as e:
            print("DB Error:", e)
            answer = "Sorry, I couldn't retrieve your account information."

        add_message(chat_id, "assistant", answer)

        return {
            "answer": answer,
            "sources": ["MongoDB"],
            "confidence": 1.0
        }

    # =========================
    # RAG RETRIEVAL (MEDICAL/WEBSITE)
    # =========================
    filtered_docs, confidence, sources = retrieve_documents(
        question_type,
        processed_query
    )

    if not filtered_docs:

        answer = "It looks like your question is not related to Med-Wasla or health."

        add_message(chat_id, "assistant", answer)

        return {
            "answer": answer,
            "sources": [],
            "confidence": 0.0
        }

    if confidence < SIMILARITY_THRESHOLD:

        answer = "I couldn't find enough reliable information."

        add_message(chat_id, "assistant", answer)

        return {
            "answer": answer,
            "sources": [],
            "confidence": round(float(confidence), 3)
        }

    # =========================
    # FINAL PROMPT BUILD
    # =========================
    history = get_history(chat_id)

    prompt = build_combined_prompt(
        context_docs=filtered_docs,
        user_query=user_query,
        history_buffer=history,
        user_context=user_context
    )

    try:
        answer = generate_response(prompt)

    except Exception as e:
        print("Ollama Error:", e)
        answer = "Sorry, I couldn't generate a response."

    add_message(chat_id, "assistant", answer)

    return {
        "answer": answer,
        "sources": sources,
        "confidence": round(float(confidence), 3)
    }