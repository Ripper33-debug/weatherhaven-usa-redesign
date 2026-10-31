import type { MetadataRoute } from "next";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = PRODUCTION_SITE_URL;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/internal/",
        "/api/",
        "/auth/",
        "/login",
        "/accept-invite",
        "/dashboard",
        "/account",
        "/mission-solution-builder/results",
        "/programs/",
        "/sof-solutions/login",
        "/sof-solutions/request-access",
        "/sof-solutions/secure/",
        "/studio",
        "/sign-in-unavailable",
        "/mission-solution-builder/plan",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
