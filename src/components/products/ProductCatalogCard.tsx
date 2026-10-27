"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import type { Product } from "@/lib/products";
import { useProductCompare } from "@/contexts/ProductCompareContext";
import { ProductCardMedia } from "@/components/products/ProductCardMedia";
import { isMarketingPage, isProductCatalogPath } from "@/lib/marketing-pages";
import { getProductInfoSheet } from "@/lib/product-info-sheets";

export function ProductCatalogCard({ product }: { product: Product }) {
  const pathname = usePathname();
  const marketing = isMarketingPage(pathname);
  const catalogPath = isProductCatalogPath(pathname);
  const { isSelected, toggleCompare, selectedSlugs } = useProductCompare();
  const selected = isSelected(product.slug);
  const compareFull = selectedSlugs.length >= 3 && !selected;
  const infoSheet = getProductInfoSheet(product);
  const href = `/configurable-solutions/${product.slug}`;

  return (
    <div
      className={`group relative isolate flex min-h-[280px] flex-col overflow-hidden sm:min-h-[320px] ${
        marketing
          ? "border border-white/[0.08] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-white/[0.22] hover:shadow-[0_20px_56px_rgba(0,0,0,0.5)]"
          : "wh-card-modern rounded border border-transparent"
      } ${selected && !marketing ? "border-[#4d9fff]" : ""}`}
    >
      <Link
        href={href}
        className="absolute inset-0 z-[1]"
        aria-label={`View ${product.name}`}
        onClick={() => void trackEvent("click", `Product card viewed — ${product.name}`)}
      />
      <ProductCardMedia
        slug={product.slug}
        preferredSrc={product.coverImageUrl}
        brightness={0.72}
        sizes="(max-width: 640px) 100vw, 33vw"
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{ background: "linear-gradient(to top, rgba(8,10,12,0.88) 0%, rgba(8,10,12,0.2) 55%)" }}
      />

      {catalogPath && (
        <div
          className={`absolute right-4 top-4 z-[3] transition-opacity duration-200 ${
            selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <label className="flex cursor-pointer items-center gap-2 border border-white/20 bg-black/60 px-2 py-1.5">
            <input
              type="checkbox"
              checked={selected}
              disabled={compareFull}
              onChange={() => toggleCompare(product.slug)}
              className="accent-[#4d9fff]"
            />
            <span className="text-[10px] font-medium text-white/60">Compare</span>
          </label>
        </div>
      )}

      <p className="pointer-events-none absolute left-4 top-4 z-[2] text-[10px] font-medium text-[#4d9fff]">
        {product.tag}
      </p>

      {infoSheet ? (
        <a
          href={infoSheet.href}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-4 bottom-[4.75rem] z-[3] border border-white/20 bg-black/70 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.12em] text-white/80 uppercase transition hover:border-white/35 hover:text-white"
          onClick={() => void trackEvent("click", `Info sheet — ${product.name}`)}
        >
          Info sheet
        </a>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-4 p-4 sm:p-5">
        <div>
          <p className="text-lg font-medium leading-snug text-white sm:text-xl">{product.name}</p>
        </div>
        <span className="shrink-0 text-lg text-white/70 transition group-hover:text-white" aria-hidden>
          →
        </span>
      </div>
    </div>
  );
}
