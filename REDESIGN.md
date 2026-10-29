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
  - A live readout along the bottom of the hero: the coldest and hottest places on Weatherhaven's deployment map right now (for example Concordia Station in Antarctica against Doha), with each place's temperature, coordinates, local time and whether the sun is up, plus a running UTC clock (see "Live weather" below). On phones the hero's two buttons give way to it, since the bar fixed along the bottom of the screen carries the same two actions.
  - Verified numbers.
  - A 3D TRECC driven by scrolling: it rides in stowed, an orange scan line sweeps across it and reveals the deployed shelter, and the camera orbits to the finished building. Visitors can switch the shell between green, desert tan and arctic white, and each finish brings its weather: wind and rain, blowing sand or blowing snow, with the ground, light and glow to match and the published rating beside it (TRECC is rated from −40 °F to +120 °F and for 55 mph sustained winds).
  - The four shelter families.
  - A dot-matrix world map of the 155 documented deployments, with filters. The land is lit where it's daylight right now and dimmed where it's night, with a mark where the sun is overhead, redrawn every minute. Selecting a named place shows its local time and its weather this hour.
  - The factory film, a 1981–2026 timeline, the latest news and a contact band.
- **Systems** (`/configurable-solutions`): a catalog filtered by family, mission, environment and transport. All 17 product pages have published specs taken from Weatherhaven literature (ISO containers and Series 1.5 & 2 say "specifications on request" because nothing is published for them).
  - The TRECC page has an interactive 3D model: turn it by dragging or with the turn buttons, switch between stowed and deployed, and change the finish.
  - The MECC page carries the scroll-driven technical drawing of a MECC going from 160 ft² on the truck to 420 ft² on the ground.
  - Every system with published dimensions has a to-scale drawing, packed and deployed, beside a 20-ft ISO container and a 6-ft person. The catalog ends with all of them drawn at one scale.
- **Mission builder** (`/mission-solution-builder`): five plain questions (mission, climate, people, transport, how long it stays up), then the best-matching systems with the published facts behind each match, the next best two, what a camp that size usually adds, and a to-scale drawing. Beside the questions, a 3D camp builds itself as you answer (see "The 3D camp" below). "Send this plan to an expert" fills in the contact form. The answers live in the link, so a plan can be shared. The original detailed form is one click away at `?form=full`, and the SOF portal's links go straight to it. The scoring is in `src/lib/mission-guide.ts`; it doesn't touch the camp planner the SOF portal uses.
- **Deployments** (`/deployments`): eight sourced stories (Beyond EPICA ice-core drilling in Antarctica, Canada's Headquarters Shelter System, the US Army's Containerized Kitchen, TRECC, Canada's COVID-19 mobile health units, the NASA-funded ENDURANCE project, the 109th Airlift Wing, a NATO headquarters), shorter field notes and the deployment map. Each story links to its sources, figures that only Weatherhaven publishes are labelled as such, and photos that show the system rather than that deployment say "Representative photo". The data is in `src/lib/field-stories.ts`.
- **Moving between pages:** clicking a system in the catalog morphs its photo into the product page's main photo, and other public pages cross-fade (Chrome, Edge and Safari 18+; other browsers simply change page). The SOF portal and admin don't animate.
- **Photos:** every product photo shows a blurred preview while the full image loads, so grids never flash empty boxes. After adding product photos, run `npm run generate:blur` to refresh the previews.
- **Capabilities, contact, events, news, resources, privacy, terms and 404:** rebuilt in the same system, with the copy rewritten in plain language.
- **News:** 12 real releases with direct links (Supacat, Battlefield 2027, Land Forces, DVD, MSPO and others), merged with anything in the CMS.
- **Untouched:** the SOF portal and admin keep their original design and behavior. The only SOF edits are two link targets (the planner's "Mission builder" button and the secure menu entry), which now add `?form=full` so they keep opening the detailed form they always opened.

## How it was checked

- `npm run lint` has no errors and all 200 tests pass (including the sun position, the map projection and the weather readout). Tests cover the mission builder's scoring and the 3D camp's layout across all 2,700 answer combinations (no two shelters overlap, the camp is always built around the builder's own best match and pairings). `npm run build` succeeds, including every SOF and admin route.
- The SOF portal (`/sof-solutions`, `/sof-solutions/request-access`, `/sof-solutions/secure`) and `/login` were screenshotted next to the untouched original at desktop and phone widths, and they are pixel-identical.
- Lighthouse on a local production build:
  - Desktop homepage: 97–99 performance, 100 accessibility, 96 best practices, 100 SEO, unchanged by the live data. Desktop TRECC page: 98 / 100 / 96 / 100.
  - Desktop deployments page: 94; desktop mission builder (with the 3D camp): 99.
  - Simulated mid-range phone on slow 4G (scores vary a few points run to run): homepage 68–76 with the live data (it was 67–77 before it and 65–70 on the original site), TRECC page 70–82, catalog 75, deployments 70–73, mission builder 85–87, contact 78, capabilities 88. Layout shift is 0 on every public page.
  - The 4 best-practices points are console errors that only happen locally (the Vercel analytics script and Supabase without keys).
- What made phones faster: the hero headline paints on the first frame, headings no longer reflow when the page script runs, the world map's land dots and the 3D models load only as you scroll toward them, Sentry and the Supabase client load only when needed, and the factory film's still image loads lazily.
- At 390 px, no public page scrolls sideways. Checked in Chrome, Safari (WebKit, desktop and iPhone) and Firefox, including the 3D scene, the 3D viewer and the page transitions.
- Every internal link, image and external news link returns 200.
- Independent reviews covered bugs, accessibility, performance, content accuracy and SOF/admin regressions, and a separate fact-check compared every story, builder reason and drawing dimension with its source. Their findings were fixed or are listed below.

## Live weather (homepage)

- **Source:** MET Norway (the Norwegian Meteorological Institute) location forecasts, which are free for commercial use with credit (CC BY 4.0). The credit is shown under the hero readout and the map. Temperatures are MET's forecast for the current hour.
- **Which places:** every named place on the deployment map within 38° of the equator or 55° and further from it (73 places; country centre points are left out). Places between those bands are never the coldest or hottest. The readout shows the coldest place in the cold band and the hottest in the hot band, and stays hidden unless at least three quarters of each band answered.
- **Load on MET:** each place's forecast is cached for 30 minutes on the server, so the site makes at most one call per place per half hour whatever the traffic. A place whose call fails isn't asked again for two minutes, at most six calls run at once, and every wait is capped, so a slow reply never holds up a page. The map asks for one place's weather only when a visitor selects it (through `/api/site-weather`, which accepts only pins on the map; the CDN keeps each answer for 15 minutes and a failure for one).
- **Honest labels:** the readout says "places on Weatherhaven's deployment map", not that shelters are there today. If a visitor gets a cached page whose reading is more than 75 minutes old, the readout says "Latest reading" with the hour, and gives local times for that hour.
- **Local time and daylight:** time zones come from each place's coordinates (`@photostructure/tz-lookup`, on the server only). Daylight, twilight and night use the sun's position (`src/lib/solar.ts`), the same bands the map shades.
- **Without MET:** if the service can't be reached, the hero simply has no readout and the map's panel says the weather isn't available right now.
- **Code:** `src/lib/field-sites.ts`, `field-weather.ts` (server), `field-readout.ts`, `deployment-pins.ts`, `src/components/home/v2/HeroFieldReadout.tsx`, `DeploymentMapClient.tsx`, `world-dot-path.ts`, `src/app/api/site-weather/route.ts`.
- **3D weather:** `src/lib/three/treccStage.ts` (the `climate` option, used only on the homepage; the TRECC page's viewer is unchanged) reuses the mission builder's weather particles at a smaller scale. While falling weather is on screen the scene draws 30 frames a second; if a device can't keep up, the weather thins out and then stops. With reduced motion the weather is shown but doesn't move.

## The 3D model

- `public/models/trecc-stowed.glb` and `trecc-open.glb` were made from the TRECC CAD exports (about 5 million triangles each) by cutting them to about 4% of the triangles and compressing them. Each is about 3.5 MB. The three finishes are one model recolored in the browser.
- The models only download once a visitor starts scrolling toward them, after the page and hero film have loaded. Until then, and on devices without WebGL, a still image of the same view is shown.
- The caption says "3D model for illustration. Configuration varies by program."
- Code: `src/lib/three/treccStage.ts` (scene, scan reveal, finishes), `src/components/home/v2/HomeTreccScene.tsx` (homepage), `src/components/systems/TreccViewer.tsx` (TRECC page).

## The 3D camp (mission builder)

- **What it does:** the questions sit on the left and a three.js scene fills the right half (on phones it sticks under the header while you answer). Each answer changes the camp:
  - **Mission:** the leading system scans in from the ground with the same orange scan as the homepage TRECC. Expanding containers then open their wings and inflatables puff up. The label reads "Leading match so far" and can change as later answers come in.
  - **Climate:** sky, terrain, light and weather cross-fade: blowing snow and route flags for polar, snow and conifers for cold, rain and trees for temperate, dunes and blowing sand for desert, heavy rain and dense trees for tropical. Shelters take the matching finish (white, green or tan).
  - **People:** more of the leading system, plus the builder's own "a camp this size usually adds" systems (accommodation rows, TRECC sanitation, fitted ISO containers).
  - **Transport:** a short arrival at real scale, with the camera following the vehicle in and then pulling back: a C-130-class airlifter lands and unloads down its ramp, a CH-47-class helicopter sets down a sling load, a truck convoy drives in, containers are stacked, or a snowmobile and sleds (or a utility vehicle and a team on foot) come in. The load is the leading system in the form it travels in: a folded TRECC on its trailer, pallet or sling (`public/models/trecc-stowed-camp.glb`, a light cut of the stowed CAD model), containers in the camp's colour for the expanding containers, ATEPS on its pallet, bags for fabric and inflatable shelters.
  - **Duration:** site works: generators for days, walkways, fuel and lights for months, gravel pads, a fenced perimeter, light masts and water tanks for years.
  - **Results:** the camera makes one slow turn around the finished camp. Each system is labelled; clicking a label or a shelter opens its product page. Drag to turn the camp at any time.
  - **Look inside:** on the results, a button cuts the roof off the best match (with an orange section line) and shows an example fit-out for the mission: desks and screens for a command post, beds for a clinic, a vehicle bay, bunks, lab benches or cots. The caption says it's an example and that layouts are configured per program (`src/lib/three/camp/interiors.ts`).
  - **The why, as you answer:** under the leading system's name, the scene shows the published fact that ties it to the latest answer (for example "Transport: Rides a light tactical trailer or an M1289 JLTV trailer"), using the same text and the same rule as the results.
- **Hand-off to an expert:** "Send this plan to an expert" now adds a link to the exact plan to the message (so the expert opens the same camp in 3D) and shows the visitor a picture of their camp above the contact form. The picture stays in the visitor's browser; only the link is sent. The message field shows a character count, because the server takes up to 500 characters.
- **Honesty about the models:** only the TRECC is a real CAD model (`public/models/trecc-camp.glb`, a 22,000-triangle cut of the CAD export, 280 KB). Every other system is a simplified model drawn to Weatherhaven's published dimensions. Where a size isn't published, it is estimated and says so in the code (`KIND_SIZE` in `src/lib/camp-scene-plan.ts`): MTS and HERCon sizes, RDMSS and MEX-26 heights, and the lengths chosen for Series 4 and Airmax HP. Quantities are illustrative. The caption under the scene says both.
- **The camp matches the results:** the scene is built from the same scoring as the recommendation (`rankPartial` in `src/lib/mission-guide.ts` equals `recommend` once all five answers are in), so the 3D best match is always the results' best match.
- **Performance:** Lighthouse runs Chrome without a graphics chip, so it gets the photo fallback and its mission-builder scores don't include the 3D. On real devices, the scene watches its own frame rate while it animates; if a device runs below 25 frames a second it steps down (lower resolution and half the weather, then no shadows or weather). three.js loads only after the page has loaded and gone idle, and the scene draws frames only while something moves (weather and the final turn run at 30 fps, and nothing draws when the scene is off screen or the tab is hidden). Browsers without hardware graphics (WebGL off, or software rendering such as SwiftShader or Windows' Basic Render Driver) skip the 3D entirely and show a photo of the leading system; the questions and results work the same. Reduced-motion settings show each step finished, without animation.
- **Checked:** every system's model, every climate and every arrival were screenshotted; the flow was clicked through in Chrome and Safari (WebKit) on desktop and iPhone sizes; Firefox's test browser here has no WebGL, so in Firefox only the photo fallback was seen (not the 3D); layout has no sideways scroll at 390 px; labels and shelters link to the right product pages; an independent code review's findings were fixed.
- **Code:** `src/lib/camp-scene-plan.ts` (what goes where, tested), `src/lib/three/camp/` (`campStage.ts` runs the scene; `shelters.ts`, `vehicles.ts`, `environment.ts`, `arrivals.ts`, `siteworks.ts` build it), `src/components/mission/CampScene.tsx` (labels, captions, fallback).
- **More real models:** any system with a CAD export (MECC, EHMECC, RDMSS, Series 4…) can replace its simplified model the way the TRECC did, at about an hour each.

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
- everything in `public/models/` (the TRECC models, including `trecc-camp.glb` and `trecc-stowed-camp.glb` for the 3D camp, and their still images)

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
15. **3D camp estimates.** The 3D camp draws MTS and HERCon at estimated sizes, RDMSS and MEX-26 at estimated heights, and Series 4 and Airmax HP at chosen lengths, because those aren't published. Someone who knows the products should look the models over; CAD files for any of them would replace the estimates.
16. **MET Norway contact.** MET asks every site that uses its data to identify itself with a contact. `USER_AGENT` in `src/lib/field-weather.ts` names weatherhavenusa.com; add a contact email there before launch.
17. **Two misplaced pins.** On the deployment map's source data, "Bogota, Colombia" sits about 600 km from Bogotá and "Loro, Colombia" sits on Bogotá's coordinates. They stay on the map but get no local time or weather until the source is fixed.
