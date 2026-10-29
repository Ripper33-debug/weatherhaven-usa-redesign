// Copies the confirmed deployment list from the deployment globe (public/deployment-globe/data/pins.js,
// the file its pin updater writes) into src/data/confirmed-pins.json, which the rest of the site
// reads (the hero's live readout, the mission builder's places). Run after updating the globe's pins:
//   node scripts/sync-confirmed-pins.mjs
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync(new URL("../public/deployment-globe/data/pins.js", import.meta.url), "utf8");
const pins = JSON.parse(src.slice(src.indexOf("["), src.lastIndexOf("]") + 1));
const out = pins.map((p) => ({
  id: p.id,
  location: p.location,
  program: p.program,
  lat: p.lat,
  lng: p.lng,
  category: p.category,
  theaterCode: p.theaterCode,
}));
writeFileSync(new URL("../src/data/confirmed-pins.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
console.log(`${out.length} confirmed pins written to src/data/confirmed-pins.json`);
