import type { MetadataRoute } from "next";
import { listNewsReleases } from "@/app/api/_lib/news-releases";
import { PRODUCTION_SITE_URL } from "@/lib/site-url";
import { listPublishedProducts } from "@/app/api/_lib/catalog-products";
import { isExternalNewsLink, isPlaceholderNewsRelease } from "@/lib/news-releases";

const MARKETING_PATHS = [
  "/",
  "/capabilities",
  "/configurable-solutions",
  "/contact",
  "/events",
  "/news",
  "/mission-solution-builder",
  "/deployments",
  "/resources",
  "/sof-solutions",
  "/privacy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = PRODUCTION_SITE_URL;
  const now = new Date();
  const products = await listPublishedProducts();

  const staticPages: MetadataRoute.Sitemap = MARKETING_PATHS.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/configurable-solutions/${product.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const newsReleases = await listNewsReleases({ publishedOnly: true });
  const newsPages: MetadataRoute.Sitemap = newsReleases
    .filter((release) => !isPlaceholderNewsRelease(release) && !isExternalNewsLink(release))
    .map((release) => ({
      url: `${base}/news/${release.slug}`,
      lastModified: release.updated_at ? new Date(release.updated_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  return [...staticPages, ...productPages, ...newsPages];
}
