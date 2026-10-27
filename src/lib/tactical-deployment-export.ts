import {
  tacticalDeploymentTypeLabel,
  type TacticalDeploymentLocation,
} from "@/lib/tactical-deployment-locations";
import { decodeMarkerNotes, markerDisplayLabel } from "@/lib/tactical-marker-meta";
import { getProductBySlug } from "@/lib/products";

export type TacticalMarkerRow = {
  id: string;
  label: string | null;
  notes: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
};

export type DeploymentExportRow = {
  name: string;
  latitude: number;
  longitude: number;
  type: string;
  commandRegion: string;
  notes: string;
  addedBy: string;
  dateAdded: string;
};

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildDeploymentExportRows(
  deployments: TacticalDeploymentLocation[],
  userMarkers: TacticalMarkerRow[],
): DeploymentExportRow[] {
  const presetRows: DeploymentExportRow[] = deployments.map((d) => ({
    name: d.name,
    latitude: d.lat,
    longitude: d.lng,
    type: tacticalDeploymentTypeLabel(d.type),
    commandRegion: d.command,
    notes: "Weatherhaven deployed",
    addedBy: "Weatherhaven",
    dateAdded: "",
  }));

  const userRows: DeploymentExportRow[] = userMarkers.map((marker, index) => {
    const { systemSlug, text } = decodeMarkerNotes(marker.notes);
    const product = systemSlug ? getProductBySlug(systemSlug) : undefined;
    const name = markerDisplayLabel(index, marker.label, product?.name ?? null);
    return {
      name,
      latitude: marker.latitude,
      longitude: marker.longitude,
      type: product?.tag ?? "User point",
      commandRegion: "",
      notes: text || (product ? product.name : ""),
      addedBy: "User",
      dateAdded: marker.created_at,
    };
  });

  return [...presetRows, ...userRows];
}

export function deploymentLocationsToCsv(rows: DeploymentExportRow[]): string {
  const header = "Name,Latitude,Longitude,Type,Command Region,Notes,Added By,Date Added";
  const lines = rows.map((row) =>
    [
      csvEscape(row.name),
      row.latitude.toFixed(6),
      row.longitude.toFixed(6),
      csvEscape(row.type),
      csvEscape(row.commandRegion),
      csvEscape(row.notes),
      csvEscape(row.addedBy),
      csvEscape(row.dateAdded),
    ].join(","),
  );
  return [header, ...lines].join("\n");
}

export function deploymentExportFilename(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `weatherhaven-deployments-${stamp}.csv`;
}
