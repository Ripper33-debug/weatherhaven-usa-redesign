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
 * the span the last card needs so neither layout ends on a half-empty row. The wide card lays out
 * side by side: its photo keeps one column's width and its text takes the rest.
 */
export function lastCardSpan(n: number, lead = 0): CardSpan | undefined {
  if (n === 0) return undefined;
  const sm = n % 2 === 1 ? 2 : undefined;
  const rem = (n + lead) % 3;
  const lg = rem === 1 ? 3 : rem === 2 ? 2 : undefined;
  return sm || lg ? { sm, lg } : undefined;
}

const SPAN_CARD: Record<string, string> = {
  "sm": "sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-x-8 lg:col-span-1 lg:flex",
  "lg2": "lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-x-8",
  "lg3": "lg:col-span-3 lg:grid lg:grid-cols-3 lg:gap-x-8",
  "sm-lg2": "sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-x-8",
  "sm-lg3": "sm:col-span-2 sm:grid sm:grid-cols-2 sm:gap-x-8 lg:col-span-3 lg:grid-cols-3",
};
const SPAN_TEXT: Record<string, string> = {
  "sm": "sm:pt-0 lg:pt-5",
  "lg2": "lg:pt-0",
  "lg3": "lg:col-span-2 lg:pt-0",
  "sm-lg2": "sm:pt-0",
  "sm-lg3": "sm:pt-0 lg:col-span-2",
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
        <div className="v2-media-zoom relative aspect-[4/3] bg-hull">
          <Image
            src={productCover(product.slug, cms)}
            alt={`Weatherhaven ${product.name}`}
            fill
            sizes={sizes}
            {...(blurDataURL ? { placeholder: "blur" as const, blurDataURL } : {})}
            className="object-cover"
          />
          {coverNote ? (
            <p className="absolute bottom-2 left-2 bg-ink/75 px-2 py-1 text-[0.8125rem] text-snow/90 backdrop-blur-sm">{coverNote}</p>
          ) : null}
        </div>
      </ViewTransition>
      <div className={`flex flex-1 flex-col pt-5 ${SPAN_TEXT[spanKey] ?? ""}`}>
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
