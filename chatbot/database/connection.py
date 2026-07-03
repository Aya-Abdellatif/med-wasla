"""
connection.py

Creates a single MongoDB connection shared
by the whole chatbot.
"""

from pymongo import MongoClient

from config import (
    MONGODB_URI,
    DATABASE_NAME
)

# Create MongoDB client
client = MongoClient(MONGODB_URI)

# Select database
db = client[DATABASE_NAME]


def get_database():
    """
    Returns the MongoDB database instance.
    """
    return db