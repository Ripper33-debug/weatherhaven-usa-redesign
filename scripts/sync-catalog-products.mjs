/**
 * Sync catalog_products in Supabase to the 17 canonical Weatherhaven product lines.
 * Preserves CMS coverImageUrl from legacy slugs where mapped.
 *
 * Usage:
 *   node --env-file=.env.local scripts/sync-catalog-products.mjs
 *   node --env-file=.env.local scripts/sync-catalog-products.mjs --dry-run
 */
import { createClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

const PAYLOAD_PATH = resolve(process.cwd(), "scripts/.catalog-sync-payload.json");
const dryRun = process.argv.includes("--dry-run");

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

function exportPayloadFromSource() {
  execSync("npx vitest run src/lib/catalog-sync-export.test.ts", {
    stdio: "inherit",
    cwd: process.cwd(),
    env: { ...process.env, CATALOG_SYNC_EXPORT: "1" },
  });

  if (!existsSync(PAYLOAD_PATH)) {
    throw new Error("Failed to export catalog payload from TypeScript sources.");
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

exportPayloadFromSource();
const payload = JSON.parse(readFileSync(PAYLOAD_PATH, "utf8"));
unlinkSync(PAYLOAD_PATH);

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/** @type {Map<string, string>} */
const preservedCovers = new Map();

const { data: existing, error: listError } = await admin.from("catalog_products").select("slug, data");
if (listError) throw new Error(listError.message);

for (const row of existing ?? []) {
  const cover = row.data?.coverImageUrl?.trim();
  if (!cover) continue;
  const canonical = payload.legacy[row.slug] ?? row.slug;
  if (!preservedCovers.has(canonical)) preservedCovers.set(canonical, cover);
}

const rows = payload.products.map((product, index) => {
  const data = { ...product };
  const cover = preservedCovers.get(product.slug) ?? payload.covers[product.slug];
  if (cover) data.coverImageUrl = cover;
  return {
    slug: product.slug,
    status: "published",
    sort_order: index,
    data,
    updated_at: new Date().toISOString(),
  };
});

console.log(`Catalog sync: ${existing?.length ?? 0} existing → ${rows.length} canonical products`);
for (const row of rows) {
  const cover = row.data.coverImageUrl ? "cover ✓" : "cover —";
  console.log(`  ${String(row.sort_order).padStart(2, "0")} ${row.slug.padEnd(32)} ${row.data.name} (${cover})`);
}

if (dryRun) {
  console.log("\nDry run — no database changes.");
  process.exit(0);
}

const { error: deleteError } = await admin.from("catalog_products").delete().neq("slug", "");
if (deleteError) throw new Error(`Delete failed: ${deleteError.message}`);

const { error: insertError } = await admin.from("catalog_products").insert(rows);
if (insertError) throw new Error(`Insert failed: ${insertError.message}`);

console.log("\nDone — catalog_products synced to 17 canonical products.");
