from database.services.database_router import handle_database_query
from database.services.database_formatter import (
    format_appointments,
    format_reviews,
    format_specialists
)

from database.collections.appointment_queries import *
from database.collections.specialist_queries import *
from database.collections.review_queries import *


def get_user_context(user_query, user_id):

    intent = handle_database_query(user_query)

    if intent is None:
        return ""

    # ----------------------------------
    # Appointments
    # ----------------------------------

    if intent == "GET_APPOINTMENTS":

        appointments = get_patient_appointments(user_id)

        return format_appointments(appointments)

    if intent == "GET_UPCOMING_APPOINTMENTS":

        appointments = get_patient_upcoming_appointments(user_id)

        return format_appointments(appointments)

    # ----------------------------------
    # Specialists
    # ----------------------------------

    if isinstance(intent, tuple):

        action, specialization = intent

        if action == "GET_SPECIALISTS_BY_SPECIALIZATION":

            specialists = get_specialists_by_specialization(
                specialization
            )

            return format_specialists(specialists)

    if intent == "COUNT_APPROVED_SPECIALISTS":

        count = count_approved_specialists()

        return f"There are currently {count} approved specialists."

    # ----------------------------------
    # Reviews
    # ----------------------------------

    if intent == "GET_SPECIALIST_REVIEWS":

        return (
            "Please mention the doctor's name so I know "
            "which reviews to retrieve."
        )

    if intent == "GET_SPECIALIST_RATING":

        return (
            "Please mention the doctor's name so I can "
            "retrieve the rating."
        )

    return ""