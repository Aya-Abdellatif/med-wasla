from database.services.database_router import handle_database_query
from database.services.database_formatter import (
    format_appointments,
    format_reviews,
    format_specialists
)
from memory.session import set_last_specialist_name


def get_user_context(user_query, user_id, chat_id=None):
    """
    Returns (context_text, specialist_name). specialist_name is the top
    specialist the response is about, or None when the answer isn't
    about a single specialist — callers use it to know whether a
    next-step offer ("more details"/"available times"/"steps to book")
    makes sense to attach.
    """

    result = handle_database_query(user_query, user_id)

    if result is None:
        return "", None

    if result["type"] == "appointments":
        return format_appointments(result["data"]), None

    if result["type"] == "specialists":
        specialist_name = result["data"][0].get("name") if result["data"] else None

        if chat_id and specialist_name:
            set_last_specialist_name(chat_id, specialist_name)

        return format_specialists(result["data"]), specialist_name

    if result["type"] == "reviews":
        return format_reviews(result["data"]), None

    if result["type"] == "login_required":
        return (
            "The user is not logged in, so this information is not available. Tell them to log in to see this.",
            None
        )

    return "", None
