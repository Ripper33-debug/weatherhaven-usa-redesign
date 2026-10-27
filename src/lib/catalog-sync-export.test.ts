import { describe, expect, it } from "vitest";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { PRODUCTS } from "./products";
import { CMS_PRODUCT_COVER_SEEDS } from "./cms-seed-data";
import { LEGACY_PRODUCT_SLUG_REDIRECTS } from "./weatherhaven-product-lines";

describe("catalog sync export", () => {
  it("exports payload json when CATALOG_SYNC_EXPORT=1", () => {
    if (process.env.CATALOG_SYNC_EXPORT !== "1") return;

    const out = resolve(process.cwd(), "scripts/.catalog-sync-payload.json");
    writeFileSync(
      out,
      JSON.stringify({
        products: PRODUCTS,
        covers: CMS_PRODUCT_COVER_SEEDS,
        legacy: LEGACY_PRODUCT_SLUG_REDIRECTS,
      }),
    );
    expect(PRODUCTS.length).toBe(17);
  });
});
