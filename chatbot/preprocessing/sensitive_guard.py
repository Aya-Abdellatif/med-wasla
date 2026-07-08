"""
sensitive_guard.py

Detects requests for credentials or another user's private data
(passwords, emails, phone numbers, etc.) so they can be refused
before any database query runs.
"""

import re

REFUSAL_MESSAGE = (
    "I can't share passwords, login credentials, or another person's "
    "private contact details. If you're locked out of your own account, "
    "please use the \"Forgot password\" option on the login page."
)

_SENSITIVE_PATTERNS = [
    r"\bpassword(s)?\b",
    r"\bcredential(s)?\b",
    r"\blog\s*in\s+(details|info|information|credentials)\b",
    r"\b(login|log-in)\s+(details|info|information|credentials)\b",
    r"\bhash(ed)?\s+password\b",
    r"\bchange\s+.*\s+password\b",
    r"\breset\s+.*\s+password\b",
    r"\b(email|e-mail|phone|mobile|address|dob|date of birth)\s+of\b",
    r"\b(email|e-mail|phone|mobile|number)\s+for\s+(dr|doctor|nurse|specialist|patient)\b",
    r"\bwhat('?s| is)\s+(dr|doctor|nurse|specialist)\s+\w+('s)?\s+(email|phone|password)\b",
    r"\bsomeone\s+else'?s\s+(account|password|email|data|info)\b",
    r"\banother\s+(user|patient|doctor|specialist|nurse)'?s\s+(password|email|phone|data|info)\b",
]

_COMPILED = [re.compile(pattern, re.IGNORECASE) for pattern in _SENSITIVE_PATTERNS]


def is_sensitive_request(text):
    """
    Returns True if the message is asking for credentials or another
    user's private contact/account details.
    """

    return any(pattern.search(text) for pattern in _COMPILED)
