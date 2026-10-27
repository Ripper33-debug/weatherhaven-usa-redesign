"use client";

import { ProductImageSlot } from "@/components/products/ProductImageSlot";

export function CapabilityHeroVisual({
  productSlug,
  diagramLabel,
}: {
  productSlug: string;
  diagramLabel: string;
}) {
  return (
    <div className="wh-marketing-panel relative mt-10 overflow-hidden">
      <p className="absolute left-4 top-4 z-10 text-xs font-medium text-[#8a9099]">{diagramLabel}</p>
      <div className="relative aspect-[16/10] w-full">
        <ProductImageSlot slug={productSlug} priority sizes="(max-width: 1024px) 100vw, 60vw" brightness={0.88} />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080a0c]/80 via-transparent to-[#080a0c]/20"
          aria-hidden
        />
      </div>
    </div>
  );
}
