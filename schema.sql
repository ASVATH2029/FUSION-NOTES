-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table linked to Supabase Auth
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    reputation_score INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the raw_notes table with a strict Foreign Key to profiles/auth
CREATE TABLE public.raw_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    group_id TEXT NOT NULL,
    image_path TEXT NOT NULL,
    extracted_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create the synthesized_notes table
CREATE TABLE public.synthesized_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id TEXT NOT NULL UNIQUE,
    master_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security (RLS) Requirements for Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synthesized_notes ENABLE ROW LEVEL SECURITY;

-- Note: To allow public viewing of notes but restrict uploads,
-- you will need to create appropriate RLS Policies in the Supabase Dashboard.
