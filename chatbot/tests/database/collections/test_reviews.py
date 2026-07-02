import os
import sys

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

from database.collections.review_queries import *

SPECIALIST_ID = "6a34916ba2440cedca661c5e"

print("=" * 60)
print("NUMBER OF REVIEWS")
print("=" * 60)

print(count_specialist_reviews(SPECIALIST_ID))


print("\n" + "=" * 60)
print("AVERAGE RATING")
print("=" * 60)

print(get_average_rating(SPECIALIST_ID))


print("\n" + "=" * 60)
print("ALL REVIEWS")
print("=" * 60)

reviews = get_reviews_for_specialist(SPECIALIST_ID)

for review in reviews:
    print(review["rating"], "-", review["comment"])