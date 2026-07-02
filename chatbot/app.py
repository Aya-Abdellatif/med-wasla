# Flask API Layer for Med-Wasla Chatbot

import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from chatbot_engine import predict


# ------------------------------------------------------------
# APP SETUP
# ------------------------------------------------------------

app = Flask(__name__)
CORS(app)

print("--- WASLABOT BACKEND ACTIVE ---")


# ------------------------------------------------------------
# CHAT ENDPOINT
# ------------------------------------------------------------

@app.route("/chat", methods=["POST"])
def chat():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "Invalid JSON payload"
            }), 400

        user_query = data.get("message", "").strip()

        if not user_query:
            return jsonify({
                "error": "Message is required"
            }), 400

        # -----------------------------
        # Run RAG pipeline
        # -----------------------------
        result = predict(user_query)

        return jsonify({
            "answer": result["answer"],
            "sources": result.get("sources", []),
            "confidence": result.get("confidence", 0.0)
        })

    except Exception as e:

        print(f"🔴 Flask Error: {e}")

        return jsonify({
            "answer": "I'm having trouble processing your request right now.",
            "sources": [],
            "confidence": 0.0
        }), 500


# ------------------------------------------------------------
# RUN SERVER
# ------------------------------------------------------------

if __name__ == "__main__":

    app.run(
        host=os.getenv("FLASK_HOST", "0.0.0.0"),
        port=int(os.getenv("FLASK_PORT", 3000)),
        debug=os.getenv("FLASK_DEBUG", "True") == "True"
    )