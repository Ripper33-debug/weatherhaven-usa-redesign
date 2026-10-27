# Supabase Auth email templates

Branded templates for **Supabase → Authentication → Email Templates**.

| File | Supabase template | Subject (recommended) |
|------|-------------------|------------------------|
| `recovery.html` | **Reset password** | `Weatherhaven Programs — Reset your platform password` |

## Setup order

1. Complete [docs/EMAIL_SETUP.md](../../docs/EMAIL_SETUP.md) steps 1–3 (Resend domain, Vercel env, Supabase SMTP → Resend).
2. Open **Authentication → URL configuration** and confirm redirect URL includes `/auth/reset-password`.
3. Paste `recovery.html` into **Reset password** template body.
4. Send a test via `/login` → **Forgot password?**

Do **not** edit `{{ .TokenHash }}`, `{{ .SiteURL }}`, or `{{ .Email }}` — Supabase replaces these at send time. Links go through `/auth/confirm` so tokens are exchanged server-side (no `#access_token` in the browser).
