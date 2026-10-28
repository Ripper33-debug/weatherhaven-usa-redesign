// Builds src/data/image-blur.json: a tiny WebP (as a data URL) for every product photo,
// used as next/image blur placeholders so photos fade in from a soft preview instead of popping.
// Run after adding photos: node scripts/generate-blur-placeholders.mjs
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public");
const exts = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const out = {};

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (exts.has(path.extname(entry.name).toLowerCase())) {
      const buf = await sharp(full).resize(12, 9, { fit: "cover" }).webp({ quality: 40 }).toBuffer();
      out["/" + path.relative(root, full).split(path.sep).join("/")] = `data:image/webp;base64,${buf.toString("base64")}`;
    }
  }
}

await walk(path.join(root, "products"));
await writeFile(path.resolve("src/data/image-blur.json"), JSON.stringify(out));
console.log(`blur placeholders: ${Object.keys(out).length} images`);
