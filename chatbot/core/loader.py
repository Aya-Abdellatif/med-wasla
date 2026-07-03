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
    Retries on the next call if a previous attempt left the
    knowledge bases only partially loaded.
    """

    if models.nhs_kb is not None and models.medwasla_kb is not None:
        return

    if models.embedder is None:
        print("⚙️ Loading SentenceTransformer model...")
        models.embedder = SentenceTransformer(EMBEDDING_MODEL)

    print("⚙️ Loading Knowledge Bases...")

    # ---------------- NHS ----------------
    nhs_kb = KnowledgeBase(
        json_path=CORPUS_PATH,
        source_name="NHS",
        embedder=models.embedder
    )
    nhs_kb.load()
    models.nhs_kb = nhs_kb

    # ---------------- Med-Wasla ----------------
    medwasla_kb = KnowledgeBase(
        json_path=MEDWASLA_CORPUS_PATH,
        source_name="Med-Wasla",
        embedder=models.embedder
    )
    medwasla_kb.load()
    models.medwasla_kb = medwasla_kb

    print("✅ All knowledge bases initialized successfully.")