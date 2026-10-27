"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { pickProductsFromCatalog } from "@/lib/published-catalog";
import type { Product } from "@/lib/products";
import { usePublishedCatalog } from "@/lib/use-published-catalog";

const MAX_COMPARE = 3;

type ProductCompareContextValue = {
  selectedSlugs: string[];
  selectedProducts: Product[];
  toggleCompare: (slug: string) => void;
  removeFromCompare: (slug: string) => void;
  clearCompare: () => void;
  isSelected: (slug: string) => boolean;
  compareOpen: boolean;
  setCompareOpen: (open: boolean) => void;
};

const ProductCompareContext = createContext<ProductCompareContextValue | null>(null);

export function ProductCompareProvider({ children }: { children: React.ReactNode }) {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const catalog = usePublishedCatalog();

  const selectedProducts = useMemo(
    () => pickProductsFromCatalog(catalog, selectedSlugs),
    [catalog, selectedSlugs],
  );

  const toggleCompare = useCallback((slug: string) => {
    setSelectedSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, slug];
    });
  }, []);

  const removeFromCompare = useCallback((slug: string) => {
    setSelectedSlugs((prev) => prev.filter((s) => s !== slug));
  }, []);

  const clearCompare = useCallback(() => setSelectedSlugs([]), []);

  const isSelected = useCallback((slug: string) => selectedSlugs.includes(slug), [selectedSlugs]);

  const value = useMemo(
    () => ({
      selectedSlugs,
      selectedProducts,
      toggleCompare,
      removeFromCompare,
      clearCompare,
      isSelected,
      compareOpen,
      setCompareOpen,
    }),
    [
      selectedSlugs,
      selectedProducts,
      toggleCompare,
      removeFromCompare,
      clearCompare,
      isSelected,
      compareOpen,
    ],
  );

  return <ProductCompareContext.Provider value={value}>{children}</ProductCompareContext.Provider>;
}

const NOOP_COMPARE: ProductCompareContextValue = {
  selectedSlugs: [],
  selectedProducts: [],
  toggleCompare: () => {},
  removeFromCompare: () => {},
  clearCompare: () => {},
  isSelected: () => false,
  compareOpen: false,
  setCompareOpen: () => {},
};

export function useProductCompare(): ProductCompareContextValue {
  const ctx = useContext(ProductCompareContext);
  return ctx ?? NOOP_COMPARE;
}
