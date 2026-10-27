-- Built-in lead management: unified profiles + operator notes (service role writes only).

create table if not exists lead_profiles (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  full_name text,
  organization text,
  pipeline_status text not null default 'new',
  next_follow_up_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create unique index if not exists lead_profiles_email_lower_idx on lead_profiles (lower(trim(email)));
create index if not exists lead_profiles_pipeline_status_idx on lead_profiles (pipeline_status);
create index if not exists lead_profiles_next_follow_up_idx on lead_profiles (next_follow_up_at);

create table if not exists lead_notes (
  id uuid default gen_random_uuid() primary key,
  lead_email text not null,
  body text not null,
  actor_email text not null,
  created_at timestamp with time zone default now()
);

create index if not exists lead_notes_lead_email_idx on lead_notes (lower(trim(lead_email)), created_at desc);

alter table lead_profiles enable row level security;
alter table lead_notes enable row level security;
