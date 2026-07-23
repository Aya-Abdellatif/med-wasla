"""
review_queries.py

MongoDB queries related to reviews.
"""

from bson import ObjectId

from database.connection import get_database

db = get_database()

reviews = db["reviews"]

# Attach the specialist's public-facing name by joining through
# medicalspecialists -> users. Only "name" is pulled from users — no
# email/password/phone/dob ever enters the review context.
_ATTACH_SPECIALIST_NAME = [
    {
        "$lookup": {
            "from": "medicalspecialists",
            "localField": "specialistId",
            "foreignField": "_id",
            "pipeline": [
                {
                    "$lookup": {
                        "from": "users",
                        "localField": "userId",
                        "foreignField": "_id",
                        "pipeline": [{"$project": {"name": 1}}],
                        "as": "_user",
                    }
                },
                {"$unwind": {"path": "$_user", "preserveNullAndEmptyArrays": True}},
                {"$project": {"name": "$_user.name"}},
            ],
            "as": "_specialist",
        }
    },
    {"$unwind": {"path": "$_specialist", "preserveNullAndEmptyArrays": True}},
    {"$addFields": {"specialistName": "$_specialist.name"}},
    {"$project": {"_specialist": 0}},
]


def get_review_by_id(review_id):
    results = list(
        reviews.aggregate([
            {"$match": {"_id": ObjectId(review_id)}},
            *_ATTACH_SPECIALIST_NAME,
        ])
    )
    return results[0] if results else None


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
        reviews.aggregate([
            {"$match": {"patientId": ObjectId(patient_id)}},
            *_ATTACH_SPECIALIST_NAME,
        ])
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
