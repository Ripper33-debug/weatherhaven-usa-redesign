import type { Product } from "@/lib/products";

export type ProductInfoSheet = {
  name: string;
  href: string;
  size: string;
};

/** Local PDF info sheets keyed by catalog slug. */
export const PRODUCT_INFO_SHEETS: Partial<Record<string, ProductInfoSheet>> = {
  "airbeam-lp": {
    name: "Inflatable Airbeam Shelter — info sheet",
    href: "/downloads/inflatable-airbeam-shelter.pdf",
    size: "674 KB",
  },
};

export function getProductInfoSheet(product: Product | string): ProductInfoSheet | undefined {
  const slug = typeof product === "string" ? product : product.slug;
  return PRODUCT_INFO_SHEETS[slug];
}

export function withProductInfoSheets(product: Product): Product {
  const sheet = getProductInfoSheet(product);
  if (!sheet) return product;
  if (product.downloads.some((d) => d.href === sheet.href)) return product;

  return {
    ...product,
    downloads: [
      { name: sheet.name, type: "PDF", size: sheet.size, href: sheet.href },
      ...product.downloads,
    ],
  };
}
