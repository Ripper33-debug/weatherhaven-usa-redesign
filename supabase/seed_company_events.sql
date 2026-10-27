-- Sample events for /events (run after company_events migration and optional seed_news_sample.sql).

insert into company_events (
  slug, title, summary, event_type, schedule_type, starts_at, ends_at, timezone, location,
  related_news_slug, cover_image_url, status
)
select
  'expeditionary-camp-briefing-june-2026',
  'Expeditionary camp capability briefing',
  'Virtual technical exchange for program offices evaluating redeployable camp solutions — mission type, environment, mobility, and indicative footprints.',
  'capability_briefing',
  'scheduled',
  '2026-06-18 14:00:00-04'::timestamptz,
  '2026-06-18 15:30:00-04'::timestamptz,
  'America/New_York',
  'Virtual — Microsoft Teams',
  'expeditionary-camp-capability-brief',
  'https://eiec269001.blob.core.windows.net/site-content/expandablecontainer1.jpg',
  'published'
where not exists (select 1 from company_events where slug = 'expeditionary-camp-briefing-june-2026');

insert into company_events (
  slug, title, summary, event_type, schedule_type, starts_at, ends_at, timezone, location,
  related_news_slug, cover_image_url, status
)
select
  'mission-builder-walkthrough-july-2026',
  'Mission Solution Builder walkthrough',
  'Live demo of indicative camp planning on weatherhavenusa.com — inputs, layout zones, parts list, and PDF export for procurement packages.',
  'webinar',
  'scheduled',
  '2026-07-09 11:00:00-04'::timestamptz,
  '2026-07-09 12:00:00-04'::timestamptz,
  'America/New_York',
  'Virtual — Microsoft Teams',
  'mission-solution-builder-launch',
  'https://eiec269001.blob.core.windows.net/site-content/softshelter6.jpg',
  'published'
where not exists (select 1 from company_events where slug = 'mission-builder-walkthrough-july-2026');

insert into company_events (
  slug, title, summary, event_type, schedule_type, starts_at, ends_at, timezone, location,
  related_news_slug, cover_image_url, status
)
select
  'usa-program-briefing-aug-2026',
  'Weatherhaven USA program briefing',
  'CONUS program office overview — shelter classes, camp integration, and engineering support for defense and expeditionary audiences.',
  'program_meeting',
  'scheduled',
  '2026-08-14 09:00:00-04'::timestamptz,
  '2026-08-14 10:30:00-04'::timestamptz,
  'America/New_York',
  'Arlington, VA — by invitation',
  'weatherhaven-usa-program-update',
  'https://eiec269001.blob.core.windows.net/site-content/weatherhaven-military-redeployable.jpg',
  'published'
where not exists (select 1 from company_events where slug = 'usa-program-briefing-aug-2026');

insert into company_events (
  slug, title, summary, event_type, schedule_type, starts_at, ends_at, timezone, location,
  related_news_slug, cover_image_url, status
)
select
  'camp-planning-office-hours',
  'Camp planning office hours',
  'Recurring virtual sessions for stakeholders using the Mission Solution Builder — bring your mission inputs and review indicative packages with programs engineering.',
  'capability_briefing',
  'on_demand',
  null,
  null,
  'America/New_York',
  'Virtual — schedule via Contact',
  'mission-solution-builder-launch',
  'https://eiec269001.blob.core.windows.net/site-content/softshelter6.jpg',
  'published'
where not exists (select 1 from company_events where slug = 'camp-planning-office-hours');

insert into company_events (
  slug, title, summary, event_type, schedule_type, starts_at, ends_at, timezone, location,
  related_news_slug, cover_image_url, status
)
select
  'trade-show-meetings',
  'Trade show & industry day meetings',
  'Meet Weatherhaven at defense and expeditionary industry forums — booth briefings and follow-on technical exchange after the show floor.',
  'trade_show',
  'on_demand',
  null,
  null,
  'America/New_York',
  'On request — contact programs team',
  'expeditionary-camp-capability-brief',
  'https://eiec269001.blob.core.windows.net/site-content/weatherhaven-military-redeployable.jpg',
  'published'
where not exists (select 1 from company_events where slug = 'trade-show-meetings');
