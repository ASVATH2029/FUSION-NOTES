-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text,
  username text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_active timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policy to allow all authenticated users to read profiles (for collaborators list)
create policy "Allow all authenticated users to view profiles"
  on public.profiles for select
  to authenticated
  using (true);

-- Create policy to allow users to update their own profile
create policy "Allow individual users to update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Create policy to allow service role (admin) to manage all profiles
-- (Needed for the backend registration bypass if using service key)
create policy "Allow service role to manage all profiles"
  on public.profiles for all
  to service_role
  using (true)
  with check (true);
