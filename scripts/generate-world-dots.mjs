/**
 * Builds the dot-matrix world map used by the homepage deployment map.
 *
 * Land polygons: Natural Earth via the `world-atlas` package (public domain data).
 * Output: src/data/world-dots.json — projected dot grid + projection parameters,
 * and the projected position of every deployment pin, so the client needs no map
 * tiles, API keys or projection library.
 *
 * Run: node scripts/generate-world-dots.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { geoNaturalEarth1, geoContains } from "d3-geo";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve("world-atlas/land-50m.json"), "utf8"));
const land = feature(topo, topo.objects.land);

const WIDTH = 1000;
const HEIGHT = 508;
const SPACING = 6.2;

const projection = geoNaturalEarth1().fitExtent(
  [
    [8, 8],
    [WIDTH - 8, HEIGHT - 8],
  ],
  { type: "Sphere" },
);

const dots = [];
let row = 0;
for (let y = SPACING / 2; y < HEIGHT; y += SPACING * 0.866, row += 1) {
  const offset = row % 2 === 0 ? 0 : SPACING / 2;
  for (let x = SPACING / 2 + offset; x < WIDTH; x += SPACING) {
    const lonLat = projection.invert([x, y]);
    if (!lonLat || Number.isNaN(lonLat[0])) continue;
    const [lon, lat] = lonLat;
    if (lon < -180 || lon > 180 || lat < -86 || lat > 84) continue;
    // Points outside the projected sphere invert to garbage — require a clean round trip.
    const back = projection(lonLat);
    if (!back || Math.abs(back[0] - x) > 0.5 || Math.abs(back[1] - y) > 0.5) continue;
    if (geoContains(land, lonLat)) dots.push([Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
  }
}

const deployments = JSON.parse(readFileSync(new URL("../src/data/global-deployments.json", import.meta.url), "utf8"));
const pins = {};
for (const d of deployments) {
  const p = projection([d.lng, d.lat]);
  if (p) pins[d.id] = [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10];
}

const out = {
  width: WIDTH,
  height: HEIGHT,
  spacing: SPACING,
  /** Projection: x = tx + k * rawX(λ, φ); y = ty - k * rawY(λ, φ) (d3 naturalEarth1Raw, radians). */
  projection: { k: projection.scale(), tx: projection.translate()[0], ty: projection.translate()[1] },
  /** Flat [x0, y0, x1, y1, ...] for a compact payload. */
  dots: dots.flat(),
  pins,
};

writeFileSync(new URL("../src/data/world-dots.json", import.meta.url), JSON.stringify(out));
console.log(`world-dots: ${dots.length} land dots, ${Object.keys(pins).length} pins`);
