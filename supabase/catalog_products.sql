-- Run in Supabase SQL Editor (or via migration) to create the catalog_products table.
-- Product rows are seeded from the canonical 17-product catalog in code — do NOT use the old 12-product inserts.
--
-- After creating the table, sync rows from your machine:
--   npm run sync:catalog
--
-- That script reads src/lib/products.ts, preserves CMS coverImageUrl from legacy slugs,
-- and replaces catalog_products with 17 published rows matching /configurable-solutions.

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

-- Optional: allow service role / admin policies are configured in your project RLS setup.
-- Run `npm run sync:catalog` with .env.local (service role key) to populate product rows.
