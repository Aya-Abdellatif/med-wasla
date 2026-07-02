import json
import faiss


class KnowledgeBase:
    """
    Represents a single knowledge base
    (NHS, Med-Wasla, WHO, etc.)
    """

    def __init__(self, json_path, source_name, embedder):
        self.json_path = json_path
        self.source_name = source_name
        self.embedder = embedder

        self.docs = []
        self.index = None

    def load(self):
        print(f"Loading {self.source_name} corpus...")

        with open(self.json_path, "r", encoding="utf-8") as f:
            self.docs = json.load(f)

        # Add source field
        for doc in self.docs:
            doc["source"] = self.source_name

        # Remove duplicate documents
        seen = set()
        unique = []

        for doc in self.docs:
            if doc["text"] not in seen:
                seen.add(doc["text"])
                unique.append(doc)

        self.docs = unique

        texts = [doc["text"] for doc in self.docs]

        embeddings = self.embedder.encode(
            texts,
            normalize_embeddings=True
        )

        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(embeddings)

        print(f"{self.source_name}: {self.index.ntotal} vectors")

    # ✅ FIX: this must be inside the class
    def retrieve(self, query, top_k, keyword_boost_fn):

        query_embedding = self.embedder.encode(
            [query],
            normalize_embeddings=True
        )[0]

        distances, indices = self.index.search(
            query_embedding.reshape(1, -1),
            k=top_k
        )

        candidates = []

        for idx, semantic_score in zip(indices[0], distances[0]):
            document = self.docs[idx]

            keyword_score = keyword_boost_fn(query, document)

            score = semantic_score * 0.7 + keyword_score * 0.3

            candidates.append((float(score), document))

        candidates.sort(key=lambda x: x[0], reverse=True)

        filtered_docs = [doc for _, doc in candidates[:top_k]]

        confidence = candidates[0][0] if candidates else 0.0

        sources = [
            {
                "title": doc["title"],
                "source": doc["source"],
                "text": doc["text"][:300]
            }
            for doc in filtered_docs
        ]

        return filtered_docs, confidence, sources