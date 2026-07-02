import models


import models


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

    filtered_docs, confidence, sources = kb.retrieve(processed_query)

    return (
        filtered_docs,
        confidence,
        sources
    )

