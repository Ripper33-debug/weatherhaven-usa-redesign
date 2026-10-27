# API Routes: CSRF & Rate Limits

## When to use

Use this skill when adding or modifying API routes under `src/app/api/`, or when wiring client forms that POST to the server.

## Standard mutation route template

```typescript
import { NextResponse } from "next/server";
import { applyApiRateLimit } from "@/lib/api-rate-limit";
import {
  badRequestResponse,
  guardApiMutation,
  serverErrorResponse,
} from "@/lib/api-guard";

export async function POST(req: Request) {
  const limited = applyApiRateLimit(req);
  if (limited) return limited;

  const blocked = await guardApiMutation(req);
  if (blocked) return blocked;

  try {
    // parse body → validate → business logic → return JSON
  } catch (error) {
    return serverErrorResponse("/api/your-route", error);
  }
}
```

## CSRF (double-submit cookie)

- Cookie: httpOnly CSRF cookie (set by `GET /api/csrf`)
- Header: client sends token via `CSRF_HEADER_NAME` from `@/lib/csrf-constants`
- Verification: `verifyCsrfRequest` in `@/lib/csrf` — header must match cookie
- Client helper: `fetchWithCsrf` from `@/lib/csrf-client`
- Bootstrap: `CsrfBootstrap` component in `SiteEnhancements` pre-fetches token

**Bearer bypass:** Routes with `Authorization: Bearer …` skip CSRF (machine-to-machine). Example: `/api/leads` uses `LEADS_ADMIN_TOKEN`.

## Rate limiting (two layers)

### Layer 1: Global API cap (every route)

`applyApiRateLimit` → in-memory 10 req/min per IP via `@/lib/rateLimit.ts` (legacy) or `@/lib/api-rate-limit.ts`.

Always call at the top of every API handler (GET and POST).

### Layer 2: Named limits (sensitive routes)

`rateLimitAllowed(key, RATE_LIMITS.*)` from `@/lib/rate-limit.ts`:

| Key constant | Limit | Window | Used by |
|--------------|-------|--------|---------|
| `contact` | 8/min | 60s | Contact form |
| `requestAccess` | 6/min | 60s | Request access |
| `sofRequestAccess` | 6/min | 60s | SOF request access |
| `leadEvents` | 40/min | 60s | Lead events |
| `sofLoginIp` | 12/15min | 15min | SOF sign-in (per IP) |
| `sofLoginEmail` | 5/15min | 15min | SOF sign-in (per email) |

Upstash Redis (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) enables shared limits across serverless instances (prefix `wh-ratelimit`). Without Upstash, named limits fall back to in-memory per instance.

## Key files

- `src/lib/api-guard.ts` — CSRF guard, error responses, Sentry capture
- `src/lib/api-rate-limit.ts` — global API rate limit
- `src/lib/rate-limit.ts` — Upstash + memory named limits
- `src/lib/rate-limit-config.ts` — `RATE_LIMITS` constants
- `src/lib/csrf.ts` — server CSRF verification
- `src/lib/csrf-client.ts` — client `fetchWithCsrf`, `ensureCsrfToken`
- `src/lib/csrf-constants.ts` — cookie/header names
- `src/lib/api-validation.ts` — shared field validators
- `src/lib/validate.ts` — sanitize/validate helpers
- `src/lib/monitoring.ts` — `captureRouteError` for Sentry

## Response helpers

| Helper | Status | Use |
|--------|--------|-----|
| `badRequestResponse(msg)` | 400 | Validation failures |
| `invalidCsrfResponse()` | 403 | CSRF mismatch |
| `tooManyRequestsResponse()` | 429 | Rate limited |
| `serverErrorResponse(route, err)` | 500 | Unexpected errors (+ Sentry) |

Production error bodies hide details; dev includes `details` field.

## Client form checklist

- [ ] Use `fetchWithCsrf` for POST/PATCH/PUT/DELETE
- [ ] `credentials: "same-origin"` (default in `fetchWithCsrf`)
- [ ] Handle 403 (CSRF), 429 (rate limit), 400 (validation) in UI
- [ ] Do not store or send service role keys from client

## Machine API checklist (Bearer auth)

- [ ] Validate token with `secureCompare` (timing-safe)
- [ ] Skip CSRF (Bearer authorized requests pass `verifyCsrfRequest`)
- [ ] Still apply `applyApiRateLimit`
- [ ] Document token env var in `.env.example`

## Invariants (do not break)

1. Every new public POST route needs `guardApiMutation` unless Bearer-authenticated.
2. Every API route needs `applyApiRateLimit` at the top.
3. Sensitive routes need additional named limits — do not rely on global cap alone.
4. Errors in production routes use `serverErrorResponse` for Sentry reporting.
5. Never disable CSRF on browser-submitted forms.

## Common mistakes

- Raw `fetch("/api/…", { method: "POST" })` without CSRF header
- Forgetting rate limit on GET handlers (still need `applyApiRateLimit`)
- Adding CSRF to Bearer routes (unnecessary; use `isBearerAuthorized` bypass)
- Returning raw Supabase/DB errors to clients in production
- Using sync `checkRateLimit` from `@/lib/rateLimit.ts` instead of async `rateLimitAllowed` for named limits
