/**
 * Loads the site's current content into the Sanity studio, so editors start from what's live:
 * the homepage text, every system's text and figures, the three program stories (photos uploaded
 * to Sanity) and the news list. Team members are left for Weatherhaven to add.
 *
 *   SANITY_API_WRITE_TOKEN=… NEXT_PUBLIC_SANITY_PROJECT_ID=… \
 *     npx vite-node --config vitest.config.ts scripts/cms/import-to-sanity.ts [--dry-run]
 *
 * Safe to run again: documents have fixed IDs and are replaced, and photos are uploaded once
 * (Sanity de-duplicates identical files). Use a token with Editor rights and delete it afterwards.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@sanity/client";
import { applyStaticCatalogFallback } from "@/lib/catalog-published";
import { LEGACY_NEWS_RELEASES } from "@/lib/news-releases";
import { getProductContent } from "@/lib/product-content";
import { PRODUCTS } from "@/lib/products";
import { FLAGSHIP_STORIES, type StoryImage } from "@/lib/stories";
import { HOMEPAGE_DEFAULTS } from "@/sanity/content";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const dryRun = process.argv.includes("--dry-run");
const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
if (!dryRun && (!projectId || !token)) {
  console.error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN (or pass --dry-run).");
  process.exit(1);
}
const client = dryRun ? null : createClient({ projectId, dataset, apiVersion, token, useCdn: false });

let keyN = 0;
const key = () => `k${(keyN++).toString(36).padStart(4, "0")}`;
const keyed = <T extends object>(items: T[]) => items.map((item) => ({ _key: key(), ...item }));

const uploaded = new Map<string, string>();
async function imageRef(src: string): Promise<{ _type: "image"; asset: { _type: "reference"; _ref: string } } | undefined> {
  if (!src.startsWith("/")) return undefined; // only the site's own files
  if (!client) return undefined;
  let id = uploaded.get(src);
  if (!id) {
    const file = path.join(process.cwd(), "public", decodeURIComponent(src));
    const asset = await client.assets.upload("image", readFileSync(file), { filename: path.basename(file) });
    id = asset._id;
    uploaded.set(src, id);
  }
  return { _type: "image", asset: { _type: "reference", _ref: id } };
}

async function photo(p: StoryImage) {
  return { image: await imageRef(p.src), legacySrc: p.src, alt: p.alt, caption: p.caption || undefined };
}

async function main() {
  const docs: Record<string, unknown>[] = [];

  docs.push({ _id: "homepage", _type: "homepage", ...HOMEPAGE_DEFAULTS });

  for (const p of applyStaticCatalogFallback(PRODUCTS)) {
    const content = getProductContent(p.slug);
    docs.push({
      _id: `product-${p.slug}`,
      _type: "product",
      slug: p.slug,
      fullName: p.subtitle || undefined,
      description: p.description || undefined,
      keySpec: content?.keySpec,
      specs: keyed(p.specs.map((s) => ({ label: s.label, value: s.value }))),
      highlights: keyed(p.features.map((f) => ({ title: f.title, description: f.description }))),
      overview: p.overview.filter((o) => o.trim()),
      configurations: keyed(p.configurations.map((c) => ({ title: c.title, description: c.description }))),
    });
  }

  for (const [i, s] of FLAGSHIP_STORIES.entries()) {
    docs.push({
      _id: `story-${s.slug}`,
      _type: "story",
      title: s.title,
      slug: { _type: "slug", current: s.slug },
      dek: s.dek,
      place: s.place,
      when: s.when,
      order: i + 1,
      systems: s.systems,
      hero: await photo(s.hero),
      heroModel: s.hero.model,
      numbers: keyed(s.numbers.map((n) => ({ value: n.value, label: n.label }))),
      timeline: keyed(s.timeline.map((t) => ({ date: t.date, text: t.text }))),
      sections: keyed(s.sections.map((sec) => ({ heading: sec.heading, paragraphs: sec.paragraphs }))),
      photos: keyed(await Promise.all(s.photos.map(photo))),
      quote: s.quote,
      note: s.note,
      sources: keyed(s.sources.map((src) => ({ label: src.label, href: src.href, own: src.own ?? false }))),
      deploymentStoryId: s.deploymentStoryId,
    });
  }

  for (const n of LEGACY_NEWS_RELEASES) {
    if (n.status !== "published" || !n.published_at) continue;
    docs.push({
      _id: `news-${n.slug}`,
      _type: "newsRelease",
      title: n.title,
      slug: { _type: "slug", current: n.slug },
      publishedAt: n.published_at,
      summary: n.summary,
      externalUrl: n.external_url ?? undefined,
      body: n.body ?? undefined,
    });
  }

  const counts = docs.reduce<Record<string, number>>((acc, d) => ({ ...acc, [String(d._type)]: (acc[String(d._type)] ?? 0) + 1 }), {});
  console.log(dryRun ? "Dry run, nothing written:" : "Writing:", counts);
  if (!client) return;
  const tx = client.transaction();
  for (const d of docs) tx.createOrReplace(d as { _id: string; _type: string });
  await tx.commit();
  console.log(`Done: ${docs.length} documents, ${uploaded.size} photos uploaded.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
