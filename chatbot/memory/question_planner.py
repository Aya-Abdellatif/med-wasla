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

FOLLOWUP_GUIDANCE = {
    "duration":
        "Ask naturally how long the symptoms have been present.",

    "age":
        "Ask naturally for the patient's age.",

    "pain_location":
        "Ask where the pain is located.",

    "pain_scale":
        "Ask how severe the pain is (1-10).",

    "pain_character":
        "Ask the patient to describe the pain (sharp, dull, burning, throbbing, cramping).",

    "fever_temperature":
        "Ask whether the patient measured their temperature and what it was.",

    "smoking":
        "Ask whether the patient currently smokes.",

    "pregnancy":
        "Ask whether there is any chance the patient could be pregnant."
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
    if not symptoms:
        return {
            "field": None,
            "priority": "waiting_for_symptoms",
            "reason": "No symptoms have been collected yet."
        }

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

    print(patient)
    
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

    if any("fever" in symptom for symptom in symptoms):

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

    patient["diagnosis_ready"] = (
    planner := {
        "field": None,
        "priority": "complete",
        "reason": "Enough information has been collected."
    }
)


    patient["diagnosis_ready"] = True

    return {
        "field": None,
        "priority": "complete",
        "reason": "Enough information has been collected."
    }


def get_followup_guidance(chat_id):
    """
    Returns the next follow-up guidance based on the planner.
    """

    planner = get_next_missing_information(chat_id)

    if planner is None:
        return None

    field = planner["field"]

    if field is None:
        return None

    return FOLLOWUP_GUIDANCE.get(field)