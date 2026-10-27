import type { CatalogProductRow } from "@/lib/catalog-products";
import { rowToProduct } from "@/lib/catalog-products";
import type { Product } from "@/lib/products";
import { withProductInfoSheets } from "@/lib/product-info-sheets";
import { LEGACY_PRODUCT_SLUG_REDIRECTS } from "@/lib/weatherhaven-product-lines";

export function isStaticCatalogRowId(id: string): boolean {
  return id.startsWith("static-");
}

export function resolveCanonicalProductSlug(slug: string): string {
  const normalized = slug.trim().toLowerCase();
  return LEGACY_PRODUCT_SLUG_REDIRECTS[normalized] ?? normalized;
}

export function hasRealCatalogRows(rows: CatalogProductRow[]): boolean {
  return rows.some((row) => !isStaticCatalogRowId(row.id));
}

/** Published CMS rows → public catalog (sorted). */
export function publishedProductsFromRows(rows: CatalogProductRow[]): Product[] {
  return rows
    .filter((row) => row.status === "published" && !isStaticCatalogRowId(row.id))
    .sort((a, b) => a.sort_order - b.sort_order || a.slug.localeCompare(b.slug))
    .map((row) => withProductInfoSheets(rowToProduct(row)));
}

/**
 * CMS row wins when Supabase is seeded. Draft CMS rows hide a product even if a static fallback exists.
 */
export function resolvePublishedProductBySlug(
  slug: string,
  row: CatalogProductRow | null | undefined,
  staticFallback: Product[],
): Product | undefined {
  const canonical = resolveCanonicalProductSlug(slug);

  if (row && !isStaticCatalogRowId(row.id) && row.slug === canonical) {
    if (row.status === "published") {
      return withProductInfoSheets(rowToProduct(row));
    }
    return undefined;
  }

  const base = staticFallback.find((p) => p.slug === canonical);
  return base ? withProductInfoSheets(base) : undefined;
}

export function applyStaticCatalogFallback(products: Product[]): Product[] {
  return products.map((product) => withProductInfoSheets(product));
}
