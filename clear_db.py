from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
sb = create_client(url, key)

try:
    r1 = sb.table('synthesized_notes').delete().neq('group_id', '____NOMATCH____').execute()
    print('Deleted synthesized_notes rows:', len(r1.data))
except Exception as e:
    print('synthesized_notes delete error:', e)

try:
    r2 = sb.table('raw_notes').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
    print('Deleted raw_notes rows:', len(r2.data))
except Exception as e:
    print('raw_notes delete error:', e)

print('Done.')
