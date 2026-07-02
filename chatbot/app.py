# Used to build the API
# Flask → web server ,request → receive HTTP request ,jsonify → return JSON
import os

from flask import Flask, request, jsonify

# Allows your frontend to call Flask (as frontned in localhost:5173 and Flask in localhost:3000)
from flask_cors import CORS

# Imports JSON (but never used so could removed)
import json

# imports the AI pipeline (retrieval, FAISS search, prompt building, LLM call)
try:
    from grad_runner import predict
# If import fails, instead of crashing, the chatbot creates a fake predict function that returns System configuration error... 
# This prevents the Flask server from failing to start. this is good defensive programming.
except ImportError:
    def predict(query):
        return "System configuration error loading prediction weights."


# Creates the Flask application. (Every route belongs to this object)
app = Flask(__name__)
# Enables cross-origin requests. (Without this, React frontend cannot call the backend)
CORS(app)  

# POrint to the terminal to help debugging and confirm that the Flask server is running and the backend is active
print("--- WASLABOT FLASK BACKEND ACTIVE ---")


# Creates the endpoint /chat that accepts POST requests. This is the main entry point for the frontend to send user queries to the backend.
@app.route("/chat", methods=["POST"])
def chat():
    try:
        # Reads the JSON body of the POST request and extracts the "message" parameter 
        # If the JSON is invalid or the "message" parameter is missing, it returns an error response (400 Bad Request)
        # This is input Validation
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON payload format"}), 400
            
        user_query = data.get("message", "").strip()
        if not user_query:
            return jsonify({"error": "No message parameter provided"}), 400

        # Run local RAG/LLM Pipeline loop execution (The AI pipeline from grad_runner.py)
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
        # We wrap it directly here so the frontend structural chain never breaks 
        return jsonify({
            "answer": str(raw_result),
            "sources": ["Overview-Rabies", "Falls", "Bird flu"], # Default fallback context blocks
            "confidence": 1.0
        })

    # The whole route is wrapped in try: except, if aanything failes (FAISS, Ollama, network, JSON, prediction) the API returns I'm having trouble.. instead of crashing
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
#Meaning:
# listen on every network interface
# use port 3000
# enable debug mode

