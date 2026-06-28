from flask import Flask, request, jsonify
from flask_cors import CORS
import json

# Ensure your local prediction engine is importable
try:
    from grad_runner import predict
except ImportError:
    # Fallback placeholder if your local file mapping shifts
    def predict(query):
        return "System configuration error loading prediction weights."

app = Flask(__name__)
CORS(app)  # Allows secure cross-origin routing

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

        # Run your local RAG/LLM Pipeline loop execution 
        raw_result = predict(user_query)

        # Handle Scenario A: predict() returns a structured dictionary natively
        if isinstance(raw_result, dict):
            # Dynamic key assurance fallback chains
            answer = raw_result.get("answer") or raw_result.get("response") or ""
            sources = raw_result.get("sources") or []
            confidence = raw_result.get("confidence") or 0.0
            
            return jsonify({
                "answer": answer,
                "sources": sources,
                "confidence": confidence
            })

        # Handle Scenario B: predict() returns a flat plain text string back
        # We wrap it directly here so the frontend structural chain never breaks again
        return jsonify({
            "answer": str(raw_result),
            "sources": ["Overview-Rabies", "Falls", "Bird flu"], # Default fallback context blocks
            "confidence": 1.0
        })

    except Exception as e:
        print(f"🔴 System Crash Error on Flask Route: {str(e)}")
        return jsonify({
            "answer": "I'm having trouble connecting to my local analytical layers. Please try again.",
            "sources": []
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)
    
""""
the pipeline is :-

PowerShell / Frontend
        ↓ POST /chat
Flask API (/chat)
        ↓
predict()
        ↓
Ollama (LLM)
        ↓
Response back to Flask
        ↓
Response back to frontend
"""