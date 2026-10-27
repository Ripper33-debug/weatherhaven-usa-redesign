-- Product catalog CMS (systems) — JSON document per product, service role writes only.

create table if not exists catalog_products (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  status text not null default 'draft',
  sort_order int not null default 0,
  data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists catalog_products_status_sort_idx on catalog_products (status, sort_order);

alter table catalog_products enable row level security;
