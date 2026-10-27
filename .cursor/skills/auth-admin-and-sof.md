# Auth: Admin vs SOF Member

## When to use

Use this skill when changing login flows, middleware, session guards, post-login redirects, or anything that gates `/admin`, `/internal`, `/programs`, or `/sof-solutions/secure/*`.

## Two auth surfaces (never mix them)

| Surface | Login URL | Credential | Post-login destination |
|---------|-----------|------------|--------------------------|
| **Admin / platform** | `/login` | Platform password (emailed on approval) | `/admin` if `ADMIN_EMAIL` matches, else `/` |
| **SOF member** | `/sof-solutions/login` | Four-digit PIN (emailed on SOF approval) | `/sof-solutions/secure` (or `redirectTo` if under secure prefix) |

**Critical:** The SOF PIN is **not** the platform password. SOF PIN maps to a derived Supabase password (`WH.SOF.*`) via HMAC — users only type the 4 digits at SOF login.

## Key files

- `src/middleware.ts` — session refresh, admin gate, SOF secure gate, post-login redirects
- `src/lib/auth-routes.ts` — `pathRequiresAuth`, auth gate paths
- `src/lib/auth-admin.ts` — `isAdminEmail`, `ADMIN_EMAIL` env
- `src/lib/sof-auth.ts` — SOF paths, `SOF_PROGRAM_MARKER`, PIN generation, `pathRequiresSofAuth`
- `src/lib/sof-membership.ts` — `userCanAccessSofSecure`, `sof_approved` metadata, DB fallback
- `src/lib/sof-auth-password.ts` — `passwordFromSofPin`, legacy fallback, `sofPinPasswordCandidates`
- `src/app/api/auth/login/route.ts` — platform login API
- `src/app/api/sof-auth/sign-in/route.ts` — SOF PIN login API
- `src/lib/auth/post-login.ts` — shared post-login helpers

## Access rules

### Admin routes (`/admin`, `/internal`, `/programs`)

- Middleware requires signed-in user whose email equals `ADMIN_EMAIL`.
- Non-admin users hitting admin paths redirect to `/login` or `/`.

### SOF secure routes (`/sof-solutions/secure/*`)

- Requires signed-in user **and** `userCanAccessSofSecure(user)`:
  1. Admin email (operator support access), **or**
  2. `user_metadata.sof_approved === true`, **or**
  3. Approved SOF row in `access_requests` for that email (`hasApprovedSofAccess`)
- Unauthenticated → redirect to `/sof-solutions/login?redirectTo=…`
- Authenticated but not approved → redirect with `not_approved=1`

### Legacy redirect

- `/sof-solutions/secure/workspace` redirects to `/sof-solutions/secure`.

## SOF PIN → Supabase password

```typescript
// New accounts (requires SOF_PIN_SECRET in production)
passwordFromSofPin("1234") → "WH.SOF.{hmac-base64url}"

// Legacy fallback still tried at sign-in
legacyPasswordFromSofPin("1234") → "WH.SOF.1234.ACCESS"
```

Sign-in tries HMAC password first, then legacy. New approvals always use HMAC via `passwordFromSofPin`.

## Invariants (do not break)

1. **Never** accept SOF PIN at `/login` or platform password at `/sof-solutions/login`.
2. SOF approval must set both: Supabase user password (from PIN) **and** `sof_approved` metadata.
3. Admin operators bypass SOF membership checks but are identified only by `ADMIN_EMAIL` — not by role metadata.
4. Middleware must refresh Supabase cookies via `@supabase/ssr` pattern (see existing `middleware.ts`).
5. `SOF_PIN_SECRET` must be set in production for new SOF accounts.

## Checklist for auth changes

- [ ] Identify which surface (admin vs SOF) the change affects
- [ ] Update middleware if route protection changes
- [ ] Update `auth-routes.ts` / `sof-auth.ts` if new protected prefixes
- [ ] Test redirect chains: unauthenticated, wrong credential, approved, denied
- [ ] Confirm CSRF + rate limits on login API routes
- [ ] Document new env vars in `.env.example` and `docs/PRODUCTION.md` if needed

## Common mistakes

- Using `generateTempPassword()` for SOF approvals instead of `passwordFromSofPin(sofPin)`
- Checking only metadata without DB fallback (or vice versa) in membership guards
- Adding `/sof-solutions/login` to marketing effects — it uses light portal chrome, not Shield marketing bar
- Forgetting to sync metadata after successful SOF sign-in (`markSofApprovedInMetadata`)
