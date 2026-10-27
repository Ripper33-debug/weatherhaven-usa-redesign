import type { Product } from "@/lib/products";

/** SOF-only systems — not listed on the public marketing catalog. */
export type SofProduct = Product & {
  classification: "SOF RESTRICTED";
  distribution: string;
};

function sofSeed(
  p: Omit<SofProduct, "overview" | "features" | "specs" | "compareScores" | "configurations" | "downloads"> & {
    overviewExtra?: string;
    features?: SofProduct["features"];
    specs?: SofProduct["specs"];
    configurations?: SofProduct["configurations"];
  },
): SofProduct {
  return {
    ...p,
    overview: [
      p.description,
      p.overviewExtra ??
        "Detailed performance data, transport matrices, and integration guides are available through your program lead under applicable disclosure controls.",
    ],
    features: p.features ?? [
      {
        title: "Low signature footprint",
        description: "Sized for small-team and special operations CONOPS with minimal logistics drag.",
      },
      {
        title: "Rapid emplacement",
        description: "Field teams can transition from transit to operational shelter in hours, not days.",
      },
      {
        title: "Program-specific integration",
        description: "Power, comms, and environmental packages configured per theater and task organization.",
      },
    ],
    specs: p.specs ?? [
      { label: "Classification", value: "SOF program release — authorized members only" },
      { label: "Team size", value: "4–24 operators (configuration-dependent)" },
      { label: "Transport", value: "Helicopter / tactical vehicle / ISO intermodal options" },
      { label: "Emplacement", value: "Hours (system-dependent)" },
      { label: "Climate band", value: "Arctic through desert — theater kits available" },
      { label: "Release", value: "Technical data via program lead" },
    ],
    compareScores: {
      footprint: 9,
      personnel: 6,
      transport: 8,
      setupTime: 9,
      climate: 8,
      power: 7,
      priceRange: 5,
    },
    configurations: p.configurations ?? [
      {
        title: "Baseline SOF kit",
        description: "Shelter, environmental liner, and power distribution sized to approved CONOPS.",
      },
      {
        title: "Extended operations",
        description: "Additional hardening, ECU redundancy, and integrated workspace modules.",
      },
    ],
    downloads: [
      {
        name: "Request classified brief",
        type: "Program desk",
        size: "—",
        href: "/contact?inquiry=SOF%20Classified%20Brief",
      },
    ],
  };
}

export const SOF_PRODUCTS: SofProduct[] = [
  sofSeed({
    slug: "clam",
    code: "CLAM",
    name: "CLAM",
    subtitle: "Compact Lightweight Adaptable Module",
    tag: "SOF RESTRICTED",
    classification: "SOF RESTRICTED",
    distribution: "Authorized SOF program members · export-controlled technical data may apply",
    missionTypes: ["c2", "accommodation"],
    environments: ["arctic", "desert", "tropical", "highalt"],
    mobilities: ["helicopter", "c130", "ground"],
    sizes: ["small", "platoon"],
    description:
      "Ultra-compact shelter module engineered for small-team forward operations — minimal signature, rapid emplacement, and redeployable across denied and remote environments.",
    overviewExtra:
      "CLAM packages shelter volume, environmental protection, and basic workspace infrastructure into a transport footprint optimized for special operations insertion and short-duration objective sites.",
    features: [
      {
        title: "Minimal logistics signature",
        description: "Designed for small teams where every pallet and flight hour counts.",
      },
      {
        title: "Adaptable interior volume",
        description: "Reconfigurable layout for C2, rest/overwatch, or equipment staging.",
      },
      {
        title: "Theater-hardened envelope",
        description: "Environmental and EMI considerations integrated for sustained field use.",
      },
    ],
    specs: [
      { label: "Design intent", value: "4–12 operator forward site / hide location" },
      { label: "Transport", value: "Helicopter sling / tactical vehicle / C-130 (configuration-dependent)" },
      { label: "Emplacement", value: "Target under 4 hours with trained team" },
      { label: "Redeploy", value: "Strike and reposition without dedicated engineer support" },
      { label: "Data release", value: "Performance sheets via SOF program lead" },
      { label: "Classification", value: "SOF RESTRICTED" },
    ],
    relatedSlugs: ["specter-c2", "shadow-cache"],
  }),
  sofSeed({
    slug: "specter-c2",
    code: "SPECTER",
    name: "Specter C2 Module",
    subtitle: "Low-signature command node",
    tag: "SOF RESTRICTED",
    classification: "SOF RESTRICTED",
    distribution: "Authorized SOF program members only",
    missionTypes: ["c2"],
    environments: ["arctic", "desert", "tropical", "maritime", "highalt"],
    mobilities: ["helicopter", "c130", "iso"],
    sizes: ["platoon"],
    description:
      "Expeditionary command shelter with integrated cable management, lighting, and power distribution for special operations headquarters and planning cells.",
    relatedSlugs: ["clam", "shadow-cache"],
  }),
  sofSeed({
    slug: "shadow-cache",
    code: "SHADOW",
    name: "Shadow Cache System",
    subtitle: "Pre-positioned SOF sustainment package",
    tag: "SOF RESTRICTED",
    classification: "SOF RESTRICTED",
    distribution: "Theater pre-positioning · program-controlled release",
    missionTypes: ["logistics", "accommodation"],
    environments: ["arctic", "desert", "tropical"],
    mobilities: ["c130", "ground", "iso"],
    sizes: ["platoon", "company"],
    description:
      "Modular sustainment and storage configuration for cached equipment, spares, and life support in support of distributed special operations.",
    relatedSlugs: ["clam", "specter-c2"],
  }),
  sofSeed({
    slug: "reaper-lc",
    code: "REAPER-LC",
    name: "Reaper LC Envelope",
    subtitle: "Long-cycle SOF living & work shelter",
    tag: "SOF RESTRICTED",
    classification: "SOF RESTRICTED",
    distribution: "Extended-duration SOF camps · controlled technical release",
    missionTypes: ["accommodation", "c2"],
    environments: ["arctic", "desert", "tropical", "highalt"],
    mobilities: ["c130", "ground", "iso"],
    sizes: ["platoon", "company"],
    description:
      "Hardened fabric-and-frame envelope for longer-duration special operations sites where comfort, ECU performance, and workspace density must balance with redeployability.",
    relatedSlugs: ["specter-c2", "shadow-cache"],
  }),
  sofSeed({
    slug: "trecc",
    code: "TRECC",
    name: "TRECC",
    subtitle: "Tactical Rapidly Expandable Command Center · field sustainment",
    tag: "SUSTAINMENT",
    classification: "SOF RESTRICTED",
    distribution: "Sustainment release for authorized SOF program members",
    missionTypes: ["logistics", "accommodation"],
    environments: ["arctic", "desert", "tropical", "maritime"],
    mobilities: ["c130", "ground", "iso"],
    sizes: ["platoon", "company", "battalion"],
    description:
      "Rapid-deploy self-contained field sanitation and kitchen capability — integrated into forward SOF camp layouts for sustainment and hygiene at scale.",
    overviewExtra:
      "TRECC provides the sustainment backbone for distributed special operations sites. Deployment planner camp packages automatically include TRECC when logistics function or force size warrants sustainment zoning.",
    features: [
      {
        title: "Rapid emplacement",
        description: "From transit to operational field kitchen and sanitation in hours, not days.",
      },
      {
        title: "Camp integration",
        description: "Sized to slot into turnkey and modular camp spines alongside command and accommodation modules.",
      },
      {
        title: "Theater sustainment",
        description: "Supports extended-duration SOF operations with redeployable infrastructure.",
      },
    ],
    relatedSlugs: ["shadow-cache", "specter-c2", "ateps"],
  }),
];

export function getSofProductBySlug(slug: string): SofProduct | undefined {
  return SOF_PRODUCTS.find((p) => p.slug === slug);
}

export function getSofProductsBySlugs(slugs: string[]): SofProduct[] {
  return slugs.map((s) => getSofProductBySlug(s)).filter((p): p is SofProduct => Boolean(p));
}

export const SOF_CATALOG_PATH = "/sof-solutions/secure";

export function sofSystemPath(slug: string): string {
  return `/sof-solutions/secure/systems/${slug}`;
}
