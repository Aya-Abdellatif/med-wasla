from flask import Flask, request, jsonify
from grad_runner import predict

app = Flask(__name__)


@app.get("/")
def home():
    return {"status": "running"}


@app.post("/chat")
def chat():
    message = request.json["message"]

    response = predict(message)

    return jsonify({
        "response": response
    })

app.run(port=8000)