import type { Product } from "@/lib/products";

/** Resolve slugs against the published CMS catalog. */
export function pickProductsFromCatalog(catalog: Product[], slugs: string[]): Product[] {
  return slugs
    .map((slug) => catalog.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));
}

export function findProductInCatalog(catalog: Product[], slug: string): Product | undefined {
  return catalog.find((p) => p.slug === slug);
}
