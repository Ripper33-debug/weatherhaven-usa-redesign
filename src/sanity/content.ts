/**
 * Content from the Sanity studio, mapped onto the shapes the site already uses. Every function
 * returns null (or leaves its input alone) when the CMS isn't connected, is empty or doesn't answer,
 * so the site always has the content written into the code to fall back on.
 */
import type { NewsReleaseRow } from "@/lib/news-releases";
import type { Product } from "@/lib/products";
import type { FlagshipStory, StoryImage } from "@/lib/stories";
import type { TeamMember } from "@/lib/team";
import { cmsFetch } from "@/sanity/client";
import { cmsImageUrl } from "@/sanity/image";

type SanityImage = { asset?: { _ref?: string } } & Record<string, unknown>;
type CmsPhoto = { image?: SanityImage | null; legacySrc?: string | null; alt?: string | null; caption?: string | null } | null | undefined;

const text = (v: string | null | undefined) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const list = <T,>(v: T[] | null | undefined) => (Array.isArray(v) && v.length > 0 ? v : undefined);

function photo(p: CmsPhoto): StoryImage | null {
  const src = cmsImageUrl(p?.image ?? null) ?? text(p?.legacySrc ?? undefined);
  if (!src) return null;
  return { src, alt: text(p?.alt ?? undefined) ?? "", caption: text(p?.caption ?? undefined) ?? "" };
}

// ---- systems ------------------------------------------------------------------------------------

type CmsProduct = {
  slug: string;
  fullName?: string | null;
  description?: string | null;
  keySpec?: string | null;
  specs?: { label: string; value: string }[] | null;
  highlights?: { title: string; description?: string | null }[] | null;
  overview?: string[] | null;
  configurations?: { title: string; description?: string | null }[] | null;
};

const PRODUCTS_QUERY = `*[_type == "product" && defined(slug)]{
  slug, fullName, description, keySpec,
  specs[]{label, value}, highlights[]{title, description}, overview, configurations[]{title, description}
}`;

/** Studio edits on top of each system; fields left empty in the studio keep the site's content. */
export async function withCmsProducts(products: Product[]): Promise<Product[]> {
  const rows = await cmsFetch<CmsProduct[]>(PRODUCTS_QUERY);
  if (!rows?.length) return products;
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return products.map((p) => {
    const c = bySlug.get(p.slug);
    if (!c) return p;
    return {
      ...p,
      subtitle: text(c.fullName) ?? p.subtitle,
      description: text(c.description) ?? p.description,
      keySpec: text(c.keySpec) ?? p.keySpec,
      specs: list(c.specs?.filter((s) => text(s.label) && text(s.value)))?.map((s) => ({ label: s.label.trim(), value: s.value.trim() })) ?? p.specs,
      features: list(c.highlights?.filter((h) => text(h.title)))?.map((h) => ({ title: h.title.trim(), description: text(h.description) ?? "" })) ?? p.features,
      overview: list(c.overview?.map((o) => o.trim()).filter(Boolean)) ?? p.overview,
      configurations:
        list(c.configurations?.filter((h) => text(h.title)))?.map((h) => ({ title: h.title.trim(), description: text(h.description) ?? "" })) ??
        p.configurations,
    };
  });
}

// ---- program stories ------------------------------------------------------------------------------

type CmsStory = {
  slug: string;
  title: string;
  dek: string;
  place: string;
  when?: string | null;
  systems?: string[] | null;
  hero?: CmsPhoto;
  heroModel?: string | null;
  numbers?: { value: string; label: string }[] | null;
  timeline?: { date: string; text: string }[] | null;
  sections?: { heading: string; paragraphs?: string[] | null }[] | null;
  photos?: CmsPhoto[] | null;
  quote?: { text?: string | null; name?: string | null; role?: string | null } | null;
  note?: string | null;
  sources?: { label: string; href: string; own?: boolean | null }[] | null;
  deploymentStoryId?: string | null;
};

const STORIES_QUERY = `*[_type == "story" && defined(slug.current)] | order(coalesce(order, 999) asc, title asc){
  "slug": slug.current, title, dek, place, when, systems, hero, heroModel,
  numbers[]{value, label}, timeline[]{date, text}, sections[]{heading, paragraphs},
  photos[]{image, legacySrc, alt, caption}, quote, note, sources[]{label, href, own}, deploymentStoryId
}`;

/** The studio's stories, or null to use the ones in code. Stories without a main photo are skipped. */
export async function cmsStories(): Promise<FlagshipStory[] | null> {
  const rows = await cmsFetch<CmsStory[]>(STORIES_QUERY);
  if (!rows?.length) return null;
  const stories = rows.flatMap((r): FlagshipStory[] => {
    const hero = photo(r.hero);
    if (!hero || !text(r.title) || !text(r.slug)) return [];
    const quoteText = text(r.quote?.text ?? undefined);
    const quoteName = text(r.quote?.name ?? undefined);
    return [
      {
        slug: r.slug,
        title: r.title.trim(),
        dek: text(r.dek) ?? "",
        place: text(r.place) ?? "",
        when: text(r.when ?? undefined),
        systems: (r.systems ?? []).filter(Boolean),
        hero: { ...hero, model: text(r.heroModel ?? undefined) },
        numbers: (r.numbers ?? []).filter((n) => text(n.value) && text(n.label)),
        timeline: (r.timeline ?? []).filter((t) => text(t.date) && text(t.text)),
        sections: (r.sections ?? []).filter((s) => text(s.heading)).map((s) => ({ heading: s.heading.trim(), paragraphs: (s.paragraphs ?? []).map((x) => x.trim()).filter(Boolean) })),
        photos: (r.photos ?? []).flatMap((p) => photo(p) ?? []),
        quote: quoteText && quoteName ? { text: quoteText, name: quoteName, role: text(r.quote?.role ?? undefined) } : undefined,
        note: text(r.note ?? undefined),
        sources: (r.sources ?? []).filter((s) => text(s.label) && text(s.href)).map((s) => ({ label: s.label.trim(), href: s.href.trim(), own: s.own ?? undefined })),
        deploymentStoryId: text(r.deploymentStoryId ?? undefined),
      },
    ];
  });
  return stories.length ? stories : null;
}

// ---- team -------------------------------------------------------------------------------------------

type CmsPerson = { name: string; title: string; photo?: SanityImage | null; email?: string | null; phone?: string | null; bio?: string | null; focus?: string | null };

const TEAM_QUERY = `*[_type == "teamMember" && defined(name) && defined(title)] | order(coalesce(order, 999) asc, name asc){name, title, photo, email, phone, bio, focus}`;

export async function cmsTeam(): Promise<TeamMember[] | null> {
  const rows = await cmsFetch<CmsPerson[]>(TEAM_QUERY);
  if (!rows?.length) return null;
  return rows.map((r) => ({
    name: r.name.trim(),
    title: r.title.trim(),
    photo: cmsImageUrl(r.photo ?? null, 800) ?? undefined,
    email: text(r.email ?? undefined),
    phone: text(r.phone ?? undefined),
    bio: text(r.bio ?? undefined),
    focus: text(r.focus ?? undefined),
  }));
}

// ---- news --------------------------------------------------------------------------------------------

type CmsNews = { _id: string; slug: string; title: string; summary?: string | null; body?: string | null; externalUrl?: string | null; publishedAt?: string | null; _updatedAt?: string; _createdAt?: string };

const NEWS_QUERY = `*[_type == "newsRelease" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc){
  _id, "slug": slug.current, title, summary, body, externalUrl, publishedAt, _createdAt, _updatedAt
}`;

/** Published news from the studio, newest first, in the site's news row shape; null to use the existing sources. */
export async function cmsNews(): Promise<NewsReleaseRow[] | null> {
  const rows = await cmsFetch<CmsNews[]>(NEWS_QUERY);
  if (!rows?.length) return null;
  return rows.map((r) => ({
    id: r._id,
    slug: r.slug,
    title: r.title,
    summary: text(r.summary ?? undefined) ?? null,
    body: text(r.body ?? undefined) ?? null,
    external_url: text(r.externalUrl ?? undefined) ?? null,
    cover_image_url: null,
    status: "published",
    published_at: r.publishedAt ?? null,
    created_at: r._createdAt ?? null,
    updated_at: r._updatedAt ?? null,
  }));
}

// ---- homepage ------------------------------------------------------------------------------------------

export type HomepageCopy = { heroHeadline: string; heroLead: string; filmCaption: string; ctaHeading: string; ctaText: string };

/** What the homepage says today; the studio's Homepage document overrides any field it fills in. */
export const HOMEPAGE_DEFAULTS: HomepageCopy = {
  heroHeadline: "Deployable shelters, camps and field hospitals",
  heroLead:
    "Expandable containers, soft-wall, inflatable and polar shelters that travel as cargo and stand up in minutes. Customers include the US Army, the Air National Guard, NATO and the Canadian Armed Forces, in more than 95 countries since 1981.",
  filmCaption: "Illustrative film made from Weatherhaven product photography",
  ctaHeading: "Tell us where you’re deploying",
  ctaText:
    "Share the mission, the climate and the number of people. A Weatherhaven expert will come back with a starting configuration, usually within 48 hours.",
};

export async function getHomepageCopy(): Promise<HomepageCopy> {
  const doc = await cmsFetch<Partial<Record<keyof HomepageCopy, string | null>>>(
    `*[_type == "homepage" && _id == "homepage"][0]{heroHeadline, heroLead, filmCaption, ctaHeading, ctaText}`,
  );
  if (!doc) return HOMEPAGE_DEFAULTS;
  return {
    heroHeadline: text(doc.heroHeadline ?? undefined) ?? HOMEPAGE_DEFAULTS.heroHeadline,
    heroLead: text(doc.heroLead ?? undefined) ?? HOMEPAGE_DEFAULTS.heroLead,
    filmCaption: text(doc.filmCaption ?? undefined) ?? HOMEPAGE_DEFAULTS.filmCaption,
    ctaHeading: text(doc.ctaHeading ?? undefined) ?? HOMEPAGE_DEFAULTS.ctaHeading,
    ctaText: text(doc.ctaText ?? undefined) ?? HOMEPAGE_DEFAULTS.ctaText,
  };
}
