import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { getProductDetailImages, mergeProductDetailImages } from "./product-gallery";
import { scanProductGalleryFromDisk } from "./product-gallery-scan";

const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "wh-products-"));
const productsRoot = path.join(tmpRoot, "public", "products");

function write(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, "test");
}

afterEach(() => {
  if (fs.existsSync(productsRoot)) {
    fs.rmSync(productsRoot, { recursive: true, force: true });
  }
});

describe("product-gallery", () => {
  it("lists gallery folder images in order", () => {
    write(path.join(productsRoot, "hqss", "gallery", "02-b.jpg"));
    write(path.join(productsRoot, "hqss", "gallery", "01-a.jpg"));

    expect(scanProductGalleryFromDisk(productsRoot, "hqss")).toEqual({
      gallery: ["/products/hqss/gallery/01-a.jpg", "/products/hqss/gallery/02-b.jpg"],
    });
  });

  it("builds detail list with cover before gallery", () => {
    const local = {
      cover: "/products/ehmecc.jpg",
      gallery: ["/products/hqss/gallery/01-field.jpg"],
    };
    const urls = mergeProductDetailImages("hqss", local);
    expect(urls[0]).toBe("/products/ehmecc.jpg");
    expect(urls[1]).toBe("/products/hqss/gallery/01-field.jpg");
  });

  it("skips CDN fallback when local images exist", () => {
    const urls = mergeProductDetailImages("hqss", { cover: "/products/ehmecc.jpg", gallery: [] });
    expect(urls).toEqual(["/products/ehmecc.jpg"]);
  });

  it("merges CMS URLs with local gallery files", () => {
    const urls = mergeProductDetailImages(
      "hqss",
      {
        cover: "/products/ehmecc.jpg",
        gallery: ["/products/hqss/gallery/01-field.jpg", "/products/hqss/gallery/02-interior.jpg"],
      },
      {
        coverImageUrl: "https://cdn.example/cover.jpg",
        galleryImageUrls: ["https://cdn.example/gallery-1.jpg"],
      },
    );

    expect(urls).toEqual([
      "/products/ehmecc.jpg",
      "/products/hqss/gallery/01-field.jpg",
      "/products/hqss/gallery/02-interior.jpg",
      "https://cdn.example/cover.jpg",
      "https://cdn.example/gallery-1.jpg",
    ]);
  });

  it("never returns the generated cut-away images", () => {
    const urls = getProductDetailImages("ehmecc");
    expect(urls.length).toBeGreaterThan(0);
    expect(urls).not.toContain("/products/ehmecc/gallery/02-EHMECC-and-Command-Post.jpg");
    expect(mergeProductDetailImages("hqss", { cover: "/products/hqss.jpg", gallery: [] })).not.toContain("/products/hqss.jpg");
  });

  it("reads bundled manifest for known slugs", () => {
    const urls = getProductDetailImages("mecc");
    expect(urls.length).toBeGreaterThan(0);
    expect(urls[0]).toBe("/products/mecc.jpg");
  });
});
