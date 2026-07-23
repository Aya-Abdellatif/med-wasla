"""
appointment_queries.py

Contains MongoDB queries related to appointments.
"""

from bson import ObjectId

from database.connection import get_database

db = get_database()

appointments = db["appointments"]

# Attach the specialist's public-facing name/specialization by joining
# through medicalspecialists -> users. Only "name" is pulled from users —
# no email/password/phone/dob ever enters the appointment context.
_ATTACH_SPECIALIST = [
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
                {
                    "$project": {
                        "name": "$_user.name",
                        "specialization": 1,
                    }
                },
            ],
            "as": "_specialist",
        }
    },
    {"$unwind": {"path": "$_specialist", "preserveNullAndEmptyArrays": True}},
    {
        "$addFields": {
            "specialistName": "$_specialist.name",
            "specialization": "$_specialist.specialization",
        }
    },
    {"$project": {"_specialist": 0}},
]


def get_appointment_by_id(appointment_id):
    results = list(
        appointments.aggregate([
            {"$match": {"_id": ObjectId(appointment_id)}},
            *_ATTACH_SPECIALIST,
        ])
    )
    return results[0] if results else None


def get_patient_appointments(patient_id):

    return list(
        appointments.aggregate([
            {"$match": {"patientId": ObjectId(patient_id)}},
            *_ATTACH_SPECIALIST,
        ])
    )


def get_specialist_appointments(specialist_id):

    return list(
        appointments.find(
            {
                "specialistId": ObjectId(specialist_id)
            }
        )
    )


def get_patient_upcoming_appointments(patient_id):

    return list(
        appointments.aggregate([
            {
                "$match": {
                    "patientId": ObjectId(patient_id),
                    "status": {
                        "$in": [
                            "pending",
                            "confirmed"
                        ]
                    }
                }
            },
            *_ATTACH_SPECIALIST,
        ])
    )


def count_patient_appointments(patient_id):

    return appointments.count_documents(
        {
            "patientId": ObjectId(patient_id)
        }
    )


def count_specialist_appointments(specialist_id):

    return appointments.count_documents(
        {
            "specialistId": ObjectId(specialist_id)
        }
    )
