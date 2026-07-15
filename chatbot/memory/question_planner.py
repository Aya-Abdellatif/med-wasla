"""
question_planner.py

Determines what information is still missing before diagnosis.
This file NEVER generates text.
It only decides WHAT should be collected next.
"""

from memory.memory import patient_state


# ==========================================================
# Required information
# ==========================================================

BASE_FIELDS = [
    "duration",
    "age",
]

PAIN_FIELDS = [
    "pain_location",
    "pain_scale",
    "pain_character",
]

FEVER_FIELDS = [
    "fever_temperature",
]

RESPIRATORY_FIELDS = [
    "smoking",
]

FEMALE_FIELDS = [
    "pregnancy",
]

# ==========================================================
# Follow-up questions
# ==========================================================

FOLLOWUP_QUESTIONS = {
    "duration": "How long have you had these symptoms?",
    "age": "How old are you?",
    "pain_location": "Where exactly is the pain located?",
    "pain_scale": "On a scale of 1 to 10, how severe is the pain?",
    "pain_character": "How would you describe the pain (sharp, dull, burning, throbbing, cramping)?",
    "fever_temperature": "Have you measured your temperature? If so, what was it?",
    "smoking": "Do you currently smoke?",
    "pregnancy": "Is there any chance you could be pregnant?"
}


# ==========================================================
# Utility
# ==========================================================

def _missing(patient, field):

    value = patient.get(field)

    if value is None:
        return True

    if isinstance(value, str) and value.strip() == "":
        return True

    if isinstance(value, list) and len(value) == 0:
        return False

    return False


# ==========================================================
# Main planner
# ==========================================================

def get_next_missing_information(chat_id):

    if chat_id not in patient_state:
        return None

    patient = patient_state[chat_id]

    symptoms = patient["symptoms_present"]

    # ------------------------------------------------------
    # Emergency case
    # ------------------------------------------------------

    if patient["red_flags"]:
        return {
            "field": None,
            "priority": "emergency",
            "reason": "Emergency symptoms already detected."
        }

    # ------------------------------------------------------
    # Basic information
    # ------------------------------------------------------

    for field in BASE_FIELDS:

        if _missing(patient, field):
            return {
                "field": field,
                "priority": "high",
                "reason": f"{field.replace('_',' ')} has not been collected."
            }

    # ------------------------------------------------------
    # Pain-specific questions
    # ------------------------------------------------------

    pain_symptoms = {

        "headache",
        "chest pain",
        "abdominal pain",
        "stomach pain",
        "back pain",
        "ear pain",
        "eye pain",
        "joint pain",
        "muscle pain"
    }

    if symptoms.intersection(pain_symptoms):

        for field in PAIN_FIELDS:

            if _missing(patient, field):

                return {
                    "field": field,
                    "priority": "high",
                    "reason": "Pain assessment is incomplete."
                }

    # ------------------------------------------------------
    # Fever
    # ------------------------------------------------------

    if "fever" in symptoms:

        for field in FEVER_FIELDS:

            if _missing(patient, field):

                return {
                    "field": field,
                    "priority": "medium",
                    "reason": "Temperature has not been recorded."
                }

    # ------------------------------------------------------
    # Respiratory
    # ------------------------------------------------------

    respiratory = {

        "difficulty breathing",
        "shortness of breath",
        "cough",
        "dry cough",
        "productive cough"
    }

    if symptoms.intersection(respiratory):

        for field in RESPIRATORY_FIELDS:

            if _missing(patient, field):

                return {
                    "field": field,
                    "priority": "low",
                    "reason": "Smoking history may help evaluate respiratory symptoms."
                }

    # ------------------------------------------------------
    # Pregnancy
    # ------------------------------------------------------

    abdominal = {

        "abdominal pain",
        "stomach pain",
        "vomiting",
        "nausea"
    }

    if (
        patient["sex"] == "female"
        and symptoms.intersection(abdominal)
    ):

        if _missing(patient, "pregnancy"):

            return {
                "field": "pregnancy",
                "priority": "medium",
                "reason": "Pregnancy status may influence diagnosis."
            }

    # ------------------------------------------------------
    # Diagnosis can start
    # ------------------------------------------------------

    patient["diagnosis_ready"] = True

    return {
        "field": None,
        "priority": "complete",
        "reason": "Enough information has been collected."
    }

def get_followup_question(chat_id):
    """
    Returns the next follow-up question based on the planner.
    """

    planner = get_next_missing_information(chat_id)

    if planner is None:
        return None

    field = planner["field"]

    if field is None:
        return None

    return FOLLOWUP_QUESTIONS.get(field)