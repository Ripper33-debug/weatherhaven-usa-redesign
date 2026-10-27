/** Default Weatherhaven deployment pins on the SOF tactical map. */

export type TacticalDeploymentType = "military" | "scientific" | "medical" | "humanitarian";

export type TacticalCommandRegion =
  | "ALL"
  | "NORTHCOM"
  | "SOUTHCOM"
  | "EUCOM"
  | "CENTCOM"
  | "AFRICOM"
  | "INDOPACOM"
  | "POLAR";

export type TacticalDeploymentLocation = {
  name: string;
  lat: number;
  lng: number;
  type: TacticalDeploymentType;
  command: Exclude<TacticalCommandRegion, "ALL">;
};

export const TACTICAL_COMMAND_FILTERS: TacticalCommandRegion[] = [
  "ALL",
  "NORTHCOM",
  "SOUTHCOM",
  "EUCOM",
  "CENTCOM",
  "AFRICOM",
  "INDOPACOM",
  "POLAR",
];

export const TACTICAL_DEPLOYMENT_LEGEND: {
  type: TacticalDeploymentType;
  label: string;
  color: string;
}[] = [
  { type: "military", label: "Military", color: "#c8a96e" },
  { type: "scientific", label: "Scientific", color: "#4d9fff" },
  { type: "medical", label: "Medical", color: "#4ade80" },
  { type: "humanitarian", label: "Humanitarian", color: "#fb923c" },
];

export const TACTICAL_DEPLOYMENT_LOCATIONS: TacticalDeploymentLocation[] = [
  { name: "Fort Liberty, USA", lat: 35.1396, lng: -79.006, type: "military", command: "NORTHCOM" },
  { name: "Vancouver, Canada", lat: 49.2827, lng: -123.1207, type: "military", command: "NORTHCOM" },
  { name: "Ottawa, Canada", lat: 45.4215, lng: -75.6972, type: "military", command: "NORTHCOM" },
  { name: "Bogota, Colombia", lat: 4.711, lng: -74.0721, type: "military", command: "SOUTHCOM" },
  { name: "Lima, Peru", lat: -12.0464, lng: -77.0428, type: "humanitarian", command: "SOUTHCOM" },
  { name: "Brasilia, Brazil", lat: -15.7975, lng: -47.8919, type: "military", command: "SOUTHCOM" },
  { name: "Ramstein, Germany", lat: 49.4369, lng: 7.6003, type: "military", command: "EUCOM" },
  { name: "London, UK", lat: 51.5074, lng: -0.1278, type: "military", command: "EUCOM" },
  { name: "Oslo, Norway", lat: 59.9139, lng: 10.7522, type: "military", command: "EUCOM" },
  { name: "Warsaw, Poland", lat: 52.2297, lng: 21.0122, type: "military", command: "EUCOM" },
  { name: "Doha, Qatar", lat: 25.2854, lng: 51.531, type: "military", command: "CENTCOM" },
  { name: "Kuwait City, Kuwait", lat: 29.3759, lng: 47.9774, type: "military", command: "CENTCOM" },
  { name: "Kabul, Afghanistan", lat: 34.5553, lng: 69.2075, type: "military", command: "CENTCOM" },
  { name: "Baghdad, Iraq", lat: 33.3152, lng: 44.3661, type: "military", command: "CENTCOM" },
  { name: "Djibouti", lat: 11.8251, lng: 42.5903, type: "military", command: "AFRICOM" },
  { name: "Nairobi, Kenya", lat: -1.2921, lng: 36.8219, type: "humanitarian", command: "AFRICOM" },
  { name: "Dakar, Senegal", lat: 14.7167, lng: -17.4677, type: "military", command: "AFRICOM" },
  { name: "Cape Town, South Africa", lat: -33.9249, lng: 18.4241, type: "military", command: "AFRICOM" },
  { name: "Tokyo, Japan", lat: 35.6762, lng: 139.6503, type: "military", command: "INDOPACOM" },
  { name: "Seoul, South Korea", lat: 37.5665, lng: 126.978, type: "military", command: "INDOPACOM" },
  { name: "Darwin, Australia", lat: -12.4634, lng: 130.8456, type: "military", command: "INDOPACOM" },
  { name: "Manila, Philippines", lat: 14.5995, lng: 120.9842, type: "military", command: "INDOPACOM" },
  { name: "Antarctica Research Station", lat: -90.0, lng: 0.0, type: "scientific", command: "POLAR" },
  { name: "Alert, Canada (Arctic)", lat: 82.5018, lng: -62.3481, type: "scientific", command: "POLAR" },
  { name: "Resolute, Canada", lat: 74.6973, lng: -94.8297, type: "scientific", command: "POLAR" },
  { name: "Port-au-Prince, Haiti", lat: 18.5944, lng: -72.3074, type: "medical", command: "SOUTHCOM" },
  { name: "Kathmandu, Nepal", lat: 27.7172, lng: 85.324, type: "humanitarian", command: "INDOPACOM" },
  { name: "Mogadishu, Somalia", lat: 2.0469, lng: 45.3182, type: "humanitarian", command: "AFRICOM" },
];

export function tacticalDeploymentsForCommand(
  command: TacticalCommandRegion,
): TacticalDeploymentLocation[] {
  if (command === "ALL") return TACTICAL_DEPLOYMENT_LOCATIONS;
  return TACTICAL_DEPLOYMENT_LOCATIONS.filter((d) => d.command === command);
}

export function tacticalDeploymentTypeLabel(type: TacticalDeploymentType): string {
  return TACTICAL_DEPLOYMENT_LEGEND.find((l) => l.type === type)?.label ?? type;
}

export function tacticalDeploymentTypeColor(type: TacticalDeploymentType): string {
  return TACTICAL_DEPLOYMENT_LEGEND.find((l) => l.type === type)?.color ?? "#c8a96e";
}
