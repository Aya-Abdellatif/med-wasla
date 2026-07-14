"""
memory.py

Conversation memory management.
"""

import re

from models import chat_sessions

# Stores positive and negative symptoms for each conversation.
chat_symptoms = {}

def get_history(chat_id):
    """
    Returns recent conversation history formatted for LLM prompt.
    """

    if chat_id not in chat_sessions:
        chat_sessions[chat_id] = []

    history = []

    # keep last 10 messages
    for turn in chat_sessions[chat_id][-10:]:

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

    if role == "user":
        update_symptoms(chat_id, text)

    limit_history(chat_id)


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

COMMON_SYMPTOMS = {
    "headache",
    "fever",
    "high fever",
    "low fever",
    "cough",
    "dry cough",
    "productive cough",
    "sore throat",
    "difficulty breathing",
    "shortness of breath",
    "chest pain",
    "fatigue",
    "body aches",
    "muscle pain",
    "joint pain",
    "nausea",
    "vomiting",
    "diarrhea",
    "constipation",
    "dizziness",
    "runny nose",
    "stuffy nose",
    "loss of smell",
    "loss of taste",
    "rash",
    "itching",
    "abdominal pain",
    "stomach pain",
    "back pain",
    "ear pain",
    "eye pain",
    "blurred vision",
    "palpitations",
    "swelling"
}

NEGATION_WORDS = [
    "no",
    "not",
    "don't",
    "do not",
    "without",
    "denies",
    "deny",
    "never had"
]


def update_symptoms(chat_id, text):
    """
    Stores symptoms as present or denied.
    """

    if chat_id not in chat_symptoms:
        chat_symptoms[chat_id] = {
            "present": set(),
            "absent": set()
        }

    lower = text.lower()

    for symptom in COMMON_SYMPTOMS:

        if symptom not in lower:
            continue

        denied = False

        for neg in NEGATION_WORDS:

            pattern = rf"{neg}\s+(any\s+)?{re.escape(symptom)}"

            if re.search(pattern, lower):
                denied = True
                break

        if denied:

            chat_symptoms[chat_id]["absent"].add(symptom)
            chat_symptoms[chat_id]["present"].discard(symptom)

        else:

            chat_symptoms[chat_id]["present"].add(symptom)
            chat_symptoms[chat_id]["absent"].discard(symptom)

def get_symptom_summary(chat_id):
    """
    Returns a formatted symptom summary.
    """

    if chat_id not in chat_symptoms:
        return "No symptoms identified yet."

    present = sorted(chat_symptoms[chat_id]["present"])
    absent = sorted(chat_symptoms[chat_id]["absent"])

    lines = []

    if present:

        lines.append("Known symptoms:")

        for symptom in present:
            lines.append(f"- {symptom}")

    if absent:

        if lines:
            lines.append("")

        lines.append("Symptoms denied:")

        for symptom in absent:
            lines.append(f"- {symptom}")

    if not lines:
        return "No symptoms identified yet."

    return "\n".join(lines)

def clear_symptoms(chat_id):
    chat_symptoms.pop(chat_id, None)