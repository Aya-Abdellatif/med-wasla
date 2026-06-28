from flask import Flask, request, jsonify
from flask_cors import CORS
from grad_runner import predict

app = Flask(__name__)
CORS(app)

@app.post("/chat")
def chat():
    message = request.json.get("message", "")
    
    # This returns {"answer": "...", "sources": [...]}
    result = predict(message) 
    
    # Return result directly to keep the structure flat for the frontend
    return jsonify(result)

if __name__ == "__main__":
    app.run(port=3000, debug=True) # Ensure this matches your AI_URL port (3000)