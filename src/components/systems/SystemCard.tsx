import Image from "next/image";
import { ViewTransition } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { EXCLUDED_PRODUCT_IMAGES, getProductContent, showsFullName } from "@/lib/product-content";
import { productCover, productCoverNote } from "@/lib/product-covers";

/** How many grid columns a card covers, so a grid's last row can end full (see gridSpans). */
export type CardSpan = { sm?: 2; lg?: 2 | 3 };

/**
 * For n cards in a grid of 2 columns (sm) and 3 (lg), with `lead` cells taken before them on lg,
 * the span the last card needs so neither layout ends on a half-empty row.
 */
export function lastCardSpan(n: number, lead = 0): CardSpan | undefined {
  if (n === 0) return undefined;
  const sm = n % 2 === 1 ? 2 : undefined;
  const rem = (n + lead) % 3;
  const lg = rem === 1 ? 3 : rem === 2 ? 2 : undefined;
  return sm || lg ? { sm, lg } : undefined;
}

// The last card of a family stretches across the rest of its row. It stays a normal card (photo,
// then text), with a wider photo of the same height as its neighbours'.
const SPAN_CARD: Record<string, string> = {
  "sm": "sm:col-span-2 lg:col-span-1",
  "lg2": "lg:col-span-2",
  "lg3": "lg:col-span-3",
  "sm-lg2": "sm:col-span-2",
  "sm-lg3": "sm:col-span-2 lg:col-span-3",
};
const SPAN_MEDIA: Record<string, string> = {
  "sm": "sm:aspect-[8/3] lg:aspect-[4/3]",
  "lg2": "lg:aspect-[8/3]",
  "lg3": "lg:aspect-[4/1]",
  "sm-lg2": "sm:aspect-[8/3]",
  "sm-lg3": "sm:aspect-[8/3] lg:aspect-[4/1]",
};

/** Photo-led system card with the most useful published figures. */
export function SystemCard({
  product,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  blurDataURL,
  span,
}: {
  product: Product;
  sizes?: string;
  /** Tiny preview from src/data/image-blur.json, passed down by a server component. */
  blurDataURL?: string;
  /** Wide card that fills the rest of a grid's last row (see lastCardSpan). */
  span?: CardSpan;
}) {
  const spanKey = span ? [span.sm ? "sm" : "", span.lg ? `lg${span.lg}` : ""].filter(Boolean).join("-") : "";
  const content = getProductContent(product.slug);
  const specs = product.specs.slice(0, 3);
  const cms = product.coverImageUrl && !EXCLUDED_PRODUCT_IMAGES.has(product.coverImageUrl.trim()) ? product.coverImageUrl : undefined;
  // Substitute images say so (a related shelter's photo, or the system's 3D model).
  const coverNote = cms ? null : productCoverNote(product.slug);
  return (
    <article className={`v2-product-card group relative flex h-full flex-col bg-ink ${SPAN_CARD[spanKey] ?? ""}`}>
      {/* Shares a name with the product page's main photo, so the card morphs into it on navigation. */}
      <ViewTransition name={`system-photo-${product.slug}`} share="v2-morph" default="none">
        <div className={`v2-media-zoom relative aspect-[4/3] bg-hull ${SPAN_MEDIA[spanKey] ?? ""}`}>
          <Image
            src={productCover(product.slug, cms)}
            alt={`Weatherhaven ${product.name}`}
            fill
            sizes={spanKey ? "(min-width: 640px) 90vw, 100vw" : sizes}
            {...(blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {})}
            className="object-cover"
          />
          {coverNote ? (
            <p className="absolute bottom-2 left-2 bg-ink/75 px-2 py-1 text-[0.8125rem] text-snow/90 backdrop-blur-sm">{coverNote}</p>
          ) : null}
        </div>
      </ViewTransition>
      <div className={`flex flex-1 flex-col pt-5 ${spanKey ? "max-w-[40rem]" : ""}`}>
        <h3 className="v2-h3 text-snow">
          <Link href={`/configurable-solutions/${product.slug}`} className="no-underline transition-colors duration-300 after:absolute after:inset-0 group-hover:text-signal">
            {product.name}
          </Link>
        </h3>
        {showsFullName(product.name, product.subtitle) ? <p className="mt-1 text-[0.875rem] text-muted">{product.subtitle}</p> : null}
        <p className="mt-3 text-[0.95rem] leading-relaxed text-snow/85">{product.keySpec ?? content?.keySpec ?? product.description}</p>
        {specs.length > 0 ? (
          <dl className="mt-4 border-t border-line text-[0.875rem]">
            {specs.map((s) => (
              <div key={s.label} className="grid grid-cols-[8.5rem_1fr] gap-3 border-b border-line py-2">
                <dt className="v2-tech pt-[0.1em] text-muted">{s.label}</dt>
                <dd className="text-snow">{s.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-4 border-t border-line pt-3 text-[0.875rem] text-muted">Specifications on request.</p>
        )}
      </div>
    </article>
  );
}
