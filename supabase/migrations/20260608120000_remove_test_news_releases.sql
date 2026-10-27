-- Remove placeholder/test news releases (e.g. "Test 1 jun 1") from CMS feeds.
delete from news_releases
where lower(trim(title)) like 'test%'
   or lower(trim(slug)) like 'test%';
