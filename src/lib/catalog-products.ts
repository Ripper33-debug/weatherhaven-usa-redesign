import type { Product } from "@/lib/products";

export type CatalogProductStatus = "draft" | "published";

export type CatalogProductRow = {
  id: string;
  slug: string;
  status: string;
  sort_order: number;
  data: Product;
  created_at: string | null;
  updated_at: string | null;
};

export type CatalogProductInsert = {
  slug: string;
  status?: CatalogProductStatus;
  sort_order?: number;
  data: Product;
};

export function slugifyProductName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base.length >= 2 ? base : "system";
}

export function rowToProduct(row: CatalogProductRow): Product {
  return { ...row.data, slug: row.slug };
}

export function productSummary(product: Product): string {
  return product.description?.trim() || product.subtitle?.trim() || product.name;
}

export function catalogProductHref(slug: string): string {
  return `/configurable-solutions/${slug}`;
}

const defaultDownloads = [
  { name: "Military solutions", type: "Web", size: "—", href: "https://www.weatherhaven.com/military" },
  { name: "Contact Weatherhaven", type: "Web", size: "—", href: "https://www.weatherhaven.com/ContactUs" },
];

/** Baseline product document for new CMS entries (matches built-in seed defaults). */
export function createDefaultCatalogProduct(slug: string, partial?: Partial<Product>): Product {
  const normalized = slugifyProductName(slug) || "new-system";
  const base: Product = {
    slug: normalized,
    code: "NEW",
    name: "New shelter system",
    subtitle: "Configurable shelter system",
    tag: "PROGRAM",
    missionTypes: ["c2"],
    environments: ["arctic", "desert", "tropical"],
    mobilities: ["c130", "ground"],
    sizes: ["platoon"],
    description: "Describe the system for program and engineering audiences.",
    overview: [
      "Describe the system for program and engineering audiences.",
      "Weatherhaven provides design, manufacture, delivery, installation, demobilization, refurbishment, and storage—ready for the next deployment.",
    ],
    features: [
      { title: "Rapid deployment", description: "From setup to fully operational in as little as 20 minutes (system-dependent)." },
      { title: "Redeployable", description: "Engineered to be repeatedly deployed anywhere in the world." },
      { title: "Turnkey support", description: "Design, manufacture, installation, demobilization, refurbishment, and storage." },
    ],
    specs: [
      { label: "Footprint", value: "Mission-configured (technical exchange)" },
      { label: "Personnel", value: "Sized to CONOPS" },
      { label: "Transport", value: "Air, ground, and sea options" },
      { label: "Setup Time", value: "Hours to days (system-dependent)" },
      { label: "Climate Rating", value: "Arctic through desert bands" },
      { label: "Power Requirement", value: "Integrated per deployment" },
    ],
    compareScores: {
      footprint: 7,
      personnel: 7,
      transport: 7,
      setupTime: 7,
      climate: 8,
      power: 7,
      priceRange: 6,
    },
    configurations: [
      { title: "Standard configuration", description: "Defined through needs assessment and engineering exchange." },
    ],
    downloads: defaultDownloads,
    relatedSlugs: [],
  };
  return { ...base, ...partial, slug: normalized };
}
