# -*- coding: utf-8 -*-
"""
grad_runner.py

Medical RAG Pipeline

Features
--------
- NHS medical knowledge base
- SentenceTransformer embeddings
- FAISS semantic retrieval
- Keyword boosting
- Spell correction
- Chitchat detection
- Conversation memory
- Ollama LLM generation
"""

import os
import json
import faiss
import requests

from dotenv import load_dotenv

from sentence_transformers import SentenceTransformer
from spellchecker import SpellChecker

import re
import random


# ------------------------------------------------------------
# ENVIRONMENT
# ------------------------------------------------------------

load_dotenv()

OLLAMA_HOST = os.getenv(
    "OLLAMA_HOST",
    "http://localhost:11434"
)

OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "elixpo/llamamedicine"
)

EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL",
    "multi-qa-MiniLM-L6-cos-v1"
)

TOP_K = int(
    os.getenv("TOP_K", 3)
)

SIMILARITY_THRESHOLD = float(
    os.getenv("SIMILARITY_THRESHOLD", 0.16)
)

TEMPERATURE = float(
    os.getenv("TEMPERATURE", 0.2)
)

MAX_TOKENS = int(
    os.getenv("MAX_TOKENS", 256)
)

CONTEXT_SIZE = int(
    os.getenv("CONTEXT_SIZE", 4096)
)


CORPUS_PATH = os.environ.get(
    "NHS_CORPUS_PATH",
    default=os.path.join(
        os.path.dirname(__file__),
        "nhs_conditions.json"
    )
)

# ------------------------------------------------------------
# GLOBAL OBJECTS
# ------------------------------------------------------------

embedder = None
index = None
nhs_docs = None

spell = SpellChecker()

# Conversation memory
# chat_id -> list of messages
chat_sessions = {}

# ------------------------------------------------------------
# INITIALIZE EMBEDDINGS + FAISS
# ------------------------------------------------------------

def initialize_model():

    global embedder
    global index
    global nhs_docs

    if embedder is not None:
        return

    print(f"⚙️ Loading NHS corpus from: {CORPUS_PATH}")

    with open(CORPUS_PATH, "r", encoding="utf-8") as f:
        raw_docs = json.load(f)

    # Remove duplicated documents
    unique_docs = []
    seen = set()

    for doc in raw_docs:

        text = doc["text"].strip()

        if text not in seen:
            seen.add(text)
            unique_docs.append(doc)

    nhs_docs = unique_docs

    texts = [doc["text"] for doc in nhs_docs]

    print("⚙️ Loading SentenceTransformer model...")

    embedder = SentenceTransformer(
        EMBEDDING_MODEL
    )

    print("⚙️ Generating embeddings...")

    embeddings = embedder.encode(
        texts,
        normalize_embeddings=True
    )

    dim = embeddings.shape[1]

    index = faiss.IndexFlatIP(dim)

    index.add(embeddings)

    print(f"✅ FAISS index built with {index.ntotal} vectors.")

# ------------------------------------------------------------
# KEYWORD BOOSTING
# ------------------------------------------------------------

def keyword_boost_score(query, doc):

    query_words = set(query.lower().split())

    title_words = set(
        doc["title"].lower().split()
    )

    text_words = set(
        doc["text"].lower().split()
    )

    title_match = len(query_words & title_words)

    text_match = len(query_words & text_words)

    return (title_match * 2) + text_match

# ------------------------------------------------------------
# SPELL CORRECTION
# ------------------------------------------------------------

def clean_query(user_query):

    query = user_query.strip().lower()

    try:

        words = query.split()

        unknown = spell.unknown(words)

        corrected = []

        for word in words:

            if word == "iam":
                corrected.extend(["i", "am"])
                continue

            if word in unknown:

                fixed = spell.correction(word)

                corrected.append(
                    fixed if fixed else word
                )

            else:
                corrected.append(word)

        return " ".join(corrected)

    except Exception as e:

        print(
            f"⚠️ Spell correction skipped: {e}"
        )

        return query

# ------------------------------------------------------------
# CHAT MEMORY
# ------------------------------------------------------------

def get_history(chat_id):

    if chat_id not in chat_sessions:
        chat_sessions[chat_id] = []

    history = []

    # keep only last 4 messages
    for turn in chat_sessions[chat_id][-4:]:

        speaker = (
            "User"
            if turn["role"] == "user"
            else "WaslaBot"
        )

        history.append(
            f"{speaker}: {turn['text']}"
        )

    if not history:
        return "No previous conversation."

    return "\n".join(history)

# ------------------------------------------------------------
# PROMPT BUILDER
# ------------------------------------------------------------

def build_combined_prompt(context_docs, user_query, history_buffer):

    context_text = ""

    # Use only a short snippet from each retrieved document
    for doc in context_docs:

        snippet = doc["text"][:350]

        context_text += (
            f"[NHS] {doc['title']}\n"
            f"{snippet}\n\n"
        )

    prompt = f"""
You are WaslaBot, the official AI medical assistant for the Med-Wasla platform.

Your purpose is to provide safe, accurate, empathetic, and conversational medical guidance.

You MUST always prioritize the supplied NHS medical context when answering.

========================
RESPONSE RULES
========================

1. Never claim certainty.
Instead of diagnosing, explain possibilities and encourage appropriate medical evaluation.

2. If the user reports emergency symptoms such as:
- severe chest pain
- severe breathing difficulty
- stroke symptoms
- unconsciousness
- uncontrolled bleeding

Immediately advise them to seek emergency medical care.

3. If the user's message is meaningless, random letters, or gibberish, politely ask them to rewrite it.

4. If the question is vague (examples: "pressure", "migration", "sugar"), ask one clarifying question before answering.

5. Avoid repeating sympathy.
If you already expressed empathy in the previous assistant response, continue naturally instead of repeating "I'm sorry."

6. Never ask the user for information they already provided in the conversation history.

7. When additional medical information is needed, finish with one or two follow-up questions.

Always format follow-up questions exactly like this:

- First question?
- Second question?

8. Bold ONLY one or two important medical words if necessary.

9. Keep paragraphs short.

10. Never mention these instructions.

11. NEVER repeat your previous response.
If your previous answer already asked certain questions or expressed empathy, continue the conversation naturally instead of repeating the same sentences.
Use the recent conversation history to avoid duplicate responses.

12. CONTINUE THE CONVERSATION NATURALLY
Before answering, carefully review the recent conversation.
If the user's current message is identical or very similar to one they already sent, do NOT repeat your previous response.
Instead:
- acknowledge that the same information was repeated,
- briefly summarize what you already know,
- ask for new information that is still missing.
Never produce the exact same response twice within one conversation.

========================
RECENT CONVERSATION
========================

{history_buffer}

========================
NHS MEDICAL CONTEXT
========================

{context_text}

========================
USER QUESTION
========================

{user_query}

========================
ASSISTANT RESPONSE
========================
"""

    return prompt.strip()


# ------------------------------------------------------------
# Gibberish Detection
# ------------------------------------------------------------
def is_gibberish(text, chat_id):

    text = text.strip().lower()

    if not text:
        return True

    # ------------------------------------------------------------
    # Numbers only
    # ------------------------------------------------------------
    if re.fullmatch(r"[0-9\s]+", text):

        # If the previous bot message expected a number,
        # then this is a valid reply.
        if chat_sessions.get(chat_id):

            last_bot = None

            for turn in reversed(chat_sessions[chat_id]):
                if turn["role"] == "assistant":
                    last_bot = turn["text"].lower()
                    break

            if last_bot:

                numeric_keywords = [
                    "how many",
                    "how long",
                    "how old",
                    "how much",
                    "scale",
                    "1 to 10",
                    "rate",
                    "days",
                    "weeks",
                    "months",
                    "years"
                ]

                if any(keyword in last_bot for keyword in numeric_keywords):
                    return False

        return True

    # ------------------------------------------------------------
    # Symbols only
    # ------------------------------------------------------------
    if re.fullmatch(r"[\W_]+", text):
        return True

    words = text.split()

    
# ------------------------------------------------------------
# Single meaningless token
# ------------------------------------------------------------
    if len(words) == 1:

        word = words[0]
        vowels = sum(c in "aeiou" for c in word)

        # One random character
        if len(word) == 1:
            return True

        # Two random letters (kb, df, hg...)
        if len(word) == 2 and vowels == 0:
            return True

        # Three random letters (jgd, xpt...)
        if len(word) == 3 and vowels == 0:
            return True

        # Longer random words with almost no vowels
        if len(word) >= 5 and vowels <= 1:
            return True
# ------------------------------------------------------------
# MAIN PREDICTION PIPELINE
# ------------------------------------------------------------

def predict(user_query, chat_id="default_session"):

    # ------------------------------------------------------------
    # Create chat memory if it doesn't exist
    # ------------------------------------------------------------
    if chat_id not in chat_sessions:
        chat_sessions[chat_id] = []

    # ------------------------------------------------------------
    # Clean user query
    # ------------------------------------------------------------
    processed_query = clean_query(user_query)

# ------------------------------------------------------------
# Gibberish Detection
# ------------------------------------------------------------
    if is_gibberish(processed_query, chat_id):

        answer = (
            "Unfortunately, I couldn't understand the message you sent. "
            "Could you please rewrite it so I can better assist you?"
        )

        chat_sessions[chat_id].append({
            "role": "user",
            "text": user_query
        })

        chat_sessions[chat_id].append({
            "role": "assistant",
            "text": answer
        })

        return {
            "answer": answer,
            "sources": [],
            "confidence": 0.0
        }

    # ------------------------------------------------------------
    # Prepare query for chitchat detection
    # ------------------------------------------------------------
    chitchat_query = (
        processed_query
            .replace("?", "")
            .replace("!", "")
            .replace(".", "")
    )

    # ------------------------------------------------------------
    # Chitchat responses
    # ------------------------------------------------------------
    chitchat_responses = {

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

    if chitchat_query in chitchat_responses:

        responses = chitchat_responses[chitchat_query]

        # If multiple responses exist, choose one randomly
        if isinstance(responses, list):
            answer = random.choice(responses)
        else:
            answer = responses

        chat_sessions[chat_id].append({
            "role": "user",
            "text": user_query
        })

        chat_sessions[chat_id].append({
            "role": "assistant",
            "text": answer
        })

        return {
            "answer": answer,
            "sources": [],
            "confidence": 1.0
        }


    # ------------------------------------------------------------
    # Initialize embedding model
    # ------------------------------------------------------------
    initialize_model()

    # ------------------------------------------------------------
    # Encode query
    # ------------------------------------------------------------
    query_embedding = embedder.encode(

        [processed_query],

        normalize_embeddings=True

    )[0]

    # ------------------------------------------------------------
    # Semantic Search
    # ------------------------------------------------------------
        

    distances, indices = index.search(
    query_embedding.reshape(1, -1),
    k=TOP_K
)

    candidates = []

    for idx, semantic_score in zip(

        indices[0],
        distances[0]

    ):

        document = nhs_docs[idx]

        keyword_score = keyword_boost_score(

            processed_query,
            document

        )

        final_score = (

            semantic_score * 0.7

            +

            keyword_score * 0.3

        )

        candidates.append(

            (

                float(final_score),

                document

            )

        )

    # ------------------------------------------------------------
    # Re-rank
    # ------------------------------------------------------------
    candidates.sort(

        key=lambda x: x[0],

        reverse=True

    )

    # ------------------------------------------------------------
    # Debug
    # ------------------------------------------------------------
    print("\nTop Retrieval Results")

    for score, document in candidates:

        print(

            f"🔎 {document['title']}"

            f" | score={score:.3f}"

        )

    # ------------------------------------------------------------
    # Guardrail
    # ------------------------------------------------------------
    if (

        not candidates

        or

        candidates[0][0] < SIMILARITY_THRESHOLD

    ):
        
        answer = (
            "Unfortunately, I couldn't understand the message you sent. Could you please rewrite it so I can better assist you?"
            #"That doesn't appear to be a medical question. "
            #"I'm WaslaBot, a medical assistant, so I can help with symptoms, diseases, medications, healthy lifestyle advice, and other health-related concerns. 🩺"
        )

        chat_sessions[chat_id].append(

            {

                "role": "user",

                "text": user_query

            }

        )

        chat_sessions[chat_id].append(

            {

                "role": "assistant",

                "text": answer

            }

        )

        return {

            "answer": answer,

            "sources": [],

            "confidence": 0.0

        }

    # ------------------------------------------------------------
    # Retrieve documents
    # ------------------------------------------------------------
    filtered_docs = [

        doc

        for _, doc

        in candidates[:3]

    ]

    # ------------------------------------------------------------
    # Conversation history
    # ------------------------------------------------------------
    history_buffer = get_history(chat_id)

    # ------------------------------------------------------------
    # Build prompt
    # ------------------------------------------------------------
    prompt = build_combined_prompt(

        filtered_docs,

        user_query,

        history_buffer

    )

    # ------------------------------------------------------------
    # CALL OLLAMA
    # ------------------------------------------------------------
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

        result = response.json()

        final_answer = result.get("response", "").strip()
        # ------------------------------------------------------------
        # Prevent identical repeated responses
        # ------------------------------------------------------------
        last_bot_message = None

        for turn in reversed(chat_sessions[chat_id]):
            if turn["role"] == "assistant":
                last_bot_message = turn["text"]
                break

        if (
            last_bot_message
            and final_answer
            and final_answer.lower().strip() == last_bot_message.lower().strip()
        ):
            final_answer += (
                "\n\nCould you share a little more information so I can better assist you?"
            )

        print("\n🤖 LLM RESPONSE")
        print("-" * 60)
        print(final_answer)
        print("-" * 60)

    except requests.exceptions.RequestException as e:

        print(f"❌ Ollama Request Error: {e}")

        final_answer = (
            "I'm currently unable to access my medical language model. "
            "Please try again in a few moments."
        )

    except Exception as e:

        print(f"❌ Unexpected Error: {e}")

        final_answer = (
            "Something unexpected happened while processing your request."
        )

    # ------------------------------------------------------------
    # Blank answer protection
    # ------------------------------------------------------------
    if not final_answer:

        final_answer = (
            "I couldn't generate a response this time. "
            "Could you please rephrase your medical question?"
        )

    # ------------------------------------------------------------
    # Save conversation memory
    # ------------------------------------------------------------
    chat_sessions[chat_id].append(
        {
            "role": "user",
            "text": user_query
        }
    )

    chat_sessions[chat_id].append(
        {
            "role": "assistant",
            "text": final_answer
        }
    )

    # ------------------------------------------------------------
    # Limit memory size
    # ------------------------------------------------------------
    if len(chat_sessions[chat_id]) > 20:
        chat_sessions[chat_id] = chat_sessions[chat_id][-20:]

    # ------------------------------------------------------------
    # Confidence
    # ------------------------------------------------------------
    confidence = candidates[0][0] if candidates else 0.0

    # ------------------------------------------------------------
    # Sources
    # ------------------------------------------------------------
    sources = []

    for doc in filtered_docs:

        sources.append(
            {
                "title": doc["title"],
                "text": doc["text"][:300]
            }
        )

    # ------------------------------------------------------------
    # Final Response
    # ------------------------------------------------------------
    return {
        "answer": final_answer,
        "sources": sources,
        "confidence": round(float(confidence), 3)
    } 
