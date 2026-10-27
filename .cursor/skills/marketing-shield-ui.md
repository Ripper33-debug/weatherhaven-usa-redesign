# Marketing Shield UI

## When to use

Use this skill when building or changing public marketing pages, product catalog, cinematic effects, mobile action bar, or layout chrome that differs from admin/SOF portal.

## Three UI zones

| Zone | Route detection | Chrome | Effects |
|------|-----------------|--------|---------|
| **Shield marketing** | `isMarketingPage(pathname)` | Cinematic dark, mobile action bar, page transitions | No platform cursor/effects |
| **Light portal** | `isLightPortalPath(pathname)` — admin + SOF secure | Minimal platform chrome | No cursor, boot screen, DOM enhancements |
| **Platform (legacy)** | Neither marketing nor light portal | Full platform effects | Custom cursor, scroll progress, magnetic buttons |

## Marketing routes

Defined in `src/lib/marketing-pages.ts`:

- `/` (homepage)
- `/capabilities`, `/configurable-solutions/*`, `/contact`, `/resources`, `/events`
- `/mission-solution-builder`
- `/sof-solutions` and `/sof-solutions/request-access`

**Excluded from marketing** (use light portal):

- `/sof-solutions/login`
- `/sof-solutions/secure/*`

## Key files

- `src/lib/marketing-pages.ts` — `isMarketingPage`, `isProductCatalogPath`
- `src/lib/route-context.ts` — `isLightPortalPath`, `isSofSecurePath`, `isAdminPath`
- `src/components/site/SiteEnhancements.tsx` — central effect routing
- `src/components/site/SiteChrome.tsx` — navbar, footer, skip link
- `src/components/marketing/*` — Shield marketing components
- `src/components/marketing/MarketingMobileActionBar.tsx` — mobile CTA bar
- `src/components/marketing/MarketingPageFlags.tsx` — body class flags
- `src/components/products/ProductCompareTools.tsx` — compare bar (catalog only)
- `src/contexts/ProductCompareContext.tsx` — compare state
- `src/lib/product-images.ts`, `src/lib/product-gallery.ts` — catalog imagery
- `src/lib/marketing-pages.test.ts` — route classification tests

## SiteEnhancements behavior

```typescript
// Simplified decision tree in SiteEnhancements.tsx
marketing = isMarketingPage(pathname)
lightPortal = isLightPortalPath(pathname)

CsrfBootstrap          // always
MarketingPageFlags     // always
PlatformPageFlags      // always
PlatformEffects          // !marketing && !lightPortal
ScrollProgress           // !marketing && !lightPortal
CustomCursor               // !marketing && !lightPortal && !isMap
PageTransition             // marketing prop controls animation style
MarketingMobileActionBar   // marketing only
ProductCompareTools        // always (internally gates on catalog path)
```

## Layout constraints (required)

1. **No horizontal page scroll** on marketing pages — use `overflow-x-hidden` on layouts.
2. Avoid `overflow-x-auto` on marketing UI except inside contained tables.
3. Product images: local `/public/products/{slug}.jpg` + gallery; CDN fallback in `product-images.ts`.
4. Hero video: `/public/hero.mp4` + `NEXT_PUBLIC_HERO_VIDEO_READY=true`.

## Product catalog

- `isProductCatalogPath` → `/configurable-solutions` and sub-routes
- Compare tools dynamically imported in `ProductCompareTools.tsx`
- Adding a product: update `src/lib/products.ts`, add images, sitemap entry

## Adding a new marketing page

- [ ] Create route under `src/app/`
- [ ] Export `metadata` (title, description, OG)
- [ ] Add path to `MARKETING_PREFIXES` in `marketing-pages.ts` if Shield chrome needed
- [ ] Add to `MARKETING_PATHS` in `src/app/sitemap.ts`
- [ ] Add test case in `marketing-pages.test.ts`
- [ ] Verify no horizontal overflow at mobile widths
- [ ] Confirm page is not accidentally classified as light portal

## Invariants (do not break)

1. SOF login and secure workspace must stay **non-marketing** (no mobile action bar).
2. DOM enhancements (`dom-enhancements.ts`) skip marketing pages entirely.
3. Platform intro screen and custom cursor disabled on marketing and light portal.
4. Map routes (`/tactical-map`, `/deployment-planner`) disable custom cursor even on platform pages.
5. All marketing forms still use CSRF-protected API calls.

## Common mistakes

- Adding `/sof-solutions/login` to marketing prefixes (breaks portal UX)
- Enabling `overflow-x-auto` on page-level marketing containers
- Loading compare tools on homepage (should only activate on catalog paths)
- Applying magnetic/tilt classes on marketing pages expecting them to work (they won't)
- Forgetting sitemap entry for new public routes
