"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import type { SofProduct } from "@/lib/sof-products";
import { sofSystemPath } from "@/lib/sof-products";
import { getSofProductImage } from "@/lib/sof-product-images";

export function SofProductCatalogCard({ product }: { product: SofProduct }) {
  const image = getSofProductImage(product.slug);

  return (
    <Link
      href={sofSystemPath(product.slug)}
      className="group relative isolate flex min-h-[300px] flex-col overflow-hidden border border-white/[0.08] transition hover:border-[#4d9fff]/35"
      onClick={() => void trackEvent("click", `SOF product — ${product.name}`)}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image.src}
          alt={image.alt}
          className={`absolute inset-0 h-full w-full brightness-[0.65] transition duration-500 group-hover:scale-[1.02] ${
            product.slug === "clam" || product.slug === "trecc"
              ? "object-contain object-center"
              : "object-cover object-center"
          }`}
        />
      ) : (
        <div className="absolute inset-0 bg-[#0d0f12]" />
      )}
      <div
        className="absolute inset-0 z-[1]"
        style={{ background: "linear-gradient(to top, rgba(8,10,12,0.92) 0%, rgba(8,10,12,0.25) 55%)" }}
      />
      <p className="absolute left-4 top-4 z-[2] text-[10px] font-medium tracking-[0.12em] text-[#4d9fff] uppercase">
        {product.classification}
      </p>
      <div className="absolute inset-x-0 bottom-0 z-[2] p-5">
        <p className="font-mono text-[11px] text-[#8a9099]">{product.code}</p>
        <p className="mt-1 text-xl font-medium text-white">{product.name}</p>
        <p className="mt-2 text-sm text-[#8a9099]">{product.subtitle}</p>
        <p className="mt-3 text-xs text-[#4d9fff] opacity-0 transition group-hover:opacity-100">
          View restricted brief →
        </p>
      </div>
    </Link>
  );
}
