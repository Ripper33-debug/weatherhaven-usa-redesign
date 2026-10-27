-- CMS overrides for global deployment map pin stories (service role writes; public read via API).

create table if not exists deployment_stories (
  deployment_id text primary key,
  headline text,
  narrative text,
  image_slug text,
  cover_image_url text,
  featured boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists deployment_stories_featured_idx on deployment_stories (featured) where featured = true;

alter table deployment_stories enable row level security;
