-- Run in Supabase SQL editor
create table if not exists access_requests (
  id uuid default gen_random_uuid() primary key,
  full_name text,
  organization text,
  email text,
  role text,
  program text,
  requirements text,
  reference text,
  request_type text default 'general',
  submitted_at timestamp with time zone default now(),
  status text default 'pending'
);

alter table access_requests enable row level security;

-- All reads/writes use Supabase service role on the server (bypasses RLS).
-- Run supabase/migrations/20260529000000_tighten_rls.sql in production to drop legacy permissive policies.
