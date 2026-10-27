create table if not exists tactical_markers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  label text,
  notes text,
  latitude double precision,
  longitude double precision,
  created_at timestamp with time zone default now()
);

alter table tactical_markers enable row level security;

create policy "Users can manage own markers"
  on tactical_markers for all using (auth.uid() = user_id);
