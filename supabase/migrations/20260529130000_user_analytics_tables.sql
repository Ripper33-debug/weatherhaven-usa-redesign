-- Signed-in member analytics (sessions, page views, events).
-- Server reads via service role; clients insert/update own rows only.

create table if not exists user_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  email text,
  started_at timestamp with time zone default now() not null,
  ended_at timestamp with time zone,
  duration_seconds integer,
  entry_page text,
  referrer text,
  user_agent text
);

create table if not exists page_views (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  email text,
  session_id uuid references user_sessions(id) on delete set null,
  page text not null,
  page_title text,
  visited_at timestamp with time zone default now() not null,
  time_on_page_seconds integer
);

create table if not exists user_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  email text,
  session_id uuid references user_sessions(id) on delete set null,
  event_type text not null,
  event_label text not null,
  page text,
  occurred_at timestamp with time zone default now() not null
);

create index if not exists user_sessions_user_started_idx on user_sessions (user_id, started_at desc);
create index if not exists user_sessions_started_at_idx on user_sessions (started_at desc);
create index if not exists page_views_user_visited_idx on page_views (user_id, visited_at desc);
create index if not exists page_views_visited_at_idx on page_views (visited_at desc);
create index if not exists page_views_session_idx on page_views (session_id);
create index if not exists user_events_user_occurred_idx on user_events (user_id, occurred_at desc);
create index if not exists user_events_occurred_at_idx on user_events (occurred_at desc);

alter table user_sessions enable row level security;
alter table page_views enable row level security;
alter table user_events enable row level security;

drop policy if exists "Users insert own sessions" on user_sessions;
create policy "Users insert own sessions"
  on user_sessions for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own sessions" on user_sessions;
create policy "Users update own sessions"
  on user_sessions for update using (auth.uid() = user_id);

drop policy if exists "Users insert own page views" on page_views;
create policy "Users insert own page views"
  on page_views for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own page views" on page_views;
create policy "Users update own page views"
  on page_views for update using (auth.uid() = user_id);

drop policy if exists "Users insert own events" on user_events;
create policy "Users insert own events"
  on user_events for insert with check (auth.uid() = user_id);

-- click_events (depends on user_sessions)
create table if not exists click_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  session_id uuid references user_sessions(id) on delete cascade,
  page text,
  element_type text,
  element_text text,
  element_id text,
  element_class text,
  href text,
  x_position integer,
  y_position integer,
  clicked_at timestamp with time zone default now()
);

create index if not exists click_events_user_clicked_idx on click_events (user_id, clicked_at desc);
create index if not exists click_events_clicked_at_idx on click_events (clicked_at desc);

alter table click_events enable row level security;

drop policy if exists "Users can insert own clicks" on click_events;
create policy "Users can insert own clicks"
  on click_events for insert with check (auth.uid() = user_id);

drop policy if exists "Admin can read all clicks" on click_events;
