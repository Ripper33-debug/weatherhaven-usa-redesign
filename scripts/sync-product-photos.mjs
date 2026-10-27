#!/usr/bin/env node
/**
 * Sync product photography from OneDrive `010 - Products` into public/products/{slug}/.
 * Run: node scripts/sync-product-photos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEST = path.join(ROOT, "public", "products");

const SOURCE =
  process.env.WEATHERHAVEN_PRODUCTS_SOURCE ??
  "/Users/barrycastelli/Downloads/OneDrive_2026-06-11/010 - Products";

const LINES = [
  { slug: "ateps", folder: "000 - ATEPS" },
  { slug: "bmecc", folder: "010 - BMECC" },
  { slug: "trecc", folder: "020 - TRECC" },
  { slug: "ehmecc", folder: "030 - EHMECC" },
  { slug: "mecc", folder: "040 - MECC" },
  { slug: "endurance", folder: "050 - Endurance" },
  { slug: "polarhaven", folder: "060 - Polarhaven" },
  { slug: "polar-chief", folder: "070 - Polar Chief" },
  { slug: "series-1-5-2", folder: "080 - Series 1.5 & 2" },
  { slug: "series-4", folder: "090 - Series 4" },
  { slug: "airbeam-hp", folder: "100 - Airbeam HP" },
  { slug: "rdmss", folder: "110 - RDMSS" },
  { slug: "airbeam-lp", folder: "120 - Airbeam LP" },
  { slug: "mex-26", folder: "130 - MEX-26" },
  { slug: "mts", folder: "140 - MTS" },
  { slug: "hercon", folder: "150 - HerCon" },
  { slug: "non-expandable-iso-containers", folder: "160 - Non-Expandable ISO Containers" },
];

const IMAGE_EXT = /\.(jpe?g|png|webp|tif{1,2})$/i;

function safeName(name) {
  return name.replace(/\s+/g, "-").replace(/[\[\]]/g, "");
}

function toWebJpeg(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (/\.(jpe?g|png|webp)$/i.test(src)) {
    fs.copyFileSync(src, dest);
    return;
  }
  execFileSync("sips", ["-s", "format", "jpeg", src, "--out", dest], { stdio: "pipe" });
}

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => path.join(dir, f));
}

function installLine({ slug, folder }) {
  const srcDir = path.join(SOURCE, folder);
  const files = listImages(srcDir);
  if (files.length === 0) {
    return { slug, skipped: true, reason: "no images" };
  }

  const galleryDir = path.join(DEST, slug, "gallery");
  fs.rmSync(galleryDir, { recursive: true, force: true });
  fs.mkdirSync(galleryDir, { recursive: true });

  const coverPath = path.join(DEST, `${slug}.jpg`);
  toWebJpeg(files[0], coverPath);

  const coverBase = path.basename(files[0]);
  let index = 1;
  for (const file of files) {
    if (path.basename(file) === coverBase) continue;
    const destName = `${String(index).padStart(2, "0")}-${safeName(path.basename(file)).replace(/\.(tif{1,2}|png|webp)$/i, ".jpg")}`;
    toWebJpeg(file, path.join(galleryDir, destName.replace(/\.jpg$/i, ".jpg")));
    index += 1;
  }

  return { slug, cover: path.basename(files[0]), gallery: index - 1 };
}

if (!fs.existsSync(SOURCE)) {
  console.error(`Source not found: ${SOURCE}`);
  process.exit(1);
}

const results = LINES.map(installLine);
console.log(JSON.stringify(results, null, 2));
execFileSync(process.execPath, ["scripts/generate-product-gallery-manifest.mjs"], { cwd: ROOT, stdio: "inherit" });
