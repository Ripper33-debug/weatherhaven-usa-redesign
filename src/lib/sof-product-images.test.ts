import { describe, expect, it } from "vitest";
import { getSofProductImage } from "./sof-product-images";

describe("sof-product-images", () => {
  it("uses local CLAM photography", () => {
    expect(getSofProductImage("clam")).toEqual({
      src: "/sof/clam.jpg",
      alt: "CLAM compact lightweight adaptable module in arctic deployment with winter camouflage shelters",
    });
  });

  it("uses public catalog TRECC photography", () => {
    const image = getSofProductImage("trecc");
    expect(image?.src).toBe("/products/trecc/gallery/13-TRECC-in-UK.png");
    expect(image?.alt).toContain("TRECC");
  });
});
