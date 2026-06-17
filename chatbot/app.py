from flask import Flask, request, jsonify
from grad_runner import predict

app = Flask(__name__)

print("APP.PY LOADED")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_query = data.get("message")

    if not user_query:
        return jsonify({"error": "No message provided"}), 400

    response = predict(user_query)

    return jsonify({
        "response": response
    })

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