-- Seed CMS cover photos for news releases and catalog products (run after cms_media migration).
-- Idempotent: only fills rows missing cover_image_url / coverImageUrl.
-- URLs point at Weatherhaven CDN; optional npm run seed:cms applies the same via API.

-- News releases (on-site sample slugs from seed_news_sample.sql)
update news_releases
set cover_image_url = 'https://eiec269001.blob.core.windows.net/site-content/weatherhaven-military-redeployable.jpg'
where slug = 'weatherhaven-usa-program-update'
  and (cover_image_url is null or cover_image_url = '');

update news_releases
set cover_image_url = 'https://eiec269001.blob.core.windows.net/site-content/expandablecontainer1.jpg'
where slug = 'expeditionary-camp-capability-brief'
  and (cover_image_url is null or cover_image_url = '');

update news_releases
set cover_image_url = 'https://eiec269001.blob.core.windows.net/site-content/softshelter6.jpg'
where slug = 'mission-solution-builder-launch'
  and (cover_image_url is null or cover_image_url = '');

-- Catalog product covers (catalog_products.data.coverImageUrl)
update catalog_products set data = data || '{"coverImageUrl":"https://eiec269001.blob.core.windows.net/site-content/softshelter6.jpg"}'::jsonb
where slug = 'softwall-command' and coalesce(data->>'coverImageUrl', '') = '';

update catalog_products set data = data || '{"coverImageUrl":"https://eiec269001.blob.core.windows.net/site-content/softshelter4.jpg"}'::jsonb
where slug = 'softwall-medical' and coalesce(data->>'coverImageUrl', '') = '';

update catalog_products set data = data || '{"coverImageUrl":"https://eiec269001.blob.core.windows.net/site-content/softshelter5.jpg"}'::jsonb
where slug = 'softwall-maintenance' and coalesce(data->>'coverImageUrl', '') = '';

update catalog_products set data = data || '{"coverImageUrl":"https://eiec269001.blob.core.windows.net/site-content/expandablecontainer1.jpg"}'::jsonb
where slug = 'expandable-command' and coalesce(data->>'coverImageUrl', '') = '';

update catalog_products set data = data || '{"coverImageUrl":"https://eiec269001.blob.core.windows.net/site-content/mecc6.jpg"}'::jsonb
where slug = 'expandable-medical' and coalesce(data->>'coverImageUrl', '') = '';

update catalog_products set data = data || '{"coverImageUrl":"https://eiec269001.blob.core.windows.net/site-content/softshelter8.jpg"}'::jsonb
where slug = 'hqss' and coalesce(data->>'coverImageUrl', '') = '';

update catalog_products set data = data || '{"coverImageUrl":"https://eiec269001.blob.core.windows.net/site-content/trecc1.jpg"}'::jsonb
where slug = 'trecc' and coalesce(data->>'coverImageUrl', '') = '';

update catalog_products set data = data || '{"coverImageUrl":"https://eiec269001.blob.core.windows.net/site-content/mecc1.jpg"}'::jsonb
where slug = 'mecc' and coalesce(data->>'coverImageUrl', '') = '';

update catalog_products set data = data || '{"coverImageUrl":"https://eiec269001.blob.core.windows.net/site-content/product-accessories2.jpg"}'::jsonb
where slug = 'solarshade' and coalesce(data->>'coverImageUrl', '') = '';

update catalog_products set data = data || '{"coverImageUrl":"https://eiec269001.blob.core.windows.net/site-content/polar-1.jpg"}'::jsonb
where slug = 'arctic-package' and coalesce(data->>'coverImageUrl', '') = '';

update catalog_products set data = data || '{"coverImageUrl":"https://eiec269001.blob.core.windows.net/site-content/weatherhaven-military-redeployable.jpg"}'::jsonb
where slug = 'turnkey-camp' and coalesce(data->>'coverImageUrl', '') = '';

update catalog_products set data = data || '{"coverImageUrl":"https://eiec269001.blob.core.windows.net/site-content/weatherhaven-medical-redeployable.jpg"}'::jsonb
where slug = 'humanitarian-package' and coalesce(data->>'coverImageUrl', '') = '';
