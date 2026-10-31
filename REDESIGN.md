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

- **Look:** dark theme with Weatherhaven orange as the accent. One typeface (Archivo, with wide headlines), chamfered primary buttons (echoing the logo's cut corner), flat panels with one hairline.
- **Homepage:**
  - Photo hero: a TRECC on its trailer behind a JLTV (Weatherhaven's own field photo). On phones the photo is a band above the copy.
  - One line along the bottom of the hero: the coldest and hottest places on the deployment map in MET Norway's latest forecast (for example −57 °F at Concordia Station, Antarctica; +89 °F at Manaus, Brazil). See "Live weather" below.
  - A 3D TRECC driven by scrolling: it rides in stowed, an orange scan line sweeps across it and reveals the deployed shelter, and the camera orbits to the finished building. Visitors can switch the shell between green, desert tan and arctic white, and each finish brings its weather: wind and rain, blowing sand or blowing snow, with the ground, light and glow to match and the published rating beside it (TRECC is rated from −40 °F to +120 °F and for 55 mph sustained winds). "See it full size" puts the deployed TRECC, at real size and in that finish, wherever the visitor is standing (see "See it full size" below).
  - The four shelter families.
  - Weatherhaven's deployment globe as a full-width band, opening on its flat map: the 142 confirmed deployments, Reach from HQ arcs out of Burnaby, satellite, night and tactical globe views, a tour of the standout deployments with their stories, and a card for every pin with a "Talk to a Weatherhaven expert" button. It plays its highlights by itself until someone uses it (see "Deployment globe" below).
  - A photo band of EHMECCs set up indoors with who builds and supports the systems, the latest news, and a closing contact band over a full-width field photo (EHMECCs deployed for NATO). The 1981–2026 timeline moved to the Capabilities page as a grid.
- **Systems** (`/configurable-solutions`): a catalog filtered by family, mission, environment and transport. All 17 product pages have published specs taken from Weatherhaven literature (ISO containers and Series 1.5 & 2 say "specifications on request" because nothing is published for them).
  - The TRECC page has an interactive 3D model: turn it by dragging or with the turn buttons, switch between stowed and deployed, and change the finish. "See it full size" opens the phone's AR view with a real-size TRECC; on a computer it shows a QR code that opens it on a phone.
  - The MECC page carries the scroll-driven technical drawing of a MECC going from 160 ft² on the truck to 420 ft² on the ground.
  - Every system with published dimensions has a to-scale drawing, packed and deployed, beside a 20-ft ISO container and a 6-ft person. The catalog ends with all of them drawn at one scale.
- **Mission builder** (`/mission-solution-builder`): five plain questions (mission, climate, people, transport, how long it stays up), then the best-matching systems with the published facts behind each match, the next best two, what a camp that size usually adds, and a to-scale drawing. Beside the questions, a 3D camp builds itself as you answer (see "The 3D camp" below). The climate question also takes a real place, searched or picked on a map, and the camp is then built in that place's weather and light this hour (see "Build it where you're going" below). "Send this plan to an expert" fills in the contact form. The answers live in the link, so a plan can be shared. The original detailed form is one click away at `?form=full`, and the SOF portal's links go straight to it. The scoring is in `src/lib/mission-guide.ts`; it doesn't touch the camp planner the SOF portal uses.
- **Deployments** (`/deployments`): eight sourced stories (Beyond EPICA ice-core drilling in Antarctica, Canada's Headquarters Shelter System, the US Army's Containerized Kitchen, TRECC, Canada's COVID-19 mobile health units, the NASA-funded ENDURANCE project, the 109th Airlift Wing, a NATO headquarters), shorter field notes and the deployment map. HQSS leads, three stories get photos, four are short briefs. Each lists its third-party sources by title; photos are captioned with what they actually show. The data is in `src/lib/field-stories.ts`.
- **Moving between pages:** clicking a system in the catalog morphs its photo into the product page's main photo, and other public pages cross-fade (Chrome, Edge and Safari 18+; other browsers simply change page). The SOF portal and admin don't animate.
- **Photos:** every product photo shows a blurred preview while the full image loads, so grids never flash empty boxes. After adding product photos, run `npm run generate:blur` to refresh the previews.
- **Capabilities, contact, events, news, resources, privacy, terms and 404:** rebuilt in the same system, with the copy rewritten in plain language.
- **News:** 12 real releases with direct links (Supacat, Battlefield 2027, Land Forces, DVD, MSPO and others), merged with anything in the CMS.
- **Untouched:** the SOF portal and admin keep their original design and behavior. The only SOF edits are two link targets (the planner's "Mission builder" button and the secure menu entry), which now add `?form=full` so they keep opening the detailed form they always opened.

## How it was checked

- `npm run lint` has no errors and all 217 tests pass (including the sun position, the map projection and the weather readout). Tests cover the mission builder's scoring and the 3D camp's layout across all 2,700 answer combinations (no two shelters overlap, the camp is always built around the builder's own best match and pairings). `npm run build` succeeds, including every SOF and admin route.
- The SOF portal (`/sof-solutions`, `/sof-solutions/request-access`, `/sof-solutions/secure`) and `/login` were screenshotted next to the untouched original at desktop and phone widths, and they are pixel-identical.
- Lighthouse on a local production build:
  - Desktop homepage: 97–99 performance, 100 accessibility, 96 best practices, 100 SEO, unchanged by the live data. Desktop TRECC page: 98 / 100 / 96 / 100.
  - Desktop deployments page: 94; desktop mission builder (with the 3D camp): 99.
  - Simulated mid-range phone on slow 4G (scores vary a few points run to run): homepage 68–76 with the live data (it was 67–77 before it and 65–70 on the original site), TRECC page 70–82, catalog 75, deployments 70–73, mission builder 85–87, contact 78, capabilities 88. Layout shift is 0 on every public page.
  - After adding AR and the place picker: homepage 98 desktop and 72 phone, TRECC page 95 and 72, mission builder 99 and 84, with accessibility 100 and layout shift 0 on all three. The AR models and the map only download when a visitor asks for them.
  - The 4 best-practices points are console errors that only happen locally (the Vercel analytics script and Supabase without keys).
- What made phones faster: the hero headline paints on the first frame, headings no longer reflow when the page script runs, the deployment globe and the 3D models load only as you scroll toward them, Sentry and the Supabase client load only when needed, and the factory film's still image loads lazily.
- At 390 px (and 360 and 375 px for the new controls), no public page scrolls sideways. Checked in Chrome, Safari (WebKit, desktop and iPhone) and Firefox, including the 3D scene, the 3D viewer and the page transitions.
- Every internal link, image and external news link returns 200.
- Independent reviews covered bugs, accessibility, performance, content accuracy and SOF/admin regressions, and a separate fact-check compared every story, builder reason and drawing dimension with its source. Their findings were fixed or are listed below.

## Live weather (homepage)

- **Source:** MET Norway (the Norwegian Meteorological Institute) location forecasts, which are free for commercial use with credit (CC BY 4.0). The credit is shown under the hero readout and the map. Temperatures are MET's forecast for the current hour.
- **Which places:** every named place among the 142 confirmed deployments within 38° of the equator or 55° and further from it (69 places; country centre points are left out). Places between those bands are never the coldest or hottest. The readout shows the coldest place in the cold band and the hottest in the hot band, and stays hidden unless at least three quarters of each band answered.
- **Load on MET:** each place's forecast is cached for 30 minutes on the server, so the site makes at most one call per place per half hour whatever the traffic. A place whose call fails isn't asked again for two minutes, at most six calls run at once, and every wait is capped, so a slow reply never holds up a page. The mission builder asks for one place's weather only when a visitor picks it (through `/api/site-weather`, which accepts only confirmed pins, and `/api/place-weather` for map points; the CDN keeps each answer for 15 minutes and a failure for one).
- **Honest labels:** the line says both places are Weatherhaven deployment sites (not that shelters stand there today) and that the figures are MET's latest forecast. It has no clock, coordinates or local times; those read as decoration.
- **Without MET:** if the service can't be reached, the hero simply has no readout.
- **Code:** `src/lib/field-sites.ts`, `field-weather.ts` (server), `field-readout.ts`, `deployment-pins.ts`, `src/components/home/v2/HeroFieldReadout.tsx`, `src/app/api/site-weather/route.ts`.
- **3D weather:** `src/lib/three/treccStage.ts` (the `climate` option, used only on the homepage; the TRECC page's viewer is unchanged) reuses the mission builder's weather particles at a smaller scale. While falling weather is on screen the scene draws 30 frames a second; if a device can't keep up, the weather thins out and then stops. With reduced motion the weather is shown but doesn't move.

## Deployment globe

- **What it is:** the deployment globe package (`weatherhaven-globe-web 4`), copied into `public/deployment-globe/` and shown in an iframe by `src/components/deployments/DeploymentGlobe.tsx`. It's self-contained (globe.gl, fonts and Earth imagery are in the folder; nothing loads from a CDN), and its `README.md` and pin updater are kept in `docs/deployment-globe/`. `assets/textures.js` is left out, since it's only used when the page is opened from disk.
- **Where it appears:** the homepage (flat map, with a still of the map until the live one loads), `/deployments` (the globe, under the stories) and `/deployments/map` (full screen under the site header, with its deployment list, filters and timeline; the phone action bar is hidden there because the globe's own controls sit at the bottom).
- **Settings changed for the site** (`public/deployment-globe/globe.config.js`): "Talk to a Weatherhaven expert" goes to `/contact?utm_source=globe` on whichever address serves the site, and "Open full map" goes to `/deployments/map`. The globe's page itself isn't indexed (`X-Robots-Tag: noindex`), since it's shown inside the site's pages.
- **One list of deployments:** the globe's 142 confirmed pins are the site's list too. `scripts/sync-confirmed-pins.mjs` copies them into `src/data/confirmed-pins.json`, which the hero's live readout and the mission builder's places read (with the globe's corrected coordinates for Bogotá, Munich, Hamburg and Trinidad). A test fails if the two lists drift apart. To update pins: edit the globe's `pins.csv`, run its pin updater, replace `public/deployment-globe/data/pins.js`, then run the sync script. The admin and SOF portal still read the full imported list.
- **Stories on the globe** come from the globe package (38 pins have one). They aren't labelled with sources the way the `/deployments` stories are; worth a check before launch.
- **Analytics:** the globe's events (pin opened, contact clicked, tour started) are forwarded to Google Analytics if the site has it.

## Design pass (after the review)

- Muted text is brighter (`--color-muted` #93a1b5 → #a6b2c3), and the smallest text on the public pages went up (12–12.5 px captions to 13 px, 12.8 px labels to 13.6 px).
- Product photos share one light grade (slightly less saturation, a touch more contrast) so bright snow shots and grey overcast ones sit together in grids. It's a CSS filter on public pages only; the files are unchanged.
- The homepage lost the timeline (now on Capabilities, as a grid instead of a sideways scroll), and its closing band is now a full-width field photo instead of an empty right half.
- The TRECC page opens on the 3D model, with the photos after it (field shots first).
- The 3D TRECC (homepage and TRECC page) now shows its still instead of 3D when the browser draws WebGL in software, as the mission builder's camp already did. That keeps old or GPU-less machines responsive, and it's what Lighthouse sees.

## Defence-company polish

- **TRECC callouts.** With the 3D TRECC deployed, three numbered markers sit on the model (actuators, shell and climate rating, transport), and a legend under it gives the published fact for each. Hovering a legend item lights its marker. Markers hide when their face turns away or while it's stowed. The points are in `CALLOUTS` in `TreccViewer.tsx`; `projectOpen` in `treccStage.ts` places them.
- **For government buyers (`/government`).** Legal name, CAGE and UEI with copy buttons, registered NAICS codes, current vehicles and recent awards (the Letterkenny BPAs, DLA spares by NSN, the 109th Airlift Wing award, allied programs) with a source on each, and what Weatherhaven provides for a procurement. The data and its sources are in `src/lib/procurement.ts`. It's linked from the hero, the Capabilities menu, the footer, Contact and Resources.
- **Menus.** Systems is a mega menu with a photo per family and every system with its key figure. Capabilities lists the capability areas, who Weatherhaven serves (each linked to the deployment story that shows it) and a government-buyers panel. Both scroll on short laptop screens. The phone menu adds Capabilities and Government buyers.
- **Demo deployment.** Without Supabase settings, the menu doesn't ask the server for a sign-in role and the footer hides "Operator sign-in" (both failed with 500s on the demo).

## Taking out the AI look

An independent design review of every public page listed what made the site read as generated. What changed:

- **Real photography only.** The homepage film and the factory film were generated video (a TRECC relit onto a moor at sunset, sandstorms, a misty forest), and the HQSS "cutaway" photo (`/products/hqss.jpg`, also `ehmecc/gallery/02-EHMECC-and-Command-Post.jpg`) is a generated image. The public site now uses Weatherhaven field photos instead (hero: TRECC and JLTV; factory band: EHMECCs set up indoors; expandable-containers cover: a deployed EHMECC). The two cutaways are excluded in code (`EXCLUDED_PRODUCT_IMAGES` in `product-content.ts`); the files are still in the repo. The SOF portal and login still use the generated films, since they were left untouched.
- **Homepage film (later round):** the hero plays a 25-second loop cut from those brand films (`public/hero/film-1080.mp4`, `film-720.mp4`, still `film-poster.jpg`), made from Weatherhaven's own product photography. Only exterior and hardware shots of the real TRECC are used (fog, snow, sandstorm, dusk, night, airfield; fan and chassis close-ups); the interiors, the desert camp and the MECC unfolding animation are left out. The hero labels it "Illustrative film made from Weatherhaven product photography". Leadership should sign off on using it; real footage would replace it.
- **Type.** Small labels (spec names, breadcrumbs, dates, places) are back in the body face, sentence case. Monospace is kept only for real codes: CAGE, UEI, NSN, contract and part numbers. The HUD corner brackets, rivets and chamfered panels are gone; the chamfer stays on the primary button only.
- **Copy.** No headings end in a period, no slogan pairs ("Ships in a container. Stands up in minutes.", "160 ft² on the truck. 420 ft² on the ground."), no "From X to Y" lines, no em dashes. Company claims are stated plainly instead of "Weatherhaven reports…"; story sources list third-party documents by title, not Weatherhaven's own sites. Lines that explained the interface ("Drag to turn it…", "Spin the globe…", "open in a new tab") are cut, and caveats are one short line each.
- **Layout.** The homepage "by the numbers" plate, the zero-padded 01–06 lifecycle grid, the hover zoom on photos and the arrow icons on system rows are gone. CAGE/UEI now appear on the government page and in the footer's legal line, instead of six places per page. Deployments has one lead story, three photo stories and four short briefs instead of eight identical blocks; Capabilities drops the bullets that restated each paragraph and hand-picks related systems.
- **Product pages.** The orange full name shows only when it spells out an acronym, empty placeholder sections and irrelevant cross-sells are gone, each fact is stated once, and the copy-pasted contact band at the bottom of every product is replaced by one product-specific button.
- **Consistency.** One figure per fact: HQSS at C$168M (taxes included, from the PSPC release), "24 VDC", MECC "nearly triples" its floor, and the map line says the 142 pins are the sites that can be shown publicly within 95+ countries.
- **Left as is:** the deployment globe (its own package, with its own fonts and instrument readouts) and the 3D TRECC (cut down from Weatherhaven's CAD, so its fabric panels look soft; a cleaner model would need a fresh export).

## Proof and buying (ideas from the best defence and hardware sites)

- **Track record (`/deployments/record`)**, after Rocket Lab's launch list and CAMSS's past-performance table: contracts on public record (DLA spares by NSN, the Letterkenny BPAs and order, the 109th Airlift Wing award, Canada's Mobile Health Units and HQSS), each with its award number and source, then all 142 confirmed sites with search and region and type filters. It shows 25 sites, then "Show all"; on phones each row stacks. Data in `src/lib/track-record.ts`. Linked from Deployments, Government buyers and the footer.
- **How to buy, on every product page**, after CAMSS: contract vehicles and past buys that involve that product (MECC: the Letterkenny BPAs and DLA spares; Polarhaven and Polar Chief: the 109th award; RDMSS: HQSS), otherwise a plain line about ordering through the US office; CAGE with a link to the government page; a printable spec sheet (`/configurable-solutions/<system>/spec-sheet`, white, letter size, marked noindex); and "Email the specs to your contracting office" (no recipient filled in). Data in `src/lib/product-buying.ts`.
- **Programs and deployments, on product pages**, after Saildrone: the deployment stories that used that system, with up to three numbers each and a link to the full account. Only systems with a story show the section. Data in `src/lib/product-proof.ts`.
- **Who we serve (`/who-we-serve`)**, after Palantir's "Discover by service": one page each for the US Army, Air Force and Air National Guard, special operations (pointing to the SOF portal), NATO, UN and allied forces, the Canadian Armed Forces, emergency management and medical, polar and scientific research, and remote industrial camps. Each shows what's on record, the systems used and one "Request a briefing" button. Pages are only as long as the record allows. The Capabilities menu's "Who we serve" column links to them. Data in `src/lib/buyer-segments.ts`.
- **Request a briefing**, after Epirus: the main button everywhere (menu, footer, phone bar, homepage close) now opens the contact form set to "Capability Briefing". The form also takes "Demo Request" and "Factory Tour"; those three ask for rank or title, service or agency, unit, base or location, preferred dates (and visitors for a tour), sent inside the message. The contact page heading follows the request type.

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

## See it full size (AR)

- **What it does:** on the TRECC page and the homepage's 3D TRECC, "See it full size" (just "Full size" on narrow phones) places a deployed TRECC at its real size wherever the visitor is standing, in the finish they picked, so they can walk around it.
- **iPhone and iPad:** Apple's AR Quick Look opens the USDZ, with pinch-scaling turned off so it stays true to size. Chrome, Firefox, Edge, the Google app and DuckDuckGo on iOS hand it to Quick Look too. In-app browsers (Instagram, LinkedIn and the like) can't, so they get a short note asking the visitor to open the page in Safari.
- **Android:** Google's Scene Viewer opens the GLB, with resizing off. Phones without AR get Scene Viewer's 3D view instead. Phones without Scene Viewer come back to the page (marked `#no-ar`) and are told AR isn't available on that phone.
- **On a computer:** a QR code that opens the same page on a phone with `?ar=<finish>`. The phone then offers "Place it" straight away (AR viewers only open from a tap).
- **The models:** `public/models/ar/trecc-deployed-{green,tan,arctic}.glb` (about 4.8 MB each) and `.usdz` (about 4.0 MB each), cut from the deployed TRECC CAD model to about 105,000 triangles. They aren't compressed, because Scene Viewer and Quick Look don't read compressed models. They download only when a visitor opens AR. `scripts/ar/` makes them again (instructions in its README). The GLBs pass the Khronos glTF validator.
- **Server setting:** iPhones only open the USDZ if it's served as `model/vnd.usdz+zip`. `next.config.ts` sets that; if a CDN sits in front of the site, check it keeps the type.
- **Checked:** in Chrome with phone and computer settings: the QR code decodes to the right link, a phone arriving from it gets "Place it", the Android no-AR note and the iOS in-app note appear, and the USDZ is served with the right type. There was no real phone here, so the AR views themselves weren't opened: try it on an iPhone and an Android phone before launch.
- **Code:** `src/components/three/TreccArButton.tsx`, used by `TreccViewer.tsx` and `HomeTreccScene.tsx`.

## Before the pitch (last round)

- **Tested and proven (`/tested-and-proven`):** published temperature ratings on one scale (RDMSS, BMECC, Polar Chief, TRECC, Airmax LP), wind and snow ratings, setup crew and time for 14 systems, the TRECC test record, field record with third-party sources, and quality certification. Every value is a reference into `product-content.ts`; `src/lib/published-facts.test.ts` fails if one stops matching.
- **Compare (`/configurable-solutions/compare`):** the four shelter types side by side on packed size, deployed size, setup, transport, ratings, service life and roles, then any two of the 17 systems. Product pages link to it with their own system picked ("Compare with another system").
- **Light sections:** a `.v2-light` theme (paper #eef1f4, ink text, all text at 4.5:1 or better) on product specifications, the government identifiers and NAICS, the track record's contracts table and the homepage systems band. The colour utilities read CSS variables, so the theme only remaps them; values elsewhere, including the SOF portal and admin, are unchanged.
- **Phone speed:** Geist Mono and Playfair no longer preload on every page, hero and gallery photos load at high priority, the menu's catalog data comes from the server instead of the page's JavaScript (about 24 KB gzipped less per page), and an unused compare provider that fetched the catalog on every product page is gone. Clean mobile runs: homepage 86–90, MECC 84–90, TRECC 89. SOF and admin pages render pixel-identical.
- **Checked:** a crawl of all 60 public pages and every internal link and anchor found no broken links, images, console errors or sideways scrolling on phones. Public pages now fetch the CSRF token only when a form is sent, so a room full of people on one office network doesn't trip the API rate limit (10 requests a minute per IP).

## System models (Barry's Blender builds)

- **The list:** `src/lib/system-models.ts` says which systems have a real model, where the files are, how each folds up (hinge nodes, expansions, parts hidden while packed), which materials take the finish colour, and the AR page's copy. Files live in `public/models/<slug>/`; `public/models/README.md` has the steps for adding one, and `node scripts/models/add-model.mjs <slug> <folder>` checks and copies a new delivery.
- **MECC (first one in):** built by Barry Castelli in Blender from the MECC brochure (1087, 2021) and weatherhaven.com photos; 0.7 MB deployed, Draco. Not engineering CAD; `public/models/mecc/README.md` lists what's estimated.
  - **Product page:** the MECC page opens on the 3D model (`SystemModelViewer.tsx`, `src/lib/three/systemStage.ts`): packed and deployed with the real fold-down (side walls swing down on their hinges, then the fabric opens out), turn buttons, green, desert tan and arctic white, a still image first and as the fallback. The photos move to "Photos" below, as on the TRECC page.
  - **AR:** `/ar/mecc`, the same page as the TRECC's (`src/lib/ar-page.ts` swaps in the MECC's wording); linked from the MECC page.
  - **3D camp:** wherever the mission builder places a MECC it uses this model at its true size (the layout uses its real footprint, guy lines included), arriving as the packed container and unfolding on its real hinges; the interior shows under "Look inside". If the model can't load, the simplified one is used.
- **To check:** the model deploys to 253 in wide (Barry's brochure source); the site's spec table says 243 in for the 8-ft model. Confirm which is right before launch.
- **Full line (second delivery):** Barry's models of the EHMECC, ATEPS, HERCon, Series 4, RDMSS, MTS, MEX-26, Polarhaven, Polar Chief and Endurance, built in Blender from weatherhaven.com pages and photos (not CAD), each deployed and packed, plus an example fit-out per system (MECC command post, EHMECC operating room, HERCon housing, ATEPS aid station, Series 4 kitchen and dining, MTS dining hall, RDMSS command post, MEX-26 vehicle bay, Polarhaven base camp, Polar Chief kitchen and mess, Endurance sleeping quarters, TRECC command post).
  - **Product pages:** every modelled system opens on its 3D model. ATEPS folds on its hinges like the MECC; the rest swap between their packed and deployed files. Finishes only on the green military models (ATEPS is modelled grey, the polar shelters in their own colours).
  - **Show inside:** loads the fit-out on first click (`inside` in the registry: one node from the fitted file, or the separate fit-out file for the MECC, EHMECC and TRECC), cuts the shell with a clipping plane and looks down into it, with screens and lights on. The TRECC viewer has it too. `src/lib/three/gltfImageTextures.ts` loads the fit-outs' embedded textures through `<img>`, because the CSP refuses fetch() of blob: URLs.
  - **AR:** `/ar/<slug>` for all eleven, with facts from the published specs only.
  - **Furnished AR:** every AR page (the TRECC's /ar too) has "Inside: Empty / <fit-out>". It swaps model-viewer's file for the furnished one (`furnished` in the registry, or the `-deployed-fitted` file); Quick Look's USDZ is made from whatever is loaded when "View in your space" is tapped, and Scene Viewer gets the file. The choice is kept in the address (`?inside=1`) and the QR code, and "See it full size" in the product viewer opens furnished while Show inside is on. The MECC, EHMECC and TRECC furnished files are merges of the shell and its fit-out (`scripts/models/merge-fitout.mjs`); `trecc-open.glb` itself is unchanged, the copy is `trecc-open-fitted.glb`. The CSP's connect-src now allows `blob:`, which model-viewer needs for embedded textures. Generated USDZ sizes: 3–27 MB, TRECC 43 MB (39 MB empty, the size already confirmed on iPhone).
  - **3D camp:** every system with a model is placed at true size; soft and polar shelters rise out of their packed load. "Look inside" shows the model's own fit-out only when it suits the mission (`fitoutForMission`); otherwise the simplified interior for that mission.
- **To check with Barry:** RDMSS modelled 20 × 30 ft (published modules are 23.8 ft wide); Polar Chief about 6 m across (published 14 ft); MTS, RDMSS and MEX-26 packed loads are the same pallet; MECC README says the door faces +Z but the file faces −Z; the TRECC fit-out runs about 10 cm past the shell at each end, under the floor.

## Fixes from the full-site review (Oct 31)

A fresh reviewer went through the whole site at desktop and phone widths; these came out of it.
- **Sign-in on copies without the member database:** `src/middleware.ts` rewrites the sign-in, SOF portal, admin and invite routes to `/sign-in-unavailable` when there are no Supabase keys (as on the preview), instead of a 500. With keys, nothing changes.
- **Homepage hydration error (#418):** the weather line was baked into the cached homepage and hydrated with weather from another time. It now loads after the page from `/api/field-extremes` (`HeroFieldReadoutLive`).
- **No 3D graphics** (common on locked-down government laptops): the homepage TRECC section becomes a short 4-step photo strip instead of a pinned scroll, and the mission builder shows a real photo before and after answering.
- **Contact:** a phone field (required when Phone is the chosen method), 2,000-character messages, and the system as a visible field.
- **Compare:** the two-system picker comes first, the choice is in the link (`?a=&b=`), and a figure only one system publishes shows "On request" for the other.
- **Navigation:** "How to buy" (the Government buyers page) is in the top bar; the phone menu has "Who we serve". News drops out of the desktop bar below 1480 px wide so it never overflows.
- **Systems:** the RDMSS card shows its 3D model; cards using another shelter's photo say so; Medical filter tags corrected (MECC and RDMSS in, Endurance out); "Airmax" naming in the family line; `/ar/trecc` redirects to `/ar`; phone numbers never break across lines.
- **Still open, for leadership:** the TRECC-T/M floor areas look swapped in Weatherhaven's data (86 ft² vs 181 × 97 in); the hero film reads as AI to a fresh viewer; the public SOF page is still the original template; named units and exercises need clearance; a named US contact for the contact page.

## Full-size AR page (/ar)

- **What it is:** a standalone page that places the deployed TRECC at real size (`ar-scale="fixed"`, on the floor) through Google <model-viewer> 3.5.0, using WebXR, Quick Look on iPhone or Scene Viewer on Android. Desktop visitors get a QR code of the page to open on a phone; phones get a "View in your space" button. Linked from the TRECC page ("See it at full size in AR").
- **Copied from the Canadian site** (github.com/Ripper33-debug/can-weatherhaven), where it's confirmed working on iPhone. Files copied byte for byte: `public/assets/models/trecc-open.glb` (Draco, 1.5 MB), `public/assets/ar/model-viewer.min.js` and `qrcode.js`, `public/assets/draco-ar/` (the newer decoder; the old r128 one makes model-viewer throw "Unexpected geometry type") and the page fonts in `public/assets/fonts/`. The page is `src/ar-template.html` with its placeholders filled in by `src/app/ar/route.ts`; the only edits are the title, heading and facts (to match this site's TRECC figures) and a header that doesn't wrap on phones.
- **Must stay true:** `self.ModelViewerElement.dracoDecoderLocation` is set before the model-viewer script loads; the site's CSP has `'wasm-unsafe-eval'` in script-src and `blob:` in worker-src (otherwise the decoder fails with a WebAssembly CompileError); `.glb` is served as `model/gltf-binary` and `.wasm` as `application/wasm` (set in `next.config.ts` as well as by Vercel).
- **Two AR routes for now:** the TRECC viewer's older "See it full size" button (USDZ and GLB files in `public/models/ar/`) is still there. Once /ar is confirmed on a phone, one of them should go.

## Build it where you're going (mission builder)

- **What it does:** the climate question starts with "Build it where you're going". Visitors search the places Weatherhaven has deployed (the 86 named places among the confirmed deployments) or click anywhere on a map. The climate answer is filled in from the place, the place shows "This hour" with its temperature, sky, wind and whether it's light, and the 3D camp is built in that weather and light: snow, rain, storm or blowing sand when that's what's happening there, the sun where it is in that place's sky (the camp looks north), and night with moonlight when it's dark there.
- **The climate answer:** documented places use a checked climate (for example Kabul and Bern as cold winters, Lima and Quito as temperate). Points clicked on the map get a guess from latitude and known dry regions. The page says which climate it chose, and choosing another climate by hand keeps the place and its weather.
- **Weather source and load:** MET Norway again, with the same credit. Named places go through `/api/site-weather`. Clicked points go through `/api/place-weather`, which only accepts points on a quarter-degree grid (about 28 km, so nearby clicks share one cached answer), allows 20 lookups a minute per visitor and caps calls to MET per server instance. Answers are cached for 15 minutes on the CDN and 30 minutes on the server.
- **Sharing and hand-off:** the place goes into the plan's link (`site=` for a named place, `at=lat,lng` for a map point). The results say, for example, "in Alert, Nunavut (polar or extreme cold)", and "Send this plan to an expert" adds a "Site:" line with the place and its coordinates.
- **Keyboard and screen readers:** the search is a standard combobox (arrow keys, Enter, Escape, with a spoken note when nothing matches). The map is an extra for pointers and stays out of the tab order.
- **Checked:** search, map clicks near a documented place and far from any, the climate guess and a manual change, night in Riyadh, twilight at Thule, the results summary and the hand-off message, at desktop and at 360–390 px phone widths, in Chrome and Safari (WebKit).
- **Code:** `src/lib/live-site.ts` (places, climate, wording, links, tested), `src/lib/three/camp/live-preset.ts` (weather and light in the camp, tested), `src/lib/solar.ts` (`sunPosition`), `src/components/mission/PlacePicker.tsx`, `MissionGuide.tsx`, `src/app/api/place-weather/route.ts`.

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
- everything in `public/models/` (the TRECC models, including `trecc-camp.glb` and `trecc-stowed-camp.glb` for the 3D camp, and their still images, and the six AR models in `public/models/ar/`)
- everything in `public/deployment-globe/` (the deployment globe)

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
12. **Company-sourced claims.** Some facts appear only in Weatherhaven's own material: the TRECC program details (DEVCOM agreements, Aberdeen testing, TRL 9, 43 field trials), the NATO headquarters, the 1994 Natick delivery, the EHMECC setup time ("under 10 minutes" on one page, "less than 20 minutes" on the next) and the 95+ vs 90+ countries. They're now stated plainly, as the company's own claims on its own site, so confirm each one before launch.
13. **Fonts for the SOF portal and admin.** Geist and Playfair (about 180 KB) are preloaded on every page, including the public site that doesn't use them. Loading them only in the SOF and admin sections would speed up phones further, but it changes how those sections load, so it was left alone.
14. **Supabase on public pages.** Public pages no longer load the Supabase client for anonymous visitors, except that Next.js prefetches the SOF portal link in the menu, and the SOF navigation loads it. That happens after the page has loaded, so it doesn't slow the first screen.
15. **3D camp estimates.** The 3D camp draws MTS and HERCon at estimated sizes, RDMSS and MEX-26 at estimated heights, and Series 4 and Airmax HP at chosen lengths, because those aren't published. Someone who knows the products should look the models over; CAD files for any of them would replace the estimates.
16. **MET Norway contact.** MET asks every site that uses its data to identify itself with a contact. `USER_AGENT` in `src/lib/field-weather.ts` names weatherhavenusa.com; add a contact email there before launch. The mission builder's place lookups use the same identification.
17. **Misplaced pins.** Fixed by using the globe's confirmed list: Bogotá, Munich, Hamburg and Trinidad now have their right coordinates, and the 13 pins still awaiting confirmation (Loro among them) are off the public site until they're confirmed.
18. **AR on real phones.** Open "See it full size" on an iPhone and an Android phone before launch (see "See it full size" above); it couldn't be tried on a physical phone here.
19. **AR model height.** The AR model keeps the CAD export's size: 4.51 m long, 2.39 m wide and 2.35 m tall. Weatherhaven publishes TRECC-T deployed as 181 × 97 × 82 in (4.60 × 2.46 × 2.08 m). Length and width agree within about 10 cm; the extra height probably comes from parts the published figure leaves out (feet or roof fittings). Someone who knows the TRECC should confirm which is right, since visitors will stand next to it.
20. **Procurement details.** The UEI, NAICS list and contract record on `/government` come from public SAM.gov and USAspending data (sources in `src/lib/procurement.ts`). Have Weatherhaven's contracts team confirm them, and say which vehicles they want shown, before launch.
21. **Generated media in the media library.** The hero films in `public/hero/` and the HQSS cutaway came from the original site and are generated, not filmed. Replace them with real footage if a film hero is wanted; the public pages no longer use them.
22. **Hero customer line.** The hero says "Customers include the US Army, the Air National Guard, NATO and the Canadian Armed Forces", based on the Letterkenny BPAs, the 109th Airlift Wing award, the NATO headquarters and HQSS. Confirm the team is comfortable naming them.
23. **Factory tours and briefings.** The site now offers capability briefings, demos and factory tours. Confirm Weatherhaven runs them, and where a tour would take place (the plants are in Burnaby and Brockville), before launch.
24. **Data the new sections can't show yet.** Product NSNs and the contract vehicles each product is on, the year and system for each of the 142 sites, and named customer quotes. Each section shows only what's on public record and fills in as Weatherhaven supplies more.
