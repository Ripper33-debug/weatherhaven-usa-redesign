import type { CampPlan, CampZoneId, CampZoneLayout } from "@/lib/campPlanner";

const GRID_COLS = 4;
/** Vehicle lane / fire break between schematic cells. */
const CELL_GAP_M = 4;

const METERS_PER_DEG_LAT = 111_320;

const ZONE_STYLES: Record<CampZoneId, { color: string; fillOpacity: number }> = {
  entry: { color: "#4d9fff", fillOpacity: 0.28 },
  command: { color: "#4d9fff", fillOpacity: 0.38 },
  medical: { color: "#10b981", fillOpacity: 0.32 },
  maintenance: { color: "#f59e0b", fillOpacity: 0.32 },
  accommodation: { color: "#94a3b8", fillOpacity: 0.28 },
  sustainment: { color: "#a855f7", fillOpacity: 0.32 },
  logistics: { color: "#3b82f6", fillOpacity: 0.24 },
  power: { color: "#e2e8f0", fillOpacity: 0.22 },
};

/** One schematic cell ≈ one shelter bay (ISO/expandable module + pad). */
const CELL_METERS: Record<CampPlan["forceTier"], number> = {
  small: 12,
  platoon: 15,
  company: 18,
  battalion: 22,
};

export type CampGeoZone = {
  id: CampZoneId;
  label: string;
  bounds: [[number, number], [number, number]];
  color: string;
  fillOpacity: number;
};

function metersPerDegLng(lat: number): number {
  return METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
}

function offsetLat(lat: number, metersNorth: number): number {
  return lat + metersNorth / METERS_PER_DEG_LAT;
}

function offsetLng(lat: number, lng: number, metersEast: number): number {
  return lng + metersEast / metersPerDegLng(lat);
}

export function campZonesToGeo(
  centerLat: number,
  centerLng: number,
  zones: CampZoneLayout[],
  forceTier: CampPlan["forceTier"],
): CampGeoZone[] {
  if (zones.length === 0) return [];

  const cellM = CELL_METERS[forceTier];
  const totalRows = Math.max(...zones.map((z) => z.row + z.rowSpan));
  const gridWidthM = GRID_COLS * cellM + (GRID_COLS - 1) * CELL_GAP_M;
  const gridHeightM = totalRows * cellM + (totalRows - 1) * CELL_GAP_M;

  const originLat = offsetLat(centerLat, gridHeightM / 2);
  const originLng = offsetLng(centerLat, centerLng, -gridWidthM / 2);

  return zones.map((zone) => {
    const westM = zone.col * (cellM + CELL_GAP_M);
    const eastM = westM + zone.colSpan * cellM + (zone.colSpan - 1) * CELL_GAP_M;
    const northM = zone.row * (cellM + CELL_GAP_M);
    const southM = northM + zone.rowSpan * cellM + (zone.rowSpan - 1) * CELL_GAP_M;

    const northLat = offsetLat(originLat, -northM);
    const southLat = offsetLat(originLat, -southM);
    const westLng = offsetLng(centerLat, originLng, westM);
    const eastLng = offsetLng(centerLat, originLng, eastM);

    const style = ZONE_STYLES[zone.id];

    return {
      id: zone.id,
      label: zone.label,
      bounds: [
        [southLat, westLng],
        [northLat, eastLng],
      ],
      color: style.color,
      fillOpacity: style.fillOpacity,
    };
  });
}

/** Leaflet bounds expression covering all camp zones (for fitBounds). */
export function campGeoBounds(
  centerLat: number,
  centerLng: number,
  zones: CampZoneLayout[],
  forceTier: CampPlan["forceTier"],
): [[number, number], [number, number]] | null {
  const geo = campZonesToGeo(centerLat, centerLng, zones, forceTier);
  if (geo.length === 0) return null;

  let south = Infinity;
  let north = -Infinity;
  let west = Infinity;
  let east = -Infinity;

  for (const zone of geo) {
    const [[zSouth, zWest], [zNorth, zEast]] = zone.bounds;
    south = Math.min(south, zSouth);
    north = Math.max(north, zNorth);
    west = Math.min(west, zWest);
    east = Math.max(east, zEast);
  }

  return [
    [south, west],
    [north, east],
  ];
}
