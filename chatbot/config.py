import os
from dotenv import load_dotenv

load_dotenv()

# ------------------------------------------------------------
# Base Directory
# ------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ------------------------------------------------------------
# Ollama
# ------------------------------------------------------------

OLLAMA_HOST = os.getenv(
    "OLLAMA_HOST",
    "http://localhost:11434"
)

OLLAMA_MODEL = os.getenv(
    "OLLAMA_MODEL",
    "elixpo/llamamedicine"
)

# ------------------------------------------------------------
# Embedding Model
# ------------------------------------------------------------

EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL",
    "multi-qa-MiniLM-L6-cos-v1"
)

# ------------------------------------------------------------
# Knowledge Bases
# ------------------------------------------------------------

CORPUS_PATH = os.getenv(
    "NHS_CORPUS_PATH",
    os.path.join(BASE_DIR, "nhs_conditions.json")
)

MEDWASLA_CORPUS_PATH = os.getenv(
    "MEDWASLA_CORPUS_PATH",
    os.path.join(BASE_DIR, "medwasla_knowledge.json")
)

# ------------------------------------------------------------
# Retrieval
# ------------------------------------------------------------

TOP_K = int(
    os.getenv("TOP_K", 3)
)

SIMILARITY_THRESHOLD = float(
    os.getenv("SIMILARITY_THRESHOLD", 0.16)
)

# ------------------------------------------------------------
# LLM
# ------------------------------------------------------------

TEMPERATURE = float(
    os.getenv("TEMPERATURE", 0.2)
)

MAX_TOKENS = int(
    os.getenv("MAX_TOKENS", 256)
)

CONTEXT_SIZE = int(
    os.getenv("CONTEXT_SIZE", 4096)
)

# ------------------------------------------------------------
# Flask
# ------------------------------------------------------------

FLASK_HOST = os.getenv(
    "FLASK_HOST",
    "0.0.0.0"
)

FLASK_PORT = int(
    os.getenv("FLASK_PORT", 3000)
)

FLASK_DEBUG = os.getenv(
    "FLASK_DEBUG",
    "True"
) == "True"

# ------------------------------------------------------------
# MongoDB
# ------------------------------------------------------------

MONGODB_URI = os.getenv(
    "MONGODB_URI",
)

DATABASE_NAME = os.getenv(
    "DATABASE_NAME",
    "medwasla"
)

ENABLE_DATABASE = (
    os.getenv(
        "ENABLE_DATABASE",
        "True"
    ).lower() == "true"
)