from database.collections.user_queries import *

user = get_user_by_email("YOUR_EMAIL") # replace "YOUR_EMAIL" with the email of the user you want to retrieve

print(user)

print(get_user_name(str(user["_id"])))
print(get_user_role(str(user["_id"])))