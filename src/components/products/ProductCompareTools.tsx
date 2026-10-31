"use client";

import { useSitePathname } from "@/hooks/useSitePathname";
import dynamic from "next/dynamic";
import { isProductCatalogPath } from "@/lib/marketing-pages";

const ProductCompareBar = dynamic(
  () => import("@/components/products/ProductCompareBar").then((m) => m.ProductCompareBar),
  { ssr: false },
);

const ProductCompareOverlay = dynamic(
  () => import("@/components/products/ProductCompareOverlay").then((m) => m.ProductCompareOverlay),
  { ssr: false },
);

export function ProductCompareTools() {
  const pathname = useSitePathname();
  if (!isProductCatalogPath(pathname)) return null;

  return (
    <>
      <ProductCompareBar />
      <ProductCompareOverlay />
    </>
  );
}
