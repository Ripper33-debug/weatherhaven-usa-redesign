export type ProductFilterMission =
  | "c2"
  | "medical"
  | "maintenance"
  | "accommodation"
  | "logistics"
  | "all";
export type ProductFilterEnvironment =
  | "arctic"
  | "desert"
  | "tropical"
  | "maritime"
  | "highalt"
  | "all";
export type ProductFilterMobility = "c130" | "helicopter" | "ground" | "iso" | "all";
export type ProductFilterSize = "small" | "platoon" | "company" | "battalion" | "all";

export type ProductSpec = { label: string; value: string };

export type CompareSpecKey =
  | "footprint"
  | "personnel"
  | "transport"
  | "setupTime"
  | "climate"
  | "power"
  | "priceRange";

export type Product = {
  slug: string;
  code: string;
  name: string;
  subtitle: string;
  tag: string;
  missionTypes: Exclude<ProductFilterMission, "all">[];
  environments: Exclude<ProductFilterEnvironment, "all">[];
  mobilities: Exclude<ProductFilterMobility, "all">[];
  sizes: Exclude<ProductFilterSize, "all">[];
  description: string;
  overview: string[];
  features: { title: string; description: string }[];
  specs: ProductSpec[];
  compareScores: Record<CompareSpecKey, number>;
  configurations: { title: string; description: string }[];
  downloads: { name: string; type: string; size: string; href: string }[];
  relatedSlugs: string[];
  /** CMS-uploaded cover photo (Supabase Storage public URL). */
  coverImageUrl?: string;
  /** CMS-uploaded gallery photos (first item may duplicate cover). */
  galleryImageUrls?: string[];
};

export const FILTER_MISSION_OPTIONS = [
  { value: "all", label: "All" },
  { value: "c2", label: "Command & Control" },
  { value: "medical", label: "Medical" },
  { value: "maintenance", label: "Maintenance" },
  { value: "accommodation", label: "Accommodation" },
  { value: "logistics", label: "Logistics" },
] as const;

export const FILTER_ENVIRONMENT_OPTIONS = [
  { value: "all", label: "All" },
  { value: "arctic", label: "Arctic" },
  { value: "desert", label: "Desert" },
  { value: "tropical", label: "Tropical" },
  { value: "maritime", label: "Maritime" },
  { value: "highalt", label: "High Altitude" },
] as const;

export const FILTER_MOBILITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "c130", label: "C-130" },
  { value: "helicopter", label: "Helicopter" },
  { value: "ground", label: "Ground" },
  { value: "iso", label: "ISO Container" },
] as const;

export const FILTER_SIZE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "small", label: "Small Team" },
  { value: "platoon", label: "Platoon" },
  { value: "company", label: "Company" },
  { value: "battalion", label: "Battalion" },
] as const;

export const COMPARE_SPEC_LABELS: Record<CompareSpecKey, string> = {
  footprint: "Footprint",
  personnel: "Personnel",
  transport: "Transport",
  setupTime: "Setup Time",
  climate: "Climate",
  power: "Power",
  priceRange: "Price Range",
};

import {
  WEATHERHAVEN_PRODUCT_LINES,
  type WeatherhavenProductLine,
} from "@/lib/weatherhaven-product-lines";
import { getProductContent, hasLegacyPlaceholderSpecs } from "@/lib/product-content";

const defaultDownloads = [
  { name: "Military solutions", type: "Web", size: "—", href: "https://www.weatherhaven.com/military" },
  { name: "Contact Weatherhaven", type: "Web", size: "—", href: "https://www.weatherhaven.com/ContactUs" },
];

type ProductSeed = Omit<Product, "overview" | "features" | "specs" | "compareScores" | "configurations" | "downloads"> & {
  overviewExtra?: string;
};

function lineToSeed(line: WeatherhavenProductLine): ProductSeed {
  return {
    slug: line.slug,
    code: line.code,
    name: line.name,
    subtitle: line.subtitle,
    tag: line.tag,
    missionTypes: line.missionTypes,
    environments: line.environments,
    mobilities: line.mobilities,
    sizes: line.sizes,
    description: line.description,
    relatedSlugs: line.relatedSlugs,
    overviewExtra: line.overviewExtra,
  };
}

function seedProduct(p: ProductSeed): Product {
  const content = getProductContent(p.slug);
  return {
    ...p,
    name: content?.name ?? p.name,
    subtitle: content?.fullName ?? p.subtitle,
    description: content?.description ?? p.description,
    overview: content?.overview ?? [
      p.description,
      p.overviewExtra ??
        "Weatherhaven provides design, manufacture, delivery, installation, demobilization, refurbishment, and storage—ready for the next deployment.",
    ],
    features: content?.highlights ?? [
      { title: "Redeployable", description: "Engineered to be repeatedly deployed anywhere in the world." },
      { title: "Turnkey support", description: "Design, manufacture, installation, demobilization, refurbishment, and storage." },
    ],
    specs: content?.specs ?? [],
    compareScores: {
      footprint: 7,
      personnel: 7,
      transport: 7,
      setupTime: 7,
      climate: 8,
      power: 7,
      priceRange: 6,
    },
    configurations: content?.configurations ?? [
      { title: "Configured to your requirement", description: "Defined with a Weatherhaven expert for each program." },
    ],
    downloads: defaultDownloads,
  };
}

/**
 * CMS rows seeded before Oct 2026 carry a generic placeholder spec sheet and some wrong
 * product names (e.g. ATEPS as a "power system"). When a row still has those placeholders,
 * show the verified content instead — CMS photos, status and ordering are kept.
 */
export function upgradeLegacyProductContent(product: Product): Product {
  const content = getProductContent(product.slug);
  if (!content || !hasLegacyPlaceholderSpecs(product.specs)) return product;
  const line = WEATHERHAVEN_PRODUCT_LINES.find((l) => l.slug === product.slug);
  return {
    ...product,
    name: content.name,
    subtitle: content.fullName,
    tag: line?.tag ?? product.tag,
    description: content.description,
    overview: content.overview,
    features: content.highlights,
    specs: content.specs,
    configurations: content.configurations,
    missionTypes: line?.missionTypes ?? product.missionTypes,
    mobilities: line?.mobilities ?? product.mobilities,
    sizes: line?.sizes ?? product.sizes,
  };
}

export const PRODUCTS: Product[] = WEATHERHAVEN_PRODUCT_LINES.map((line) => seedProduct(lineToSeed(line)));

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsBySlugs(slugs: string[]): Product[] {
  return slugs.map((s) => getProductBySlug(s)).filter((p): p is Product => Boolean(p));
}

function normalizeProductSearchQuery(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Match name, code, slug, tag, subtitle, or description (e.g. "trecc", "TRECC", "command center"). */
export function productMatchesSearch(product: Product, rawQuery: string): boolean {
  const query = normalizeProductSearchQuery(rawQuery);
  if (!query) return true;

  const haystack = [
    product.name,
    product.code,
    product.slug,
    product.tag,
    product.subtitle,
    product.description,
  ]
    .join(" ")
    .toLowerCase();

  const tokens = query.split(" ");
  return tokens.every((token) => haystack.includes(token) || product.slug.includes(token.replace(/\s+/g, "-")));
}

export function filterProducts(
  products: Product[],
  filters: {
    mission: ProductFilterMission;
    environment: ProductFilterEnvironment;
    mobility: ProductFilterMobility;
    size: ProductFilterSize;
    search?: string;
  },
): Product[] {
  return products.filter((p) => {
    if (!productMatchesSearch(p, filters.search ?? "")) return false;
    if (filters.mission !== "all" && !p.missionTypes.includes(filters.mission)) return false;
    if (filters.environment !== "all" && !p.environments.includes(filters.environment)) return false;
    if (filters.mobility !== "all" && !p.mobilities.includes(filters.mobility)) return false;
    if (filters.size !== "all" && !p.sizes.includes(filters.size)) return false;
    return true;
  });
}

export function getCompareSpecValues(product: Product): Record<CompareSpecKey, string> {
  const map = Object.fromEntries(product.specs.map((s) => [s.label.toLowerCase(), s.value])) as Record<
    string,
    string
  >;
  return {
    footprint: map.footprint ?? "—",
    personnel: map.personnel ?? "—",
    transport: map.transport ?? "—",
    setupTime: map["setup time"] ?? "—",
    climate: map["climate rating"] ?? "—",
    power: map["power requirement"] ?? "—",
    priceRange: "Pricing available upon program alignment",
  };
}
