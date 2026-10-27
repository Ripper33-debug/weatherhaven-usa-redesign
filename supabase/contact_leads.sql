-- Run in Supabase SQL editor
create table if not exists contact_leads (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  full_name text,
  organization text,
  role text,
  inquiry_type text,
  program text,
  subject text,
  message text,
  contact_method text,
  phone text,
  email text,
  region text,
  submitted_at timestamp with time zone default now(),
  status text default 'new'
);

alter table contact_leads enable row level security;

-- Server routes use service role. See migrations/20260529000000_tighten_rls.sql for production policy cleanup.
