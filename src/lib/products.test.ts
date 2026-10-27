import { describe, expect, it } from "vitest";
import { filterProducts, getProductBySlug, productMatchesSearch } from "./products";

describe("product search", () => {
  const trecc = getProductBySlug("trecc");
  const ehmecc = getProductBySlug("ehmecc");

  it("matches product code and slug", () => {
    expect(trecc).toBeDefined();
    expect(productMatchesSearch(trecc!, "trecc")).toBe(true);
    expect(productMatchesSearch(trecc!, "TRECC")).toBe(true);
    expect(productMatchesSearch(ehmecc!, "ehmecc")).toBe(true);
  });

  it("returns all products when search is empty", () => {
    expect(productMatchesSearch(trecc!, "")).toBe(true);
    expect(productMatchesSearch(trecc!, "   ")).toBe(true);
  });

  it("filters catalog by search query", () => {
    const results = filterProducts([trecc!, ehmecc!], {
      mission: "all",
      environment: "all",
      mobility: "all",
      size: "all",
      search: "trecc",
    });
    expect(results).toEqual([trecc]);
  });
});
