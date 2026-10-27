-- Public CMS media bucket for admin-uploaded product and news photos.
-- Run in Supabase → SQL Editor. See docs/PRODUCTION.md.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cms-media',
  'cms-media',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read cms media" on storage.objects;
create policy "Public read cms media"
  on storage.objects for select
  using (bucket_id = 'cms-media');

alter table news_releases
  add column if not exists cover_image_url text;
