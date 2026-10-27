-- Public events & capability briefings for /events (service role writes only).

create table if not exists company_events (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  summary text,
  event_type text not null default 'capability_briefing',
  schedule_type text not null default 'scheduled',
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text default 'America/New_York',
  location text,
  registration_url text,
  related_news_slug text,
  cover_image_url text,
  status text not null default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists company_events_status_starts_idx
  on company_events (status, starts_at desc nulls last);

alter table company_events enable row level security;
