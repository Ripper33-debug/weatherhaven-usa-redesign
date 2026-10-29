import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import confirmed from "@/data/confirmed-pins.json";
import { CONFIRMED_DEPLOYMENTS } from "@/lib/confirmed-deployments";
import { FIELD_SITES } from "@/lib/field-sites";

describe("confirmed deployments", () => {
  it("match the deployment globe's own list (run scripts/sync-confirmed-pins.mjs after updating it)", () => {
    const src = readFileSync(join(process.cwd(), "public/deployment-globe/data/pins.js"), "utf8");
    const globe = JSON.parse(src.slice(src.indexOf("["), src.lastIndexOf("]") + 1)) as { id: string; lat: number; lng: number }[];
    expect(confirmed.map((p) => [p.id, p.lat, p.lng])).toEqual(globe.map((p) => [p.id, p.lat, p.lng]));
  });

  it("are all on the site, with the globe's corrected coordinates", () => {
    expect(CONFIRMED_DEPLOYMENTS.length).toBe(confirmed.length);
    const at = (id: string) => CONFIRMED_DEPLOYMENTS.find((d) => d.id === id)!;
    expect(at("gemany-munich-gemany").lat).toBeCloseTo(48.14, 1);
    expect(at("gemany-hamburg-gemany").lat).toBeCloseTo(53.55, 1);
    expect(at("colombia-bogota-colombia").lat).toBeCloseTo(4.71, 1);
  });

  it("feed the hero readout only confirmed places", () => {
    const ids = new Set(confirmed.map((p) => p.id));
    expect(FIELD_SITES.length).toBeGreaterThan(40);
    for (const s of FIELD_SITES) expect(ids.has(s.id), s.id).toBe(true);
  });
});
