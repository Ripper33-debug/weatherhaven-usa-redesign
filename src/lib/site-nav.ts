import { PRODUCT_CONTENT, PRODUCT_FAMILIES, type ProductFamily } from "@/lib/product-content";
import { WEATHERHAVEN_PRODUCT_LINES } from "@/lib/weatherhaven-product-lines";

/** Primary navigation for the public site. */
export const NAV_LINKS = [
  { href: "/capabilities", label: "Capabilities" },
  { href: "/mission-solution-builder", label: "Mission builder" },
  { href: "/deployments", label: "Deployments" },
  { href: "/news", label: "News" },
] as const;

export const NAV_CTA = { href: "/contact", label: "Talk to an expert" } as const;
export const NAV_SOF = { href: "/sof-solutions", label: "SOF portal" } as const;

/** Display order inside each family: best-known, best-documented systems first. */
export const FAMILY_ORDER: string[] = [
  "mecc",
  "ehmecc",
  "trecc",
  "bmecc",
  "ateps",
  "hercon",
  "non-expandable-iso-containers",
  "rdmss",
  "series-4",
  "mts",
  "mex-26",
  "series-1-5-2",
  "airbeam-lp",
  "airbeam-hp",
  "polarhaven",
  "polar-chief",
  "endurance",
];

export type NavSystem = { slug: string; name: string; keySpec: string; href: string };

/** Systems grouped by family, in catalog order — drives the menu, footer and homepage. */
export const SYSTEMS_BY_FAMILY: { id: ProductFamily; name: string; summary: string; cover: string; systems: NavSystem[] }[] =
  PRODUCT_FAMILIES.map((family) => ({
    ...family,
    systems: WEATHERHAVEN_PRODUCT_LINES.filter((line) => PRODUCT_CONTENT[line.slug]?.family === family.id)
      .sort((a, b) => FAMILY_ORDER.indexOf(a.slug) - FAMILY_ORDER.indexOf(b.slug))
      .map((line) => ({
        slug: line.slug,
        name: PRODUCT_CONTENT[line.slug]?.name ?? line.name,
        keySpec: PRODUCT_CONTENT[line.slug]?.keySpec ?? line.subtitle,
        href: `/configurable-solutions/${line.slug}`,
      })),
  }));
