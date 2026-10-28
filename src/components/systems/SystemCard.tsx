import Image from "next/image";
import { ViewTransition } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { getProductContent } from "@/lib/product-content";
import { productCover } from "@/lib/product-covers";

/** Photo-led system card with the most useful published figures. */
export function SystemCard({ product, sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" }: { product: Product; sizes?: string }) {
  const content = getProductContent(product.slug);
  const specs = product.specs.slice(0, 3);
  return (
    <article className="group relative flex h-full flex-col bg-ink">
      {/* Shares a name with the product page's main photo, so the card morphs into it on navigation. */}
      <ViewTransition name={`system-photo-${product.slug}`} share="v2-morph">
        <div className="relative aspect-[4/3] overflow-hidden bg-hull">
          <Image
            src={productCover(product.slug, product.coverImageUrl)}
            alt={`Weatherhaven ${product.name}`}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
      </ViewTransition>
      <div className="flex flex-1 flex-col pt-5">
        <h3 className="v2-h3 text-snow">
          <Link href={`/configurable-solutions/${product.slug}`} className="no-underline after:absolute after:inset-0 group-hover:text-signal">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 text-[0.85rem] text-muted">{product.subtitle}</p>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-snow/85">{content?.keySpec ?? product.description}</p>
        {specs.length > 0 ? (
          <dl className="mt-4 border-t border-line text-[0.85rem]">
            {specs.map((s) => (
              <div key={s.label} className="grid grid-cols-[8.5rem_1fr] gap-3 border-b border-line py-2">
                <dt className="text-muted">{s.label}</dt>
                <dd className="text-snow">{s.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-4 border-t border-line pt-3 text-[0.85rem] text-muted">Specifications on request.</p>
        )}
      </div>
    </article>
  );
}
