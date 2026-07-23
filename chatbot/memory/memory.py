"""
memory.py

Conversation memory management.
"""

# from email.mime import text
import re

from models import chat_sessions

from memory.session import (
    get_expected_answer,
    clear_expected_answer,
    set_expected_answer
)

# from memory.question_planner import get_next_missing_information


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

            # =========================
            # Chief Complaint
            # =========================

            "chief_complaint": None,

            # =========================
            # Symptoms
            # =========================

            "symptoms_present": set(),
            "symptoms_absent": set(),

            # =========================
            # Symptom Details
            # =========================

            "duration": None,
            "pain_scale": None,
            "pain_location": None,
            "pain_character": None,

            "fever_temperature": None,

            # =========================
            # Medical Background
            # =========================

            "medical_history": [],
            "surgical_history": [],
            "family_history": [],

            "medications": [],
            "allergies": [],

            "travel_history": None,
            "smoking": None,
            "pregnancy": None,

            # =========================
            # Patient Information
            # =========================

            "age": None,
            "sex": None,

            # =========================
            # Safety
            # =========================

            "red_flags": set(),

            # =========================
            # Conversation
            # =========================

            "asked_questions": set(),

            "expected_answer": None,

            # =========================
            # Workflow
            # =========================

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
    from memory.question_planner import get_next_missing_information

    planner = get_next_missing_information(chat_id)

    if planner and planner["field"]:
        set_expected_answer(chat_id, planner["field"])

    return planner["priority"] == "complete"

def clear_patient_state(chat_id):
    patient_state.pop(chat_id, None)


def _extract_number(text):
    match = re.search(r"\b([1-9]|10)\b", text)
    return int(match.group(1)) if match else None


def update_patient_entities(chat_id, text):

    lower = text.lower()

    patient = patient_state[chat_id]

    expected = get_expected_answer(chat_id)

    # ------------------------------------------------------
    # Smoking (only if we were expecting a smoking answer)
    # ------------------------------------------------------

    if expected == "smoking":

        if re.search(r"\b(yes|i smoke|smoker)\b", lower):
            patient["smoking"] = True
            clear_expected_answer(chat_id)
            return

        elif re.search(r"\b(no|don't smoke|do not smoke|never smoked|non smoker)\b", lower):
            patient["smoking"] = False
            clear_expected_answer(chat_id)
            return


    # ------------------------------------------------------
    # Pregnancy (only if we were expecting a pregnancy answer)
    # ------------------------------------------------------

    if expected == "pregnancy":

        if re.search(r"\b(yes|pregnant)\b", lower):
            patient["pregnancy"] = True
            clear_expected_answer(chat_id)
            return

        elif re.search(r"\b(no|not pregnant)\b", lower):
            patient["pregnancy"] = False
            clear_expected_answer(chat_id)
            return
    
    print("=" * 60)
    print("USER:", text)
    print("EXPECTED:", expected)
    print("=" * 60)
    print("EXPECTED:", expected)
    print("CHAT ID:", chat_id)
    print("=" * 60)

    # =====================================================
    # Handle expected answer first
    # =====================================================

    if expected:

        # -------------------------
        # Pain Scale
        # -------------------------

        if expected == "pain_scale":

            value = _extract_number(lower)

            if value:
                patient["pain_scale"] = value
                clear_expected_answer(chat_id)
                return

        # -------------------------
        # Duration
        # -------------------------

        elif expected == "duration":

            match = re.search(
                r"(\d+)\s*(hour|hours|day|days|week|weeks|month|months|year|years)",
                lower
            )

            if match:
                patient["duration"] = match.group(0)
                clear_expected_answer(chat_id)
                return

        # -------------------------
        # Temperature
        # -------------------------

        elif expected == "temperature":

            match = re.search(
                r"\b(3[5-9]|4[0-2])(\.\d)?\b",
                lower
            )

            if match:
                patient["fever_temperature"] = match.group(0)
                clear_expected_answer(chat_id)
                return

        # -------------------------
        # Age
        # -------------------------

        elif expected == "age":

            value = re.search(r"\b(\d{1,3})\b", lower)

            if value:
                age = int(value.group(1))

                if 0 < age <= 120:
                    patient["age"] = age
                    print("AGE SAVED:", age)
                    patient["age"] = age

                    clear_expected_answer(chat_id)
                    return

    # =====================================================
    # General extraction
    # =====================================================

    # -------------------------
    # Duration
    # -------------------------

    match = re.search(
        r"(\d+)\s*(hour|hours|day|days|week|weeks|month|months|year|years)",
        lower
    )

    if match:
        patient["duration"] = match.group(0)

    # -------------------------
    # Pain Scale
    # -------------------------

    value = _extract_number(lower)

    if value and any(word in lower for word in [
        "pain",
        "scale",
        "severity"
    ]):
        patient["pain_scale"] = value

    # -------------------------
    # Temperature
    # -------------------------

    match = re.search(
        r"\b(3[5-9]|4[0-2])(\.\d)?\b",
        lower
    )

    if match:
        patient["fever_temperature"] = match.group(0)

    # -------------------------
    # Age
    # -------------------------
    match = re.search(
        r"(i am|i'm|my age is|age is)\s+(\d{1,3})",
        lower
    )

    if match:
        age = int(match.group(2))

        if 0 < age <= 120:
            patient["age"] = age

    # -------------------------
    # Sex
    # -------------------------

    if re.search(r"\b(female|woman|girl)\b", lower):
        if patient["sex"] is None:
            patient["sex"] = "female"

    elif re.search(r"\b(male|man|boy)\b", lower):
        if patient["sex"] is None:
            patient["sex"] = "male"

    # -------------------------
    # Pain Location
    # -------------------------

    locations = [

        "head",
        "chest",
        "abdomen",
        "stomach",
        "back",
        "lower back",
        "upper back",
        "neck",
        "throat",
        "leg",
        "arm",
        "shoulder",
        "eye",
        "ear",
        "jaw",
        "hip",
        "knee",
        "foot",
        "ankle",
        "hand",
        "wrist",
        "finger"

    ]

    for location in locations:

        if re.search(rf"\b{re.escape(location)}\b", lower):
            if patient["pain_location"] is None:
                patient["pain_location"] = location
            break

    pain_characters = [

        "sharp",
        "dull",
        "burning",
        "stabbing",
        "cramping",
        "throbbing",
        "pressure",
        "aching"

    ]

    for character in pain_characters:
        if re.search(rf"\b{character}\b", lower):
            if patient["pain_character"] is None:
                patient["pain_character"] = character
            break
        
    # -------------------------
    # Emergency Symptoms
    # -------------------------

    emergency = [

        "difficulty breathing",
        "shortness of breath",
        "chest pain",
        "loss of consciousness",
        "confusion",
        "seizure"

    ]

    for symptom in emergency:

        if symptom in lower:
            patient["red_flags"].add(symptom)

    # -------------------------
    # Medications
    # -------------------------

    meds = re.search(
        r"(taking|using|on)\s+(.+)",
        lower
    )

    if meds:
        medication = meds.group(2).strip()
        if medication not in patient["medications"]:
            patient["medications"].append(medication)

    # -------------------------
    # Chronic Medical History
    # -------------------------

    chronic_diseases = [

        "diabetes",
        "hypertension",
        "high blood pressure",
        "asthma",
        "heart disease",
        "kidney disease",
        "liver disease",
        "copd",
        "epilepsy",
        "cancer",
        "thyroid disease"

    ]

    for disease in chronic_diseases:

        if disease in lower:
            if disease not in patient["medical_history"]:
                patient["medical_history"].append(disease)
            break

    # -------------------------
    # Chief Complaint
    # -------------------------

    if patient["chief_complaint"] is None:

        lower = text.lower()

        for symptom in COMMON_SYMPTOMS:

            if symptom in lower:
                patient["chief_complaint"] = symptom
                break


def get_patient_summary(chat_id):

    if chat_id not in patient_state:
        return "No patient information."

    patient = patient_state[chat_id]

    lines = []

    if patient["chief_complaint"]:
        lines.append(f"Chief complaint: {patient['chief_complaint']}")

    if patient["symptoms_present"]:
        lines.append(
            "Symptoms: " +
            ", ".join(sorted(patient["symptoms_present"]))
        )

    if patient["symptoms_absent"]:
        lines.append(
            "Denied symptoms: " +
            ", ".join(sorted(patient["symptoms_absent"]))
        )

    if patient["duration"]:
        lines.append(f"Duration: {patient['duration']}")

    if patient["pain_scale"] is not None:
        lines.append(f"Pain scale: {patient['pain_scale']}/10")

    if patient["pain_location"]:
        lines.append(f"Pain location: {patient['pain_location']}")

    if patient["pain_character"]:
        lines.append(f"Pain character: {patient['pain_character']}")

    if patient["fever_temperature"]:
        lines.append(f"Temperature: {patient['fever_temperature']}°C")

    if patient["medical_history"]:
        lines.append(
            "Medical history: " +
            ", ".join(patient["medical_history"])
        )

    if patient["medications"]:
        lines.append(
            "Medications: " +
            ", ".join(patient["medications"])
        )

    if patient["red_flags"]:
        lines.append(
            "Red flags: " +
            ", ".join(sorted(patient["red_flags"]))
        )

    return "\n".join(lines)