"""
router.py

Fast keyword-based router.

Returns one of:

MEDICAL
WEBSITE
DATABASE
CHITCHAT

or

None
"""

import re


DATABASE_KEYWORDS = {

    "appointment",
    "appointments",
    "booking",
    "bookings",
    "queue",
    "review",
    "reviews",
    "rating",
    "ratings",
    "doctor",
    "doctors",
    "nurse",
    "nurses",
    "specialist",
    "specialists",
    "available",
    "availability",
    "my appointment",
    "my appointments",
    "my booking",
    "my bookings",
    "my doctor",
    "my specialist",
    "my review",
    "my queue",
}


WEBSITE_KEYWORDS = {

    "register",
    "registration",
    "signup",
    "sign up",
    "login",
    "log in",
    "forgot password",
    "reset password",
    "otp",
    "verify",
    "book appointment",
    "cancel appointment",
    "reschedule",
    "how to",
    "dashboard",
    "home visit",
    "services",
    "contact",
    "about",
    "profile",
    "waslabot",
}


CHITCHAT_KEYWORDS = {

    "hi",
    "hello",
    "hey",
    "thanks",
    "thank you",
    "bye",
    "goodbye",
    "good morning",
    "good evening",
    "how are you",
    "who are you",
}


MEDICAL_KEYWORDS = {

    "pain",
    "fever",
    "headache",
    "cough",
    "cold",
    "rash",
    "diabetes",
    "blood pressure",
    "heart",
    "infection",
    "medicine",
    "medication",
    "symptom",
    "symptoms",
    "treatment",
    "disease",
    "doctor says",
}


def keyword_route(text):

    text = text.lower()

    for keyword in CHITCHAT_KEYWORDS:
        if keyword in text:
            return "CHITCHAT"

    for keyword in DATABASE_KEYWORDS:
        if keyword in text:
            return "DATABASE"

    for keyword in WEBSITE_KEYWORDS:
        if keyword in text:
            return "WEBSITE"

    for keyword in MEDICAL_KEYWORDS:
        if keyword in text:
            return "MEDICAL"

    return None