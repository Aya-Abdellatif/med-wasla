"""
specialist_queries.py

MongoDB queries related to medical specialists.
"""

from bson import ObjectId

from database.connection import get_database

db = get_database()

specialists = db["medicalspecialists"]


def get_specialist_by_id(specialist_id):
    return specialists.find_one(
        {
            "_id": ObjectId(specialist_id)
        }
    )


def get_specialist_by_user_id(user_id):
    return specialists.find_one(
        {
            "userId": ObjectId(user_id)
        }
    )


def get_specialists_by_specialization(specialization):
    return list(
        specialists.find(
            {
                "specialization": specialization,
                "verificationStatus": "approved"
            }
        )
    )


def get_approved_specialists():
    return list(
        specialists.find(
            {
                "verificationStatus": "approved"
            }
        )
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
    Returns all specialists visited by a patient.
    """

    appointments = get_patient_appointments(patient_id)

    specialist_ids = list({
        appointment["specialistId"]
        for appointment in appointments
    })

    if not specialist_ids:
        return []

    return list(
        specialists.find(
            {
                "_id": {
                    "$in": specialist_ids
                }
            }
        )
    )