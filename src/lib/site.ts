import { COMPANY_CONTACT } from "@/lib/company-facts";

export const company = {
  name: "Weatherhaven Resources Inc.",
  shortName: "Weatherhaven",
  tagline: "Rapidly Deploying Shelter Systems Anywhere in the World",
  description:
    "Weatherhaven is a world leader in the design, manufacture, delivery, and support of rapidly deployable and redeployable shelters, camps, and field hospitals for military, medical, and commercial operations.",
  headquarters: COMPANY_CONTACT.headquarters,
  address: COMPANY_CONTACT.headquartersAddress,
  phone: COMPANY_CONTACT.phone,
  contactUrl: COMPANY_CONTACT.contactPageUrl,
} as const;

/** Flat primary nav — systems catalog, SOF portal, and contact. */
export const navPrimaryLinks = [
  { href: "/configurable-solutions", label: "Systems" },
  { href: "/sof-solutions/login", label: "SOF Portal" },
  { href: "/contact", label: "Contact" },
] as const;

/** Shown in mobile menu and footer — content discovery without crowding top nav. */
export const navDiscoverLinks = [
  { href: "/news", label: "News & releases" },
  { href: "/events", label: "Events & briefings" },
] as const;

/** Homepage quick paths — browse catalog or contact. */
export const marketingQuickPaths = [
  { href: "/configurable-solutions", label: "Browse systems", description: "All shelter configurations" },
  { href: "/contact", label: "Get in touch", description: "Program & technical inquiry" },
] as const;

/** Featured on systems catalog — two clicks from home (Systems → product). */
export const featuredProductSlugs = [
  "series-4",
  "ehmecc",
  "airbeam-lp",
  "mecc",
] as const;

/** Secondary destinations (footer, cross-links — not in top nav). */
export const navSecondaryLinks = [
  ...navDiscoverLinks,
  { href: "/capabilities", label: "Capabilities" },
  { href: "/resources", label: "Resources library" },
  { href: "/mission-solution-builder", label: "Mission builder" },
  { href: "/sof-solutions/secure/deployment-planner", label: "SOF deployment planner" },
  { href: "/sof-solutions/request-access", label: "SOF program access" },
] as const;

export const navContactLink = { href: "/contact", label: "Contact" } as const;

export const legalLinks = [
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of use" },
] as const;

export const navFooterLeafLinks = [
  ...navPrimaryLinks,
  ...navSecondaryLinks,
  { href: "/login", label: "Sign in" },
] as const;

export const footerColumns = [
  {
    title: "Explore",
    links: [
      { href: "/configurable-solutions", label: "Systems" },
      { href: "/capabilities", label: "Capabilities" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources", label: "Resources library" },
      { href: "/news", label: "News & releases" },
      { href: "/events", label: "Events" },
      { href: "/mission-solution-builder", label: "Mission builder" },
    ],
  },
  {
    title: "Contact",
    links: [
      { href: "/contact", label: "Talk to a Weatherhaven Expert" },
      { href: "/sof-solutions/login", label: "SOF Portal" },
      { href: "/sof-solutions/request-access", label: "SOF program access" },
    ],
  },
  {
    title: "Legal",
    links: [...legalLinks],
  },
] as const;
