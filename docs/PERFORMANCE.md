# Performance notes

## What we optimize

| Area | Approach |
|------|----------|
| **Three.js shelter preview** | Dynamic import + load only when panel is in viewport (desktop) |
| **Hero / chapter videos** | Poster first; MP4 loads when section enters viewport |
| **Hero topo fallback** | Dynamic import (not in main bundle when video is active) |
| **Product compare UI** | Dynamic import on catalog routes only |
| **DOM effects** | Debounced `MutationObserver` on platform pages; disabled on marketing |
| **Icons** | `optimizePackageImports` for Tabler |
| **Images** | `next/image` with lazy loading below the fold |

## Measuring

```bash
npm run build
# Inspect .next/static/chunks for route sizes
```

In Chrome DevTools: **Performance** tab (LCP, long tasks) and **Network** (video/MP4 weight).

## Production tips

1. Add `/public/hero.mp4` and set `NEXT_PUBLIC_HERO_VIDEO_READY=true` — one local file beats multiple Mixkit requests.
2. Keep product JPGs in `/public/products/` under ~200KB each where possible.
3. Prefer static marketing pages; avoid loading `/tactical-map` until needed (already code-split).

## Reduced motion

Users with `prefers-reduced-motion: reduce` skip magnetic/tilt effects and the platform intro screen (see `lib/effects/media.ts`).
