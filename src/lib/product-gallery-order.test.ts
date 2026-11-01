import { describe, expect, it } from "vitest";
import { orderProductGallery } from "@/lib/product-gallery-order";

describe("orderProductGallery", () => {
  it("puts the chosen field photos first and workshop shots last, keeping the rest in order", () => {
    const urls = [
      "/products/trecc/gallery/10-TRECC-T_deployed.jpg",
      "/products/trecc/gallery/03-x.jpg",
      "/products/trecc/gallery/08-TRECC-and-Car.jpg",
      "/products/trecc/gallery/12-y.jpg",
    ];
    expect(orderProductGallery("trecc", urls)).toEqual([
      "/products/trecc/gallery/08-TRECC-and-Car.jpg",
      "/products/trecc/gallery/03-x.jpg",
      "/products/trecc/gallery/12-y.jpg",
      "/products/trecc/gallery/10-TRECC-T_deployed.jpg",
    ]);
  });

  it("never adds photos the page doesn't have, and leaves unlisted systems alone", () => {
    expect(orderProductGallery("trecc", ["/a.jpg"])).toEqual(["/a.jpg"]);
    expect(orderProductGallery("polarhaven", ["/b.jpg", "/a.jpg"])).toEqual(["/b.jpg", "/a.jpg"]);
  });
});
