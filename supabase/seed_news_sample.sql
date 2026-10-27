-- Optional sample on-site news releases for homepage /news (run after news_releases migration).
-- Skip any slug that already exists.

insert into news_releases (slug, title, summary, body, cover_image_url, status, published_at)
select
  'weatherhaven-usa-program-update',
  'Weatherhaven USA — program-ready shelter systems',
  'U.S. program office and engineering team supporting CONUS and OCONUS shelter deployments.',
  'Weatherhaven USA provides deployable shelter systems, camp infrastructure, and engineering support for defense and expeditionary programs.

Our configurable systems span command, medical, maintenance, and accommodation — sized through technical exchange rather than generic cut sheets.

Contact our programs team for capability briefings, mission solution planning, or solicitation support.',
  'https://eiec269001.blob.core.windows.net/site-content/weatherhaven-military-redeployable.jpg',
  'published',
  now() - interval '14 days'
where not exists (select 1 from news_releases where slug = 'weatherhaven-usa-program-update');

insert into news_releases (slug, title, summary, body, cover_image_url, status, published_at)
select
  'expeditionary-camp-capability-brief',
  'Expeditionary camp capability briefings available',
  'Structured technical exchanges for program offices evaluating redeployable camp solutions.',
  'Program and engineering audiences can request a capability briefing aligned to mission type, environment, mobility constraints, and force size.

Briefings cover shelter classes, power and environmental integration, setup timelines, and indicative deployment footprints — planning aids only, not formal quotes.',
  'https://eiec269001.blob.core.windows.net/site-content/expandablecontainer1.jpg',
  'published',
  now() - interval '30 days'
where not exists (select 1 from news_releases where slug = 'expeditionary-camp-capability-brief');

insert into news_releases (slug, title, summary, body, cover_image_url, status, published_at)
select
  'mission-solution-builder-launch',
  'Mission Solution Builder — indicative camp planning online',
  'Define operational parameters and explore indicative layouts before a programs conversation.',
  'The Mission Solution Builder on weatherhavenusa.com helps stakeholders outline mission inputs and review indicative camp packages.

Results are planning aids only — submit through Contact or your programs representative for engineering follow-up and formal technical exchange.',
  'https://eiec269001.blob.core.windows.net/site-content/softshelter6.jpg',
  'published',
  now() - interval '7 days'
where not exists (select 1 from news_releases where slug = 'mission-solution-builder-launch');
