import os
import sys

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

from database.collections.appointment_queries import count_patient_appointments

patient_id = "6a349169a2440cedca661c5b"

count = count_patient_appointments(patient_id)

print(count)