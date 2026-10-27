-- Persist submitter email on engineering inquiries (required by API, previously email-only).
alter table contact_leads add column if not exists email text;

create index if not exists contact_leads_email_idx on contact_leads (email);
