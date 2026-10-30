/**
 * The site's link constants, with no data imports, so client components (the navbar, the phone
 * action bar) can use them without pulling the product and capability catalogs into the page
 * JavaScript. Re-exported from site-nav.ts, which adds the catalog-driven menu data.
 */
/** Primary navigation for the public site (after the Systems and Capabilities menus). */
export const NAV_LINKS = [
  { href: "/mission-solution-builder", label: "Mission builder" },
  { href: "/deployments", label: "Deployments" },
  { href: "/news", label: "News" },
] as const;

export const NAV_CTA = { href: "/contact?inquiry=Capability%20Briefing", label: "Request a briefing" } as const;

export const NAV_SOF = { href: "/sof-solutions", label: "SOF portal" } as const;

export const NAV_GOV = { href: "/government", label: "Government buyers" } as const;

export const NAV_CAPABILITIES_PAGE = { href: "/capabilities", label: "Capabilities" } as const;

/** Who Weatherhaven serves: the menu's short list, each leading to its page under /who-we-serve. */
export const NAV_PROGRAMS = [
  { href: "/who-we-serve/us-army", label: "US Army", note: "TRECC, developed with DEVCOM" },
  { href: "/who-we-serve/special-operations", label: "Special operations", note: "Small, air-mobile systems and the SOF portal" },
  { href: "/who-we-serve/nato-allies", label: "NATO and UN", note: "Deployable headquarters, UN mission sites" },
  { href: "/who-we-serve/emergency-medical", label: "Medical and disaster relief", note: "100-bed field hospitals" },
  { href: "/who-we-serve/polar-research", label: "Polar and research", note: "Ice-core drilling at 3,200 m" },
] as const;

export const NAV_WHO_WE_SERVE = { href: "/who-we-serve", label: "All buyers" } as const;
