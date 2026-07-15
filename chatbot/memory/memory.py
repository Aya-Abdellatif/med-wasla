"""
memory.py

Conversation memory management.
"""

import re

from models import chat_sessions

from memory.session import (
    get_expected_answer,
    clear_expected_answer
)

# Stores structured clinical information for each conversation.
patient_state = {}

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
        update_patient_entities(chat_id, text)

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

    if chat_id not in patient_state:
        patient_state[chat_id] = {
            "symptoms_present": set(),
            "symptoms_absent": set()
        }
    
    if chat_id not in patient_state:

        patient_state[chat_id] = {

            "chief_complaint": None,

            "symptoms_present": set(),
            "symptoms_absent": set(),

            "duration": None,
            "pain_scale": None,
            "pain_location": None,
            "pain_character": None,

            "fever_temperature": None,

            "medical_history": None,
            "surgical_history": None,
            "family_history": None,

            "medications": None,
            "allergies": None,

            "travel_history": None,
            "smoking": None,
            "pregnancy": None,

            "age": None,
            "sex": None,

            "red_flags": set(),

            "asked_questions": set(),

            "diagnosis_ready": False
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

            patient_state[chat_id]["symptoms_absent"].add(symptom)
            patient_state[chat_id]["symptoms_present"].discard(symptom)

        else:

            patient_state[chat_id]["symptoms_present"].add(symptom)
            patient_state[chat_id]["symptoms_absent"].discard(symptom)

def get_symptom_summary(chat_id):
    """
    Returns a formatted symptom summary.
    """

    if chat_id not in patient_state:
        return "No symptoms identified yet."

    present = sorted(patient_state[chat_id]["symptoms_present"])
    absent = sorted(patient_state[chat_id]["symptoms_absent"])

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


def is_patient_ready(chat_id):

    patient = patient_state[chat_id]

    if len(patient["symptoms_present"]) == 0:
        return False

    if patient["duration"] is None:
        return False

    if patient["pain_scale"] is None:
        return False

    return True


def clear_patient_state(chat_id):
    patient_state.pop(chat_id, None)


def update_patient_entities(chat_id, text):

    lower = text.lower()

    patient = patient_state[chat_id]

    expected = get_expected_answer(chat_id)

    # -------------------------
    # Expected pain scale
    # -------------------------

    if expected == "pain_scale":
        match = re.search(r"\b([1-9]|10)\b", lower)

        if match:
            patient["pain_scale"] = int(match.group(1))
            clear_expected_answer(chat_id)
            return
        
    # -------------------------
    # Expected duration
    # -------------------------

    if expected == "duration":
        match = re.search(
            r"(\d+)\s*(day|days|week|weeks|month|months|hour|hours)",
            lower
        )

        if match:
            patient["duration"] = match.group(0)
            clear_expected_answer(chat_id)
            return
        
    # -------------------------
    # Pain scale
    # -------------------------
    match = re.search(
        r"\b([1-9]|10)\b",
        lower
    )

    if (
        ("pain" in lower or "scale" in lower or "severity" in lower)
        and match
    ):
        patient["pain_scale"] = int(match.group(1))

    # -------------------------
    # Temperature
    # -------------------------
    match = re.search(
        r"\b(3[5-9]|4[0-2])(\.\d)?\b",
        lower
    )

    if match:
        patient["temperature"] = match.group(0)

    # -------------------------
    # Age
    # -------------------------
    match = re.search(
        r"(i am|i'm|age is)\s+(\d{1,3})",
        lower
    )

    if match:
        patient["age"] = int(match.group(2))

    # -------------------------
    # Pain location
    # -------------------------
    locations = [

        "head",
        "chest",
        "abdomen",
        "stomach",
        "back",
        "neck",
        "throat",
        "leg",
        "arm",
        "shoulder",
        "eye",
        "ear"

    ]

    for location in locations:

        if location in lower:

            patient["pain_location"] = location
            break