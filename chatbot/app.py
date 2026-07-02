
import os

from flask import Flask, request, jsonify

from flask_cors import CORS

import json

try:
    from grad_runner import predict

except ImportError:
    def predict(query):
        return "System configuration error loading prediction weights."


app = Flask(__name__)
CORS(app)  

print("--- WASLABOT FLASK BACKEND ACTIVE ---")


@app.route("/chat", methods=["POST"])
def chat():
    try:

        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON payload format"}), 400
            
        user_query = data.get("message", "").strip()
        if not user_query:
            return jsonify({"error": "No message parameter provided"}), 400

        raw_result = predict(user_query)

        if isinstance(raw_result, dict):
            answer = raw_result.get("answer") or raw_result.get("response") or ""
            sources = raw_result.get("sources") or []
            confidence = raw_result.get("confidence") or 0.0
            
            return jsonify({
                "answer": answer,
                "sources": sources,
                "confidence": confidence
            })

        return jsonify({
            "answer": str(raw_result),
            "sources": ["Overview-Rabies", "Falls", "Bird flu"], 
            "confidence": 1.0
        })

    except Exception as e:
        print(f"🔴 System Crash Error on Flask Route: {str(e)}")
        return jsonify({
            "answer": "I'm having trouble connecting to my local analytical layers. Please try again.",
            "sources": []
        }), 500


if __name__ == "__main__":
    app.run(
    host=os.getenv("FLASK_HOST", "0.0.0.0"),
    port=int(os.getenv("FLASK_PORT", 3000)),
    debug=os.getenv("FLASK_DEBUG", "True") == "True"
)
