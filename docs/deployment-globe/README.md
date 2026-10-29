# Weatherhaven deployment globe: website package

Everything is self-hosted. Nothing loads from a CDN, so it works behind strict firewalls and on any host.

| File | What it is |
| --- | --- |
| `index.html` | The globe page |
| `globe.config.js` | Logo, contact button, brand colour, photos. Edit this file, not index.html |
| `data/pins.js` | The 142 confirmed deployments (what the globe reads) |
| `data/pins.csv` | The same list as a spreadsheet, for editing |
| `tools/pin-updater.html` | Turns an edited `pins.csv` back into `pins.js` |
| `assets/` | 3D library, Earth imagery, fonts, link-preview image (`og.jpg`) |
| `brand/logo.png` | White Weatherhaven logo, from weatherhaven.com |
| `photos/` | Product photos from weatherhavenusa.com, shown on 11 deployment cards |

Already set: the white logo, Weatherhaven orange on the tour and contact buttons, and "Talk to a Weatherhaven expert" pointing at `https://www.weatherhavenusa.com/contact?utm_source=globe` (the `utm_source` tag lets you see globe-driven leads in analytics).

## Preview it

Double-click `index.html`. It works straight from your Downloads folder (when opened from disk it loads `assets/textures.js`, a bundled copy of the Earth imagery, because browsers block image files in 3D from local disk). On the website it uses the separate, cacheable image files instead.

## Add it to weatherhavenusa.com (Next.js)

**1. Copy the folder** into the site as `public/deployment-globe/`.

**2. Full page at `/deployments`** (App Router: `app/deployments/page.tsx`):

```tsx
export const metadata = {
  title: 'Where Weatherhaven has deployed',
  description: 'Interactive 3D globe of Weatherhaven deployments on every continent.',
};

export default function Deployments() {
  return (
    <iframe
      src="/deployment-globe/index.html"
      title="Weatherhaven deployment globe"
      allow="fullscreen"
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', border: 0 }}
    />
  );
}
```

If the page keeps the site's top nav, drop `position: 'fixed'` and use `height: 'calc(100vh - 72px)'` (your nav height).

**3. Homepage "Global reach" section** (replaces the Leaflet map). Copy `_nextjs/DeploymentGlobe.tsx` into your components folder (then delete `_nextjs/` from `public/`), and drop it in:

```tsx
import DeploymentGlobe from '@/components/DeploymentGlobe';

<DeploymentGlobe />               // 3D globe
<DeploymentGlobe view="map" />    // or the flat map
```

That one line gives an always-on section:

- **Never a blank box:** a still of the globe (`assets/embed-poster.jpg`) shows instantly; the live globe loads by itself as the section nears the screen and fades in over it. No click needed.
- **Plays by itself:** while nobody is using it, it runs the highlights loop (arcs out of Burnaby, then standout deployments with a caption). It hands over the moment someone clicks, drags or taps, and picks the loop back up after 60 seconds untouched (`ambientIdleSeconds` in `globe.config.js`; `<DeploymentGlobe ambient={false} />` turns the loop off).
- **Doesn't trap the page:** the mouse wheel scrolls the page as normal; Ctrl/⌘ + scroll (or a trackpad pinch) zooms, and a hint says so. On phones a vertical swipe scrolls the page, a sideways swipe spins the globe, two fingers zoom.
- **Costs nothing off screen:** it stops drawing while scrolled out of view or when the tab is in the background.
- **Phones:** one fixed screen (no scrolling inside the box), with the deployment card sliding up over the map.
- **Analytics:** it forwards the globe's events to Google Analytics for you (see Tracking below); no extra snippet needed.

Default height is `clamp(560px, 56vw, 760px)`; pass `height={640}` (or any CSS value) to change it.

Without the component (plain HTML), the section is just:

```html
<iframe src="/deployment-globe/index.html?embed" title="Weatherhaven deployments" allow="fullscreen"
        style="width:100%;height:640px;border:0;display:block"></iframe>
```

`?embed` hides the side panel and adds an "Open full map" button that goes to `fullPageUrl` in `globe.config.js` (set to `/deployments`).

## URL options

- `#<pin-id>` opens straight on one deployment, e.g. `/deployment-globe/index.html#japan-osaka-japan`. The address updates as people click pins, so any view can be copied and sent.
- `?embed` the always-on page-section version (see step 3 above). Add `&ambient=0` to stop it playing the highlights loop by itself.
- `?view=map` opens on the **flat map** (Equal Earth projection) instead of the 3D globe. Combine them for a lightweight page band: `?embed&view=map`. Set `view: 'map'` in `globe.config.js` to make it the default.
- `?kiosk` trade-show behaviour on any screen (see the kiosk package for the offline version).
- `?quality=high` or `?quality=low` overrides the automatic quality setting (also settable as `quality` in `globe.config.js`).

## Tracking engagement (Google Analytics)

The globe reports what visitors do as events, all prefixed `globe_`:

| Event | When | Details sent |
|---|---|---|
| `globe_pin_open` | a deployment card opens | `pin_id`, `pin_name`, `category`, `command`, `via` (globe, list, timeline, next, link, tour) |
| `globe_cta_click` | "Talk to a Weatherhaven expert" is clicked | `pin_id`, `pin_name` |
| `globe_tour_start` | Play tour | |
| `globe_view_change` | Satellite / Night / Tactical | `view` |
| `globe_reach_on` | Reach from HQ switched on | |
| `globe_filter_change` | a mission-type filter changes | `category`, `showing` |
| `globe_command_focus` | a combatant command bar is picked | `command` |
| `globe_explore_open` | the Explore panel opens | |
| `globe_quality_reduced` | the device was too slow and effects were stepped down | `level`, `fps` |

If the globe page itself has GA (`gtag`) or Google Tag Manager (`dataLayer`), the events go straight there. When it is embedded in an iframe, it also posts each event to the parent page. Add this once to the page (or layout) that holds the iframe so the site's GA records them:

```jsx
'use client';
import { useEffect } from 'react';

export function GlobeAnalytics() {
  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin || e.data?.source !== 'weatherhaven-globe') return;
      const { source, event, ...params } = e.data;
      if (typeof window.gtag === 'function') window.gtag('event', event, params);
      else (window.dataLayer = window.dataLayer || []).push({ event, ...params });
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);
  return null;
}
```

Then render `<GlobeAnalytics />` next to the iframe (the `DeploymentGlobe` component already does this for its own section). In GA4 the events show up under Reports → Engagement → Events; register `pin_name` and `via` as custom dimensions to break them down.

## Updating the pins

No code needed:

1. Open `data/pins.csv` in Excel or Google Sheets and edit it. One row per pin; the column notes are in the updater page.
2. Save it as CSV (in Excel, "CSV UTF-8"; in Google Sheets, File → Download → CSV).
3. Open `tools/pin-updater.html` in a browser and drop the CSV on it. It checks every row (missing coordinates, a mistyped mission type or command, duplicate IDs, a story switched on with no text) and lists anything to fix.
4. Click **Download pins.js**, replace `data/pins.js` with it, and redeploy (or reload, if testing from disk).

If the spreadsheet goes missing, the updater's **Download current pins as CSV** rebuilds it from `data/pins.js`.

For developers: `data/pins.js` holds the list as `window.GLOBE_PINS = [ ... ];` (plain JSON after the `=`, so a CMS export drops straight in). Fields: `id`, `location`, `program`, `lat`, `lng`, `category` (`Defence/Peacekeeping`, `Commercial/Scientific` or `Medical/Disaster Relief`), `theaterCode` (`northcom`, `southcom`, `eucom`, `africom`, `centcom`, `indopacom`; `indopacom` is shown on the globe as PACOM, the designation DoD restored in June 2026), `headline`, `narrative`, `hasStory`.

- **Photos:** 11 cards currently show a product photo of the shelter system named in their story (MECC, MEX-26, ATEPS, Endurance, Polarhaven), captioned "product photo" because they are not pictures of those sites. To add real site photos, drop them in `photos/` and list them under `photos` in `globe.config.js` by pin ID; that list overrides the defaults. Landscape, about 1200×675, under 300 KB each.
- A pin with `hasStory: false` shows only the place and mission type. Flip it to `true` and add `headline` + `narrative` once there is a real story.
- IDs match the site's existing map pins and the review workbook, so rows can be matched one-to-one.
- The 13 pins still waiting on MJB are not in this file. Add them back once confirmed.

## Notes

- About 3.3 MB in total. The page and list appear first; Earth imagery streams in behind them. All asset files are safe to cache long-term.
- Runs in any browser with WebGL (Chrome, Edge, Safari, Firefox, iOS, Android). Without WebGL, the deployment list still works.
- **Flat map:** the fourth view button. Same pins, filters, cards, tour and Reach from HQ, on a flat dot-matrix world map you can drag, scroll-zoom and pinch. Devices that can't run 3D (no WebGL) open straight on the flat map instead of showing an error.
- On slow devices the globe steps its effects down by itself (lower render resolution, then no clouds or radar sweep) rather than stuttering.
- Credits: globe.gl (MIT), topojson-client (ISC), Natural Earth boundaries via world-atlas (ISC), NASA Blue Marble and Black Marble imagery (public domain), Saira Extra Condensed, Public Sans and IBM Plex Mono fonts (SIL Open Font License).
