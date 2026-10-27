import { describe, expect, it } from "vitest";
import type { CatalogProductRow } from "./catalog-products";
import type { Product } from "./products";
import {
  hasRealCatalogRows,
  publishedProductsFromRows,
  resolveCanonicalProductSlug,
  resolvePublishedProductBySlug,
} from "./catalog-published";

const staticMecc: Product = {
  slug: "mecc",
  code: "MECC",
  name: "Static MECC",
  subtitle: "Static",
  tag: "TEST",
  missionTypes: ["c2"],
  environments: ["arctic"],
  mobilities: ["ground"],
  sizes: ["platoon"],
  description: "Static description",
  overview: ["Static"],
  features: [],
  specs: [],
  compareScores: {
    footprint: 7,
    personnel: 7,
    transport: 7,
    setupTime: 7,
    climate: 7,
    power: 7,
    priceRange: 6,
  },
  configurations: [],
  downloads: [],
  relatedSlugs: [],
};

function cmsRow(
  slug: string,
  status: "draft" | "published",
  name: string,
  sort_order: number,
): CatalogProductRow {
  return {
    id: `uuid-${slug}`,
    slug,
    status,
    sort_order,
    data: { ...staticMecc, slug, name },
    created_at: null,
    updated_at: null,
  };
}

describe("catalog-published", () => {
  it("maps legacy slugs to canonical product slugs", () => {
    expect(resolveCanonicalProductSlug("hqss")).toBe("ehmecc");
    expect(resolveCanonicalProductSlug("mecc")).toBe("mecc");
  });

  it("returns only published CMS rows in sort order", () => {
    const rows = [
      cmsRow("mecc", "published", "CMS MECC", 2),
      cmsRow("trecc", "draft", "CMS TRECC", 1),
      cmsRow("ateps", "published", "CMS ATEPS", 0),
    ];
    const products = publishedProductsFromRows(rows);
    expect(products.map((p) => p.slug)).toEqual(["ateps", "mecc"]);
    expect(products[1]?.name).toBe("CMS MECC");
  });

  it("ignores static fallback row ids", () => {
    const rows = [
      { ...cmsRow("mecc", "published", "CMS MECC", 0), id: "static-mecc" },
      cmsRow("trecc", "published", "CMS TRECC", 1),
    ];
    expect(hasRealCatalogRows(rows)).toBe(true);
    expect(publishedProductsFromRows(rows).map((p) => p.slug)).toEqual(["trecc"]);
  });

  it("prefers published CMS data over static fallback", () => {
    const row = cmsRow("mecc", "published", "CMS MECC", 0);
    const resolved = resolvePublishedProductBySlug("mecc", row, [staticMecc]);
    expect(resolved?.name).toBe("CMS MECC");
  });

  it("hides draft CMS products even when static fallback exists", () => {
    const row = cmsRow("mecc", "draft", "CMS MECC", 0);
    expect(resolvePublishedProductBySlug("mecc", row, [staticMecc])).toBeUndefined();
  });

  it("resolves legacy slug through CMS canonical row", () => {
    const row = cmsRow("ehmecc", "published", "CMS EHMECC", 0);
    const resolved = resolvePublishedProductBySlug("hqss", row, [staticMecc]);
    expect(resolved?.name).toBe("CMS EHMECC");
  });
});
