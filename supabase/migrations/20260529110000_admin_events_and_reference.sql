-- Admin audit trail + access request reference IDs (for customer email follow-up).
alter table access_requests add column if not exists reference text;

create index if not exists access_requests_reference_idx on access_requests (reference);

create table if not exists admin_events (
  id uuid default gen_random_uuid() primary key,
  actor_email text not null,
  action text not null,
  target_type text,
  target_id text,
  target_email text,
  detail jsonb,
  created_at timestamp with time zone default now()
);

create index if not exists admin_events_created_at_idx on admin_events (created_at desc);
create index if not exists admin_events_action_idx on admin_events (action);

alter table admin_events enable row level security;
