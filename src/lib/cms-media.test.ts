import { describe, expect, it } from "vitest";
import {
  buildCmsMediaPath,
  cmsMediaPublicUrl,
  sanitizeCmsMediaSlug,
  validateCmsMediaFile,
} from "./cms-media";

describe("cms-media", () => {
  it("validates allowed image types and size", () => {
    expect(validateCmsMediaFile({ type: "image/jpeg", size: 1024 })).toBeNull();
    expect(validateCmsMediaFile({ type: "application/pdf", size: 1024 })).toMatch(/JPEG/);
    expect(validateCmsMediaFile({ type: "image/png", size: 9 * 1024 * 1024 })).toMatch(/8 MB/);
  });

  it("builds stable storage paths", () => {
    const path = buildCmsMediaPath("products", "HQSS System!", "jpg");
    expect(path.startsWith("products/hqss-system/")).toBe(true);
    expect(path.endsWith(".jpg")).toBe(true);
  });

  it("sanitizes slugs and builds public URLs", () => {
    expect(sanitizeCmsMediaSlug("  My Product  ")).toBe("my-product");
    expect(cmsMediaPublicUrl("https://abc.supabase.co/", "products/hqss/1.jpg")).toBe(
      "https://abc.supabase.co/storage/v1/object/public/cms-media/products/hqss/1.jpg",
    );
  });
});
