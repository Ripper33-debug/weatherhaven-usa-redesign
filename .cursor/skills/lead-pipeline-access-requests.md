# Lead Pipeline & access_requests

## When to use

Use this skill when adding or changing lead capture, access request forms, admin approve/deny flows, lead analytics, or external lead integrations.

## Single source of truth

**All program access requests** go to the `access_requests` table. Do not create parallel lead tables for access intake.

| Flow | API route | Form / UI | Reference prefix | Program marker |
|------|-----------|-----------|------------------|----------------|
| Public request access | `POST /api/request-access` | `RequestAccessForm`, `/request-access` | `WH-RA-*` | User-selected or empty |
| SOF access request | `POST /api/sof-request-access` | `SofRequestAccessForm` | `WH-SOF-*` | `special-forces` (`SOF_PROGRAM_MARKER`) |
| Engineering contact | `POST /api/contact-leads` | `ContactEngineeringForm` | — | Separate `contact_leads` table |
| Lead intent tracking | `POST /api/lead-events` | `track-lead.ts` client helper | — | `lead_events` table |
| External admin API | `GET/PATCH /api/leads` | Bearer `LEADS_ADMIN_TOKEN` | — | Reads/writes `access_requests` |

## Key files

- `src/app/api/_lib/access-requests.ts` — insert, list, update, `hasApprovedSofAccess`
- `src/lib/accessRequests.ts` — re-exports for app code
- `src/app/api/request-access/route.ts` — public access request handler
- `src/app/api/sof-request-access/route.ts` — SOF-specific handler
- `src/app/api/contact-leads/route.ts` — engineering inquiries
- `src/app/api/lead-events/route.ts` — anonymous intent events
- `src/app/api/leads/route.ts` — machine API for integrations
- `src/lib/send-access-request-emails.ts` — customer + internal notify emails
- `src/lib/lead-events.ts` — server-side lead event inserts
- `src/lib/lead-quality.ts` — funnel KPI helpers for admin
- `src/app/admin/actions.ts` — `adminApproveAccessRequest`, `adminDenyAccessRequest`

## Request lifecycle

```
Submit form → validate → insert access_requests (status: pending)
           → send emails (Resend)
           → insert lead_event (analytics)
           → optional webhook (REQUEST_ACCESS_WEBHOOK_URL)

Admin approve → upsert auth user + password/PIN
             → update status: approved
             → send welcome or SOF code email
             → record admin_events audit row
             → revalidatePath("/admin")

Admin deny → update status: denied
          → send accessRequestDeniedEmail (with reference ID)
          → record admin_events audit row
```

## SOF vs platform approval

`adminApproveAccessRequest` branches on `isSofAccessRequest(program)`:

- **SOF:** generates 4-digit PIN → `passwordFromSofPin` → `sendSofAccessCodeEmail` → `markSofApprovedInMetadata`
- **Platform:** generates temp password → `sendWelcomeEmail` → user signs in at `/login`

## Reference IDs

- Generated at submit time: `WH-RA-{timestamp-base36}` or `WH-SOF-{timestamp-base36}`
- Stored in `access_requests.reference` column (migration `20260529110000_admin_events_and_reference.sql`)
- Fallback: appended to `requirements` if column missing (legacy compat in `insertAccessRequest`)

## Invariants (do not break)

1. Public writes go through API routes with **service role** — never client-side Supabase inserts to `access_requests`.
2. Every successful form submit must: DB insert → email attempt → lead event (where applicable).
3. Approval must not skip email without surfacing failure to admin (actions return manual-share fallback).
4. SOF requests must set `program: SOF_PROGRAM_MARKER` so `hasApprovedSofAccess` works.
5. Deny flow sends professional email with reference when available.
6. Do not bypass `access_requests` for CRM-style integrations — use `/api/leads` or webhooks.

## Checklist for new lead capture

- [ ] Reuse `insertAccessRequest` or `contact_leads` insert helpers — do not raw-query Supabase from components
- [ ] Add `applyApiRateLimit` + `guardApiMutation` to new POST routes
- [ ] Client form uses `fetchWithCsrf`
- [ ] Validate with `validate.ts` or `api-validation.ts`
- [ ] Send emails via existing Shield email builders
- [ ] Record `insertLeadEvent` for funnel analytics
- [ ] Add reference ID generation if access-request shaped
- [ ] Update admin dashboard if new lead type needs visibility

## Common mistakes

- Creating a new `leads` or `inquiries` table instead of extending existing ones
- Forgetting `reference` column migration in production
- Approving SOF request without `SOF_PROGRAM_MARKER` in program field
- Skipping lead events (breaks admin Command center KPIs)
- Using admin UI to approve without checking email delivery result
