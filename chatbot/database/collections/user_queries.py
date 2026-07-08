"""
Queries for users collection.
"""

from bson import ObjectId
from database.connection import get_database

db = get_database()

users = db["users"]

# Mongoose's `select: false` on the password field is a Mongoose-only
# convention — raw pymongo doesn't know about it and will happily return
# the bcrypt hash. Every read of the users collection must explicitly
# exclude password (and other private fields the chatbot never needs).
_EXCLUDE_SENSITIVE = {
    "password": 0,
    "email": 0,
    "phone": 0,
    "dob": 0,
}


def get_user_by_id(user_id):
    return users.find_one(
        {
            "_id": ObjectId(user_id)
        },
        _EXCLUDE_SENSITIVE
    )


def get_user_by_email(email):
    return users.find_one(
        {
            "email": email
        },
        _EXCLUDE_SENSITIVE
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