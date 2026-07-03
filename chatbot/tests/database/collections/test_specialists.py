import os
import sys

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

from database.collections.specialist_queries import *

SPECIALIST_ID = "6a35c86f78313c787dc095fb"

print("=" * 60)
print("SPECIALIST BY ID")
print("=" * 60)

print(get_specialist_by_id(SPECIALIST_ID))


print("\n" + "=" * 60)
print("APPROVED SPECIALISTS")
print("=" * 60)

print(count_approved_specialists())


print("\n" + "=" * 60)
print("CARDIOLOGISTS")
print("=" * 60)

docs = get_specialists_by_specialization("Cardiology")

for d in docs:
    print(d["licenseNumber"], "-", d["specialization"])