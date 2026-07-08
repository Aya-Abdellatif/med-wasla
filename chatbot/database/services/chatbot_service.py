from database.services.database_router import handle_database_query
from database.services.database_formatter import (
    format_appointments,
    format_reviews,
    format_specialists
)
from memory.session import set_last_specialist_name


def get_user_context(user_query, user_id, chat_id=None):

    result = handle_database_query(user_query, user_id)

    if result is None:
        return ""

    if result["type"] == "appointments":
        return format_appointments(result["data"])

    if result["type"] == "specialists":
        if chat_id and result["data"]:
            set_last_specialist_name(chat_id, result["data"][0].get("name"))
        return format_specialists(result["data"])

    if result["type"] == "reviews":
        return format_reviews(result["data"])

    if result["type"] == "login_required":
        return "The user is not logged in, so this information is not available. Tell them to log in to see this."

    return ""