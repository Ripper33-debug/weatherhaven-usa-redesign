# Reset admin password (`/login`)

Admin uses **Supabase Auth** at `/login`. The email must match **`ADMIN_EMAIL`** in Vercel (production) or `.env.local` (local). This is **not** the SOF 4-digit code.

Supabase Dashboard **does not** let you type a new password for an existing user — only **Send password recovery** (email). If recovery links open `localhost`, fix **Authentication → URL configuration → Site URL** to `https://weatherhavenusa.com` first, or use the CLI below.

## CLI reset (recommended)

### Quick interactive (no `.env.local`)

```bash
cd /path/to/WeatherhavenSpecialForcesMay
npm install
npm run admin:reset-password:interactive
```

Paste URL, service role key, and `ADMIN_EMAIL` when prompted. Copy the printed password and sign in at https://weatherhavenusa.com/login.

### 1. Get three values

| Variable | Where to find it |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel → Project → Settings → Environment Variables, or Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env (service_role), or Supabase → API → `service_role` key (**secret**) |
| `ADMIN_EMAIL` | Vercel env — the exact email you use for admin |

Use the **same** Supabase project as production.

### 2. Create `.env.local` in the repo root

```bash
cp .env.example .env.local
```

Edit `.env.local` and set the three variables above (no quotes needed unless values contain spaces).

### 3. Run reset

From the project folder:

```bash
npm install
npm run admin:reset-password
```

Or choose your own password:

```bash
node --env-file=.env.local scripts/reset-admin-password.mjs 'YourNewPassword123'
```

The terminal prints **Email** and **Password**.

### 4. Sign in

Open **https://weatherhavenusa.com/login** (or `http://localhost:3000/login` if testing locally with `npm run dev`).

Use the printed email and password. Then open **/admin**.

## Fix Supabase recovery emails (optional)

If you prefer email recovery instead of CLI:

1. Supabase → **Authentication** → **URL configuration**
2. **Site URL:** `https://weatherhavenusa.com`
3. **Redirect URLs:** add `https://weatherhavenusa.com/**`
4. **Redirect URLs:** add `https://weatherhavenusa.com/auth/reset-password`
5. **Users** → your admin user → **Send password recovery**
6. Open the email link — you should land on **Set a new password**, not the homepage with a long `#access_token` URL
7. Save password, then sign in at `/login` if needed

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Missing ADMIN_EMAIL` | Set `ADMIN_EMAIL` in `.env.local` to match Vercel |
| `listUsers failed` | Wrong `SUPABASE_SERVICE_ROLE_KEY` or URL |
| Login works but `/admin` redirects away | Email ≠ `ADMIN_EMAIL` on Vercel |
| `Created new admin user` | No user existed; use printed credentials |
| Recovery → `localhost` refused | Change Site URL; run CLI or start `npm run dev` |

## Self-serve (platform users)

On **https://weatherhavenusa.com/login**:

1. Click **Forgot password?**
2. Enter email → **Send reset link**
3. Open the email link → **Set a new password** at `/auth/reset-password`
4. Sign in with the new password

Supabase must allow redirect URL: `https://weatherhavenusa.com/auth/reset-password`

## After you're in admin

**Admin → Accounts & passwords → Reset my admin password & email** can issue a new password (emailed if Resend is configured).
