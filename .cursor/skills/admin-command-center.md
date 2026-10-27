# Admin Command Center

## When to use

Use this skill when changing `/admin` dashboard, server actions, operator workflows, user management, access approvals, or audit logging.

## Access model

- **Single operator:** only the email matching `ADMIN_EMAIL` env var
- Middleware blocks non-admin from `/admin/*` (redirects to `/`)
- Server actions call `assertAdmin()` — checks session email against `ADMIN_EMAIL`
- Admin can access SOF secure routes for support (via `isAdminEmail` in membership check)

## Key files

- `src/app/admin/page.tsx` — dashboard UI
- `src/app/admin/actions.ts` — all server actions (~500 lines)
- `src/app/admin/components/*` — dashboard tabs and forms
- `src/lib/admin-analytics.ts` — Command center KPIs, funnel metrics
- `src/lib/admin-events.ts` — audit log insert/query
- `src/lib/admin-event-labels.ts` — human-readable action labels
- `src/app/api/_lib/admin-user-ops.ts` — Supabase auth user CRUD
- `src/app/api/_lib/admin-data.ts` — dashboard data aggregation
- `src/lib/invites.ts` — invite token management
- `scripts/reset-admin-password.mjs` — CLI password reset fallback

## Server action pattern

```typescript
"use server";

export async function adminDoSomething(...): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await assertAdmin())) {
    return { ok: false, error: "Unauthorized" };
  }
  // mutate via service role / admin helpers
  await recordAdminAction({ action: "…", target_type: "…", … });
  revalidatePath("/admin");
  return { ok: true };
}
```

Every mutating action should record an `admin_events` row via `recordAdminAction`.

## Core workflows

### Approve access request (`adminApproveAccessRequest`)

1. Detect SOF vs platform via `isSofAccessRequest(program)`
2. Generate credentials: SOF PIN + HMAC password, or temp platform password
3. `upsertAuthUserPassword` — create/update Supabase auth user
4. SOF: `markSofApprovedInMetadata`
5. `updateAccessRequestStatus(id, "approved")`
6. Send email (SOF code or welcome password)
7. `recordAdminAction({ action: "access_request.approved", … })`
8. Return password/PIN for manual share if email fails

### Deny access request (`adminDenyAccessRequest`)

1. Fetch request by ID
2. `updateAccessRequestStatus(id, "denied")`
3. `sendAccessDeniedEmail` with reference ID
4. `recordAdminAction({ action: "access_request.denied", … })`

### Reset platform password (`adminResetPlatformPassword`)

- For `/login` — generates temp password, emails via `sendWelcomeEmail`
- Action: `platform_password.reset`

### Reset SOF access code (`adminResetSofAccessCode`)

- Generates new 4-digit PIN → `passwordFromSofPin` → `sendSofAccessCodeEmail`
- Action: `sof_code.reset`

### User & invite management

- `adminSendInvite` / `adminResendInvite` — invite tokens + email
- `adminAddUser` / `adminDeleteUser` — direct auth user ops
- `acceptInviteAccount` — public invite acceptance flow

### Contact leads

- `adminUpdateContactLeadStatus` — status updates on `contact_leads`

## Dashboard data sources

| Tab / section | Source |
|---------------|--------|
| Command center KPIs | `admin-analytics.ts`, `lead_events`, `access_requests` |
| Access requests | `listAccessRequests()` |
| Contact leads | `contactLeads.ts` |
| Users & passwords | `adminListUsers()`, auth admin API |
| Invites | `listInvites()` |
| Operator activity log | `admin_events` table |
| Member analytics | `user_sessions`, `page_views`, `user_events` (if migration run) |

## CLI fallback

When email-based reset fails or operator is locked out:

```bash
npm run admin:reset-password
```

Uses `SUPABASE_SERVICE_ROLE_KEY`, prints temp password for `ADMIN_EMAIL`.

## Checklist for admin changes

- [ ] Guard with `assertAdmin()` at top of every server action
- [ ] Use service role helpers — never client Supabase in actions
- [ ] Record `admin_events` for audit trail
- [ ] Call `revalidatePath("/admin")` after mutations
- [ ] Handle email failure gracefully (return manual-share credentials)
- [ ] SOF actions use `passwordFromSofPin`, not temp password
- [ ] Update `admin-event-labels.ts` if adding new action types

## Invariants (do not break)

1. Only `ADMIN_EMAIL` user can invoke admin actions — no role-based multi-admin yet.
2. Approval must update both auth user AND `access_requests.status`.
3. SOF approval must set `sof_approved` metadata.
4. Deny must attempt customer email notification.
5. Audit log entries must include `target_email` when available.
6. Never expose service role key or raw passwords in client-rendered HTML (only in action responses to admin UI).

## Common mistakes

- Adding admin UI without server action guard
- Approving without checking email delivery result
- Using platform password flow for SOF program requests
- Forgetting `revalidatePath` after data mutation
- Skipping audit log on "minor" admin operations
- Allowing non-ADMIN_EMAIL users via metadata instead of env check

See also: `docs/PRODUCTION.md` for admin sign-in troubleshooting.
