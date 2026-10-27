# Email systems

Weatherhaven uses **two email channels**, configured together for a single professional brand.

## Overview

| Channel | Used for | Configured in |
|---------|----------|----------------|
| **Resend** | Program and operator mail | Vercel env (`RESEND_API_KEY`, `EMAIL_FROM`, …) |
| **Supabase Auth** | Sign-in, forgot password, recovery links | Supabase dashboard + redirect URLs |
| **Resend SMTP in Supabase** | Same sender/domain for recovery mail | Supabase → Authentication → SMTP |

**Setup guide (do this once):** [EMAIL_SETUP.md](./EMAIL_SETUP.md)

---

## Resend (program email)

**Sends:**

- Contact form confirmations and internal lead alerts
- Access request confirmations (user + `NOTIFY_TO`)
- SOF access request confirmations
- Platform welcome / temporary password when an **admin** approves access or resets a user from **Admin → Accounts**
- Invitations and denial notices

**Required (Vercel):**

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend API |
| `EMAIL_FROM` | Verified sender, e.g. `Weatherhaven Programs <noreply@yourdomain.com>` |
| `NOTIFY_TO` | Internal distribution for leads and access |
| `EMAIL_REPLY_TO` | Optional reply-to for customer mail |

If `RESEND_API_KEY` is missing, forms still save to the database; email is skipped and the admin UI will note that Resend is not configured.

---

## Supabase Auth (sign-in & password reset)

**Sends:**

- **Forgot password?** on `/login` (self-serve)
- **Send password recovery** from Supabase Dashboard
- Magic links (if used)

**Required:**

1. **Authentication → URL configuration**
   - **Site URL:** `https://weatherhavenusa.com` (your production domain)
   - **Redirect URLs:** `https://weatherhavenusa.com/auth/reset-password`

2. User completes reset at **Set a new password**, then signs in at `/login`.

### Brand recovery mail with Resend SMTP (recommended)

In **Supabase → Authentication → Emails → SMTP settings**:

- Host: `smtp.resend.com` · Port: `465` · Username: `resend` · Password: your `RESEND_API_KEY`
- Sender name/email: match `EMAIL_FROM`

Paste the branded template from `supabase/auth-email-templates/recovery.html`. Full steps: [EMAIL_SETUP.md](./EMAIL_SETUP.md).

---

## Operator password reset (quick reference)

| Method | Email from |
|--------|------------|
| Admin → **Reset my admin password & email** | **Resend** (new temp password) |
| `/login` → **Forgot password?** | **Supabase Auth via Resend SMTP** (reset link) |
| `npm run admin:reset-password` | Terminal only (no email) |

See [ADMIN_PASSWORD_RESET.md](./ADMIN_PASSWORD_RESET.md) for step-by-step recovery.

---

## Quality check

After deploy:

1. Submit a test contact form → confirmation from `EMAIL_FROM` via Resend.
2. Use **Forgot password?** on `/login` → branded recovery link to `/auth/reset-password`.
3. Approve a test access request → welcome mail via Resend.
