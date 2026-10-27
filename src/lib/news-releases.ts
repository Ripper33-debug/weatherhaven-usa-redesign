/** Fallback press items when DB is unavailable or migration not yet run. */
export const LEGACY_NEWS_RELEASES = [
  {
    slug: "compotech-ballistic-partnership",
    title: "Weatherhaven and Compotech announce ballistic protection partnership",
    summary: null as string | null,
    body: null as string | null,
    external_url: "https://www.weatherhaven.com/",
    status: "published" as const,
    published_at: "2023-05-26T12:00:00Z",
  },
  {
    slug: "us-advisory-board",
    title: "Weatherhaven appoints US Advisory Board",
    summary: null,
    body: null,
    external_url: "https://www.weatherhaven.com/",
    status: "published" as const,
    published_at: "2022-10-05T12:00:00Z",
  },
  {
    slug: "40th-anniversary",
    title: "Weatherhaven 40th anniversary",
    summary: null,
    body: null,
    external_url: "https://www.weatherhaven.com/",
    status: "published" as const,
    published_at: "2022-08-02T12:00:00Z",
  },
] as const;

export type NewsReleaseStatus = "draft" | "published";

export type NewsReleaseRow = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  external_url: string | null;
  cover_image_url: string | null;
  status: string;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type NewsReleaseInsert = {
  slug: string;
  title: string;
  summary?: string | null;
  body?: string | null;
  external_url?: string | null;
  cover_image_url?: string | null;
  status?: NewsReleaseStatus;
  published_at?: string | null;
};

export function slugifyNewsTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base.length >= 2 ? base : "release";
}

export function formatNewsDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function newsReleaseHref(release: Pick<NewsReleaseRow, "slug" | "external_url">): string {
  if (release.external_url?.trim()) return release.external_url.trim();
  return `/news/${release.slug}`;
}

export function isExternalNewsLink(release: Pick<NewsReleaseRow, "external_url">): boolean {
  return Boolean(release.external_url?.trim());
}

export function isPlaceholderNewsRelease(release: Pick<NewsReleaseRow, "title" | "slug">): boolean {
  const title = release.title.trim();
  const slug = release.slug.trim().toLowerCase();
  if (/^test\b/i.test(title)) return true;
  if (slug.startsWith("test") || slug.includes("test-")) return true;
  return false;
}

export function legacyRowsAsNews(): NewsReleaseRow[] {
  return LEGACY_NEWS_RELEASES.map((row, index) => ({
    id: `legacy-${index}`,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    external_url: row.external_url,
    cover_image_url: null,
    status: row.status,
    published_at: row.published_at,
    created_at: row.published_at,
    updated_at: row.published_at,
  }));
}
