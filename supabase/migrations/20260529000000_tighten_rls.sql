-- Tighten RLS: server uses service role (bypasses RLS). Remove permissive anon/authenticated policies.

-- access_requests
drop policy if exists "Admin can read all requests" on access_requests;
drop policy if exists "Anyone can insert requests" on access_requests;
drop policy if exists "Admin can update requests" on access_requests;

-- contact_leads
drop policy if exists "Users can insert own leads" on contact_leads;
drop policy if exists "Admin can read all leads" on contact_leads;
drop policy if exists "Admin can update leads" on contact_leads;

-- invites (see invites.sql)
drop policy if exists "Admin can manage invites" on invites;

-- click_events (see migrations/click_events.sql)
drop policy if exists "Users can insert own clicks" on click_events;
drop policy if exists "Admin can read all clicks" on click_events;
