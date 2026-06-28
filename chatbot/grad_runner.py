# -*- coding: utf-8 -*-
"""
grad_runner.py
Refactored RAG pipeline with:
- Chitchat / Non-medical question interceptor
- Production-grade NLP spelling correction pipeline
- FAISS retrieval (top_k=3)
- Keyword boosting & Low-confidence guardrail
- Reranking
- Per-chat conversation memory tracking (Stateful sessions)
- Structured output (answer + sources + confidence)
"""

import os
from dotenv import load_dotenv
import json
import faiss
import requests
from sentence_transformers import SentenceTransformer
from spellchecker import SpellChecker  # for spell checking

# ----------------------------
# ENV
# ----------------------------
load_dotenv()

CORPUS_PATH = os.environ.get(
    "NHS_CORPUS_PATH",
    default=os.path.join(os.path.dirname(__file__), "nhs_conditions.json")
)

# ----------------------------
# GLOBALS & MEMORY STORAGE
# ----------------------------
embedder = None
index = None
nhs_docs = None
spell = SpellChecker()  # for spell checker

# 🔥 Chat Memory Store: Maps chat_id -> list of dicts [{"role": "user"/"assistant", "text": "..."}]
chat_sessions = {}


# ----------------------------
# INIT MODEL
# ----------------------------
def initialize_model():
    global embedder, index, nhs_docs

    if embedder is not None:
        return

    print("⚙️ Loading NHS corpus from:", CORPUS_PATH)

    with open(CORPUS_PATH, "r", encoding="utf-8") as f:
        raw_docs = json.load(f)

    # deduplicate
    seen = set()
    unique_docs = []

    for d in raw_docs:
        text = d["text"].strip()
        if text not in seen:
            seen.add(text)
            unique_docs.append(d)

    nhs_docs = unique_docs
    texts = [d["text"] for d in nhs_docs]

    print("⚙️ Loading SentenceTransformer model...")
    embedder = SentenceTransformer("multi-qa-MiniLM-L6-cos-v1")

    print("⚙️ Generating embeddings...")
    embeddings = embedder.encode(texts, normalize_embeddings=True)

    dim = embeddings.shape[1]
    index_local = faiss.IndexFlatIP(dim)
    index_local.add(embeddings)

    index = index_local

    print(f"✅ FAISS index built with {index.ntotal} vectors.")


# ----------------------------
# KEYWORD BOOSTING
# ----------------------------
def keyword_boost_score(query, doc):
    query_words = set(query.lower().split())
    title_words = set(doc["title"].lower().split())
    text_words = set(doc["text"].lower().split())

    title_match = len(query_words & title_words)
    text_match = len(query_words & text_words)

    return (title_match * 2) + text_match


# ----------------------------
# PROMPT BUILDER
# ----------------------------
def build_combined_prompt(context_docs, user_query, history_buffer):
    context_text = ""

    for doc in context_docs:
        snippet = doc["text"][:800]
        context_text += f"[NHS] {doc['title']}: {snippet}\n\n"

    prompt = f"""
You are WaslaBot, the official medical chatbot assistant for the Med-Wasla platform. Your core mission is to help users navigate health concerns safely, compassionately, and accurately through conversational intake.

You must follow these execution protocols and structural formatting rules strictly across every single turn of the conversation:

1. SMART BOLDING PROTOCOL
- NEVER bold entire sentences, long phrases, introductory statements, or full lines of empathy.
- Only wrap a maximum of 1 or 2 isolated, crucial medical words or key symptoms per response in markdown stars (**word**).
- Absolute Rule: If you cannot restrict bolding to an isolated single word, do not use markdown bolding anywhere in your response.
- Good Example: "I'm sorry to hear you're dealing with that **pain**."
- Bad Example: "**I'm sorry to hear you're dealing with that pain. Let's look into this together.**"

2. TRIAGE QUESTIONS SEPARATION PROTOCOL
- When asking follow-up questions to explore the user's condition, you MUST present each individual question on a completely fresh line.
- CRITICAL FOR DESIGN: You must exclusively use a single markdown hyphen character followed by a space (- ) at the absolute start of the line for each question. This signals the UI renderer to create clean vertical container blocks.
- STRICTLY BANNED: Never use asterisks (*), never use numbers (1., 2.), and never wrap numbers in parentheses (1), 2)). Only use hyphens.
- Example Structural Layout:
  "Could you please tell me a bit more about what's going on? 
  - What specific **symptoms** are you experiencing?
  - How long have you been feeling this way?"

3. INTELLIGENT CONVERSATIONAL EMPATHY (NO REPETITION)
- Check the recent conversation history buffer before generating your response.
- NEW SYMPTOMS: If the user introduces a new symptom or emotional distress for the first time (e.g., "iam not feeling good", "i have pain in brain"), validate their feelings warmly without using bolding.
  * Examples: "I'm sorry to hear you're dealing with that pain." or "I hear you, and I'm sorry you are going through a tough time right now."
- ONGOING SYMPTOMS: If you have already expressed sympathy or validated their pain in the immediately preceding messages in the chat history, DO NOT REPEAT IT. Banning consecutive "I'm so sorry" statements prevents a robotic loop. Instead, transition naturally using active listening phrases:
  * Examples: "Thank you for confirming those details.", "Got it, a sudden onset helps clarify things.", "Understood. Let's focus closely on that symptom."

4. CONVERSATIONAL DIAGNOSTIC TRIAGE (NO REDUNDANT QUESTIONS)
- Review what facts the user has already stated inside the recent conversation history. If the user already volunteered a detail (e.g., "it started yesterday" or "i feel pain in the brain"), DO NOT ask them a redundant question about it.
- Always conclude your response by asking 1 or 2 targeted, open-ended follow-up questions formatted on separate hyphenated lines to explore missing context:
  * Chronology: "When did this symptom first begin, and has it changed over time?"
  * Severity: "On a scale of 1 to 10 (with 10 being severe), how would you rate your discomfort right now?"
  * Accompanying Symptoms: "Are you experiencing any other symptoms alongside this, such as nausea, dizziness, or a fever?"

5. HANDLING GIBBERISH, TYPOS, AND MEANINGLESS INPUTS
- If a user sends random keystrokes, non-words, or gibberish that lacks any semantic meaning (e.g., "jfbgr", "d", "gf"), do not attempt to guess or hallucinate an interpretation.
- Stop immediately and use this exact fallback style:
  * "I'm sorry, I didn't quite catch that or understand what you sent. 📝 Could you please rephrase your message using clear symptoms or health concerns? I am here to help you with medical and wellness questions!"

6. HANDLING VAGUE OR AMBIGUITY (THE "MIGRATION" SCENARIO)
- Never say a cold dead-end statement like: "I don't have enough medical information to provide an answer." 
- If a user inputs a single ambiguous medical word or a highly vague concept (like "migration", "sugar", "pressure"), guide them by offering clear, contextual possibilities and asking them to choose or expand.
  * Example: "I want to make sure I understand you correctly. When you mention 'migration', are you referring to a migrating pain (like a headache moving around), or are you planning an international move/travel and need travel vaccinations? Please tell me a bit more so I can offer relevant guidance."

7. MEDICAL SAFETY & EMERGENCY RED FLAGS (CRITICAL)
- If a user reports life-threatening emergency symptoms (such as severe crushing chest pain, sudden numbness on one side of the body, severe shortness of breath, or uncontrollable bleeding), skip normal intake.
- Immediately tell them to seek urgent care: "These symptoms could indicate a serious condition that requires immediate medical attention. Please contact your local **emergency services** (like 999 or 112) or go to the nearest emergency department right away."

8. STRUCTURAL PARAGRAPH BOUNDARIES
- Use explicit newline carriage returns (\\n) to break your response into short, clean paragraphs so it is easy to read on mobile and web chat screens.
- Avoid long walls of text. Keep information paragraphs to a maximum of 2 sentences.

9. ZERO META-COMMENTARY OR NOTES
- NEVER add explanatory notes, meta-commentary, parenthetical advice, or feedback about how you followed instructions.
- Output ONLY the direct conversational dialogue intended for the user to read.

RECENT CONVERSATION HISTORY (PER CHAT SESSION):
{history_buffer}

CONTEXT From Medical Database:
{context_text}

USER NEW QUESTION:
{user_query}

ANSWER:
"""
    return prompt.strip()


# ----------------------------
# PREDICT FUNCTION
# ----------------------------
def predict(user_query, chat_id="default_session"):
    # Initialize the memory array for a new chat session if it does not exist
    if chat_id not in chat_sessions:
        chat_sessions[chat_id] = []

    # --------------------------------------------------------
    # 1. PRODUCTION-GRADE NLP TEXT CLEANING & DYNAMIC SPELL CHECK
    # --------------------------------------------------------
    query_clean = user_query.strip().lower()
    processed_query = query_clean  # for spell checking -> Correct spelling
    
    # for spell checking, we can split the query into words and correct each word
    try:
        words = query_clean.split()
        unknown_words = spell.unknown(words)
        
        corrected_words = []
        for word in words:
            # Clean common slangs / manual attachments that break spellcheckers
            if word == "iam":
                corrected_words.append("i am")
                continue
                
            if word in unknown_words:
                corrected = spell.correction(word)
                corrected_words.append(corrected if corrected else word)
            else:
                corrected_words.append(word)
                
        processed_query = " ".join(corrected_words)
    except Exception as e:
        print(f"⚠️ Spellcheck error bypassed: {e}")
        processed_query = query_clean

    # Clean punctuation just for the strict chitchat lookup matrix
    chitchat_query = processed_query.replace("?", "").replace("!", "").replace(".", "")

    # --------------------------------------------------------
    # 2. INTERCEPT CUTE / CHITCHAT QUESTIONS
    # --------------------------------------------------------
    chitchat_responses = {
        "i love you": "Aww, that's so sweet! 🥰 But I'm just an AI... and specifically, a medical chatbot! How can I help you take care of your health today?",
        "hi": "Hello there! 👋 I am Waslabot, your medical chatbot assistant. What health questions do you have for me today?",
        "hello": "Hello there! 👋 I am Waslabot, your medical chatbot assistant. What health questions do you have for me today?",
        "hey": "Hey! 👋 Just a reminder that I'm a specialized medical chatbot. How can I help you with your health today?",
        "how are you": "I'm running perfectly, thank you! 🤖 As a medical chatbot, I'm fully charged and ready to answer your health inquiries. What's on your mind?",
        "who are you": "I am Waslabot, a specialized medical chatbot designed to assist you with health conditions and symptoms! 🩺",
        "what is your name": "I am Waslabot, your dedicated medical chatbot assistant! 🩺",
    }
    
    if chitchat_query in chitchat_responses:  # chitchat instead of query_clean for spelling check
        # Save chitchat context to history to preserve absolute state
        chat_sessions[chat_id].append({"role": "user", "text": user_query})
        chat_sessions[chat_id].append({"role": "assistant", "text": chitchat_responses[chitchat_query]})
        
        return {
            "answer": chitchat_responses[chitchat_query],
            "sources": [],
            "confidence": 1.0
        }

    # --------------------------------------------------------
    # 3. RUN RETRIEVAL PIPELINE (Using the cleaned processed_query)
    # --------------------------------------------------------
    initialize_model()

    # Pass the corrected text vector to FAISS
    query_emb = embedder.encode([processed_query], normalize_embeddings=True)[0]

    # RETRIEVAL (TOP 3)
    k = 3
    D, I = index.search(query_emb.reshape(1, -1), k=k)

    candidates = []

    for idx, score in zip(I[0], D[0]):
        doc = nhs_docs[idx]

        semantic_score = float(score)
        boost = keyword_boost_score(processed_query, doc)

        final_score = (semantic_score * 0.7) + (boost * 0.3)
        candidates.append((final_score, doc))

    # rerank
    candidates.sort(key=lambda x: x[0], reverse=True)

    # --------------------------------------------------------
    # 4. GUARDRAIL FOR UNKNOWN NON-MEDICAL QUESTIONS
    # --------------------------------------------------------
    if not candidates or candidates[0][0] < 0.16: 
        non_medical_fallback = "Oh, that sounds interesting! 👀 However, I am a medical chatbot, so I can only help you with health-related questions, symptoms, or conditions. Feel free to ask me something medical! 🩺"
        chat_sessions[chat_id].append({"role": "user", "text": user_query})
        chat_sessions[chat_id].append({"role": "assistant", "text": non_medical_fallback})
        return {
            "answer": non_medical_fallback,
            "sources": [],
            "confidence": 0.0
        }

    filtered_docs = [doc for _, doc in candidates[:3]]

    # debug
    for score, doc in candidates:
        print(f"🔎 {doc['title']} | score={score:.3f}")

    # Build the conversational rolling text buffer (Limit memory to last 6 turns to maximize window efficiency)
    history_lines = []
    for turn in chat_sessions[chat_id][-6:]:
        speaker = "User" if turn["role"] == "user" else "WaslaBot"
        history_lines.append(f"{speaker}: {turn['text']}")
    
    history_buffer = "\n".join(history_lines) if history_lines else "No history recorded yet."

    # build prompt (Pass raw user_query and session history into context window)
    prompt = build_combined_prompt(filtered_docs, user_query, history_buffer)

    # ----------------------------
    # CALL LLM
    # ----------------------------
    payload = {
        "model": "elixpo/llamamedicine",
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": 256
        }
    }

    response = requests.post(
        "http://localhost:11434/api/generate",
        json=payload,
        timeout=300
    )

    response.raise_for_status()
    result = response.json()

    final_answer = result.get("response", "").strip()
    print(f"🤖 LLM Raw Response: '{final_answer}'")

    # --------------------------------------------------------
    # 5. SAFETY FALLBACK FOR BLANK LLM ANSWERS
    # --------------------------------------------------------
    if not final_answer:
        final_answer = "I hear you! Just a quick reminder that I am a medical chatbot. Could you please rephrase your request so I can look it up in my health database? 🩺"

    # 🔥 Save current turn state to memory storage for this specific chat_id
    chat_sessions[chat_id].append({"role": "user", "text": user_query})
    chat_sessions[chat_id].append({"role": "assistant", "text": final_answer})

    confidence = float(candidates[0][0]) if candidates else 0.0

    return {
        "answer": final_answer,
        "sources": [
            {
                "title": doc["title"],
                "text": doc["text"][:300]
            }
            for doc in filtered_docs
        ],
        "confidence": confidence
    }


