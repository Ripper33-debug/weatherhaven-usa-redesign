-- Marketing lead intent events (anonymous + authenticated). Server writes via service role only.
create table if not exists lead_events (
  id uuid default gen_random_uuid() primary key,
  event_type text not null,
  event_label text not null,
  page text,
  payload jsonb,
  session_key text,
  submitted_at timestamp with time zone default now()
);

create index if not exists lead_events_submitted_at_idx on lead_events (submitted_at desc);
create index if not exists lead_events_event_type_idx on lead_events (event_type);

alter table lead_events enable row level security;
