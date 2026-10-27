/**
 * Seed CMS cover photos for news releases and catalog products.
 * Applies CDN URLs (same as supabase/seed_cms_photos.sql) via Supabase service role.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-cms-media.mjs
 *   node --env-file=.env.local scripts/seed-cms-media.mjs --upload
 *
 * --upload: fetch CDN images and store in cms-media bucket (optional; slower).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const CDN = "https://eiec269001.blob.core.windows.net/site-content";
const cdn = (file) => `${CDN}/${file}`;

const PRODUCT_COVERS = {
  ateps: cdn("weatherhaven-military-redeployable.jpg"),
  bmecc: cdn("mecc6.jpg"),
  trecc: cdn("trecc1.jpg"),
  ehmecc: cdn("softshelter8.jpg"),
  mecc: cdn("mecc1.jpg"),
  endurance: cdn("polar-1.jpg"),
  polarhaven: cdn("polar-1.jpg"),
  "polar-chief": cdn("polar-1.jpg"),
  "series-1-5-2": cdn("softshelter6.jpg"),
  "series-4": cdn("softshelter6.jpg"),
  "airbeam-hp": cdn("softshelter6.jpg"),
  rdmss: cdn("weatherhaven-military-redeployable.jpg"),
  "airbeam-lp": cdn("softshelter4.jpg"),
  "mex-26": cdn("expandablecontainer1.jpg"),
  mts: cdn("softshelter5.jpg"),
  hercon: cdn("weatherhaven-medical-redeployable.jpg"),
  "non-expandable-iso-containers": cdn("expandablecontainer1.jpg"),
};

const NEWS_COVERS = {
  "weatherhaven-usa-program-update": cdn("weatherhaven-military-redeployable.jpg"),
  "expeditionary-camp-capability-brief": cdn("expandablecontainer1.jpg"),
  "mission-solution-builder-launch": cdn("softshelter6.jpg"),
};

const BUCKET = "cms-media";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i);
    let val = t.slice(i + 1);
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const uploadToBucket = process.argv.includes("--upload");

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function publicUrl(path) {
  return `${url.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function resolveCoverUrl(context, slug, cdnUrl) {
  if (!uploadToBucket) return cdnUrl;

  const res = await fetch(cdnUrl);
  if (!res.ok) throw new Error(`Fetch failed ${cdnUrl}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const ext = contentType.includes("png") ? "png" : "jpg";
  const stamp = Date.now();
  const path = `${context}/${slug}/${stamp}-seed.${ext}`;

  const { error } = await admin.storage.from(BUCKET).upload(path, buf, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(`Upload ${path}: ${error.message}`);
  return publicUrl(path);
}

async function seedNews() {
  let updated = 0;
  for (const [slug, cdnUrl] of Object.entries(NEWS_COVERS)) {
    const { data: row } = await admin.from("news_releases").select("cover_image_url").eq("slug", slug).maybeSingle();
    if (!row) {
      console.warn(`  skip news (missing row): ${slug}`);
      continue;
    }
    if (row.cover_image_url?.trim()) {
      console.log(`  skip news (has cover): ${slug}`);
      continue;
    }
    const coverUrl = await resolveCoverUrl("news", slug, cdnUrl);
    const { error } = await admin.from("news_releases").update({ cover_image_url: coverUrl }).eq("slug", slug);
    if (error) throw new Error(`news ${slug}: ${error.message}`);
    updated += 1;
    console.log(`  news cover: ${slug}`);
  }
  return updated;
}

async function seedProducts() {
  let updated = 0;
  for (const [slug, cdnUrl] of Object.entries(PRODUCT_COVERS)) {
    const { data: row } = await admin.from("catalog_products").select("data").eq("slug", slug).maybeSingle();
    if (!row) {
      console.warn(`  skip product (missing row): ${slug}`);
      continue;
    }
    const existing = row.data?.coverImageUrl?.trim();
    if (existing) {
      console.log(`  skip product (has cover): ${slug}`);
      continue;
    }
    const coverUrl = await resolveCoverUrl("products", slug, cdnUrl);
    const data = { ...row.data, coverImageUrl: coverUrl };
    const { error } = await admin.from("catalog_products").update({ data }).eq("slug", slug);
    if (error) throw new Error(`product ${slug}: ${error.message}`);
    updated += 1;
    console.log(`  product cover: ${slug}`);
  }
  return updated;
}

console.log(`Seeding CMS photos${uploadToBucket ? " (upload to bucket)" : " (CDN URLs)"}…`);
const newsCount = await seedNews();
const productCount = await seedProducts();
console.log(`Done — ${newsCount} news, ${productCount} products updated.`);
