import { describe, expect, it } from "vitest";
import {
  catalogProductHref,
  createDefaultCatalogProduct,
  slugifyProductName,
} from "./catalog-products";

describe("catalog-products", () => {
  it("slugifies product names", () => {
    expect(slugifyProductName("HQSS — Command")).toBe("hqss-command");
    expect(slugifyProductName("x")).toBe("system");
  });

  it("builds catalog detail href", () => {
    expect(catalogProductHref("hqss")).toBe("/configurable-solutions/hqss");
  });

  it("creates default product with slug", () => {
    const p = createDefaultCatalogProduct("Test System");
    expect(p.slug).toBe("test-system");
    expect(p.overview.length).toBeGreaterThan(0);
  });
});
