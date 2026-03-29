from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
sb = create_client(url, key)

print("Fetching all users...")
try:
    # list_users() returns a list of User objects
    users_response = sb.auth.admin.list_users()
    users = users_response
    print(f"Found {len(users)} users.")
    
    for u in users:
        print(f"Deleting user: {u.email} ({u.id})")
        sb.auth.admin.delete_user(u.id)
        
    print("Done clearing users.")
except Exception as e:
    print(f"Error clearing users: {e}")
