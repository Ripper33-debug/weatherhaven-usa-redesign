import { describe, expect, it } from "vitest";
import { PRODUCTS } from "@/lib/products";
import { getProductInfoSheet, withProductInfoSheets } from "@/lib/product-info-sheets";

describe("product-info-sheets", () => {
  it("attaches Airbeam info sheet to airbeam-lp", () => {
    const base = PRODUCTS.find((p) => p.slug === "airbeam-lp");
    expect(base).toBeDefined();
    const merged = withProductInfoSheets(base!);
    expect(merged.downloads[0]).toMatchObject({
      type: "PDF",
      href: "/downloads/inflatable-airbeam-shelter.pdf",
    });
  });

  it("does not duplicate info sheet on second merge", () => {
    const base = PRODUCTS.find((p) => p.slug === "airbeam-lp")!;
    const merged = withProductInfoSheets(withProductInfoSheets(base));
    const pdfs = merged.downloads.filter((d) => d.type === "PDF");
    expect(pdfs).toHaveLength(1);
  });

  it("returns info sheet metadata for catalog cards", () => {
    expect(getProductInfoSheet("airbeam-lp")?.href).toBe("/downloads/inflatable-airbeam-shelter.pdf");
    expect(getProductInfoSheet("ehmecc")).toBeUndefined();
  });
});
