# SEO & Metadata

## When to use

Use this skill when adding public routes, updating page titles/descriptions, Open Graph tags, sitemap entries, or robots rules.

## Current SEO setup

- **Root metadata:** `src/app/layout.tsx` — title template, description, OG, Twitter card
- **Per-page metadata:** export `metadata` or `generateMetadata` from page/layout files
- **Sitemap:** `src/app/sitemap.ts` — static marketing paths + product slugs
- **Robots:** `src/app/robots.ts` — disallow private routes
- **Site URL:** `getSiteUrl()` / `PRODUCTION_SITE_URL` from `@/lib/site-url`
- **JSON-LD:** not implemented yet — add here if introducing structured data

## Key files

- `src/app/layout.tsx` — global `Metadata` export
- `src/app/sitemap.ts` — `MARKETING_PATHS` + product pages
- `src/app/robots.ts` — crawl rules
- `src/lib/site-url.ts` — canonical URL helper
- `src/lib/site.ts` — company name, description constants
- `src/lib/products.ts` — product slugs for sitemap
- Individual `src/app/*/page.tsx` — page-level metadata

## Robots disallow list

These must stay disallowed (private/authenticated):

- `/admin`
- `/internal/`
- `/api/`
- `/sof-solutions/secure/`

Do not add marketing pages to disallow. SOF login and request-access **are** public and may be indexed unless intentionally excluded.

## Sitemap paths

Currently included in `MARKETING_PATHS`:

```
/, /capabilities, /configurable-solutions, /contact, /events,
/mission-solution-builder, /resources, /sof-solutions
```

Plus dynamic product pages: `/configurable-solutions/{slug}` from `PRODUCTS`.

**Not in sitemap (by design or omission):**

- `/login`, `/request-access`, `/sof-solutions/login`, `/sof-solutions/request-access`
- `/dashboard`, `/account`, `/admin`, `/tactical-map`

Add new public marketing routes to `MARKETING_PATHS` when they should be indexed.

## Per-page metadata pattern

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title", // uses template: `%s | Weatherhaven`
  description: "Unique description for this page.",
  openGraph: {
    title: "Page Title",
    description: "…",
    images: [{ url: "/products/hqss.jpg", width: 1200, height: 630 }],
  },
};
```

For dynamic routes:

```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return { title: product.name, description: product.summary };
}
```

## OG images

- Default OG image: `/products/hqss.jpg` (set in root layout)
- Product pages should use product-specific images from `/public/products/{slug}.jpg`
- Use absolute URLs via `metadataBase` (already set from `getSiteUrl()`)

## Env requirements

- `NEXT_PUBLIC_SITE_URL` — canonical site URL for OG links and email (required in production)

## Checklist for new public page

- [ ] Export `metadata` with unique title and description
- [ ] Add to `MARKETING_PATHS` in `sitemap.ts` if indexable
- [ ] Verify page is NOT in robots disallow
- [ ] Test OG preview (title, description, image)
- [ ] Confirm `metadataBase` resolves correctly with `NEXT_PUBLIC_SITE_URL`
- [ ] No sensitive content in metadata for authenticated routes

## JSON-LD (if adding)

No structured data exists today. If adding:

- Use `Organization` or `Product` schema as appropriate
- Inject via page-level `<script type="application/ld+json">` or Next.js metadata API
- Match visible page content — no keyword stuffing
- Follow existing brand naming from `src/lib/site.ts`

## Invariants (do not break)

1. Secure and admin routes stay out of sitemap and in robots disallow.
2. `metadataBase` must use production URL, not localhost, in deployed env.
3. Page titles should use the root template (short `title` string, not duplicated brand suffix).
4. Do not expose internal program names or classified product details in public metadata.

## Common mistakes

- Forgetting sitemap entry for new marketing route
- Using relative OG image URLs without `metadataBase`
- Adding `/sof-solutions/secure/` to sitemap
- Duplicate or generic descriptions across all pages
- Hardcoding `https://weatherhaven.com` instead of `getSiteUrl()`
