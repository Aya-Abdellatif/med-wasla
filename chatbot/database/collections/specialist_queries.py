"""
specialist_queries.py

MongoDB queries related to medical specialists.
"""

from bson import ObjectId

from database.connection import get_database

db = get_database()

specialists = db["medicalspecialists"]

# The specialist's display name lives on the linked User document, not on
# the MedicalSpecialist document itself. This join pulls ONLY "name" from
# users — never email/password/phone/dob — so a specialist lookup can
# never leak another user's credentials or private info.
_ATTACH_NAME = [
    {
        "$lookup": {
            "from": "users",
            "localField": "userId",
            "foreignField": "_id",
            "pipeline": [{"$project": {"name": 1}}],
            "as": "_user",
        }
    },
    {
        "$unwind": {
            "path": "$_user",
            "preserveNullAndEmptyArrays": True,
        }
    },
    {
        "$addFields": {
            "name": "$_user.name",
        }
    },
    {"$project": {"_user": 0}},
]


def get_specialist_by_id(specialist_id):
    results = list(
        specialists.aggregate([
            {"$match": {"_id": ObjectId(specialist_id)}},
            *_ATTACH_NAME,
        ])
    )
    return results[0] if results else None


def get_specialist_by_user_id(user_id):
    results = list(
        specialists.aggregate([
            {"$match": {"userId": ObjectId(user_id)}},
            *_ATTACH_NAME,
        ])
    )
    return results[0] if results else None


def get_specialists_by_specialization(specialization):
    return list(
        specialists.aggregate([
            {
                "$match": {
                    "specialization": specialization,
                    "verificationStatus": "approved",
                }
            },
            *_ATTACH_NAME,
            {"$sort": {"rating": -1}},
        ])
    )


def get_approved_specialists():
    return list(
        specialists.aggregate([
            {"$match": {"verificationStatus": "approved"}},
            *_ATTACH_NAME,
            {"$sort": {"rating": -1}},
        ])
    )


def get_pending_specialists():
    return list(
        specialists.find(
            {
                "verificationStatus": "pending"
            }
        )
    )


def count_approved_specialists():
    return specialists.count_documents(
        {
            "verificationStatus": "approved"
        }
    )


def count_specialists():
    return specialists.count_documents({})

from database.collections.appointment_queries import (
    get_patient_appointments
)


def get_patient_specialists(patient_id):
    """
    Returns all specialists (with display name) the patient has had
    appointments with.
    """

    appointments = get_patient_appointments(patient_id)

    specialist_ids = list({
        appointment["specialistId"]
        for appointment in appointments
        if appointment.get("specialistId")
    })

    if not specialist_ids:
        return []

    return list(
        specialists.aggregate([
            {"$match": {"_id": {"$in": specialist_ids}}},
            *_ATTACH_NAME,
        ])
    )
