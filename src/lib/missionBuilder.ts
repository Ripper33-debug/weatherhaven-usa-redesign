import { getProductBySlug, PRODUCTS, type Product } from "@/lib/products";
import { loadMissionProfile } from "@/lib/missionConfigurator";

export type MissionBuilderState = {
  environment: string;
  tempMin: string;
  tempMax: string;
  elevation: string;
  precipitation: string;
  primaryFunction: string;
  secondaryFunction: string;
  classification: string;
  personnelCount: string;
  primaryTransport: string;
  secondaryTransport: string;
  maxWeight: string;
  dimLength: string;
  dimWidth: string;
  dimHeight: string;
  fieldingDate: string;
  setupTime: string;
  deploymentDuration: string;
  resupplyFrequency: string;
  powerSource: string;
  powerKw: string;
  ecuRequired: boolean;
  climateMin: string;
  climateMax: string;
  specialRequirements: string[];
  notes: string;
  contactName: string;
  contactOrg: string;
  contactEmail: string;
};

export const MISSION_BUILDER_DEFAULTS: MissionBuilderState = {
  environment: "",
  tempMin: "",
  tempMax: "",
  elevation: "",
  precipitation: "",
  primaryFunction: "",
  secondaryFunction: "",
  classification: "",
  personnelCount: "",
  primaryTransport: "",
  secondaryTransport: "",
  maxWeight: "",
  dimLength: "",
  dimWidth: "",
  dimHeight: "",
  fieldingDate: "",
  setupTime: "",
  deploymentDuration: "",
  resupplyFrequency: "",
  powerSource: "",
  powerKw: "",
  ecuRequired: false,
  climateMin: "",
  climateMax: "",
  specialRequirements: [],
  notes: "",
  contactName: "",
  contactOrg: "",
  contactEmail: "",
};

const ENV_MAP: Record<string, string> = {
  arctic: "Arctic",
  desert: "Desert",
  tropical: "Tropical",
  maritime: "Maritime",
  highalt: "High Altitude",
  temperate: "Temperate",
};

const FUNCTION_MAP: Record<string, string> = {
  c2: "C2",
  medical: "Medical",
  maintenance: "Maintenance",
  accommodation: "Accommodation",
  scif: "SCIF",
  logistics: "Logistics",
};

export function prefillFromConfigurator(state: MissionBuilderState): MissionBuilderState {
  const profile = loadMissionProfile();
  if (!profile) return state;
  const next = { ...state };
  const envId = profile.environment;
  if (envId === "arid") next.environment = "desert";
  else if (envId === "jungle") next.environment = "tropical";
  else if (envId === "highalt") next.environment = "highalt";
  else if (envId in ENV_MAP) next.environment = envId;
  const fn = profile.missionType;
  if (fn in FUNCTION_MAP) next.primaryFunction = fn === "basecamp" ? "accommodation" : fn;
  const size = profile.forceSize;
  if (size === "small") next.personnelCount = "12";
  else if (size === "platoon") next.personnelCount = "36";
  else if (size === "company") next.personnelCount = "120";
  else if (size === "battalion") next.personnelCount = "400";
  const mob = profile.mobility;
  if (mob === "c130") next.primaryTransport = "c130";
  else if (mob === "sling") next.primaryTransport = "ch47";
  else if (mob === "ground") next.primaryTransport = "ground";
  else if (mob === "iso") next.primaryTransport = "iso";
  else if (mob === "lapes") next.primaryTransport = "lapes";
  return next;
}

export function hasConfiguratorPrefill(): boolean {
  return loadMissionProfile() !== null;
}

export function recommendProducts(state: MissionBuilderState, catalog: Product[] = PRODUCTS): Product[] {
  const slugs = new Set<string>();
  const env = state.environment;
  const fn = state.primaryFunction;
  const personnel = Number(state.personnelCount) || 0;
  const setup = state.setupTime;

  if (env === "arctic") slugs.add("endurance");
  if (fn === "c2" || fn === "scif") slugs.add("ehmecc");
  if (fn === "medical") slugs.add("bmecc");
  if (personnel > 0 && personnel <= 24 && (setup === "under2" || setup === "2-8")) {
    slugs.add("series-4");
  }
  if (personnel >= 80 || state.deploymentDuration === "6months" || state.deploymentDuration === "12plus") {
    slugs.add("ateps");
  }
  if (fn === "maintenance") slugs.add("mts");
  if (fn === "logistics") slugs.add("ateps");

  if (slugs.size === 0) {
    slugs.add("ehmecc");
    slugs.add("series-4");
  }

  const products: Product[] = [];
  for (const slug of slugs) {
    const p = catalog.find((x) => x.slug === slug) ?? getProductBySlug(slug);
    if (p) products.push(p);
    if (products.length >= 3) break;
  }
  if (products.length === 0) return catalog.slice(0, 2);
  return products.slice(0, 3);
}

export function buildProfileSummary(state: MissionBuilderState): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (state.environment) rows.push({ label: "Environment", value: ENV_MAP[state.environment] ?? state.environment });
  if (state.tempMin || state.tempMax) {
    rows.push({ label: "Temperature", value: `${state.tempMin || "—"}°F to ${state.tempMax || "—"}°F` });
  }
  if (state.elevation) rows.push({ label: "Elevation", value: state.elevation });
  if (state.precipitation) rows.push({ label: "Precipitation", value: state.precipitation });
  if (state.primaryFunction) {
    rows.push({ label: "Primary function", value: FUNCTION_MAP[state.primaryFunction] ?? state.primaryFunction });
  }
  if (state.secondaryFunction) {
    rows.push({ label: "Secondary function", value: FUNCTION_MAP[state.secondaryFunction] ?? state.secondaryFunction });
  }
  if (state.classification) rows.push({ label: "Classification", value: state.classification });
  if (state.personnelCount) rows.push({ label: "Personnel", value: state.personnelCount });
  if (state.primaryTransport) rows.push({ label: "Transport", value: state.primaryTransport });
  if (state.setupTime) rows.push({ label: "Setup window", value: state.setupTime });
  if (state.deploymentDuration) rows.push({ label: "Duration", value: state.deploymentDuration });
  if (state.powerSource) rows.push({ label: "Power", value: `${state.powerSource}${state.powerKw ? ` · ${state.powerKw} kW` : ""}` });
  if (state.ecuRequired) rows.push({ label: "ECU", value: "Required" });
  if (state.specialRequirements.length) {
    rows.push({ label: "Special", value: state.specialRequirements.join(", ") });
  }
  return rows;
}

export function buildRequirementsText(state: MissionBuilderState): string {
  return buildProfileSummary(state)
    .map((r) => `${r.label}: ${r.value}`)
    .concat(state.notes ? [`Notes: ${state.notes}`] : [])
    .join("\n");
}
