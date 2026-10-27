"use client";

import Image from "next/image";
import { useState } from "react";
import { getProductCardImage } from "@/lib/product-card-images";
import { getProductImage } from "@/lib/product-images";

type Props = {
  slug: string;
  preferredSrc?: string;
  className?: string;
  brightness?: number;
  showCaption?: boolean;
  priority?: boolean;
  sizes?: string;
};

export function ProductImageSlot({
  slug,
  preferredSrc,
  className = "",
  brightness = 0.92,
  showCaption = false,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: Props) {
  const meta = getProductImage(slug);
  const cardSrc = getProductCardImage(slug);
  const sources: string[] = [];
  if (preferredSrc?.trim()) sources.push(preferredSrc.trim());
  else if (cardSrc) sources.push(cardSrc);
  sources.push(`/products/${slug}.jpg`);
  if (meta?.src) sources.push(meta.src);

  const [sourceIndex, setSourceIndex] = useState(0);
  const src = sources[sourceIndex];
  const exhausted = sourceIndex >= sources.length;
  const alt = meta?.alt ?? "Weatherhaven shelter system";

  return (
    <div className={`absolute inset-0 z-0 overflow-hidden ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(145deg, #121820 0%, #080a0c 50%, #0d0f12 100%)",
        }}
        aria-hidden
      />

      {!exhausted && src ? (
        <>
          <Image
            key={src}
            src={src}
            alt={alt}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes={sizes}
            className={
              slug === "trecc" || slug === "clam"
                ? "object-contain object-center"
                : "object-cover object-center"
            }
            style={{ filter: `brightness(${brightness})` }}
            onError={() => setSourceIndex((i) => i + 1)}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(8,10,12,0.72) 0%, rgba(8,10,12,0.12) 50%, transparent 100%)",
            }}
            aria-hidden
          />
        </>
      ) : null}

      {showCaption && meta && !exhausted ? (
        <p className="absolute bottom-3 left-4 right-4 z-[2] text-[10px] tracking-wide text-white/40">
          Product imagery · Weatherhaven
        </p>
      ) : null}
    </div>
  );
}
