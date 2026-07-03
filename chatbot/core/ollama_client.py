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

    except requests.exceptions.HTTPError as e:
        body = e.response.text if e.response is not None else str(e)
        print("❌ Ollama Error:", body)
        return "Sorry, I cannot generate a response right now."

    except Exception as e:
        print("❌ Ollama Error:", e)
        return "Sorry, I cannot generate a response right now."