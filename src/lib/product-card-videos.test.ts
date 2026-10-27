import { describe, expect, it } from "vitest";
import { getProductCardVideo, PRODUCT_CARD_VIDEOS } from "./product-card-videos";

describe("product-card-videos", () => {
  it("maps TRECC to owned card video", () => {
    expect(PRODUCT_CARD_VIDEOS.trecc?.src).toBe("/products/trecc-card.mp4");
    expect(getProductCardVideo("trecc")?.label).toMatch(/TRECC/i);
  });

  it("returns undefined for slugs without card video", () => {
    expect(getProductCardVideo("hqss")).toBeUndefined();
  });
});
