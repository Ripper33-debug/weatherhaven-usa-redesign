-- Run this entire script in Supabase → SQL Editor (select all, then Run).
-- Creates news_releases for admin CMS + seeds three legacy press items.

create table if not exists news_releases (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  title text not null,
  summary text,
  body text,
  external_url text,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists news_releases_status_published_idx
  on news_releases (status, published_at desc);

alter table news_releases enable row level security;

insert into news_releases (slug, title, external_url, status, published_at)
select 'compotech-ballistic-partnership',
  'Weatherhaven and Compotech announce ballistic protection partnership',
  'https://www.weatherhaven.com/',
  'published',
  '2023-05-26T12:00:00Z'::timestamptz
where not exists (select 1 from news_releases where slug = 'compotech-ballistic-partnership');

insert into news_releases (slug, title, external_url, status, published_at)
select 'us-advisory-board',
  'Weatherhaven appoints US Advisory Board',
  'https://www.weatherhaven.com/',
  'published',
  '2022-10-05T12:00:00Z'::timestamptz
where not exists (select 1 from news_releases where slug = 'us-advisory-board');

insert into news_releases (slug, title, external_url, status, published_at)
select '40th-anniversary',
  'Weatherhaven 40th anniversary',
  'https://www.weatherhaven.com/',
  'published',
  '2022-08-02T12:00:00Z'::timestamptz
where not exists (select 1 from news_releases where slug = '40th-anniversary');
