"""
ollama_client.py

Handles all communication with the Ollama API.
ONLY API layer (NO chatbot logic here)
"""

import requests

from config import (
    OLLAMA_HOST,
    OLLAMA_MODEL,
    TEMPERATURE,
    MAX_TOKENS,
    CONTEXT_SIZE
)


def classify_question(user_query):
    """
    Classify user query into:
    MEDICAL / WEBSITE / DATABASE / CHITCHAT
    """

    prompt = f"""
You are a classifier.

Classify the user's question into ONE category:

MEDICAL
WEBSITE
DATABASE
CHITCHAT

Return ONLY one word.

Question:
{user_query}

Category:
"""

    try:
        response = requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0}
            },
            timeout=60
        )

        response.raise_for_status()
        return response.json()["response"].strip().upper()

    except Exception as e:
        print("Classifier error:", e)
        return "CHITCHAT"


def generate_response(prompt):
    """
    Send final prompt to Ollama
    """

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": TEMPERATURE,
            "num_predict": MAX_TOKENS,
            "num_ctx": CONTEXT_SIZE
        }
    }

    try:
        response = requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json=payload,
            timeout=180
        )

        response.raise_for_status()

        return response.json().get("response", "").strip()

    except Exception as e:
        print("❌ Ollama Error:", e)
        return "Sorry, I cannot generate a response right now."