# Supabase RLS & Clients

## When to use

Use this skill when adding tables, changing RLS policies, writing database queries, or choosing which Supabase client to import.

## Three clients — pick the right one

| Client | Import | Key | RLS | Use for |
|--------|--------|-----|-----|---------|
| **Browser** | `@/lib/supabase/client` | Anon | Enforced | Client components with user session (rare writes) |
| **Server session** | `@/lib/supabase/server` | Anon + cookies | Enforced | Server Components, auth checks, user-scoped reads |
| **Admin / service** | `@/lib/supabase/admin` or `@/app/api/_lib/get-admin` | Service role | **Bypassed** | All server-side mutations for leads, admin, invites |

**Default rule:** API routes and server actions that write business data use **service role** via `createAdminClient()`.

```typescript
import "server-only";
import { createAdminClient } from "@/app/api/_lib/get-admin";
// or: import { createAdminClient } from "@/lib/supabase/admin";
```

**Never** import admin client from Client Components or expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

## Production RLS posture

Migration `supabase/migrations/20260529000000_tighten_rls.sql` **removes permissive policies** on:

- `access_requests`
- `contact_leads`
- `invites`
- `click_events` (admin read policy)

After this migration, those tables are writable only via service role (server API routes). **Required in production** — see `docs/PRODUCTION.md`.

## Tables with intentional client writes (RLS enforced)

| Table | Policy | Who writes |
|-------|--------|------------|
| `tactical_markers` | `auth.uid() = user_id` | Authenticated users from tactical map |
| `user_sessions` | own-row insert/update | Signed-in member analytics |
| `page_views` | own-row insert/update | Signed-in member analytics |
| `user_events` | own-row insert | Signed-in member analytics |
| `click_events` | own-row insert | Signed-in member analytics |

See `supabase/tactical_markers.sql` and `supabase/migrations/20260529130000_user_analytics_tables.sql`.

## Key files

- `src/lib/supabase/client.ts` — browser client
- `src/lib/supabase/server.ts` — cookie-backed server client
- `src/lib/supabase/admin.ts` — service role (server-only)
- `src/app/api/_lib/get-admin.ts` — re-export for API layer
- `src/app/api/_lib/access-requests.ts` — canonical access_requests writes
- `src/app/api/_lib/contact-leads.ts` — contact_leads writes
- `src/app/api/_lib/admin-user-ops.ts` — auth user CRUD via admin API
- `supabase/migrations/` — production migration sequence

## Migration checklist

When adding a new table:

1. Add SQL in `supabase/` or `supabase/migrations/`
2. Enable RLS: `alter table … enable row level security;`
3. **Default:** no anon/authenticated INSERT policies — server writes via service role
4. If client writes needed: scope policies to `auth.uid() = user_id` (own-row only)
5. Document in `docs/PRODUCTION.md` if production-required
6. Never add "Anyone can insert" policies on lead or admin tables

## Required production migrations (in order)

1. Base schema in `supabase/*.sql`
2. `20260529000000_tighten_rls.sql` — remove permissive policies
3. `20260529100000_lead_events.sql` — marketing funnel events
4. `20260529110000_admin_events_and_reference.sql` — audit log + reference IDs
5. `20260529120000_contact_leads_email.sql` — inquiry email storage
6. `20260529130000_user_analytics_tables.sql` — member analytics

## Invariants (do not break)

1. Service role client must always have `import "server-only"` in its import chain.
2. Lead tables (`access_requests`, `contact_leads`) are server-write-only in production.
3. SOF membership checks use service role reads (`hasApprovedSofAccess`).
4. Middleware uses anon key + cookies — not service role.
5. Admin dashboard data loads via server actions/API using service role.

## Common mistakes

- Adding `createClient()` browser import in API routes for inserts
- Creating anon INSERT policy on `access_requests` "for convenience"
- Forgetting to run tighten RLS migration in production
- Using service role in middleware (unnecessary; use anon + getUser)
- Mixing `@/lib/accessRequests` re-exports with direct Supabase calls in components
