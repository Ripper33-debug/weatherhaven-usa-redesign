import { describe, expect, it } from "vitest";
import { resolveProductShareImageUrl, shareMetadataFromImage } from "./share-metadata";

describe("share-metadata", () => {
  it("prefers CMS cover over CDN", () => {
    const url = resolveProductShareImageUrl({
      slug: "hqss",
      coverImageUrl: "https://cdn.example/cover.jpg",
    } as import("@/lib/products").Product);
    expect(url).toBe("https://cdn.example/cover.jpg");
  });

  it("builds OG metadata when image present", () => {
    const meta = shareMetadataFromImage("/products/hqss.jpg", "HQSS");
    expect(meta.openGraph?.images?.[0]).toMatchObject({ url: "/products/hqss.jpg", alt: "HQSS" });
  });

  it("returns empty when no image", () => {
    expect(shareMetadataFromImage(null, "x")).toEqual({});
  });
});
