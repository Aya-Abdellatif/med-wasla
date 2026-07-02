"""
memory.py

Conversation memory management.
"""

from models import chat_sessions


def get_history(chat_id):
    """
    Returns recent conversation history formatted for LLM prompt.
    """

    if chat_id not in chat_sessions:
        chat_sessions[chat_id] = []

    history = []

    # keep last 4 messages
    for turn in chat_sessions[chat_id][-4:]:

        speaker = "User" if turn["role"] == "user" else "WaslaBot"

        history.append(f"{speaker}: {turn['text']}")

    if not history:
        return "No previous conversation."

    return "\n".join(history)


def add_message(chat_id, role, text):
    """
    Adds a message to memory.
    """

    if chat_id not in chat_sessions:
        chat_sessions[chat_id] = []

    chat_sessions[chat_id].append({
        "role": role,
        "text": text
    })


def limit_history(chat_id, max_messages=20):
    """
    Keeps memory size under control.
    """

    if chat_id in chat_sessions and len(chat_sessions[chat_id]) > max_messages:
        chat_sessions[chat_id] = chat_sessions[chat_id][-max_messages:]


def get_last_assistant_message(chat_id):
    """
    Returns last assistant response.
    """

    if chat_id not in chat_sessions:
        return None

    for turn in reversed(chat_sessions[chat_id]):
        if turn["role"] == "assistant":
            return turn["text"]

    return None