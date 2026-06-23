# -*- coding: utf-8 -*-
"""
grad_runner.py
Refactored RAG pipeline with hybrid retrieval (FAISS + keyword boosting + reranking)
"""

import os
from dotenv import load_dotenv
import json
import faiss
import requests
from sentence_transformers import SentenceTransformer

# ----------------------------
# ENV
# ----------------------------
load_dotenv()

CORPUS_PATH = os.environ.get(
    "NHS_CORPUS_PATH",
    default=os.path.join(os.path.dirname(__file__), "nhs_conditions.json")
)

# ----------------------------
# GLOBALS
# ----------------------------
embedder = None
index = None
nhs_docs = None


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
def build_combined_prompt(context_docs, user_query):
    context_text = ""

    for doc in context_docs:
        snippet = doc["text"][:800]
        context_text += f"[NHS] {doc['title']}: {snippet}\n\n"

    prompt = f"""
You are HealthMate, a strict medical assistant for Med-Wasla.

RULES:
- Do NOT greet the user.
- Do NOT introduce yourself.
- Answer ONLY using the provided medical context.
- Be concise and medically accurate.
- If context is insufficient, say:
  "I don’t have enough medical information in the database to answer this accurately."
- Do NOT mention retrieval systems.

CONTEXT:
{context_text}

USER QUESTION:
{user_query}

ANSWER:
"""
    return prompt.strip()


# ----------------------------
# PREDICT FUNCTION
# ----------------------------
def predict(user_query):
    initialize_model()

    # embed query
    query_emb = embedder.encode([user_query], normalize_embeddings=True)[0]

    # ----------------------------
    # RETRIEVAL (top_k = 3)
    # ----------------------------
    k = 3
    D, I = index.search(query_emb.reshape(1, -1), k=k)

    candidates = []

    for idx, score in zip(I[0], D[0]):
        doc = nhs_docs[idx]

        semantic_score = float(score)
        boost = keyword_boost_score(user_query, doc)

        final_score = (semantic_score * 0.7) + (boost * 0.3)

        candidates.append((final_score, doc))

    # sort best first
    candidates.sort(key=lambda x: x[0], reverse=True)

    # keep top 2 docs
    filtered_docs = [doc for _, doc in candidates[:2]]

    # debug logs
    for score, doc in candidates:
        print(f"🔎 {doc['title']} | score={score:.3f}")

    if not filtered_docs:
        return "I don’t have enough medical information in the database to answer this accurately."

    # build prompt
    prompt = build_combined_prompt(filtered_docs, user_query)

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

    return result.get("response", "").strip()