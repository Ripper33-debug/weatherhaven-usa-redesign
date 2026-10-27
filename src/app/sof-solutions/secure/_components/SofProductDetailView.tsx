"use client";

import Link from "next/link";
import { useState } from "react";
import type { SofProduct } from "@/lib/sof-products";
import { getSofProductsBySlugs, SOF_CATALOG_PATH } from "@/lib/sof-products";
import { getSofProductImage, getSofTreccGalleryImages } from "@/lib/sof-product-images";
import { ProductGallery } from "@/components/products/ProductGallery";
import { SofProductCatalogCard } from "./SofProductCatalogCard";
import { contactUrl } from "@/lib/contact-url";
import { btnMarketingLink, btnMarketingPrimary } from "@/lib/cta-buttons";
import { trackEvent } from "@/lib/analytics";

const TABS = ["Overview", "Specifications", "Configurations", "Release"] as const;
type Tab = (typeof TABS)[number];

export function SofProductDetailView({ product }: { product: SofProduct }) {
  const [tab, setTab] = useState<Tab>("Overview");
  const image = getSofProductImage(product.slug);
  const related = getSofProductsBySlugs(product.relatedSlugs);

  return (
    <>
      <section className="border-b border-white/[0.08]">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-10 lg:py-14">
          <div className="relative min-h-[280px] overflow-hidden border border-white/[0.08] bg-[#0d0f12] lg:col-span-7 lg:min-h-[480px]">
            {product.slug === "trecc" ? (
              <ProductGallery
                slug="trecc"
                images={getSofTreccGalleryImages()}
                brightness={0.9}
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
              />
            ) : image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.src}
                alt={image.alt}
                className="absolute inset-0 h-full w-full object-contain object-center brightness-[0.9]"
              />
            ) : (
              <div className="h-full w-full bg-[#0d0f12]" />
            )}
            <p className="absolute left-4 top-4 z-[2] text-[11px] font-medium tracking-[0.12em] text-[#4d9fff] uppercase">
              {product.classification}
            </p>
          </div>

          <div className="lg:col-span-5">
            <p className="font-mono text-sm text-[#8a9099]">{product.code}</p>
            <h1 className="font-serif mt-2 text-3xl leading-tight text-white sm:text-4xl">{product.name}</h1>
            <p className="mt-2 text-base text-[#4d9fff]">{product.subtitle}</p>
            <p className="mt-6 text-sm leading-relaxed text-[#8a9099]">{product.description}</p>
            <p className="mt-4 text-xs leading-relaxed text-[#8a9099]">{product.distribution}</p>

            <ul className="mt-8 space-y-3">
              {product.specs.slice(0, 4).map((s) => (
                <li key={s.label} className="border-l-2 border-[#4d9fff]/40 pl-4">
                  <p className="text-xs text-[#8a9099]">{s.label}</p>
                  <p className="mt-1 text-sm text-white">{s.value}</p>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link
                href={contactUrl({ system: product.slug, inquiry: "SOF Classified Brief" })}
                className={btnMarketingPrimary}
                onClick={() => void trackEvent("click", `SOF contact — ${product.name}`)}
              >
                Request program brief
              </Link>
              <Link href={SOF_CATALOG_PATH} className={btnMarketingLink}>
                ← All SOF systems
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0d0f12]">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
          <div className="flex flex-wrap gap-4 border-b border-white/[0.08] sm:gap-6">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`shrink-0 py-4 text-sm font-medium transition ${
                  tab === t ? "border-b-2 border-[#4d9fff] text-white" : "text-[#8a9099] hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="py-10 sm:py-12">
            {tab === "Overview" && (
              <div className="max-w-3xl space-y-5 text-sm leading-relaxed text-[#8a9099]">
                {product.overview.map((p) => (
                  <p key={p.slice(0, 48)}>{p}</p>
                ))}
                <div className="grid gap-6 pt-6 sm:grid-cols-3">
                  {product.features.map((f) => (
                    <div key={f.title}>
                      <p className="text-sm font-medium text-white">{f.title}</p>
                      <p className="mt-2 text-xs leading-relaxed text-[#8a9099]">{f.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "Specifications" && (
              <table className="w-full border-collapse text-left text-sm">
                <tbody>
                  {product.specs.map((s, i) => (
                    <tr key={s.label} className={i % 2 === 0 ? "bg-[#080a0c]" : "bg-transparent"}>
                      <th className="w-1/3 px-4 py-3 text-xs text-[#8a9099]">{s.label}</th>
                      <td className="px-4 py-3 text-white">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === "Configurations" && (
              <div className="grid gap-6 sm:grid-cols-2">
                {product.configurations.map((c) => (
                  <div key={c.title}>
                    <p className="font-medium text-white">{c.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-[#8a9099]">{c.description}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === "Release" && (
              <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-[#8a9099]">
                <p>
                  Full performance data, transport matrices, and integration drawings for {product.name} are not
                  distributed on this site. Contact your Weatherhaven program lead or submit a classified brief
                  request through the engineering desk.
                </p>
                <p className="text-xs">{product.distribution}</p>
                <Link href="/privacy" className="inline-block text-[#4d9fff] hover:underline">
                  Privacy & data handling policy
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-[#080a0c] py-14">
          <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-10">
            <p className="text-[11px] font-medium tracking-[0.14em] text-[#4d9fff] uppercase">Related SOF systems</p>
            <h2 className="font-serif mt-3 text-2xl text-white">Adjacent configurations</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {related.map((p) => (
                <SofProductCatalogCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
