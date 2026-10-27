import type { ContactPrefillPayload } from "@/lib/contact-prefill";
import { buildRequirementsText, type MissionBuilderState } from "@/lib/missionBuilder";
import type { Product } from "@/lib/products";

export const MISSION_BUILDER_STORAGE_KEY = "wh-mission-builder-state";

export const PRICING_PLACEHOLDER = "Pricing available upon program alignment";

export type CampZoneId =
  | "entry"
  | "command"
  | "medical"
  | "maintenance"
  | "accommodation"
  | "sustainment"
  | "logistics"
  | "power";

export type CampZoneLayout = {
  id: CampZoneId;
  label: string;
  row: number;
  col: number;
  colSpan: number;
  rowSpan: number;
};

export type CampLineItem = {
  slug: string;
  code: string;
  name: string;
  qty: number;
  zoneId: CampZoneId;
  notes?: string;
};

export type CampRomEstimate = {
  minMillionsUsd: number;
  maxMillionsUsd: number;
  label: string;
  disclaimer: string;
};

export type CampPlan = {
  packageId: string;
  title: string;
  subtitle: string;
  forceTier: "small" | "platoon" | "company" | "battalion";
  zones: CampZoneLayout[];
  lineItems: CampLineItem[];
  rom: CampRomEstimate;
};

export const CAMP_ZONE_LABELS: Record<CampZoneId, string> = {
  entry: "Entry / access",
  command: "Command & control",
  medical: "Medical",
  maintenance: "Maintenance",
  accommodation: "Accommodation",
  sustainment: "Sustainment",
  logistics: "Logistics hub",
  power: "Power yard",
};

export function parsePersonnelCount(raw: string): number {
  const n = Number.parseInt(raw.trim(), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function forceTierFromPersonnel(count: number): CampPlan["forceTier"] {
  if (count <= 24) return "small";
  if (count <= 80) return "platoon";
  if (count <= 200) return "company";
  return "battalion";
}

function aggregateRom(_lineItems: CampLineItem[], _catalog: Map<string, Product>): CampRomEstimate {
  return {
    minMillionsUsd: 0,
    maxMillionsUsd: 0,
    label: PRICING_PLACEHOLDER,
    disclaimer: "Final configuration and pricing require technical exchange and program review.",
  };
}

function addLine(
  items: CampLineItem[],
  catalog: Map<string, Product>,
  slug: string,
  qty: number,
  zoneId: CampZoneId,
  notes?: string,
): void {
  if (qty <= 0) return;
  const product = catalog.get(slug);
  if (!product) return;
  const existing = items.find((i) => i.slug === slug && i.zoneId === zoneId);
  if (existing) {
    existing.qty += qty;
    return;
  }
  items.push({
    slug,
    code: product.code,
    name: product.name,
    qty,
    zoneId,
    notes,
  });
}

function buildZones(
  state: MissionBuilderState,
  tier: CampPlan["forceTier"],
  lineItems: CampLineItem[],
): CampZoneLayout[] {
  const zones: CampZoneLayout[] = [];
  const fn = state.primaryFunction;
  const fn2 = state.secondaryFunction;
  const personnel = parsePersonnelCount(state.personnelCount);
  const longDeploy =
    state.deploymentDuration === "6months" || state.deploymentDuration === "12plus";

  zones.push({ id: "entry", label: CAMP_ZONE_LABELS.entry, row: 0, col: 0, colSpan: 1, rowSpan: 1 });

  if (fn === "c2" || fn === "scif" || fn2 === "c2" || fn2 === "scif") {
    zones.push({ id: "command", label: CAMP_ZONE_LABELS.command, row: 0, col: 1, colSpan: 2, rowSpan: 1 });
  }
  if (fn === "medical" || fn2 === "medical") {
    zones.push({ id: "medical", label: CAMP_ZONE_LABELS.medical, row: 1, col: 0, colSpan: 2, rowSpan: 1 });
  }
  if (fn === "maintenance" || fn2 === "maintenance") {
    zones.push({ id: "maintenance", label: CAMP_ZONE_LABELS.maintenance, row: 1, col: 2, colSpan: 2, rowSpan: 1 });
  }
  if (fn === "accommodation" || personnel > 36 || tier === "company" || tier === "battalion") {
    zones.push({ id: "accommodation", label: CAMP_ZONE_LABELS.accommodation, row: 2, col: 0, colSpan: 2, rowSpan: 1 });
  }
  if (
    fn === "logistics" ||
    fn2 === "logistics" ||
    personnel > 20 ||
    lineItems.some((i) => i.slug === "trecc")
  ) {
    zones.push({ id: "sustainment", label: CAMP_ZONE_LABELS.sustainment, row: 2, col: 2, colSpan: 1, rowSpan: 1 });
  }
  if (tier === "company" || tier === "battalion" || longDeploy || fn === "logistics") {
    zones.push({ id: "logistics", label: CAMP_ZONE_LABELS.logistics, row: 2, col: 3, colSpan: 1, rowSpan: 1 });
  }
  zones.push({ id: "power", label: CAMP_ZONE_LABELS.power, row: 3, col: 0, colSpan: 1, rowSpan: 1 });

  return zones;
}

export function generateCampPlan(state: MissionBuilderState, products: Product[]): CampPlan | null {
  const env = state.environment;
  const fn = state.primaryFunction;
  if (!env || !fn) return null;

  const personnel = parsePersonnelCount(state.personnelCount);
  const tier = forceTierFromPersonnel(personnel || 24);
  const catalog = new Map(products.map((p) => [p.slug, p]));
  const lineItems: CampLineItem[] = [];

  const longDeploy =
    state.deploymentDuration === "6months" || state.deploymentDuration === "12plus";

  if (env === "arctic") {
    addLine(lineItems, catalog, "endurance", 1, "power", "Cold-weather package");
  }

  if (fn === "c2" || fn === "scif") {
    if (tier === "small" || tier === "platoon") {
      addLine(lineItems, catalog, "series-4", 1, "command");
      addLine(lineItems, catalog, "ehmecc", 1, "command", "Primary HQ footprint");
    } else {
      addLine(lineItems, catalog, "ehmecc", tier === "battalion" ? 2 : 1, "command");
      addLine(lineItems, catalog, "non-expandable-iso-containers", 1, "command");
    }
  }

  if (fn === "medical") {
    addLine(lineItems, catalog, "bmecc", 1, "medical");
    if (tier !== "small") addLine(lineItems, catalog, "airbeam-lp", 1, "medical", "Triage / surge");
  }

  if (fn === "maintenance") {
    addLine(lineItems, catalog, "mts", 1, "maintenance");
    if (tier === "company" || tier === "battalion") {
      addLine(lineItems, catalog, "mecc", 1, "maintenance");
    }
  }

  if (fn === "accommodation" || personnel > 36) {
    const accSlug = tier === "small" ? "series-4" : "non-expandable-iso-containers";
    addLine(lineItems, catalog, accSlug, tier === "battalion" ? 2 : 1, "accommodation", "Berthing / admin");
  }

  if (fn === "logistics" || personnel > 20) {
    addLine(lineItems, catalog, "trecc", 1, "sustainment");
  }

  if (longDeploy || tier === "company" || tier === "battalion") {
    addLine(lineItems, catalog, "ateps", 1, "logistics", "Camp power and infrastructure");
  }

  if (lineItems.length === 0) {
    addLine(lineItems, catalog, "ehmecc", 1, "command");
    addLine(lineItems, catalog, "series-4", 1, "command");
  }

  const zones = buildZones(state, tier, lineItems);
  const rom = aggregateRom(lineItems, catalog);
  const packageId = `WH-CAMP-${Date.now().toString(36).toUpperCase().slice(-8)}`;

  const envLabel =
    env === "arctic"
      ? "Arctic"
      : env === "desert"
        ? "Desert"
        : env === "tropical"
          ? "Tropical"
          : env === "maritime"
            ? "Maritime"
            : env === "highalt"
              ? "High altitude"
              : "Temperate";

  return {
    packageId,
    title: `${envLabel} ${fn.toUpperCase()} camp package`,
    subtitle: `${personnel || "—"} personnel · ${tier} footprint · ${lineItems.length} line items`,
    forceTier: tier,
    zones,
    lineItems,
    rom,
  };
}

export function buildCampPlanMessage(state: MissionBuilderState, plan: CampPlan): string {
  const lines: string[] = [
    `Camp package ID: ${plan.packageId}`,
    plan.title,
    plan.subtitle,
    "",
    "— Indicative layout zones —",
    ...plan.zones.map((z) => `• ${z.label}`),
    "",
    "— Parts list (ROM planning) —",
    ...plan.lineItems.map(
      (i) =>
        `• ${i.qty}× ${i.code} ${i.name}${i.notes ? ` (${i.notes})` : ""} [${CAMP_ZONE_LABELS[i.zoneId]}]`,
    ),
    "",
    `ROM: ${plan.rom.label}`,
    plan.rom.disclaimer,
    "",
    "— Mission profile —",
  ];

  lines.push(buildRequirementsText(state));
  return lines.join("\n");
}

export function campPlanMinimumReady(state: MissionBuilderState): boolean {
  return Boolean(state.environment && state.primaryFunction && state.personnelCount.trim());
}

/** Contact form prefill from camp planner results. */
export function buildCampPlanContactPrefill(
  state: MissionBuilderState,
  plan: CampPlan,
): ContactPrefillPayload {
  const primarySlug = plan.lineItems[0]?.slug;
  return {
    inquiry_type: "Technical Exchange",
    program: `${plan.packageId} · ${plan.title}`,
    subject: `Camp package discussion — ${plan.packageId}`,
    message: buildCampPlanMessage(state, plan),
    system: primarySlug,
  };
}
