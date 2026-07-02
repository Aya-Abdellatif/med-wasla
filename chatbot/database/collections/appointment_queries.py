"""
appointment_queries.py

Contains MongoDB queries related to appointments.
"""

from bson import ObjectId

from database.connection import get_database

db = get_database()

appointments = db["appointments"]


def get_appointment_by_id(appointment_id):

    return appointments.find_one(
        {
            "_id": ObjectId(appointment_id)
        }
    )


def get_patient_appointments(patient_id):

    return list(
        appointments.find(
            {
                "patientId": ObjectId(patient_id)
            }
        )
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
        appointments.find(
            {
                "patientId": ObjectId(patient_id),
                "status": {
                    "$in": [
                        "pending",
                        "confirmed"
                    ]
                }
            }
        )
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