from database.services.database_router import handle_database_query
from database.services.database_formatter import (
    format_appointments,
    format_reviews,
    format_specialists
)


def get_user_context(user_query, user_id):

    result = handle_database_query(user_query, user_id)

    if result is None:
        return ""

    if result["type"] == "appointments":
        return format_appointments(result["data"])

    if result["type"] == "specialists":
        return format_specialists(result["data"])

    if result["type"] == "reviews":
        return format_reviews(result["data"])

    return ""