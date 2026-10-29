import { SOF_LOGIN_PATH, SOF_SECURE_PREFIXES } from "@/lib/sof-auth";

/** Routes that use Shield-mode UI (calm, cinematic marketing). */
const MARKETING_PREFIXES = [
  "/sof-solutions",
  "/capabilities",
  "/configurable-solutions",
  "/contact",
  "/resources",
  "/events",
  "/news",
  "/mission-solution-builder",
  "/deployments",
  "/government",
] as const;

/** SOF auth/secure paths use workspace chrome, not marketing mobile bar etc. */
function isExcludedFromMarketing(pathname: string): boolean {
  if (SOF_SECURE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true;
  }
  if (pathname === SOF_LOGIN_PATH) {
    return true;
  }
  return false;
}

export function isMarketingPage(pathname: string): boolean {
  if (isExcludedFromMarketing(pathname)) return false;
  if (pathname === "/") return true;
  return MARKETING_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** Product catalog + compare tools (not on homepage or other marketing pages). */
export function isProductCatalogPath(pathname: string): boolean {
  return pathname === "/configurable-solutions" || pathname.startsWith("/configurable-solutions/");
}

const PUBLIC_EXTRA_PATHS = ["/privacy", "/terms"] as const;

/**
 * Public website pages that use the v2 design language (global nav + footer).
 * Excludes the SOF microsite, which keeps its own immersive chrome.
 */
export function isPublicSitePage(pathname: string): boolean {
  if (pathname === "/sof-solutions" || pathname.startsWith("/sof-solutions/")) return false;
  if (PUBLIC_EXTRA_PATHS.some((p) => pathname === p)) return true;
  return isMarketingPage(pathname);
}
