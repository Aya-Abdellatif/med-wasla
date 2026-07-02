# Flask API Layer for Med-Wasla Chatbot

import os
from flask import Flask, request, jsonify
from flask_cors import CORS

from chatbot_engine import predict
from memory.session import set_user


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
        chat_id = data.get("chat_id", "").strip()
        user_id = data.get("user_id")

        if not user_query:
            return jsonify({
                "error": "Message is required"
            }), 400

        if not chat_id:
            return jsonify({
                "error": "chat_id is required"
            }), 400

        if user_id:
            set_user(chat_id, user_id)

        # -----------------------------
        # Run RAG pipeline
        # -----------------------------
        result = predict(user_query, chat_id)

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