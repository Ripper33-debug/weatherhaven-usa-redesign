/**
 * Scan public/products and emit src/lib/product-gallery-manifest.json.
 * Avoids fs.readdir in server routes (Vercel traces the whole folder into lambdas).
 *
 * Usage: node scripts/generate-product-gallery-manifest.mjs
 */
import fs from "node:fs";
import path from "node:path";

const IMAGE_EXT = /\.(jpe?g|webp|png)$/i;
const root = process.cwd();
const productsDir = path.join(root, "public", "products");
const outFile = path.join(root, "src", "lib", "product-gallery-manifest.json");

/** @type {Record<string, { cover?: string; gallery: string[] }>} */
const manifest = {};

if (fs.existsSync(productsDir)) {
  for (const entry of fs.readdirSync(productsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const slug = entry.name;
    const galleryDir = path.join(productsDir, slug, "gallery");
    /** @type {{ cover?: string; gallery: string[] }} */
    const item = { gallery: [] };

    const coverPath = path.join(productsDir, `${slug}.jpg`);
    if (fs.existsSync(coverPath)) {
      item.cover = `/products/${slug}.jpg`;
    }

    if (fs.existsSync(galleryDir)) {
      item.gallery = fs
        .readdirSync(galleryDir)
        .filter((file) => IMAGE_EXT.test(file))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
        .map((file) => `/products/${slug}/gallery/${file}`);
    }

    if (item.cover || item.gallery.length > 0) {
      manifest[slug] = item;
    }
  }

  for (const file of fs.readdirSync(productsDir)) {
    if (!IMAGE_EXT.test(file) || file === "README.txt") continue;
    const slug = file.replace(/\.(jpe?g|webp|png)$/i, "");
    if (manifest[slug]) continue;
    manifest[slug] = { cover: `/products/${file}`, gallery: [] };
  }
}

fs.writeFileSync(outFile, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${Object.keys(manifest).length} product gallery entries → ${path.relative(root, outFile)}`);
