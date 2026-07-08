"""
Stores the logged-in user for each conversation.
"""

_sessions = {}

# The name of the specialist most recently shown to the user in this
# conversation — lets a follow-up like "yes, more details please" or
# "what about available times?" know who "them" refers to.
_last_specialist = {}


def set_user(session_id: str, user_id: str):
    _sessions[session_id] = user_id


def get_user(session_id: str):
    return _sessions.get(session_id)


def remove_user(session_id: str):
    _sessions.pop(session_id, None)


def set_last_specialist_name(session_id: str, name: str):
    if name:
        _last_specialist[session_id] = name


def get_last_specialist_name(session_id: str):
    return _last_specialist.get(session_id)


# Which of the three next-step offers (more_details/available_times/
# book) have already been given for a given specialist in a given
# conversation — so WaslaBot never re-offers something the user just
# confirmed.
_fulfilled_offers = {}


def mark_offer_fulfilled(session_id: str, specialist_name: str, offer_type: str):
    if not specialist_name:
        return
    _fulfilled_offers.setdefault((session_id, specialist_name), set()).add(offer_type)


def get_fulfilled_offers(session_id: str, specialist_name: str):
    return _fulfilled_offers.get((session_id, specialist_name), set())