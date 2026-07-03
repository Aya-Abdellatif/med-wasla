"""
Stores the logged-in user for each conversation.
"""

_sessions = {}


def set_user(session_id: str, user_id: str):
    _sessions[session_id] = user_id


def get_user(session_id: str):
    return _sessions.get(session_id)


def remove_user(session_id: str):
    _sessions.pop(session_id, None)