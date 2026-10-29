import { CAPABILITY_CATEGORIES } from "@/lib/capabilitiesExplorer";
import { PRODUCT_CONTENT, PRODUCT_FAMILIES, type ProductFamily } from "@/lib/product-content";
import { WEATHERHAVEN_PRODUCT_LINES } from "@/lib/weatherhaven-product-lines";

/** Primary navigation for the public site (after the Systems and Capabilities menus). */
export const NAV_LINKS = [
  { href: "/mission-solution-builder", label: "Mission builder" },
  { href: "/deployments", label: "Deployments" },
  { href: "/news", label: "News" },
] as const;

export const NAV_CTA = { href: "/contact", label: "Talk to an expert" } as const;
export const NAV_SOF = { href: "/sof-solutions", label: "SOF portal" } as const;
export const NAV_GOV = { href: "/government", label: "Government buyers" } as const;
export const NAV_CAPABILITIES_PAGE = { href: "/capabilities", label: "Capabilities" } as const;

const sentence = (s: string) => {
  const t = s.replace("&", "and").toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

/** The capability areas on /capabilities, for the Capabilities menu. */
export const NAV_CAPABILITIES = CAPABILITY_CATEGORIES.map((c) => ({ href: `/capabilities#${c.id}`, label: sentence(c.label) }));

/** Who Weatherhaven serves, each pointing to the story (or portal) that shows it. */
export const NAV_PROGRAMS = [
  { href: "/deployments#trecc-us-army", label: "US Army", note: "TRECC, built with the US Army" },
  { href: "/sof-solutions", label: "Special operations", note: "Planning tools in the SOF portal" },
  { href: "/deployments#nato-headquarters", label: "NATO and UN", note: "Deployable headquarters, peacekeeping camps" },
  { href: "/deployments#covid-mobile-health-units", label: "Medical and disaster relief", note: "100-bed field hospitals" },
  { href: "/deployments#beyond-epica", label: "Polar and research", note: "Ice-core drilling at 3,200 m" },
] as const;

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
