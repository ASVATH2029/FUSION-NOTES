import { createClient } from '@supabase/supabase-js';

// These come from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ngknahrdxadhzexqhbwt.supabase.co';
// Note: Usually you'd use the ANON key on the frontend, but we'll use what's available
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5na25haHJkeGFkaHpleHFoYnd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDcwMjI1NSwiZXhwIjoyMDkwMjc4MjU1fQ.JN2RcE1sDaaoBl4LQ9lRhc6biJmUGsCbL3So4-ucmUA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
