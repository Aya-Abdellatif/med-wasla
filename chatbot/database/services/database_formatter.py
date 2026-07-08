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
            f"- Doctor: {appt.get('specialistName') or 'Unknown'}\n"
            f"- Specialization: {appt.get('specialization', 'N/A')}\n"
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
            f"{i}. Specialist Record\n"
            f"- Name: {doc.get('name', 'Unknown')}\n"
            f"- Type: {doc.get('specialistType', 'Unknown')}\n"
            f"- Specialization: {doc.get('specialization', 'N/A')}\n"
            f"- Rating: {doc.get('rating', 0)}\n"
            f"- Fee: {doc.get('consultationFee', 'N/A')}\n\n"
        )

    return text


def _format_slots(slots):

    if not slots:
        return "No available time slots listed yet."

    return "; ".join(
        f"{slot.get('day', '?')} {slot.get('startTime', '?')}-{slot.get('endTime', '?')}"
        for slot in slots
    )


def format_specialist_detail(doc):
    """
    Full detail for a single specialist — used when the user asks for
    "more details" or "available times" about someone WaslaBot already
    named, as opposed to the compact list format above.
    """

    if not doc:
        return "No further details are available for this specialist."

    return (
        "SPECIALIST DETAILS:\n\n"
        f"- Name: {doc.get('name', 'Unknown')}\n"
        f"- Type: {doc.get('specialistType', 'Unknown')}\n"
        f"- Specialization: {doc.get('specialization', 'N/A')}\n"
        f"- Rating: {doc.get('rating', 0)}\n"
        f"- Fee: {doc.get('consultationFee', 'N/A')}\n"
        f"- Bio: {doc.get('bio') or 'N/A'}\n"
        f"- Available appointment times: {_format_slots(doc.get('availableSlots'))}\n"
    )


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
            f"- Doctor: {r.get('specialistName') or 'Unknown'}\n"
            f"- Rating: {r.get('rating', 0)}/5\n"
            f"- Comment: {r.get('comment', 'No comment')}\n\n"
        )

    return text