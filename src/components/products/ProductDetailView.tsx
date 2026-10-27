"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductCatalogCard } from "@/components/products/ProductCatalogCard";
import { ProductGallery } from "@/components/products/ProductGallery";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { trackEvent } from "@/lib/analytics";
import { contactUrl } from "@/lib/contact-url";
import { btnMarketingLink, btnMarketingPrimary } from "@/lib/cta-buttons";
import { getProductsBySlugs, type Product } from "@/lib/products";
import { pickProductsFromCatalog } from "@/lib/published-catalog";
import { useProductCompare } from "@/contexts/ProductCompareContext";

const TABS = ["Overview", "Specifications", "Configurations", "Resources"] as const;
type Tab = (typeof TABS)[number];

export function ProductDetailView({
  product,
  galleryImages = [],
  showCompare = false,
  catalog = [],
}: {
  product: Product;
  galleryImages?: string[];
  showCompare?: boolean;
  /** Published catalog for resolving related systems (CMS when available). */
  catalog?: Product[];
}) {
  const [tab, setTab] = useState<Tab>("Overview");
  const { toggleCompare, isSelected } = useProductCompare();
  const related =
    catalog.length > 0
      ? pickProductsFromCatalog(catalog, product.relatedSlugs)
      : getProductsBySlugs(product.relatedSlugs);

  const onTab = (t: Tab) => {
    setTab(t);
    void trackEvent("click", `Product detail tab — ${t}`);
  };

  return (
    <>
      <section className="border-b border-white/[0.08]">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-10 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-12 lg:py-14">
          <div className="relative min-h-[360px] border border-white/[0.08] lg:col-span-7 lg:min-h-[540px]">
            <ProductGallery
              slug={product.slug}
              images={galleryImages}
              brightness={0.95}
              showCaption
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            <p className="absolute left-4 top-4 z-[2] text-[11px] font-medium tracking-wide text-[#4d9fff] uppercase">
              {product.tag}
            </p>
          </div>

          <div className="lg:col-span-5">
            <p className="wh-marketing-label">{product.tag}</p>
            <p className="mt-3 text-sm text-[#8a9099]">{product.code}</p>
            <h1 className="wh-marketing-display mt-2 text-3xl leading-[1.05] text-white sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>
            <p className="mt-6 text-base leading-relaxed text-[#8a9099]">{product.description}</p>

            <ul className="mt-8 space-y-3">
              {product.specs.slice(0, 4).map((s) => (
                <li key={s.label} className="border-l-2 border-[#4d9fff]/40 pl-4">
                  <p className="text-xs text-[#8a9099]">{s.label}</p>
                  <p className="mt-1 text-sm text-white">{s.value}</p>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href={contactUrl({ system: product.slug, inquiry: "Program Requirement" })}
                className={btnMarketingPrimary}
                onClick={() => void trackEvent("click", `Contact — ${product.name}`)}
              >
                Discuss this system
              </Link>
              <Link
                href="/mission-solution-builder"
                className={btnMarketingLink}
                onClick={() => void trackEvent("click", `Mission builder — ${product.name}`)}
              >
                Mission solution builder <span aria-hidden>→</span>
              </Link>
            </div>
            {showCompare && (
              <button
                type="button"
                onClick={() => toggleCompare(product.slug)}
                className={`mt-4 text-sm transition ${isSelected(product.slug) ? "text-[#4d9fff]" : "text-[#8a9099] hover:text-white"}`}
              >
                {isSelected(product.slug) ? "Remove from compare" : "Add to compare"}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#0d0f12]">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-6 lg:px-12">
          <div
            className="flex flex-wrap gap-4 border-b border-white/[0.08] sm:gap-6"
            role="tablist"
            aria-label="Product information"
          >
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                id={`product-tab-${t}`}
                aria-selected={tab === t}
                aria-controls={`product-panel-${t}`}
                onClick={() => onTab(t)}
                className={`shrink-0 py-4 text-sm font-medium transition ${
                  tab === t ? "border-b-2 border-[#4d9fff] text-white" : "text-[#8a9099] hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div
            className="py-10 sm:py-12"
            role="tabpanel"
            id={`product-panel-${tab}`}
            aria-labelledby={`product-tab-${tab}`}
          >
            {tab === "Overview" && (
              <div className="max-w-3xl space-y-5 text-sm leading-relaxed text-[#8a9099] sm:text-base">
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

            {tab === "Resources" && (
              <ul className="divide-y divide-white/[0.08]">
                {product.downloads.map((d) => {
                  const external = d.href.startsWith("http");
                  return (
                    <li key={d.name} className="flex flex-wrap items-center justify-between gap-4 py-4">
                      <div>
                        <p className="text-sm font-medium text-white">{d.name}</p>
                        <p className="mt-1 text-xs text-[#8a9099]">
                          {d.type}
                          {d.size !== "—" ? ` · ${d.size}` : ""}
                        </p>
                      </div>
                      <a
                        href={d.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className={btnMarketingLink}
                        onClick={() => void trackEvent("click", `Resource — ${d.name}`)}
                      >
                        {external ? "Open" : "View"} <span aria-hidden>→</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-[#080a0c] py-14 sm:py-16">
          <div className="mx-auto max-w-[1400px] px-6 sm:px-6 lg:px-12">
            <MarketingSection>
              <p className="wh-marketing-eyebrow" data-reveal-child>
                Related systems
              </p>
              <h2 data-reveal-child className="wh-marketing-display mt-4 text-2xl text-white sm:text-3xl">
                Explore adjacent configurations
              </h2>
              <div data-reveal-child className="mt-8 grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <ProductCatalogCard key={p.slug} product={p} />
                ))}
              </div>
            </MarketingSection>
          </div>
        </section>
      )}
    </>
  );
}
