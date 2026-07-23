from database.services.database_router import handle_database_query
from database.services.database_formatter import (
    format_appointments,
    format_reviews,
    format_specialists
)

from memory.session import (
    set_last_specialist_name,
    set_pending_offer,
)

def get_user_context(user_query, user_id, chat_id=None):
    """
    Returns (context_text, specialist_name, specialist_list).

    specialist_name is the top specialist the response is about, or
    None when the answer isn't about a single specialist — callers use
    it to know whether a next-step offer ("more details"/"available
    times"/"steps to book") makes sense to attach.

    specialist_list is the raw, Mongo-sorted (by rating desc) list of
    matched specialists when the intent was SPECIALISTS, or None
    otherwise — callers use it to answer "highest rated" questions by
    reading data[0] directly instead of trusting the LLM to correctly
    pick the top entry back out of formatted text.
    """

    result = handle_database_query(user_query, user_id)

    if result is None:
        return "", None, None

    if result["type"] == "appointments":
        return format_appointments(result["data"]), None, None

    if result["type"] == "specialists":
        specialists = result["data"] or []
        specialist_name = specialists[0].get("name") if specialists else None

        if chat_id and specialist_name:
            set_last_specialist_name(chat_id, specialist_name)

        return format_specialists(specialists), specialist_name, specialists

    if result["type"] == "reviews":
        return format_reviews(result["data"]), None, None

    if result["type"] == "login_required":

        if chat_id:
            set_pending_offer(chat_id, "login_help")

        return (
            "The user is not logged in, so this information is not available. Explain that they need to log in first, then ask exactly: 'Would you like to know how to log in?'",
            None,
            None
        )

    return "", None, None
