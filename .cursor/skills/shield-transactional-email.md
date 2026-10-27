# Shield Transactional Email

## When to use

Use this skill when adding or changing transactional emails (access requests, approvals, denials, invites, welcome/password resets).

## Email system

All customer-facing email uses the **Shield premium HTML system** — table layout, inline CSS only, dark brand palette. Do not introduce React Email, MJML, or unstyled HTML fragments.

## Key files

- `src/lib/shield-email.ts` — HTML builders + `escapeHtml`
- `src/lib/shield-email-text.ts` — plain-text counterparts
- `src/lib/email-config.ts` — Resend client, `EMAIL_FROM`, `NOTIFY_TO`, `ADMIN_EMAIL`
- `src/lib/send-customer-email.ts` — Resend send wrapper for customer mail
- `src/lib/email.ts` — invite/welcome send helpers
- `src/lib/send-access-request-emails.ts` — access request customer + admin notify
- `src/lib/send-sof-access-email.ts` — SOF four-digit code email
- `src/lib/send-access-denied-email.ts` — denial notification
- `src/lib/send-customer-email.ts` — shared Resend dispatch

## Available email builders

| Builder | Purpose |
|---------|---------|
| `contactConfirmationEmail` | Engineering inquiry confirmation |
| `contactAdminEmail` | Internal notify for contact leads |
| `requestAccessConfirmationEmail` | Public access request confirmation |
| `sofRequestAccessConfirmationEmail` | SOF access request confirmation |
| `requestAccessAdminEmail` | Internal notify for access requests |
| `sofAccessApprovedEmail` | SOF four-digit code delivery |
| `platformAccessApprovedEmail` | Platform password delivery |
| `accessRequestDeniedEmail` | Professional denial with reference |
| `platformInviteEmail` | Invite accept link |

Each has a matching `*Text` variant in `shield-email-text.ts` for multipart emails.

## Send flow pattern

```typescript
const resend = getResendClient();
if (!resend) return { ok: false, skipped: true, reason: "RESEND_API_KEY not set" };

await resend.emails.send({
  from: getEmailFrom(),
  to: recipient,
  replyTo: getReplyTo(), // optional
  subject: "…",
  html: builderFunction({ … }),
  text: textBuilderFunction({ … }),
});
```

Internal notify emails go to `NOTIFY_TO` / `ADMIN_EMAIL` via `getNotifyTo()`.

## Required env vars

- `RESEND_API_KEY` — Resend API key
- `EMAIL_FROM` — verified sender (e.g. `Weatherhaven Programs <noreply@domain.com>`)
- `NOTIFY_TO` — internal lead distribution
- `ADMIN_EMAIL` — admin route + fallback notify
- `EMAIL_REPLY_TO` — optional reply-to for customer mail

## Content rules

1. **Always** escape user input with `escapeHtml()` before embedding in HTML.
2. Include **reference IDs** when available (`WH-RA-*`, `WH-SOF-*`).
3. Use `ShieldEmailRow[]` for structured detail tables in admin emails.
4. Plain-text body must accompany HTML (deliverability + accessibility).
5. Links use `getSiteUrl()` from `@/lib/site-url` for absolute URLs in email.
6. When Resend is not configured, return `{ skipped: true }` — do not throw.

## Email triggers

| Event | Sender function | Templates |
|-------|-----------------|-----------|
| Access request submitted | `sendAccessRequestEmails` | confirmation + admin |
| SOF request submitted | `sendAccessRequestEmails` (SOF source) | SOF confirmation + admin |
| Admin approves (platform) | `sendWelcomeEmail` | platformAccessApprovedEmail |
| Admin approves (SOF) | `sendSofAccessCodeEmail` | sofAccessApprovedEmail |
| Admin denies | `sendAccessDeniedEmail` | accessRequestDeniedEmail |
| Admin invite | `sendInviteEmail` | platformInviteEmail |
| Contact form | contact-leads route | contactConfirmation + admin |

## Checklist for new email type

- [ ] Add HTML builder in `shield-email.ts` using existing header/footer patterns
- [ ] Add plain-text builder in `shield-email-text.ts`
- [ ] Escape all dynamic strings
- [ ] Wire send function with Resend skip handling
- [ ] Include reference ID if lead-related
- [ ] Add Vitest test if builder has conditional logic (see `shield-email-text.test.ts`)
- [ ] Document new env requirements if any

## Invariants (do not break)

1. Do not send raw user HTML — always escape.
2. Do not create parallel email styling systems.
3. Approval/deny flows must attempt email and surface failure to admin UI.
4. SOF code emails show only the 4-digit PIN — not the derived Supabase password.
5. Customer emails should have sensible reply-to for program desk follow-up.

## Common mistakes

- Embedding unescaped `organization` or `requirements` fields
- Forgetting plain-text alternative
- Hardcoding production URL instead of `getSiteUrl()`
- Throwing when `RESEND_API_KEY` missing (breaks dev/test — use skip pattern)
- Sending platform password format in SOF code emails
