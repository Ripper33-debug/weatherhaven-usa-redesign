# Launch checklist

Use this after merging PRs **#16**, **#17**, and **#18** to production. Pushing to `main` triggers a Vercel redeploy when the repo is connected.

## 1. Vercel redeploy

- Confirm the latest `main` commit is deployed (Vercel → Deployments → Production).
- If env vars changed, click **Redeploy** on the production deployment.

## 2. Supabase SQL (run in SQL Editor)

Run **in order** if not already applied:

| Script | Purpose |
|--------|---------|
| `supabase/migrations/20260603120000_cms_media.sql` or `supabase/cms_media.sql` | CMS photo storage bucket + `news_releases.cover_image_url` |
| `supabase/seed_news_sample.sql` | Optional: three on-site news articles for `/news` and homepage |

## 3. Vercel environment variables

| Variable | Action |
|----------|--------|
| `ADMIN_EMAILS` | Set comma-separated operator emails (overrides `ADMIN_EMAIL` when set). Example: `barry@…,programs@…` |
| `ADMIN_EMAIL` | Keep as fallback if `ADMIN_EMAILS` is empty |
| `NEXT_PUBLIC_HERO_VIDEO_READY` | Set to `true` **after** hero video is deployed (step 5) |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Optional — same DSN for server + client error monitoring |
| `REQUEST_ACCESS_WEBHOOK_URL` | Optional — POST JSON to HubSpot/Zapier on each access request |

Redeploy after any env change.

## 4. Supabase Auth users (operators)

For **each** email in `ADMIN_EMAILS`:

1. Supabase → Authentication → Users → **Add user**
2. Email + password, mark **Auto confirm user**
3. Sign in at `https://your-domain.com/login` → `/admin`

Forgot password uses Supabase Auth email (configure SMTP → Resend per [EMAIL_SETUP.md](./EMAIL_SETUP.md)).

## 5. Hero video

1. Replace or add your MP4 at **`public/hero.mp4`** in the repo (exact path and filename).
2. Set **`NEXT_PUBLIC_HERO_VIDEO_READY=true`** in Vercel → Environment Variables (Production).
3. Redeploy.

**Replace with a new video (on your Mac, in the repo folder):**

```bash
cp /path/to/your-new-hero.mp4 public/hero.mp4
git add public/hero.mp4
git commit -m "Update homepage hero video"
git push origin main
```

Tips: MP4 (H.264), aim for under ~20 MB if possible (`-movflags +faststart` helps streaming). When the env flag is `true`, Mixkit stock footage is disabled site-wide.

The same `/hero.mp4` is used on the homepage, SOF landing, login, and inner page heroes.

## 6. CMS content (admin)

Sign in at `/login` → `/admin`.

### News

- **Content → News releases** — edit the seeded articles or add new ones.
- Upload an optional **cover photo** per release (requires step 2 storage bucket).
- Publish to show on `/news` and the homepage news section.

### Product photos

- **Content → Shelter systems** — edit each system → **Photos** → upload cover + gallery.
- Save after each upload.
- Published systems appear on `/configurable-solutions`.

Without CMS photos, catalog cards fall back to CDN images in `product-images.ts`.

## 7. SOF landing

`/sof-solutions` now shows the full program landing page (no redirect to login). Member sign-in remains at `/sof-solutions/login`.

## 8. Verify

- [ ] Footer **Operator sign-in** → `/login` (sign out first if testing with a SOF session)
- [ ] `/admin` loads for each operator email
- [ ] `/news` shows releases; homepage news section visible
- [ ] `/configurable-solutions` catalog loads; product detail pages show images
- [ ] `/sof-solutions` landing renders
- [ ] Share a product or news URL — preview should use CMS/CDN image when set (Open Graph)

## Related docs

- [PRODUCTION.md](./PRODUCTION.md) — full env and migration list
- [EMAIL_SETUP.md](./EMAIL_SETUP.md) — Resend + Supabase SMTP
- [ADMIN_PASSWORD_RESET.md](./ADMIN_PASSWORD_RESET.md) — operator password recovery
