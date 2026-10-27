# Email setup (Resend + Supabase Auth)

Follow these steps in order. The app already sends **program mail** through Resend in code; **forgot password** goes through Supabase Auth. Step 3 connects them so recovery mail uses the same domain and sender.

---

## Step 1 — Resend domain and API key

1. Sign in at [resend.com](https://resend.com) → **Domains** → add `weatherhavenusa.com` (or your production domain).
2. Add the DNS records Resend shows (SPF, DKIM). Wait until the domain shows **Verified**.
3. **API Keys** → create a key (e.g. `weatherhaven-production`). Copy it once — you will use it in Vercel and Supabase.

**Recommended sender** (match in Vercel `EMAIL_FROM` and Supabase SMTP):

```text
Weatherhaven Programs <noreply@weatherhavenusa.com>
```

Use an address on your verified domain (`noreply@`, `programs@`, etc.).

---

## Step 2 — Vercel environment (program email)

In **Vercel → Project → Settings → Environment Variables** (Production + Preview):

| Variable | Example | Notes |
|----------|---------|--------|
| `RESEND_API_KEY` | `re_…` | From Resend |
| `EMAIL_FROM` | `Weatherhaven Programs <noreply@weatherhavenusa.com>` | Must use verified domain |
| `NOTIFY_TO` | `programs@weatherhavenusa.com` | Internal leads / access alerts |
| `EMAIL_REPLY_TO` | `programs@weatherhavenusa.com` | Optional; customer reply-to |
| `ADMIN_EMAIL` | `barry.castelli33@gmail.com` | Operator Supabase login |
| `NEXT_PUBLIC_SITE_URL` | `https://weatherhavenusa.com` | No trailing slash |

Redeploy after saving.

**Program mail sent via Resend (already wired in the app):**

- Contact form confirmations + internal alerts
- Access request confirmations
- SOF access request confirmations
- Admin approvals, invites, denials
- Admin-initiated platform / SOF password emails

---

## Step 3 — Supabase Auth URLs

In **Supabase → Authentication → URL configuration**:

| Setting | Value |
|---------|--------|
| **Site URL** | `https://weatherhavenusa.com` |
| **Redirect URLs** | `https://weatherhavenusa.com/auth/reset-password` |

Add preview URLs if you test forgot-password on Vercel previews, e.g. `https://your-preview.vercel.app/auth/reset-password`.

---

## Step 4 — Supabase SMTP → Resend (recommended)

This makes **Forgot password?** mail come from the same branded sender as program email.

In **Supabase → Authentication → Emails → SMTP settings** → enable custom SMTP:

| Field | Value |
|-------|--------|
| **Sender name** | `Weatherhaven Programs` (match `EMAIL_FROM`) |
| **Sender email** | `noreply@weatherhavenusa.com` (match `EMAIL_FROM`) |
| **Host** | `smtp.resend.com` |
| **Port** | `465` |
| **Username** | `resend` |
| **Password** | Your **same** `RESEND_API_KEY` |

Save. Supabase Auth emails (recovery, etc.) now deliver through Resend on your domain.

**Alternative:** Resend dashboard → **Integrations → Supabase** can auto-configure SMTP if you prefer the native integration.

---

## Step 5 — Branded recovery template

1. Open `supabase/auth-email-templates/recovery.html` in this repo.
2. **Supabase → Authentication → Email Templates → Reset password**
3. **Subject:** `Weatherhaven Programs — Reset your platform password`
4. Paste the HTML body. Keep `{{ .ConfirmationURL }}` and `{{ .Email }}` unchanged.
5. Save.

---

## Step 6 — Verify end-to-end

After deploy:

| Test | Expected |
|------|----------|
| Submit **Contact** form | Confirmation from `EMAIL_FROM` via Resend |
| Approve a test access request | Welcome / password email via Resend |
| `/login` → **Forgot password?** | Branded reset link → `/auth/reset-password` |
| Complete reset → sign in | Success banner on `/login?reset=ok` |

**Admin shortcut:** **Admin → Accounts & passwords** shows your current sender, SMTP fields, and redirect URL (from env).

---

## Quick reference

| Flow | System | Configured in |
|------|--------|----------------|
| Contact, leads, approvals, invites | **Resend** | Vercel env |
| Sign-in, forgot password | **Supabase Auth** | Supabase URLs + SMTP |
| Branded recovery appearance | **Resend SMTP + template** | Supabase dashboard |

See also: [EMAIL.md](./EMAIL.md), [ADMIN_PASSWORD_RESET.md](./ADMIN_PASSWORD_RESET.md).
