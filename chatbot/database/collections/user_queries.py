"""
Queries for users collection.
"""

from bson import ObjectId
from database.connection import get_database

db = get_database()

users = db["users"]


def get_user_by_id(user_id):
    return users.find_one(
        {
            "_id": ObjectId(user_id)
        }
    )


def get_user_by_email(email):
    return users.find_one(
        {
            "email": email
        }
    )


def get_user_name(user_id):

    user = get_user_by_id(user_id)

    if not user:
        return None

    return user["name"]


def get_user_role(user_id):

    user = get_user_by_id(user_id)

    if not user:
        return None

    return user["role"]