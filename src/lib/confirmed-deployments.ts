/**
 * The deployments the public site shows: the confirmed list behind the deployment globe
 * (public/deployment-globe/data/pins.js, copied into src/data/confirmed-pins.json by
 * scripts/sync-confirmed-pins.mjs), with its corrected coordinates, matched to the site's own pin
 * records by ID for their labels and titles.
 *
 * The admin and the SOF portal keep reading the full imported list (global-deployments.ts).
 */
import confirmed from "@/data/confirmed-pins.json";
import { GLOBAL_DEPLOYMENTS, type GlobalDeployment } from "@/lib/global-deployments";

type ConfirmedPin = { id: string; location: string; program: string; lat: number; lng: number; category: string; theaterCode: string };

const byId = new Map(GLOBAL_DEPLOYMENTS.map((d) => [d.id, d]));

export const CONFIRMED_DEPLOYMENTS: GlobalDeployment[] = (confirmed as ConfirmedPin[]).flatMap((c) => {
  const d = byId.get(c.id);
  return d ? [{ ...d, lat: c.lat, lng: c.lng }] : [];
});
