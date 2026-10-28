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
  - Every system with published dimensions has a to-scale drawing, packed and deployed, beside a 20-ft ISO container and a 6-ft person. The catalog ends with all of them drawn at one scale.
- **Mission builder** (`/mission-solution-builder`): five plain questions (mission, climate, people, transport, how long it stays up), then the best-matching systems with the published facts behind each match, the next best two, what a camp that size usually adds, and a to-scale drawing. "Send this plan to an expert" fills in the contact form. The answers live in the link, so a plan can be shared. The original detailed form is one click away at `?form=full`, and the SOF portal's links go straight to it. The scoring is in `src/lib/mission-guide.ts`; it doesn't touch the camp planner the SOF portal uses.
- **Deployments** (`/deployments`): eight sourced stories (Beyond EPICA ice-core drilling in Antarctica, Canada's Headquarters Shelter System, the US Army's Containerized Kitchen, TRECC, Canada's COVID-19 mobile health units, the NASA-funded ENDURANCE project, the 109th Airlift Wing, a NATO headquarters), shorter field notes and the deployment map. Each story links to its sources, figures that only Weatherhaven publishes are labelled as such, and photos that show the system rather than that deployment say "Representative photo". The data is in `src/lib/field-stories.ts`.
- **Moving between pages:** clicking a system in the catalog morphs its photo into the product page's main photo, and other public pages cross-fade (Chrome, Edge and Safari 18+; other browsers simply change page). The SOF portal and admin don't animate.
- **Photos:** every product photo shows a blurred preview while the full image loads, so grids never flash empty boxes. After adding product photos, run `npm run generate:blur` to refresh the previews.
- **Capabilities, contact, events, news, resources, privacy, terms and 404:** rebuilt in the same system, with the copy rewritten in plain language.
- **News:** 12 real releases with direct links (Supacat, Battlefield 2027, Land Forces, DVD, MSPO and others), merged with anything in the CMS.
- **Untouched:** the SOF portal and admin keep their original design and behavior. The only SOF edits are two link targets (the planner's "Mission builder" button and the secure menu entry), which now add `?form=full` so they keep opening the detailed form they always opened.

## How it was checked

- `npm run lint` has no errors and all 169 tests pass (8 new ones cover the mission builder's scoring across all 2,700 answer combinations). `npm run build` succeeds, including every SOF and admin route.
- The SOF portal (`/sof-solutions`, `/sof-solutions/request-access`, `/sof-solutions/secure`) and `/login` were screenshotted next to the untouched original at desktop and phone widths, and they are pixel-identical.
- Lighthouse on a local production build:
  - Desktop homepage: 98 performance, 100 accessibility, 96 best practices, 100 SEO. Desktop TRECC page: 98 / 100 / 96 / 100.
  - Simulated mid-range phone on slow 4G: homepage 69–77 (it was 65–70), TRECC page 70–82, contact 78, capabilities 88. Layout shift is 0 on every public page.
  - The 4 best-practices points are console errors that only happen locally (the Vercel analytics script and Supabase without keys).
- What made phones faster: the hero headline paints on the first frame, headings no longer reflow when the page script runs, the world map's land dots and the 3D models load only as you scroll toward them, Sentry and the Supabase client load only when needed, and the factory film's still image loads lazily.
- At 390 px, no public page scrolls sideways. Checked in Chrome, Safari (WebKit, desktop and iPhone) and Firefox, including the 3D scene, the 3D viewer and the page transitions.
- Every internal link, image and external news link returns 200.
- Independent reviews covered bugs, accessibility, performance, content accuracy and SOF/admin regressions, and a separate fact-check compared every story, builder reason and drawing dimension with its source. Their findings were fixed or are listed below.

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
9. **Detailed mission form.** The camp planner behind the detailed form (`?form=full`) and its results page was left as it was, and it still puts Endurance in the "Power yard" and labels ATEPS "Camp power and infrastructure". It is shared with the SOF planner, so it needs a deliberate fix.
10. **Shared product data.** Corrected mission types and transport modes in `weatherhaven-product-lines.ts` also feed the SOF planner's recommendations.
11. **TRECC numbers.** Weatherhaven's 2026 capabilities statement lists TRECC-T as 181 × 97 in deployed with 86 ft², and TRECC-M as 171 × 72 in with 121.6 ft². The areas look swapped against the dimensions, and the UK site gives different TRECC-T figures again. The spec table repeats the capabilities statement; the size drawing uses the dimensions and shows a worked-out footprint instead of the area. Confirm the right numbers before launch.
12. **Company-sourced claims.** Some facts appear only in Weatherhaven's own material: the TRECC program details (DEVCOM agreements, Aberdeen testing, TRL 9, 43 field trials), the NATO headquarters, the 1994 Natick delivery, the EHMECC setup time ("under 10 minutes" on one page, "less than 20 minutes" on the next) and the 95+ vs 90+ countries. They're labelled on the page; having the contract or test references to hand would let buyers check them.
13. **Fonts for the SOF portal and admin.** Geist and Playfair (about 180 KB) are preloaded on every page, including the public site that doesn't use them. Loading them only in the SOF and admin sections would speed up phones further, but it changes how those sections load, so it was left alone.
14. **Supabase on public pages.** Public pages no longer load the Supabase client for anonymous visitors, except that Next.js prefetches the SOF portal link in the menu, and the SOF navigation loads it. That happens after the page has loaded, so it doesn't slow the first screen.
