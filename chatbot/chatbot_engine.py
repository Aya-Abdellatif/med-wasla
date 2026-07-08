# -*- coding: utf-8 -*-

from core.router import keyword_route

from core.loader import initialize_model
from core.classifier import classify_question

from preprocessing.gibberish import is_gibberish
from preprocessing.spell_checker import clean_query

from memory.memory import add_message, get_history
from memory.chitchat import get_chitchat_response
from memory.session import get_user

from core.retrieval import retrieve_documents
from core.prompt_builder import build_combined_prompt, build_chitchat_prompt
from core.ollama_client import generate_response

from database.services.chatbot_service import get_user_context

from config import SIMILARITY_THRESHOLD, ENABLE_DATABASE


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

    if ENABLE_DATABASE:
        user_id = get_user(chat_id)

        try:
            user_context = get_user_context(processed_query, user_id)
        except Exception as e:
            print("Database Error:", e)

    # =========================
    # DATABASE RESPONSE
    # =========================
    if question_type == "DATABASE":

        history = get_history(chat_id)

        prompt = build_combined_prompt(
            context_docs=[],
            user_query=user_query,
            history_buffer=history,
            user_context=user_context
        )

        try:
            answer = generate_response(prompt)
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