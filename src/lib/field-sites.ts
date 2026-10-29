/**
 * Places on Weatherhaven's deployment map (src/data/global-deployments.json) that can be the
 * coldest or hottest of them, for the live "weather right now" readout on the homepage hero.
 *
 * Every named place (not country centre points) in the cold band (55° and further from the
 * equator) and the hot band (within 38° of it) is checked, so "coldest" and "hottest" hold across
 * the whole map: places between the bands are never the extremes. Names are the map's, with
 * spelling fixed and stations named as their operators do. Time zones come from the coordinates,
 * the same way the deployment map gets them.
 */
import tzlookup from "@photostructure/tz-lookup";
import deployments from "@/data/global-deployments.json";
import { cleanLabel, isPrecisePin } from "@/lib/deployment-pins";

export type FieldSite = {
  /** Pin id on the deployment map. */
  id: string;
  name: string;
  /** IANA time zone. */
  tz: string;
  lat: number;
  lng: number;
  band: "cold" | "hot";
};

const NAME_FIXES: Record<string, string> = {
  "Base Concordia, Antarctica": "Concordia Station, Antarctica",
  "Troll, Antarctica": "Troll Station, Antarctica",
  "Svaldbard, Norway": "Svalbard, Norway",
  "Atquasuk, Alaska": "Atqasuk, Alaska",
  "Brasilla, Brazil": "Brasília, Brazil",
  Narsarsuaq: "Narsarsuaq, Greenland",
  Reykjavík: "Reykjavík, Iceland",
  "Wekweeti, North West Territories": "Wekweètì, Northwest Territories",
  "Tuktoyaktuk, North West Territories": "Tuktoyaktuk, Northwest Territories",
};

type Pin = { id: string; label: string; title: string; lat: number; lng: number };

export const FIELD_SITES: FieldSite[] = (deployments as Pin[]).flatMap((d) => {
  if (!isPrecisePin(d)) return [];
  const band = Math.abs(d.lat) >= 55 ? "cold" : Math.abs(d.lat) <= 38 ? "hot" : null;
  if (!band) return [];
  const label = cleanLabel(d.label, d.lat);
  return [{ id: d.id, name: NAME_FIXES[label] ?? label, tz: tzlookup(d.lat, d.lng), lat: d.lat, lng: d.lng, band }];
});
