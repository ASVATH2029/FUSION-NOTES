import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not supabase_key:
    print("Error: Supabase credentials not found.")
    exit(1)

supabase: Client = create_client(supabase_url, supabase_key)

# We can't easily run raw SQL from the client unless we use a function,
# but we can try to insert/select to see if the table exists.
# The best way is to provide the SQL to the user.

print("Checking if 'synthesized_notes' table exists...")
try:
    supabase.table("synthesized_notes").select("*").limit(1).execute()
    print("Table 'synthesized_notes' exists.")
except Exception as e:
    print(f"Error or Table missing: {e}")
    print("\nPLEASE RUN THE FOLLOWING SQL IN YOUR SUPABASE SQL EDITOR:\n")
    print("""
CREATE TABLE IF NOT EXISTS public.synthesized_notes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id text UNIQUE NOT NULL,
  master_text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.synthesized_notes ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read (for global study guides)
CREATE POLICY \"Allow read for all\" ON public.synthesized_notes FOR SELECT USING (true);

-- Allow service role to manage everything
CREATE POLICY \"Allow service role all\" ON public.synthesized_notes FOR ALL TO service_role USING (true) WITH CHECK (true);
""")

print("\nChecking if 'messages' table exists...")
try:
    supabase.table("messages").select("*").limit(1).execute()
    print("Table 'messages' exists.")
except Exception as e:
    print(f"Error or Table missing: {e}")
    print("\nPLEASE RUN THE FOLLOWING SQL IN YOUR SUPABASE SQL EDITOR:\n")
    print("""
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  username text,
  text text NOT NULL,
  group_id text DEFAULT 'main',
  role text DEFAULT 'user',
  time text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read and insert (Simple hackathon mode)
CREATE POLICY \"Allow all select\" ON public.messages FOR SELECT USING (true);
CREATE POLICY \"Allow all insert\" ON public.messages FOR INSERT WITH CHECK (true);
""")
