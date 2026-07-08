"""
database_classifier.py

Classifies database questions into:
APPOINTMENTS / SPECIALISTS / REVIEWS / UNKNOWN
"""

import re

# Maps a keyword found in the user's question to the exact
# specialization value stored on MedicalSpecialist documents.
SPECIALIZATION_KEYWORDS = {
    "cardiolog": "Cardiology",
    "orthoped": "Orthopedics",
    "dermatolog": "Dermatology",
    "pediatric": "Pediatrics",
    "neurolog": "Neurology",
    "psychiatr": "Psychiatry",
    "gynecolog": "Gynecology",
    "ent": "ENT",
    "ophthalmolog": "Ophthalmology",
    "urolog": "Urology",
    "oncolog": "Oncology",
}


def extract_specialization(question: str):
    """
    Returns the exact specialization value (matching the
    MedicalSpecialist schema) mentioned in the question, or None.
    """

    question = question.lower()

    for keyword, specialization in SPECIALIZATION_KEYWORDS.items():
        if re.search(rf"\b{re.escape(keyword)}", question):
            return specialization

    return None


def classify_database_query(question: str):

    question = question.lower()

    # "who is my doctor" is asking about the specialist(s) the user has
    # actually booked with, not the platform-wide specialist list — must
    # be checked before the generic specialist_keywords match below.
    my_specialist_keywords = [
        "my doctor", "my doctors", "my specialist", "my specialists",
        "my nurse", "my nurses", "who is my doctor", "who's my doctor",
        "who is my specialist", "who's my specialist",
    ]

    appointment_keywords = [
        "appointment", "appointments", "book",
        "booking", "visit", "upcoming",
        "schedule", "cancel", "reschedule"
    ]

    specialist_keywords = [
        "doctor", "specialist", "nurse",
        "cardiologist", "dermatologist",
        "neurologist", "physician"
    ]

    review_keywords = [
        "review", "reviews", "rating",
        "ratings", "comment", "feedback"
    ]

    if any(phrase in question for phrase in my_specialist_keywords):
        return "MY_SPECIALIST"

    if any(word in question for word in appointment_keywords):
        return "APPOINTMENTS"

    if any(word in question for word in specialist_keywords):
        return "SPECIALISTS"

    if any(word in question for word in review_keywords):
        return "REVIEWS"

    return "UNKNOWN"