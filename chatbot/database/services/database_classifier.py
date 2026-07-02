"""
database_classifier.py

Classifies database questions into:
APPOINTMENTS / SPECIALISTS / REVIEWS / UNKNOWN
"""

def classify_database_query(question: str):

    question = question.lower()

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

    if any(word in question for word in appointment_keywords):
        return "APPOINTMENTS"

    if any(word in question for word in specialist_keywords):
        return "SPECIALISTS"

    if any(word in question for word in review_keywords):
        return "REVIEWS"

    return "UNKNOWN"