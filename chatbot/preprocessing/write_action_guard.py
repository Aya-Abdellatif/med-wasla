"""
write_action_guard.py

The chatbot has no write access to the database at all — nothing in
database/collections/ can create, update, or delete anything, only
read it. Left to its own devices, a small local LLM will happily
"confirm" having booked an appointment, changed a password, or updated
a profile once the conversation makes it sound plausible. This module
catches both:

  1. A direct request to perform one of these actions
     ("change my password", "cancel my appointment").
  2. A short affirmative reply right after WaslaBot itself offers to
     do one ("Would you like me to update your profile?" -> "yes").

...and answers deterministically with real steps from the Med-Wasla
knowledge base, never claiming the action was actually performed.
"""

import re

from memory.memory import get_last_assistant_message

_ACTION_VERB = {
    "book": "book appointments",
    "cancel": "cancel appointments",
    "reschedule": "reschedule appointments",
    "password": "change your password",
    "email": "change your email",
    "profile": "update your profile",
}

_ACTION_STEPS = {
    "book": (
        "open the specialist's profile page and use the **Book Appointment** "
        "button to pick an available date and time"
    ),
    "cancel": (
        "go to your **Patient Appointments** page and cancel it there — clinic "
        "appointments can be cancelled up to 6 hours before the scheduled time, "
        "and home visits up to 24 hours before"
    ),
    "reschedule": (
        "go to your **Patient Appointments** page and reschedule it there, "
        "choosing a new date and time that's still available"
    ),
    "password": (
        "go to your **Profile** page and use the change password option — "
        "you'll need to enter your current password. If you're locked out, "
        "use **Forgot Password** on the login page instead"
    ),
    "profile": (
        "go to your **Profile** page — you can update your name, phone "
        "number, governorate, address, date of birth, password, and "
        "profile photo there directly"
    ),
}

# Phrases WaslaBot itself might use to offer to perform one of these
# actions on the user's behalf.
_OFFERED_ACTION_PATTERNS = {
    "book": re.compile(r"(would you like|do you want|shall i|can i help).{0,40}\bbook", re.IGNORECASE),
    "cancel": re.compile(r"(would you like|do you want|shall i|can i help).{0,40}\bcancel", re.IGNORECASE),
    "reschedule": re.compile(r"(would you like|do you want|shall i|can i help).{0,40}\bresched", re.IGNORECASE),
    "password": re.compile(r"(would you like|do you want|shall i|can i help).{0,40}\bpassword", re.IGNORECASE),
    "email": re.compile(r"(would you like|do you want|shall i|can i help).{0,40}\bemail", re.IGNORECASE),
    "profile": re.compile(
        r"(would you like|do you want|shall i|can i help).{0,40}\b"
        r"(profile|phone number|address|photo)",
        re.IGNORECASE,
    ),
}

# A direct request/question about performing one of these actions.
_DIRECT_ACTION_PATTERNS = {
    "book": re.compile(r"\bbook\b.{0,25}\b(appointment|visit|doctor|specialist|nurse)\b", re.IGNORECASE),
    "cancel": re.compile(r"\bcancel\b.{0,20}\b(appointment|visit|booking)\b", re.IGNORECASE),
    "reschedule": re.compile(r"\breschedul\w*\b.{0,20}\b(appointment|visit)\b", re.IGNORECASE),
    "password": re.compile(r"\b(change|update|reset|set)\b.{0,15}\bpassword\b", re.IGNORECASE),
    "email": re.compile(r"\b(change|update)\b.{0,15}\be-?mail\b", re.IGNORECASE),
    "profile": re.compile(
        r"\b(change|update|edit)\b.{0,20}\b(profile|phone( number)?|address|"
        r"governorate|date of birth|dob|photo|(first|last) name)\b",
        re.IGNORECASE,
    ),
}

_AFFIRMATIVE_RE = re.compile(
    r"^\s*(yes|yeah|yep|yup|sure|ok(ay)?|please|go ahead|do it|confirm(ed)?|"
    r"book it|cancel it|reschedule it)\b",
    re.IGNORECASE,
)

# ANY offer-shaped question from the bot, regardless of which specific
# verb it used. A small local model can invent endless offer phrasings
# ("see more details", "send you", "notify you", "look that up for
# you"...) and then hallucinate having fulfilled a completely fictional
# one ("I've sent it to your inbox") when the user just says "yes".
# Enumerating every verb is a losing battle, so any confirmed offer
# that isn't one of the specific, known actions above still gets
# intercepted here instead of reaching the LLM.
#
# Deliberately excludes bare "can i help" — "How can I help you today?"
# is a generic greeting closer used throughout memory/chitchat.py, not
# an offer to perform a specific action.
_ANY_OFFER_RE = re.compile(
    r"(would you like|do you want|shall i|can i help (you )?(with|by|find|send|update|notify|book|cancel|resched))",
    re.IGNORECASE,
)

GENERIC_NO_ACTION_MESSAGE = (
    "Just to be clear — I can only share information I already have. I "
    "can't send messages, update your account, or perform any action on "
    "your behalf. If there's a specific detail you'd like, just ask and "
    "I'll answer directly."
)


def detect_offered_action(chat_id):
    """
    Returns the action WaslaBot's last message offered to perform, or
    None.
    """

    last_bot_message = get_last_assistant_message(chat_id)

    if not last_bot_message:
        return None

    for action, pattern in _OFFERED_ACTION_PATTERNS.items():
        if pattern.search(last_bot_message):
            return action

    return None


def get_requested_action(user_query, chat_id):
    """
    Returns the write action (book/cancel/reschedule/password/email/
    profile) the user wants — either asked for directly, or confirmed
    right after WaslaBot itself offered it — or None.
    """

    query = user_query.strip()

    for action, pattern in _DIRECT_ACTION_PATTERNS.items():
        if pattern.search(query):
            return action

    offered = detect_offered_action(chat_id)

    if offered and _AFFIRMATIVE_RE.match(query):
        return offered

    return None


def is_unrecognized_offer_confirmation(user_query, chat_id):
    """
    True if the bot's last message was ANY offer-shaped question, the
    user gave a short affirmative reply, and the offer didn't match one
    of the specific known actions (book/cancel/reschedule/password/
    email/profile) — i.e. some other offer the model made up on its
    own, which it cannot actually be trusted to follow through on.
    """

    last_bot_message = get_last_assistant_message(chat_id)

    if not last_bot_message or not _ANY_OFFER_RE.search(last_bot_message):
        return False

    if not _AFFIRMATIVE_RE.match(user_query.strip()):
        return False

    return detect_offered_action(chat_id) is None


def build_action_guard_message(action, logged_in):
    """
    A fixed, accurate response for a requested write action — never
    claims the action was actually performed.
    """

    if action == "email":
        return (
            "I can't change your email myself — and actually, the registered "
            "email address can't be changed at all once your account is "
            "created. Please contact support at medwasla@healthcareplus.com "
            "if this is a serious issue."
        )

    verb = _ACTION_VERB[action]
    steps = _ACTION_STEPS[action]

    if not logged_in:
        return (
            f"I can't {verb} myself, and you'll need to **log in** first. "
            f"Once logged in, {steps}."
        )

    return f"I can't {verb} myself — but here's how: {steps}."
