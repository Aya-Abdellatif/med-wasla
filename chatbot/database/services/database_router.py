"""
database_router.py

Maps database intent → actual MongoDB calls
"""

from database.services.database_classifier import classify_database_query

from database.collections.appointment_queries import (
    get_patient_appointments,
    get_patient_upcoming_appointments
)

from database.collections.specialist_queries import (
    get_specialists_by_specialization,
    count_approved_specialists
)

from database.collections.review_queries import (
    get_reviews_by_patient
)


def handle_database_query(user_query: str, user_id: str):

    intent = classify_database_query(user_query)

    # -----------------------------
    # APPOINTMENTS
    # -----------------------------
    if intent == "APPOINTMENTS":

        return {
            "type": "appointments",
            "data": get_patient_appointments(user_id)
        }

    if intent == "SPECIALISTS":

        return {
            "type": "specialists",
            "data": get_specialists_by_specialization("")
        }

    if intent == "REVIEWS":

        return {
            "type": "reviews",
            "data": get_reviews_by_patient(user_id)
        }

    return None