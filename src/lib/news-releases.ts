/**
 * Verified Weatherhaven news (direct article URLs, checked Oct 2026).
 * Shown when the CMS is empty and merged with CMS releases otherwise, so the public list
 * never falls back to three 2022–2023 items that link to the corporate homepage.
 */
export const LEGACY_NEWS_RELEASES = [
  {
    slug: "supacat-partnership",
    title: "Weatherhaven and Supacat partner to advance redeployable infrastructure",
    summary:
      "Announced at Land Forces 2026 in Perth: Weatherhaven infrastructure paired with Supacat high-mobility vehicles for Asia-Pacific customers, with TRECC-T field trials planned for 2027.",
    body: null as string | null,
    external_url: "https://weatherhaven.com/Article?name=Weatherhaven%20and%20Supacat%20Partnership",
    status: "published" as const,
    published_at: "2026-10-08T12:00:00Z",
  },
  {
    slug: "battlefield-2027-showcase",
    title: "TRECC at the Battlefield 2027 defense innovation showcase",
    summary:
      "Weatherhaven presented TRECC rapidly deployable infrastructure in Washington, D.C., October 12–14, 2026.",
    body: null,
    external_url: "https://weatherhaven.com/Article?name=Weatherhaven%20Battlefield",
    status: "published" as const,
    published_at: "2026-10-01T12:00:00Z",
  },
  {
    slug: "land-forces-2026",
    title: "Weatherhaven at LAND FORCES 2026 with Supacat Asia Pacific",
    summary: "Deployable infrastructure for military and remote operations on show in Perth, Western Australia.",
    body: null,
    external_url: "https://weatherhaven.com/Article?name=Weatherhaven%20at%20LAND%20FORCES%202026",
    status: "published" as const,
    published_at: "2026-09-28T12:00:00Z",
  },
  {
    slug: "dvd-2026",
    title: "Next-generation MECC modules and TRECC at DVD 2026",
    summary: "Two new MECC expandable modules and TRECC shown at UTAC Millbrook for UK operational requirements.",
    body: null,
    external_url: "https://weatherhaven.com/Article?name=Weatherhaven%20DVD%202026",
    status: "published" as const,
    published_at: "2026-09-04T12:00:00Z",
  },
  {
    slug: "mspo-2026",
    title: "Weatherhaven exhibits at MSPO 2026 in Kielce, Poland",
    summary: "Command, accommodation, medical and logistics infrastructure in the Canadian Pavilion.",
    body: null,
    external_url: "https://weatherhaven.com/Article?name=Weatherhaven%20MSPO%202026%20in%20Kielce%2C%20Poland%20",
    status: "published" as const,
    published_at: "2026-09-08T12:00:00Z",
  },
  {
    slug: "usubc-membership",
    title: "Weatherhaven Resources joins the U.S.-Ukraine Business Council",
    summary:
      "The US entity, based in North Tonawanda, NY, joined the council for defense, humanitarian and reconstruction programs.",
    body: null,
    external_url: "https://usubc.org/?p=71155",
    status: "published" as const,
    published_at: "2026-08-16T12:00:00Z",
  },
  {
    slug: "trecc-trailer-sanitation",
    title: "TRECC trailer-mounted sanitation systems",
    summary:
      "A JLTV-towable TRECC unit for off-grid field sanitation and kitchen use, set up by two people in under 15 minutes on solar and 24VDC power.",
    body: null,
    external_url: "https://weatherhaven.com/Article?name=TRECC%20Trailer-Mounted%20Sanitation%20Systems%20",
    status: "published" as const,
    published_at: "2026-03-08T12:00:00Z",
  },
  {
    slug: "arctic-summit-2026",
    title: "First place at Arctic Summit 2026",
    summary:
      "Weatherhaven won the Build the North pitch competition in Whitehorse, Yukon, for modular redeployable northern infrastructure.",
    body: null,
    external_url: "https://weatherhaven.com/Article?name=First%20Place%20Award%20at%20Arctic%20Summit%202026",
    status: "published" as const,
    published_at: "2026-02-24T12:00:00Z",
  },
  {
    slug: "mecc-additive-manufacturing-facility",
    title: "MECC-based additive manufacturing facility delivered to the US",
    summary:
      "Two linked MECC expandable containers, a workshop and a 3D-printing unit, each certified as a 20-ft ISO container and C-130 transportable.",
    body: null,
    external_url:
      "https://weatherhaven.com/Article?name=MECC%20Based%20Additive%20Manufacturing%20Facility%20Delivered%20to%20the%20US%20",
    status: "published" as const,
    published_at: "2025-10-12T12:00:00Z",
  },
  {
    slug: "compotech-ballistic-partnership",
    title: "Weatherhaven and Compotech partner on ballistic protection",
    summary: "Weatherhaven becomes the exclusive international marketer of Compotech's modular armor system.",
    body: null,
    external_url: "https://weatherhaven.com/Article?name=WEATHERHAVEN%20AND%20COMPOTECH%20ANNOUNCE%20PARTNERSHIP%20",
    status: "published" as const,
    published_at: "2023-05-26T12:00:00Z",
  },
  {
    slug: "us-advisory-board",
    title: "Weatherhaven appoints US Advisory Board",
    summary:
      "Retired Lt. Gens. Guy C. Swan III, Mark Brilakis and Chris Nowland, retired Brig. Gen. Les Fuller and Craig Fugate join, introduced at AUSA 2022.",
    body: null,
    external_url: "https://weatherhaven.com/Article?name=Weatherhaven-appoints-US-Advisory-Board",
    status: "published" as const,
    published_at: "2022-10-05T12:00:00Z",
  },
  {
    slug: "40th-anniversary",
    title: "Weatherhaven 40th anniversary book",
    summary: "A 150-page history of the company's first four decades.",
    body: null,
    external_url: "https://weatherhaven.com/Article?name=Weatherhaven-40th-Anniversary-Book",
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
    // Fixed time zone so server and browser render the same string (avoids hydration mismatches).
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isBareHomepageLink(url: string | null | undefined): boolean {
  const u = (url ?? "").trim().replace(/\/+$/, "").toLowerCase();
  return u === "https://www.weatherhaven.com" || u === "https://weatherhaven.com";
}

/**
 * CMS releases + verified releases, newest first. CMS rows win unless they only link to the
 * corporate homepage and a verified row covers the same story.
 */
export function mergeWithVerifiedNews(cmsRows: NewsReleaseRow[]): NewsReleaseRow[] {
  const verified = legacyRowsAsNews();
  const byKey = new Map<string, NewsReleaseRow>();
  for (const row of verified) byKey.set(row.slug, row);
  for (const row of cmsRows) {
    // Same story only when slug, exact title or article URL match; never on a shared title prefix.
    const match = verified.find(
      (v) =>
        v.slug === row.slug ||
        normalizeTitle(v.title) === normalizeTitle(row.title) ||
        (!isBareHomepageLink(row.external_url) &&
          Boolean(row.external_url?.trim()) &&
          v.external_url?.trim() === row.external_url?.trim()),
    );
    if (match && isBareHomepageLink(row.external_url)) continue;
    if (match) byKey.delete(match.slug);
    byKey.set(row.slug, row);
  }
  return [...byKey.values()].sort(
    (a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime(),
  );
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
  })).sort((a, b) => new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime());
}
