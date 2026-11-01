/** Canonical production domain for invite links, metadata, and emails. */
export const PRODUCTION_SITE_URL = "https://weatherhavenusa.com";

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

/**
 * Where share images (Open Graph / Twitter cards) are served from: this deployment's own production
 * address on Vercel. Canonical links keep pointing at weatherhavenusa.com, but the images have to
 * load from wherever the site actually runs, or shared links show no picture. When the site moves to
 * weatherhavenusa.com as its Vercel domain, this follows automatically.
 */
export function shareImageUrl(path: string): string {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  return host && path.startsWith("/") ? `https://${host}${path}` : path;
}
