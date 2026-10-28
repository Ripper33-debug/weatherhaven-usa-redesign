# Weatherhaven USA public-site redesign

This folder is a separate copy of `weatherhaven-special-forces-may` with the public site redesigned. The original folder, the GitHub repo, Vercel and Supabase were not touched. This copy has no git remote on purpose, so nothing here can be pushed by accident.

## Run it

The download carries the code and the new media only. The existing photos (about 390 MB) are copied from your original project by a one-time script, which only reads the original:

```bash
cd ~/Downloads/weatherhaven-usa-redesign     # wherever you unzipped it
bash finish-setup.sh                          # copies public/ media from ~/weatherhaven-special-forces-may, runs npm install
npm run dev                                   # http://localhost:3000
```

If the original lives somewhere else, pass its path: `bash finish-setup.sh ~/path/to/weatherhaven-special-forces-may`.

Without a `.env.local`, the site runs on the built-in content (verified specs, news, deployments). Forms and sign-in won't submit, which is the safe default for a demo. If you want live CMS data, copy `.env.local` over from the original folder, but then the contact form and mission builder would write to the real database and send real notification emails.

To share it, deploy it as a **new** Vercel project (`npx vercel`), not the production one.

## What changed

- **Look:** dark defense-tech theme with Weatherhaven orange as the accent. One typeface (Archivo, with wide headlines), chamfered buttons, riveted "data plate" panels.
- **Homepage:**
  - Film hero: a 17-second seamless loop cut from the best shots of the original film, with one consistent color grade.
  - Verified numbers.
  - A 3D TRECC driven by scrolling: it rides in stowed, an orange scan line sweeps across it and reveals the deployed shelter, and the camera orbits to the finished building. Visitors can switch the shell between green, desert tan and arctic white.
  - The four shelter families.
  - A dot-matrix world map of the 155 documented deployments, with filters.
  - The factory film, a 1981–2026 timeline, the latest news and a contact band.
- **Systems** (`/configurable-solutions`): a catalog filtered by family, mission, environment and transport. All 17 product pages have published specs taken from Weatherhaven literature (ISO containers and Series 1.5 & 2 say "specifications on request" because nothing is published for them).
  - The TRECC page has an interactive 3D model: turn it by dragging or with the turn buttons, switch between stowed and deployed, and change the finish.
  - The MECC page carries the scroll-driven technical drawing of a MECC going from 160 ft² on the truck to 420 ft² on the ground.
- **Moving between pages:** clicking a system in the catalog morphs its photo into the product page's main photo, and other public pages cross-fade (Chrome, Edge and Safari 18+; other browsers simply change page). The SOF portal and admin don't animate.
- **Photos:** every product photo shows a blurred preview while the full image loads, so grids never flash empty boxes. After adding product photos, run `npm run generate:blur` to refresh the previews.
- **Capabilities, contact, events, news, resources, mission builder, privacy, terms and 404:** rebuilt in the same system, with the copy rewritten in plain language.
- **News:** 12 real releases with direct links (Supacat, Battlefield 2027, Land Forces, DVD, MSPO and others), merged with anything in the CMS.
- **Untouched:** the SOF portal and admin keep their original design and behavior.

## How it was checked

- `npm run lint` is clean and all 161 tests pass. `npm run build` succeeds, including every SOF and admin route.
- The SOF portal pages (`/sof-solutions` and `/sof-solutions/request-access`) were screenshotted next to the untouched original at desktop and phone widths, and they are pixel-identical.
- Lighthouse on a local production build:
  - Desktop homepage: 96 performance, 100 accessibility, 96 best practices, 100 SEO.
  - Desktop MECC page: 98 / 100 / 96 / 100.
  - Simulated mid-range phone homepage: 65–70 performance, mostly held back by the Sentry monitoring bundle. The hero film now waits for page load before it downloads.
- At 390 px, no public page scrolls sideways.
- Every internal link, image and external news link returns 200.
- An independent review covered bugs, accessibility, content accuracy and SOF/admin regressions. Its findings were fixed or are listed below.

## The 3D model

- `public/models/trecc-stowed.glb` and `trecc-open.glb` were made from the TRECC CAD exports (about 5 million triangles each) by cutting them to about 4% of the triangles and compressing them. Each is about 3.5 MB. The three finishes are one model recolored in the browser.
- The models only download once a visitor starts scrolling toward them, after the page and hero film have loaded. Until then, and on devices without WebGL, a still image of the same view is shown.
- The caption says "3D model for illustration. Configuration varies by program."
- Code: `src/lib/three/treccStage.ts` (scene, scan reveal, finishes), `src/components/home/v2/HomeTreccScene.tsx` (homepage), `src/components/systems/TreccViewer.tsx` (TRECC page).

## Bringing it into the real repo

The redesign is also provided as `redesign.patch`, a diff against commit `e0f53c3` of the original repo:

```bash
git checkout -b redesign
git apply redesign.patch
```

Then copy the new media from this folder's `public/` into the repo and commit it. The patch can't include these files because they are binary:

- `public/weatherhaven-logo-reverse.png` and `public/weatherhaven-logo-reverse@2x.png`
- `public/og-image.jpg` (the 1200×630 card shown when a link is shared)
- `public/hero/hero-v2-poster.jpg`, `hero-v2-1080.mp4` and `hero-v2-720.mp4` (homepage film)
- `public/hero/built-poster.jpg` and `built-720.mp4` (factory film)
- everything in `public/models/` (the two TRECC models and their still images)

## Things to check before this goes live

1. **Product photos.** RDMSS, Airmax HP and Series 1.5 & 2 have no product photos of their own, so their pages use a representative Weatherhaven photo.
2. **Product status.** Confirm Series 1.5 & 2 and HERCon are still sold.
3. **Country count.** The site says 95+ countries; some Weatherhaven pages say 90+.
4. **Airmax LP PDF.** Confirm the info sheet is cleared for public download.
5. **CMS content.**
   - CMS product rows that still hold the old placeholder specs are upgraded on the fly to the verified content.
   - Running the catalog sync script would store that content in the database for good.
   - The 12 verified news items are built in. Once they are in the CMS, the built-in list can be deleted.
6. **"48 hours" response time.** This promise is carried over from the old site. Make sure the team can meet it.
7. **Legacy redirect.** The old `/hqss` link still redirects to EHMECC, but public sources describe HQSS as RDMSS-based.
8. **3D model accuracy.** Have someone who knows the TRECC look over the 3D model and the scroll sequence. It is built from Weatherhaven's own CAD exports, simplified for the web.
9. **Mission builder.** The camp planner logic was left as it was, and it still puts Endurance in the "Power yard" and labels ATEPS "Camp power and infrastructure". It is shared with the SOF planner, so it needs a deliberate fix.
10. **Shared product data.** Corrected mission types and transport modes in `weatherhaven-product-lines.ts` also feed the SOF planner's recommendations.
