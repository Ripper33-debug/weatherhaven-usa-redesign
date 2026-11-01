/**
 * Builds the 1200×630 share cards (the picture a link shows in LinkedIn, Teams, Slack, iMessage…)
 * for the public pages: a photo, the wordmark, the page's name and one line, in the same layout as
 * the homepage card (public/og-image.jpg). Writes public/og/<key>.jpg and src/lib/share-cards.json,
 * which pageMeta() reads by path.
 *
 *   node scripts/og/build-share-cards.mjs
 *
 * Re-run after changing a page name or photo below. Pages without a card fall back to their own
 * photo or the homepage card. Systems whose only photo shows another system (Airmax HP,
 * Series 1.5 & 2) get no card on purpose.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Playwright is not a project dependency; use the copy installed on the machine (npm i -g playwright).
const { chromium } = createRequire(import.meta.url)("playwright");

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const pub = (p) => pathToFileURL(join(root, "public", p)).href;

/** key: output file name; path: the page; photo: under public/; pos: object-position. */
const CARDS = [
  // Systems
  { key: "systems", path: "/configurable-solutions", photo: "/products/ehmecc/gallery/08-EHMECC.jpg", pos: "50% 60%", title: "Shelter systems", line: "Expandable, soft-wall, inflatable and polar shelters" },
  { key: "compare", path: "/configurable-solutions/compare", photo: "/products/mecc/gallery/16-MECCs_x5_deployed_01.jpg", title: "Compare shelter systems", line: "Floor area, packed size, setup and ratings side by side" },
  { key: "system-trecc", path: "/configurable-solutions/trecc", photo: "/products/trecc/gallery/08-TRECC-and-Car.jpg", pos: "50% 62%", title: "TRECC", line: "Tactical Redeployable Expanding Container Capability" },
  { key: "system-mecc", path: "/configurable-solutions/mecc", photo: "/products/mecc/gallery/20-MIL-MECC-7.jpg", pos: "50% 60%", title: "MECC", line: "Mobile Expandable Container Configuration" },
  { key: "system-ehmecc", path: "/configurable-solutions/ehmecc", photo: "/products/ehmecc/gallery/08-EHMECC.jpg", pos: "50% 60%", title: "EHMECC", line: "Extended Height Mobile Expandable Container Configuration" },
  { key: "system-bmecc", path: "/configurable-solutions/bmecc", photo: "/products/bmecc/gallery/01-BMECC-2.jpg", pos: "50% 62%", title: "BMECC", line: "10-ft expandable container" },
  { key: "system-ateps", path: "/configurable-solutions/ateps", photo: "/products/ateps/gallery/01-ATEPS-2.jpg", pos: "50% 55%", title: "ATEPS", line: "Air-Transportable Expandable Pallet Shelter" },
  { key: "system-hercon", path: "/configurable-solutions/hercon", photo: "/products/hercon/gallery/01-BAC-Ablution-HERCon-Deployed-(8).jpg", pos: "50% 55%", title: "HERCon", line: "Hardwall Expandable Redeployable Container" },
  { key: "system-iso", path: "/configurable-solutions/non-expandable-iso-containers", photo: "/products/non-expandable-iso-containers/gallery/04-Non-Expandable-Container-Morgue-Outside.jpg", pos: "50% 60%", title: "ISO containers", line: "Fitted ISO modules for fixed roles" },
  { key: "system-rdmss", path: "/configurable-solutions/rdmss", photo: "/models/rdmss/rdmss-poster-deployed.jpg", title: "RDMSS", line: "Rapidly Deployed Modular Shelter System" },
  { key: "system-series-4", path: "/configurable-solutions/series-4", photo: "/products/series-4/gallery/02-com-S4-PrimerCamp.PlacerDome150.jpg", pos: "50% 55%", title: "Series 4", line: "Tensioned fabric shelter" },
  { key: "system-mts", path: "/configurable-solutions/mts", photo: "/products/mts/gallery/14-MIL-MTS2Exterior.jpg", pos: "50% 60%", title: "MTS", line: "Modular Tentage System" },
  { key: "system-mex-26", path: "/configurable-solutions/mex-26", photo: "/products/mex-26/gallery/01-MIL-MEX&TEMS2.jpg", pos: "50% 55%", title: "MEX-26", line: "Maintenance shelter, extended height, 26 ft wide" },
  { key: "system-airbeam-lp", path: "/configurable-solutions/airbeam-lp", photo: "/products/airbeam-lp/gallery/08-Airbeam-Low-Pressure-9.jpg", pos: "50% 55%", title: "Airmax LP", line: "Low-pressure airbeam shelter" },
  { key: "system-polarhaven", path: "/configurable-solutions/polarhaven", photo: "/products/polarhaven.jpg", pos: "50% 55%", title: "Polarhaven", line: "Polar base-camp shelter" },
  { key: "system-polar-chief", path: "/configurable-solutions/polar-chief", photo: "/products/polar-chief/gallery/01-com-PolarChief149.jpg", pos: "50% 60%", title: "Polar Chief", line: "Octagonal polar shelter" },
  { key: "system-endurance", path: "/configurable-solutions/endurance", photo: "/products/endurance.jpg", pos: "50% 60%", title: "Endurance", line: "Polar expedition shelter" },

  // Stories
  { key: "stories", path: "/stories", photo: "/products/trecc/gallery/06-TRECC-3.jpg", pos: "50% 55%", title: "Program stories", line: "Three Weatherhaven programs told in depth" },
  { key: "story-trecc-us-army", path: "/stories/trecc-us-army", photo: "/products/trecc/gallery/08-TRECC-and-Car.jpg", pos: "50% 62%", title: "TRECC, developed with the US Army", line: "Program story" },
  { key: "story-canada-hqss", path: "/stories/canada-hqss", photo: "/models/rdmss/rdmss-poster-deployed.jpg", title: "1,435 headquarters shelters for the Canadian Armed Forces", line: "Program story" },
  { key: "story-beyond-epica", path: "/stories/beyond-epica", photo: "/products/series-4/gallery/12-S4-Truss-Little-Dome-EPICA-1.jpeg", pos: "50% 60%", title: "Drilling for million-year-old ice in Antarctica", line: "Program story" },

  // Company and buyers
  { key: "about", path: "/about", photo: "/products/polar-chief/gallery/01-com-PolarChief149.jpg", pos: "50% 60%", title: "About Weatherhaven", line: "Deployable shelters, camps and field hospitals since 1981" },
  { key: "government", path: "/government", photo: "/products/mecc/gallery/16-MECCs_x5_deployed_01.jpg", title: "For government buyers", line: "CAGE code, UEI, NAICS codes and contract vehicles" },
  { key: "who-we-serve", path: "/who-we-serve", photo: "/products/trecc/gallery/06-TRECC-3.jpg", pos: "50% 55%", title: "Who we serve", line: "Armed forces, allies, emergency services and polar science" },
  { key: "segment-us-army", path: "/who-we-serve/us-army", photo: "/products/trecc/gallery/08-TRECC-and-Car.jpg", pos: "50% 62%", title: "US Army programs", line: "Who we serve" },
  { key: "segment-air-force", path: "/who-we-serve/air-force", photo: "/products/arctic-package/gallery/07-03_com-Polar-Chief-McMurdo164.jpg", pos: "50% 88%", title: "Air Force and Air National Guard", line: "Who we serve" },
  { key: "segment-special-operations", path: "/who-we-serve/special-operations", photo: "/products/trecc/gallery/06-TRECC-3.jpg", pos: "50% 55%", title: "Special operations", line: "Who we serve" },
  { key: "segment-nato-allies", path: "/who-we-serve/nato-allies", photo: "/products/ehmecc/gallery/13-NATO_EHMECCs_deployed.jpg", title: "NATO, UN and allied forces", line: "Who we serve" },
  { key: "segment-canada", path: "/who-we-serve/canada", photo: "/products/mex-26.jpg", pos: "50% 55%", title: "Canadian Armed Forces", line: "Who we serve" },
  { key: "segment-emergency-medical", path: "/who-we-serve/emergency-medical", photo: "/products/airbeam-lp/gallery/09-Airbeam-Low-Pressure-10.jpg", pos: "50% 60%", title: "Emergency management and medical", line: "Who we serve" },
  { key: "segment-polar-research", path: "/who-we-serve/polar-research", photo: "/products/series-4/gallery/12-S4-Truss-Little-Dome-EPICA-1.jpeg", pos: "50% 60%", title: "Polar and scientific research", line: "Who we serve" },
  { key: "segment-industrial-camps", path: "/who-we-serve/industrial-camps", photo: "/products/series-4/gallery/02-com-S4-PrimerCamp.PlacerDome150.jpg", pos: "50% 55%", title: "Remote industrial and workforce camps", line: "Who we serve" },

  // Record and tools
  { key: "deployments", path: "/deployments", photo: "/products/series-4/gallery/12-S4-Truss-Little-Dome-EPICA-1.jpeg", pos: "50% 60%", title: "Where Weatherhaven has deployed", line: "Confirmed sites on every continent" },
  { key: "deployments-map", path: "/deployments/map", photo: "/deployment-globe/assets/embed-poster-map.jpg", title: "Deployment map", line: "Confirmed Weatherhaven sites on every continent" },
  { key: "track-record", path: "/deployments/record", photo: "/products/ehmecc/gallery/14-NATO_EHMECCs.jpg", pos: "50% 60%", title: "Track record", line: "Programs, deliveries and fielded systems" },
  { key: "tested", path: "/tested-and-proven", photo: "/products/polarhaven.jpg", pos: "50% 55%", title: "Tested and proven", line: "Wind, snow, setup times and certification" },
  { key: "capabilities", path: "/capabilities", photo: "/products/series-4/gallery/01-com-S4-PlacerDome151.jpg", pos: "50% 55%", title: "Capabilities", line: "Command posts, field hospitals, maintenance and camps" },
  { key: "mission-builder", path: "/mission-solution-builder", photo: "/products/series-4/gallery/02-com-S4-PrimerCamp.PlacerDome150.jpg", pos: "50% 55%", title: "Mission builder", line: "Plan a camp: systems, power, logistics and a printable plan" },
  { key: "contact", path: "/contact", photo: "/products/airbeam-lp/gallery/13-Airbeam-Low-Pressure-14.jpg", pos: "50% 60%", title: "Talk to Weatherhaven", line: "Request a briefing, an engineer call or CAD drawings" },
  { key: "news", path: "/news", photo: "/products/ehmecc/gallery/14-NATO_EHMECCs.jpg", pos: "50% 60%", title: "News", line: "Programs, partnerships and events" },
  { key: "events", path: "/events", photo: "/products/airbeam-lp/gallery/22-Airbeam-Low-Pressure-23.jpg", pos: "50% 45%", title: "Events and briefings", line: "Where to see Weatherhaven systems next" },
  { key: "resources", path: "/resources", photo: "/products/ateps/gallery/02-ATEPS-3.jpg", pos: "50% 55%", title: "Resources", line: "Spec sheets, brochures and guides" },
  { key: "sof", path: "/sof-solutions", photo: "/products/trecc/gallery/09-Trecc-Woods.jpg", pos: "50% 55%", title: "Special operations", line: "Shelters for SOF teams, and secure portal access" },
];

const page = (c) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: Archivo; src: url(${pathToFileURL(join(root, "src/app/fonts/archivo-var.woff2")).href}) format("woff2"); font-weight: 400 700; font-stretch: 100% 118%; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; overflow: hidden; background: #0a0f17; font-family: Archivo, sans-serif; color: #eef2f6; }
.photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: ${c.pos ?? "50% 50%"}; filter: saturate(0.92) contrast(1.04); }
.scrim { position: absolute; inset: 0; background:
  linear-gradient(to top, rgb(10 15 23 / 0.94) 0%, rgb(10 15 23 / 0.7) 32%, rgb(10 15 23 / 0.18) 62%, rgb(10 15 23 / 0.35) 100%),
  linear-gradient(to right, rgb(10 15 23 / 0.45) 0%, rgb(10 15 23 / 0) 60%); }
.logo { position: absolute; left: 64px; top: 60px; width: 420px; }
.text { position: absolute; left: 64px; right: 120px; bottom: 74px; }
h1 { font-weight: 640; font-variation-settings: "wdth" 118; font-size: ${c.title.length > 34 ? 60 : 78}px; line-height: 1.02; letter-spacing: -0.02em; text-wrap: balance; }
p { margin-top: 22px; font-size: 26px; font-weight: 420; color: rgb(238 242 246 / 0.86); }
.rule { position: absolute; left: 0; right: 0; bottom: 0; height: 8px; background: #f18522; }
</style></head><body>
<img class="photo" src="${pub(c.photo)}">
<div class="scrim"></div>
<img class="logo" src="${pub("/weatherhaven-logo-reverse@2x.png")}">
<div class="text"><h1>${c.title.replace(/&/g, "&amp;")}</h1><p>${c.line.replace(/&/g, "&amp;")}</p></div>
<div class="rule"></div>
</body></html>`;

const outDir = join(root, "public", "og");
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const manifest = {};
for (const c of CARDS) {
  // Loaded from a file so the page may read the photos and font from disk.
  const html = join(tmpdir(), `share-card-${c.key}.html`);
  writeFileSync(html, page(c));
  await tab.goto(pathToFileURL(html).href, { waitUntil: "load" });
  await tab.evaluate(() => document.fonts.ready);
  const broken = await tab.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.src));
  if (broken.length) throw new Error(`${c.key}: image did not load: ${broken.join(", ")}`);
  await tab.screenshot({ path: join(outDir, `${c.key}.jpg`), type: "jpeg", quality: 82 });
  manifest[c.path] = `/og/${c.key}.jpg`;
}
await browser.close();
writeFileSync(join(root, "src", "lib", "share-cards.json"), `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`${CARDS.length} share cards written to public/og/`);
