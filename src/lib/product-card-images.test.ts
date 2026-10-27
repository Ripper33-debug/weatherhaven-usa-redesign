import { describe, expect, it } from "vitest";
import { getProductCardImage, PRODUCT_CARD_IMAGES } from "./product-card-images";

describe("product-card-images", () => {
  it("maps TRECC to UK field photography", () => {
    expect(PRODUCT_CARD_IMAGES.trecc).toBe("/products/trecc/gallery/13-TRECC-in-UK.png");
    expect(getProductCardImage("trecc")).toBe("/products/trecc/gallery/13-TRECC-in-UK.png");
  });

  it("returns undefined for slugs without card image", () => {
    expect(getProductCardImage("mecc")).toBeUndefined();
  });
});
