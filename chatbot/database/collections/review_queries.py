"""
review_queries.py

MongoDB queries related to reviews.
"""

from bson import ObjectId

from database.connection import get_database

db = get_database()

reviews = db["reviews"]


def get_review_by_id(review_id):
    return reviews.find_one(
        {
            "_id": ObjectId(review_id)
        }
    )


def get_reviews_for_specialist(specialist_id):
    return list(
        reviews.find(
            {
                "specialistId": ObjectId(specialist_id)
            }
        )
    )


def get_reviews_by_patient(patient_id):
    return list(
        reviews.find(
            {
                "patientId": ObjectId(patient_id)
            }
        )
    )


def count_specialist_reviews(specialist_id):
    return reviews.count_documents(
        {
            "specialistId": ObjectId(specialist_id)
        }
    )


def get_average_rating(specialist_id):

    docs = list(
        reviews.find(
            {
                "specialistId": ObjectId(specialist_id)
            }
        )
    )

    if not docs:
        return 0

    return sum(doc["rating"] for doc in docs) / len(docs)