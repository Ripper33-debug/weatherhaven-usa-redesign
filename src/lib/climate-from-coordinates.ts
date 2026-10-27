export type MissionEnvironment =
  | "arctic"
  | "desert"
  | "tropical"
  | "maritime"
  | "highalt"
  | "temperate";

export type ClimateInference = {
  environment: MissionEnvironment;
  label: string;
  detail: string;
};

const ENV_LABELS: Record<MissionEnvironment, string> = {
  arctic: "Arctic",
  desert: "Desert / arid",
  tropical: "Tropical",
  maritime: "Maritime / littoral",
  highalt: "High altitude",
  temperate: "Temperate",
};

/** Rough arid regions — planning aid only, not a survey. */
function isLikelyArid(lat: number, lng: number): boolean {
  const absLat = Math.abs(lat);

  if (absLat >= 18 && absLat <= 38 && lng >= -10 && lng <= 55) return true;
  if (absLat >= 15 && absLat <= 35 && lng >= 35 && lng <= 65) return true;
  if (lat >= 24 && lat <= 38 && lng >= -125 && lng <= -100) return true;
  if (lat >= -30 && lat <= -18 && lng >= 115 && lng <= 145) return true;
  if (lat >= -28 && lat <= -15 && lng >= 115 && lng <= 145) return true;
  if (lat >= -25 && lat <= -10 && lng >= -70 && lng <= -35) return true;

  return false;
}

/** Coasts and littoral bands where maritime shelter kits are common. */
function isLikelyMaritime(lat: number, lng: number): boolean {
  const absLat = Math.abs(lat);

  if (absLat > 55) return true;
  if (absLat <= 55 && lng >= -130 && lng <= -65 && (Math.abs(lat) <= 48 || lat >= 25)) return true;
  if (absLat <= 45 && lng >= -10 && lng <= 15) return true;
  if (absLat <= 45 && lng >= 95 && lng <= 155) return true;
  if (absLat <= 35 && lng >= -85 && lng <= -75 && lat >= 18 && lat <= 32) return true;
  if (absLat <= 35 && lng >= -82 && lng <= -79 && lat >= 24 && lat <= 31) return true;

  return false;
}

export function inferEnvironmentFromCoordinates(lat: number, lng: number): ClimateInference {
  const absLat = Math.abs(lat);

  if (absLat >= 66) {
    return {
      environment: "arctic",
      label: ENV_LABELS.arctic,
      detail: "High-latitude cold band (≥66°)",
    };
  }

  if (isLikelyArid(lat, lng)) {
    return {
      environment: "desert",
      label: ENV_LABELS.desert,
      detail: "Dry-climate region for this latitude/longitude",
    };
  }

  if (absLat <= 23.5) {
    return {
      environment: "tropical",
      label: ENV_LABELS.tropical,
      detail: "Within the tropics (≤23.5° latitude)",
    };
  }

  if (isLikelyMaritime(lat, lng)) {
    return {
      environment: "maritime",
      label: ENV_LABELS.maritime,
      detail: "Coastal or littoral band for this map location",
    };
  }

  return {
    environment: "temperate",
    label: ENV_LABELS.temperate,
    detail: "Mid-latitude continental band",
  };
}

export function applyHighAltitudeIfNeeded(
  base: ClimateInference,
  elevationMeters: number | null | undefined,
): ClimateInference {
  if (elevationMeters == null || elevationMeters < 2500) return base;
  return {
    environment: "highalt",
    label: ENV_LABELS.highalt,
    detail: `Elevation ~${Math.round(elevationMeters)} m — high-altitude kitting recommended`,
  };
}

export async function fetchElevationMeters(lat: number, lng: number): Promise<number | null> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/elevation");
    url.searchParams.set("latitude", lat.toFixed(5));
    url.searchParams.set("longitude", lng.toFixed(5));
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as { elevation?: number[] };
    const value = data.elevation?.[0];
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}
