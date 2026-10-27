-- Run in Supabase SQL editor if not applied via migration tooling

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

alter table click_events enable row level security;

drop policy if exists "Users can insert own clicks" on click_events;
create policy "Users can insert own clicks"
  on click_events for insert with check (auth.uid() = user_id);

drop policy if exists "Admin can read all clicks" on click_events;
create policy "Admin can read all clicks"
  on click_events for select using (true);
