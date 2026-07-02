import requests

from config import (
    OLLAMA_HOST,
    OLLAMA_MODEL
)


def classify_question(user_query):
    """
    Classify the user's question into one of:
    MEDICAL
    WEBSITE
    DATABASE
    CHITCHAT
    """

    prompt = f"""
    You are a classifier for the Med-Wasla chatbot.

    Classify the user's message into EXACTLY ONE of these labels.

    MEDICAL
    WEBSITE
    DATABASE
    CHITCHAT
    GENERAL


    ------------------------
    MEDICAL
    ------------------------

    Medical questions about:

    - diseases
    - symptoms
    - diagnosis
    - medications
    - treatments
    - prevention
    - medical advice

    Examples:

    I have chest pain
    What causes diabetes?
    How do I treat a fever?


    ------------------------
    WEBSITE
    ------------------------

    Questions about how the Med-Wasla platform works.

    Examples:

    How do I register?
    How do I book an appointment?
    Can doctors offer home visits?
    How do reviews work?
    What is WaslaBot?
    How does the queue work?


    ------------------------
    DATABASE
    ------------------------

    Questions that require LIVE information from the database.

    Examples:

    Show my appointments.
    What appointments do I have?
    Who is my doctor?
    Show my upcoming bookings.
    How many reviews does Dr Ahmed have?
    What is Dr Ahmed's rating?
    Which cardiologists are available?
    Find dermatologists.
    Show approved specialists.

    If answering requires querying MongoDB, return DATABASE.


    ------------------------
    CHITCHAT
    ------------------------

    Greetings or casual conversation.

    Examples:

    Hello
    Hi
    Good morning
    Thanks
    Bye
    Who are you?


    ------------------------
    GENERAL
    ------------------------

    Everything else.

    Examples:

    Tell me a joke.
    What is Python?
    How do airplanes fly?


    Return ONLY ONE WORD.

    Question:

    {user_query}

    Category:
    """

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0
        }
    }

    try:
        response = requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json=payload,
            timeout=60
        )

        response.raise_for_status()

        return (
            response.json()["response"]
            .strip()
            .split()[0]
            .replace(".", "")
            .upper()
        )

    except requests.exceptions.HTTPError as e:
        body = e.response.text if e.response is not None else str(e)
        print("Classifier error:", body)
        return "CHITCHAT"

    except Exception as e:
        print("Classifier error:", e)
        return "CHITCHAT"