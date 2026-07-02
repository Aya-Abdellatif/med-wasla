"""
database_formatter.py

Converts MongoDB documents into clean LLM-ready text.
"""

from datetime import datetime


def _safe_date(date):
    if not date:
        return "Unknown date"

    if isinstance(date, datetime):
        return date.strftime("%d %B %Y %I:%M %p")

    return str(date)


# --------------------------------------------------
# APPOINTMENTS
# --------------------------------------------------

def format_appointments(appointments):

    if not appointments:
        return "The user has no appointments."

    text = "USER APPOINTMENTS:\n\n"

    for i, appt in enumerate(appointments, start=1):

        text += (
            f"{i}. Appointment\n"
            f"- Type: {appt.get('type', 'unknown')}\n"
            f"- Status: {appt.get('status', 'unknown')}\n"
            f"- Date: {_safe_date(appt.get('date'))}\n"
            f"- Notes: {appt.get('notes', 'None')}\n\n"
        )

    return text


# --------------------------------------------------
# SPECIALISTS
# --------------------------------------------------

def format_specialists(specialists):

    if not specialists:
        return "No specialists found."

    text = "SPECIALISTS:\n\n"

    for i, doc in enumerate(specialists, start=1):

        text += (
            f"{i}. Doctor/Nurse\n"
            f"- Name: {doc.get('name', 'Unknown')}\n"
            f"- Type: {doc.get('specialistType', 'Unknown')}\n"
            f"- Specialization: {doc.get('specialization', 'N/A')}\n"
            f"- Rating: {doc.get('rating', 0)}\n"
            f"- Fee: {doc.get('consultationFee', 'N/A')}\n\n"
        )

    return text


# --------------------------------------------------
# REVIEWS
# --------------------------------------------------

def format_reviews(reviews):

    if not reviews:
        return "No reviews found."

    text = "REVIEWS:\n\n"

    for i, r in enumerate(reviews, start=1):

        text += (
            f"{i}. Review\n"
            f"- Rating: {r.get('rating', 0)}/5\n"
            f"- Comment: {r.get('comment', 'No comment')}\n\n"
        )

    return text