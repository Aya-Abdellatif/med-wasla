"""
booking_guard.py

The chatbot has no write path to the database at all — nothing in
database/collections/ can create, cancel, or reschedule an appointment,
only read it. Left to its own devices, a small local LLM will happily
"confirm" one of these actions anyway once the conversation history
suggests it was offered (e.g. after WaslaBot asks "Would you like to
book/cancel/reschedule this appointment?"). This catches that exact
pattern — a short affirmative reply right after such an offer — and
answers deterministically instead of letting the LLM improvise.
"""

import re

from memory.memory import get_last_assistant_message

_ACTION_OFFERED_PATTERNS = {
    "book": re.compile(
        r"(would you like|do you want|shall i|can i help).{0,40}\bbook",
        re.IGNORECASE,
    ),
    "cancel": re.compile(
        r"(would you like|do you want|shall i|can i help).{0,40}\bcancel",
        re.IGNORECASE,
    ),
    "reschedule": re.compile(
        r"(would you like|do you want|shall i|can i help).{0,40}\bresched",
        re.IGNORECASE,
    ),
}

_AFFIRMATIVE_RE = re.compile(
    r"^\s*(yes|yeah|yep|yup|sure|ok(ay)?|please|go ahead|do it|confirm(ed)?|"
    r"book it|cancel it|reschedule it)\b",
    re.IGNORECASE,
)

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
}


def detect_offered_action(chat_id):
    """
    Returns "book" / "cancel" / "reschedule" if the bot's last message
    offered to do one of these, otherwise None.
    """

    last_bot_message = get_last_assistant_message(chat_id)

    if not last_bot_message:
        return None

    for action, pattern in _ACTION_OFFERED_PATTERNS.items():
        if pattern.search(last_bot_message):
            return action

    return None


def get_confirmed_action(user_query, chat_id):
    """
    Returns "book" / "cancel" / "reschedule" if the bot just offered one
    of these and the user's message is a short affirmative reply to it,
    otherwise None.
    """

    action = detect_offered_action(chat_id)

    if not action:
        return None

    if not _AFFIRMATIVE_RE.match(user_query.strip()):
        return None

    return action


def build_action_guard_message(action, logged_in):
    """
    A fixed, accurate response for a confirmed book/cancel/reschedule
    action — never claims the action was actually performed.
    """

    steps = _ACTION_STEPS[action]

    if not logged_in:
        return (
            f"I can't {action} appointments myself, and you'll need to "
            f"**log in** first. Once logged in, {steps}."
        )

    return f"I can't {action} appointments myself — but here's how: {steps}."
