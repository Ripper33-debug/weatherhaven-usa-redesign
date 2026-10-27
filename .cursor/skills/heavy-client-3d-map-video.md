# Heavy Client Features: 3D, Map, Video

## When to use

Use this skill when working with Three.js shelter preview, Leaflet tactical map, hero video/topo, product compare, or any performance-sensitive client bundle.

## Core principles

1. **Dynamic import** heavy libraries — never static-import Three.js or Leaflet in shared layouts.
2. **Viewport gating** — load 3D/video only when the section enters view.
3. **SSR off** — `{ ssr: false }` for anything touching `window`, WebGL, or Leaflet.
4. **Reduced motion** — respect `prefers-reduced-motion: reduce`.
5. **Mobile fallbacks** — lighter alternatives on small viewports.

## Three.js shelter preview

| File | Role |
|------|------|
| `src/components/home/ShelterVisualPanel.tsx` | Viewport gate + mobile/desktop branch |
| `src/components/home/Shelter3DVisual.tsx` | Three.js scene (dynamic import) |
| `src/components/home/InteractiveShelterVisual.tsx` | Mobile fallback (no WebGL) |
| `src/hooks/useInView.ts` | Intersection observer hook |
| `src/lib/shelter-view-mode.ts` | View mode types |

Pattern:

```typescript
const Shelter3DVisual = dynamic(
  () => import("@/components/home/Shelter3DVisual").then((m) => m.Shelter3DVisual),
  { ssr: false, loading: () => <Skeleton /> },
);

// Load 3D only when panel in view AND desktop
const { ref, inView } = useInView("240px");
// mobile → InteractiveShelterVisual; desktop + inView → Shelter3DVisual
```

Cleanup: dispose Three.js geometries/materials/renderer on unmount in `Shelter3DVisual`.

## Leaflet tactical map

| File | Role |
|------|------|
| `src/app/tactical-map/TacticalMapClient.tsx` | Main map client component |
| `src/app/tactical-map/page.tsx` | Route wrapper |
| `src/app/sof-solutions/secure/deployment-planner/page.tsx` | Embedded map (dynamic import) |
| `src/lib/tactical-marker-meta.ts` | Marker encode/decode |
| `supabase/tactical_markers.sql` | User-scoped marker storage (RLS) |

Pattern:

```typescript
const TacticalMapClient = dynamic(
  () => import("@/app/tactical-map/TacticalMapClient"),
  { ssr: false },
);
```

Markers sync to Supabase `tactical_markers` via authenticated client (RLS: own rows only).

## Hero video & topo fallback

| File | Role |
|------|------|
| `src/components/hero/HeroMediaBackground.tsx` | Poster-first, viewport-gated MP4 |
| `src/components/hero/HeroTopoCanvas.tsx` | Dynamic topo fallback |
| `src/lib/hero-media.ts` | Hero media config |
| `public/hero.mp4` | Production hero asset |

- Poster loads first; MP4 when section enters viewport.
- Topo canvas dynamically imported when video not ready (`NEXT_PUBLIC_HERO_VIDEO_READY`).
- Prefer one local `/public/hero.mp4` over external CDN requests in production.

## Product compare (catalog only)

| File | Role |
|------|------|
| `src/components/products/ProductCompareTools.tsx` | Dynamic import wrapper |
| `src/components/products/ProductCompareBar.tsx` | Compare bar UI |
| `src/components/products/ProductCompareOverlay.tsx` | Full compare overlay |

Loaded globally via `SiteEnhancements` but internally gates on `isProductCatalogPath`.

## Platform DOM effects

| File | Role |
|------|------|
| `src/lib/effects/media.ts` | `prefersReducedMotion`, `effectsEnabled()` |
| `src/lib/effects/dom-enhancements.ts` | Magnetic buttons, card tilt, scramble text |
| `src/components/effects/PlatformEffects.tsx` | MutationObserver bootstrap |
| `src/components/effects/InitialLoadScreen.tsx` | Boot screen (skipped if reduced motion) |

```typescript
// dom-enhancements.ts skips marketing pages
if (!effectsEnabled()) return;
if (isMarketingPage(window.location.pathname)) return;
```

Effects enabled only when: not reduced motion AND not mobile viewport (`effectsEnabled()`).

## Performance checklist

- [ ] Heavy lib behind `dynamic(..., { ssr: false })`
- [ ] Viewport or interaction gate before loading WebGL/video
- [ ] Loading skeleton with `aria-hidden` during load
- [ ] Cleanup listeners and GPU resources on unmount
- [ ] Check bundle: `npm run build` → inspect `.next/static/chunks`
- [ ] Test with `prefers-reduced-motion: reduce` enabled
- [ ] Test mobile viewport (767px breakpoint)

## Map-specific UX

- Custom cursor disabled on map routes in `SiteEnhancements`
- Context menus and mobile controls need keyboard/ARIA attention (see `TacticalMapClient` patterns)
- Deployment planner embeds same client — keep props interface stable

## Invariants (do not break)

1. Never add static `import * as THREE` or `leaflet` in `layout.tsx` or shared server components.
2. Marketing pages must not run DOM enhancement MutationObserver.
3. Reduced motion users skip boot screen, magnetic effects, and heavy animations.
4. Three.js only on desktop when panel is in view — mobile gets 2D fallback.
5. Tactical map markers must respect RLS (authenticated user, own rows).

## Common mistakes

- Importing Three.js in a Server Component
- Loading hero MP4 on every page instead of viewport-gated
- Forgetting WebGL cleanup (memory leaks on SPA navigation)
- Enabling platform effects on marketing pages
- Static-importing compare overlay on homepage bundle

See also: `docs/PERFORMANCE.md` for production media tips.
