alter table contact_leads add column if not exists region text;

create index if not exists contact_leads_region_idx on contact_leads (region);
