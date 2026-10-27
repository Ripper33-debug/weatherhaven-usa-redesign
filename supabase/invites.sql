create table if not exists invites (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  name text,
  token uuid default gen_random_uuid(),
  invited_by text,
  invited_at timestamp with time zone default now(),
  accepted_at timestamp with time zone,
  status text default 'pending'
);

alter table invites enable row level security;

-- Server uses service role. See migrations/20260529000000_tighten_rls.sql for production policy cleanup.
