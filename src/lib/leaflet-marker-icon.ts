import L from "leaflet";
import type { DeploymentPinKind } from "@/lib/deployment-pin-style";
import type { TacticalDeploymentType } from "@/lib/tactical-deployment-locations";

function markerHtml(kind: DeploymentPinKind = "military", active = false) {
  const pulseClass = active
    ? `wh-marker-pulse wh-marker-pulse--${kind} wh-marker-pulse-active`
    : `wh-marker-pulse wh-marker-pulse--${kind}`;
  const coreClass = active
    ? `wh-marker-core wh-marker-core--${kind} wh-marker-core-active`
    : `wh-marker-core wh-marker-core--${kind}`;
  return `<div class="${pulseClass}"><div class="${coreClass}"></div></div>`;
}

/** Shared Leaflet marker icon for deployment maps (avoids pulling tactical map UI into marketing chunks). */
export function pulsingMarkerIcon(
  active = false,
  kind: DeploymentPinKind = "military",
  dimmed = false,
) {
  return L.divIcon({
    className: `wh-tactical-marker-wrap${dimmed ? " wh-marker-dimmed" : ""}`,
    html: markerHtml(kind, active),
    iconSize: active ? [28, 28] : [20, 20],
    iconAnchor: active ? [14, 14] : [10, 10],
  });
}

const TACTICAL_KIND_CLASS: Record<TacticalDeploymentType, string> = {
  military: "tactical-military",
  scientific: "tactical-scientific",
  medical: "tactical-medical",
  humanitarian: "tactical-humanitarian",
};

function tacticalMarkerHtml(type: TacticalDeploymentType) {
  const kind = TACTICAL_KIND_CLASS[type];
  return `<div class="wh-marker-pulse wh-marker-pulse--${kind}"><div class="wh-marker-core wh-marker-core--${kind}"></div></div>`;
}

/** Color-coded markers for preset tactical deployment locations. */
export function tacticalDeploymentMarkerIcon(type: TacticalDeploymentType) {
  return L.divIcon({
    className: "wh-tactical-marker-wrap",
    html: tacticalMarkerHtml(type),
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

/** Default Leaflet pin for user-placed markers (Next.js-safe paths). */
export function defaultLeafletMarkerIcon() {
  return L.icon({
    iconUrl: "/marker-icon.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

export function ensureLeafletDefaultIcon() {
  if (typeof window === "undefined") return;
  const icon = defaultLeafletMarkerIcon();
  L.Marker.prototype.options.icon = icon;
}
