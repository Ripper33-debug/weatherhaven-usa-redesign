"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/products";
import { PRODUCTS } from "@/lib/products";

let cached: Product[] | null = null;
let inflight: Promise<Product[]> | null = null;

async function fetchPublishedCatalog(): Promise<Product[]> {
  if (cached) return cached;
  if (inflight) return inflight;
  inflight = fetch("/api/catalog/products")
    .then(async (res) => {
      if (!res.ok) return PRODUCTS;
      const data = (await res.json()) as { products?: Product[] };
      const list = data.products?.length ? data.products : PRODUCTS;
      cached = list;
      return list;
    })
    .catch(() => PRODUCTS)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Client hook — published shelter catalog from CMS (static fallback when API unavailable). */
export function usePublishedCatalog(): Product[] {
  const [catalog, setCatalog] = useState<Product[]>(cached ?? PRODUCTS);

  useEffect(() => {
    void fetchPublishedCatalog().then(setCatalog);
  }, []);

  return catalog;
}

export function invalidatePublishedCatalogCache() {
  cached = null;
}
