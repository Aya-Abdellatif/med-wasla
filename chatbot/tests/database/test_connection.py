import os
import sys

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

from database.connection import get_database

db = get_database()

print("Connected!")

print(db.list_collection_names())