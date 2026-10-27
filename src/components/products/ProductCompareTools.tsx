"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  if (!isProductCatalogPath(pathname)) return null;

  return (
    <>
      <ProductCompareBar />
      <ProductCompareOverlay />
    </>
  );
}
