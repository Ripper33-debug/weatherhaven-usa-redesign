import fs from "node:fs";
import path from "node:path";
import type { LocalProductImages } from "@/lib/product-gallery";

const IMAGE_EXT = /\.(jpe?g|webp|png)$/i;

/** Scan disk — used by unit tests only. Production uses product-gallery-manifest.json. */
export function scanProductGalleryFromDisk(productsRoot: string, slug: string): LocalProductImages {
  const result: LocalProductImages = { gallery: [] };
  const coverFile = path.join(productsRoot, `${slug}.jpg`);
  if (fs.existsSync(coverFile)) {
    result.cover = `/products/${slug}.jpg`;
  }

  const galleryDir = path.join(productsRoot, slug, "gallery");
  if (fs.existsSync(galleryDir)) {
    result.gallery = fs
      .readdirSync(galleryDir)
      .filter((file) => IMAGE_EXT.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((file) => `/products/${slug}/gallery/${file}`);
  }

  return result;
}
