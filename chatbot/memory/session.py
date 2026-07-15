"""
Stores the logged-in user and conversation state for each chat session.
"""

# Logged-in user per session
_sessions = {}

# The name of the specialist most recently shown to the user
_last_specialist = {}

# Which offers have already been fulfilled for a specialist
_fulfilled_offers = {}

# Conversation state (last detected intent + waiting for reply)
_conversation_state = {}


# ==========================================================
# User Session
# ==========================================================

def set_user(session_id: str, user_id: str):
    _sessions[session_id] = user_id


def get_user(session_id: str):
    return _sessions.get(session_id)


def remove_user(session_id: str):
    _sessions.pop(session_id, None)


# ==========================================================
# Last Specialist
# ==========================================================

def set_last_specialist_name(session_id: str, name: str):
    if name:
        _last_specialist[session_id] = name


def get_last_specialist_name(session_id: str):
    return _last_specialist.get(session_id)


# ==========================================================
# Fulfilled Offers
# ==========================================================

def mark_offer_fulfilled(session_id: str, specialist_name: str, offer_type: str):
    if not specialist_name:
        return

    _fulfilled_offers.setdefault(
        (session_id, specialist_name),
        set()
    ).add(offer_type)


def get_fulfilled_offers(session_id: str, specialist_name: str):
    return _fulfilled_offers.get(
        (session_id, specialist_name),
        set()
    )


# ==========================================================
# Conversation State
# ==========================================================

def set_conversation_state(chat_id: str, state: str):
    _conversation_state.setdefault(chat_id, {})
    _conversation_state[chat_id]["conversation_state"] = state


def get_conversation_state(chat_id: str):
    return (
        _conversation_state
        .get(chat_id, {})
        .get("conversation_state")
    )

def set_last_question_type(chat_id: str, question_type: str):
    _conversation_state.setdefault(chat_id, {})
    _conversation_state[chat_id]["last_question_type"] = question_type


def get_last_question_type(chat_id: str):
    return (
        _conversation_state
        .get(chat_id, {})
        .get("last_question_type")
    )


def set_waiting_for_reply(chat_id: str, waiting: bool = True):
    _conversation_state.setdefault(chat_id, {})
    _conversation_state[chat_id]["waiting_for_reply"] = waiting


def is_waiting_for_reply(chat_id: str):
    return (
        _conversation_state
        .get(chat_id, {})
        .get("waiting_for_reply", False)
    )


# ==========================================================
# Assistant Reply Detection
# ==========================================================

def assistant_is_waiting(answer: str):
    """
    Returns True if the assistant is asking the user
    for more information.
    """

    if not answer:
        return False

    answer = answer.lower().strip()

    question_phrases = [
        "can you",
        "could you",
        "would you",
        "do you",
        "have you",
        "are you",
        "is the",
        "is this",
        "what",
        "when",
        "where",
        "which",
        "who",
        "how",
        "tell me",
        "please describe",
        "please tell me"
    ]

    return (
        answer.endswith("?")
        or any(answer.startswith(phrase) for phrase in question_phrases)
    )