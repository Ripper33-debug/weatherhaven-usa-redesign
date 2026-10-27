# Production readiness checklist

**Quick path:** see [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) for merge #16–#18, Supabase storage, admin users, hero video, and CMS content.

## Environment

Copy `.env.example` to `.env.local` and set:

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Auth and data |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server writes (leads, dashboard) |
| `RESEND_API_KEY` | Yes | Transactional email |
| `EMAIL_FROM` | Yes | Verified Resend sender (e.g. `Weatherhaven Programs <noreply@yourdomain.com>`) |
| `EMAIL_REPLY_TO` | No | Reply-to for customer transactional mail (defaults to `NOTIFY_TO` / `ADMIN_EMAIL`) |
| `NOTIFY_TO` | Yes | Internal lead distribution |
| `ADMIN_EMAIL` | Yes | Primary admin email (Supabase auth + notify fallback) |
| `ADMIN_EMAILS` | No | Comma-separated operators with `/admin` access (overrides single email when set) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Email links and OG metadata |
| `SOF_PIN_SECRET` | Yes (production) | HMAC pepper for SOF four-digit access codes (new approvals) |

Optional: `REQUEST_ACCESS_WEBHOOK_URL` (POST JSON on each access request), `LEADS_ADMIN_TOKEN`, `LEADS_REGISTER_VIEW_TOKEN`, `WH_ENABLE_INTERNAL_INTEL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN` (same DSN for client errors, optional).

## Media

1. Add owned hero: `/public/hero.mp4`
2. Set `NEXT_PUBLIC_HERO_VIDEO_READY=true`
3. Product photos:
   - **CMS (recommended):** Admin → Content → Shelter systems or News — upload JPEG/PNG/WebP/GIF (max 8 MB). Requires `supabase/migrations/20260603120000_cms_media.sql` (or `supabase/cms_media.sql`) for the `cms-media` storage bucket.
   - Catalog cover: `/public/products/{slug}.jpg`
   - Detail gallery: `/public/products/{slug}/gallery/*.{jpg,jpeg,webp,png}` (see `public/products/README.txt`)
   - CDN fallback in `product-images.ts` when local files are missing

## Supabase

- Run SQL in `/supabase` (including `tactical_markers.sql`)
- **Required in production:** run `supabase/migrations/20260529000000_tighten_rls.sql` to remove permissive RLS policies
- Confirm RLS enabled; app writes use **service role** on the server only
- SOF secure routes require `user_metadata.sof_approved` (set automatically when a SOF access request is approved)
- Run `supabase/migrations/20260529110000_admin_events_and_reference.sql` for operator audit log + access request reference IDs
- Run `supabase/migrations/20260529120000_contact_leads_email.sql` so inquiry emails are stored for admin follow-up
- Run `supabase/migrations/20260529130000_user_analytics_tables.sql` for signed-in member analytics (`user_sessions`, `page_views`, `user_events`, `click_events`)
- Run `supabase/migrations/20260601150000_lead_management.sql` for built-in lead pipeline (`lead_profiles`, `lead_notes`)
- Run `supabase/migrations/20260601160000_news_releases.sql` for CMS news releases (`news_releases`)
- Or paste the same script from `supabase/news_releases.sql` into Supabase SQL Editor and run **the entire file**
- Run `supabase/migrations/20260602180000_catalog_products.sql` for product catalog CMS (`catalog_products`)
- Or paste the script from `supabase/catalog_products.sql` (creates table only), then run **`npm run sync:catalog`** with `.env.local` to seed the 17 canonical products from `src/lib/products.ts`
- Run `supabase/migrations/20260603120000_cms_media.sql` (or `supabase/cms_media.sql`) for CMS photo uploads (`cms-media` bucket + `news_releases.cover_image_url`)
- Run `supabase/migrations/20260608120000_remove_test_news_releases.sql` to remove placeholder news rows from production
- Ensure `access_requests.request_type` and `contact_leads.region` columns exist (see project SQL migrations or apply manually before deploy)
- Optional: `supabase/seed_news_sample.sql` for three on-site news articles
- **Auth redirect URLs:** add `https://your-domain.com/auth/reset-password` (password recovery + forgot password on `/login`)
- **Auth SMTP → Resend:** see [EMAIL_SETUP.md](./EMAIL_SETUP.md) — use branded sender matching `EMAIL_FROM`
- Paste **Reset password** template from `supabase/auth-email-templates/recovery.html`

## CRM webhook

Set `REQUEST_ACCESS_WEBHOOK_URL` to receive JSON when someone submits `/api/request-access` (HubSpot, Zapier, etc.). Payload includes name, email, organization, program, reference id.

## Admin exports

Signed-in operators: **Admin → Lead pipeline → Export CSV** (`GET /api/admin/export-leads`).

## Public catalog API

`GET /api/catalog/products` returns published shelter systems from the CMS (static catalog when Supabase is not configured).

Contact, access requests, SOF login, and lead events are rate-limited server-side.

1. In Vercel: **Storage → Marketplace → Upstash Redis** → create database and connect to `weatherhaven-special-forces-may`
2. Vercel auto-sets `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. Redeploy — limits are shared across all serverless instances (prefix `wh-ratelimit`)

Without Upstash, limits fall back to **in-memory per instance** (weaker under abuse or cold starts). Startup logs warn when Upstash is missing.

## Email

Program mail (contact, access, approvals) uses **Resend**. Sign-in and **Forgot password?** use **Supabase Auth** with **Resend SMTP** for branded recovery mail.

**One-time setup:** [EMAIL_SETUP.md](./EMAIL_SETUP.md) · Reference: [EMAIL.md](./EMAIL.md)

## Error monitoring (Sentry)

1. Create a Sentry project (Next.js)
2. Set `SENTRY_DSN` on Vercel (server + API routes)
3. Optionally set `NEXT_PUBLIC_SENTRY_DSN` to the same value for client-side errors
4. Failed form/API writes and admin audit insert failures are reported when DSN is set

## Lead quality analytics

- Run `supabase/migrations/20260529100000_lead_events.sql` for marketing intent events
- Admin **Command center** shows lead funnel KPIs (intent → inquiries → access decisions)
- `POST /api/lead-events` records anonymous high-intent actions (forms also write server-side)

### Admin sign-in (`/login`)

- Set `ADMIN_EMAIL` (or `ADMIN_EMAILS`) to match Supabase auth email(s) for operator account(s).
- **Platform password** ≠ SOF four-digit code. SOF members sign in at `/sof-solutions/login` with the emailed PIN.
- Set `SOF_PIN_SECRET` in production so new SOF approvals use HMAC-derived passwords (legacy `WH.SOF.{pin}.ACCESS` still works for existing accounts until rotated).
- **Reset password:** see [ADMIN_PASSWORD_RESET.md](./ADMIN_PASSWORD_RESET.md) — Supabase Dashboard does not set passwords for existing users; use `npm run admin:reset-password` with `.env.local`, or fix Site URL then **Send password recovery**.
- In **Admin → Accounts & passwords** (when already signed in): **Reset my admin password & email** or **Reset platform password** per user.

### Operator audit log

- Admin **Access requests** tab includes an **Operator activity log** (approvals, denials, password/code resets)
- Denying a request sends a professional **not approved** email to the requester (with reference ID when stored)

## Leads

All program access requests flow to **`access_requests`** (single source of truth).

- Public submit: `POST /api/request-access` (DB + email in one call)
- Engineering contact: `POST /api/contact-leads`
- Integrations: `GET/PATCH /api/leads` with `Authorization: Bearer $LEADS_ADMIN_TOKEN`

## Quality gates

```bash
npm run lint
npm run test
npm run build
```

## Deploy

Vercel (or similar): set env vars in the project dashboard; enable Analytics if desired.
