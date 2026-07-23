"""
chitchat.py

Handles predefined conversational responses.
"""

import random

CHITCHAT_RESPONSES = {

    "hi": [
        "Hello! 👋 I'm WaslaBot, your AI medical assistant. How are you feeling today, and how can I help you with your health?",
        "Hi there! 😊 Welcome to Med-Wasla. I'm here to answer your health questions. What can I help you with today?",
        "Hello! 🩺 It's great to see you. Tell me about any symptoms or health concerns you have.",
        "Hi! 👋 I'm WaslaBot. Whether you have symptoms or just a health question, I'm here to help."
    ],

    "hello": [
        "Hello! 😊 I'm WaslaBot, your AI medical assistant. How can I assist you today?",
        "Hi there! 👋 I hope you're doing well. What health question can I help you with?",
        "Hello! 🩺 Welcome! Feel free to ask me about symptoms, conditions, or general health advice.",
        "Hello! It's nice to meet you. 😊 What can I help you with today?"
    ],

    "hey": [
        "Hey! 👋 It's great to see you. How can I help you with your health today?",
        "Hey there! 😊 I'm WaslaBot. Tell me what's been bothering you.",
        "Hi! 👋 I'm here whenever you need health information or guidance.",
        "Hey! 🩺 What health concern would you like to discuss today?"
    ],

    "good morning": [
        "Good morning! ☀️ I hope you're having a great start to your day. How can I help you today?",
        "Good morning! 😊 I'm WaslaBot, ready to help with any health questions you have.",
        "Morning! 🌞 I hope you're feeling well. Is there anything health-related you'd like to ask?",
        "Good morning! 🩺 How can I assist you today?"
    ],

    "good afternoon": [
        "Good afternoon! 😊 How can I help you with your health today?",
        "Good afternoon! 👋 I'm WaslaBot. What health question is on your mind?",
        "Hello! I hope your day is going well. 🩺 How may I assist you?",
        "Good afternoon! Feel free to tell me about any symptoms or health concerns."
    ],

    "good evening": [
        "Good evening! 🌙 I'm WaslaBot. How can I help you tonight?",
        "Good evening! 😊 I hope you're doing well. What health question can I help with?",
        "Hello! 🌙 If you have any health concerns, I'm here to help.",
        "Good evening! 🩺 How are you feeling today?"
    ],

    "how are you": [
        "I'm doing great, thank you for asking! 😊 I'm always ready to help with your health questions. How are you feeling today?",
        "I'm doing well! 🤖 Thank you for asking. What can I help you with today?",
        "I'm functioning perfectly and ready to assist you. 🩺 How can I help?",
        "I'm always here and ready to support you with your health concerns. 😊"
    ],

    "who are you": [
        "I'm WaslaBot, the AI medical assistant for the Med-Wasla platform. I'm here to answer health-related questions and provide general medical guidance. 🩺",
        "I'm WaslaBot! 😊 My goal is to help you understand symptoms, health conditions, and when to seek medical care.",
        "I'm WaslaBot, your virtual medical assistant. I can provide health information and help guide you through your concerns.",
        "I'm WaslaBot, an AI assistant designed to support users with reliable health information."
    ],

    "what is your name": [
        "My name is WaslaBot! 😊 I'm your AI medical assistant.",
        "I'm WaslaBot. 👋 It's nice to meet you!",
        "You can call me WaslaBot! 🩺 I'm here whenever you need health guidance.",
        "I'm WaslaBot, your virtual healthcare assistant."
    ],

    "i love you": [
        "Aww, thank you! ❤️ That means a lot. I'm always happy to help with your health questions.",
        "That's so kind of you! 😊 I'm glad I can support you whenever you need health information.",
        "Thank you! 💙 I'm always here to help you stay informed and healthy.",
        "You're very sweet! ❤️ I'll always do my best to help with your medical concerns."
    ],

    "thank you": [
        "You're very welcome! 😊 I'm happy I could help. If you have any other health questions, just let me know.",
        "My pleasure! 💙 Take care, and feel free to ask if you need anything else.",
        "You're welcome! 🩺 Wishing you good health. Let me know if there's anything more I can do.",
        "Anytime! 😊 I'm here whenever you need health information or guidance."
    ],

    "thanks": [
        "You're welcome! 😊 Take care and stay healthy!",
        "Happy to help! 💙 Don't hesitate to ask if you have more health questions.",
        "You're most welcome! 🩺 I hope you have a wonderful day.",
        "Glad I could help! 😊 Let me know if you need anything else."
    ],

    "bye": [
        "Goodbye! 👋 Take care of yourself, and I wish you good health!",
        "See you next time! 😊 Stay safe and take care.",
        "Take care! 💙 I'm here whenever you need health advice.",
        "Goodbye! 🩺 Wishing you good health and a wonderful day."
    ],

    "goodbye": [
        "Take care! 🌿 I hope you stay healthy. Feel free to come back anytime.",
        "Goodbye! 👋 Wishing you all the best and good health.",
        "See you soon! 😊 Stay healthy and don't hesitate to return if you have questions.",
        "Take care! 💙 I'm always here whenever you need medical guidance."
    ],

    "good night": [
        "Good night! 🌙 I hope you get a restful sleep. Take care!",
        "Sleep well! 😊 Wishing you a peaceful and healthy night.",
        "Good night! 🌟 Take care of yourself, and I'll be here if you need me.",
        "Have a restful night! 🌙 Stay healthy."
    ],

    "good job": [
        "Thank you! 😊 I'm glad I could help.",
        "That's very kind of you! 💙 I'm always happy to assist.",
        "I appreciate that! 😊 My goal is to provide helpful health information.",
        "Thank you! 🩺 I'm here whenever you need assistance."
    ],

    "nice": [
        "I'm glad you think so! 😊 Is there anything else I can help you with today?",
        "That's great to hear! 💙 Feel free to ask any health-related questions.",
        "Thank you! 😊 I'm always here if you need medical information or guidance.",
        "I'm happy to help! 🩺 Is there anything else on your mind?"
    ]
}


def normalize_chitchat_query(query):
    """
    Removes common punctuation before matching.
    """

    return (
        query.lower()
             .replace("?", "")
             .replace("!", "")
             .replace(".", "")
             .strip()
    )


def get_chitchat_response(query):
    """
    Returns a random predefined response.

    Returns
    -------
    str | None
    """

    query = normalize_chitchat_query(query)

    responses = CHITCHAT_RESPONSES.get(query)

    if responses is None:
        return None

    return random.choice(responses)