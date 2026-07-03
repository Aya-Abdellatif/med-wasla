import models

from config import TOP_K


def keyword_boost(query, document):
    """
    Simple lexical overlap score between the query and a document's
    title/text, used to nudge the semantic ranking from kb.retrieve.
    """

    query_words = set(query.lower().split())

    if not query_words:
        return 0.0

    doc_text = (document.get("title", "") + " " + document.get("text", "")).lower()

    matches = sum(1 for word in query_words if word in doc_text)

    return matches / len(query_words)


def retrieve_documents(question_type, processed_query):
    """
    Retrieve documents from the appropriate knowledge base.

    Returns
    -------
    filtered_docs : list
    confidence : float
    sources : list
    """

    if question_type == "MEDICAL":
        kb = models.nhs_kb

    elif question_type == "WEBSITE":
        kb = models.medwasla_kb

    else:
        return [], 0.0, []

    filtered_docs, confidence, sources = kb.retrieve(
        processed_query,
        TOP_K,
        keyword_boost
    )

    return (
        filtered_docs,
        confidence,
        sources
    )

