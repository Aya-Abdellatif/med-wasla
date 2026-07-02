from sentence_transformers import SentenceTransformer

import models

from config import (
    EMBEDDING_MODEL,
    CORPUS_PATH,
    MEDWASLA_CORPUS_PATH
)

from core.knowledge_base import KnowledgeBase


def initialize_model():
    """
    Load embedding model + initialize all knowledge bases.
    Runs only once.
    """

    if models.embedder is not None:
        return

    print("⚙️ Loading SentenceTransformer model...")

    models.embedder = SentenceTransformer(EMBEDDING_MODEL)

    print("⚙️ Loading Knowledge Bases...")

    # ---------------- NHS ----------------
    models.nhs_kb = KnowledgeBase(
        json_path=CORPUS_PATH,
        source_name="NHS",
        embedder=models.embedder
    )
    models.nhs_kb.load()

    # ---------------- Med-Wasla ----------------
    models.medwasla_kb = KnowledgeBase(
        json_path=MEDWASLA_CORPUS_PATH,
        source_name="Med-Wasla",
        embedder=models.embedder
    )
    models.medwasla_kb.load()

    print("✅ All knowledge bases initialized successfully.")