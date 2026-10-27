"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { btnMarketingLink } from "@/lib/cta-buttons";
import { ProductCatalogCard } from "@/components/products/ProductCatalogCard";
import { EmptyState } from "@/components/site/EmptyState";
import { ProductFilterBar, type ProductFilters } from "@/components/products/ProductFilterBar";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { StickyContactBar } from "@/components/marketing/StickyContactBar";
import { filterProducts, type Product } from "@/lib/products";
import { contactUrl } from "@/lib/contact-url";
import { featuredProductSlugs } from "@/lib/site";

const defaultFilters: ProductFilters = {
  mission: "all",
  environment: "all",
  mobility: "all",
  size: "all",
  search: "",
};

export function ConfigurableSolutionsShowcase({ products }: { products: Product[] }) {
  const [filters, setFilters] = useState<ProductFilters>(defaultFilters);
  const [gridKey, setGridKey] = useState(0);
  const featured = useMemo(
    () =>
      featuredProductSlugs
        .map((slug) => products.find((p) => p.slug === slug))
        .filter((p): p is Product => Boolean(p)),
    [products],
  );
  const filtered = useMemo(() => filterProducts(products, filters), [filters, products]);

  const handleFilterChange = (next: ProductFilters) => {
    setFilters(next);
    setGridKey((k) => k + 1);
  };

  const handleClear = () => {
    setFilters(defaultFilters);
    setGridKey((k) => k + 1);
  };

  return (
    <>
      <PageHero
        label="Shelter systems"
        title="Every configuration starts with your mission."
        description="Command, medical, camp, and expeditionary shelter systems — MECC, Series 4, Airbeam LP, Endurance, and the full Weatherhaven product line. Contact our team when you are ready to scope a program."
      />

      <ProductFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onClear={handleClear}
        defaultCollapsed
      />

      {!filters.search.trim() ? (
      <section className="bg-[#080a0c] px-6 py-12 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-10 border border-[#4d9fff]/20 bg-gradient-to-r from-[#4d9fff]/[0.08] to-transparent px-6 py-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <p className="text-[11px] font-medium tracking-[0.14em] text-[#4d9fff] uppercase">Recommended start</p>
              <p className="mt-2 text-lg text-white">EHMECC — extended-height command shelter</p>
              <p className="mt-1 max-w-xl text-sm text-[#8a9099]">
                Modular, climate-ready headquarters footprint. Ideal for command and SOF programs.
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:mt-0 sm:flex-row">
              <Link
                href="/configurable-solutions/ehmecc"
                className="inline-flex min-h-11 items-center justify-center border border-white px-5 py-2.5 text-sm font-medium text-white no-underline transition hover:bg-white/10"
              >
                View EHMECC
              </Link>
              <Link
                href={contactUrl({ system: "ehmecc", inquiry: "Demo Request" })}
                className="inline-flex min-h-11 items-center justify-center bg-white px-5 py-2.5 text-sm font-semibold text-[#080a0c] no-underline transition hover:bg-white/90"
              >
                Discuss EHMECC
              </Link>
            </div>
          </div>
          <p className="wh-marketing-eyebrow">Start here</p>
          <h2 className="wh-marketing-display mt-4 text-2xl text-white sm:text-3xl">Featured systems</h2>
          <p className="mt-3 max-w-2xl text-sm text-[#8a9099]">
            One click to open a system profile.{" "}
            <Link href="/contact" className={btnMarketingLink}>
              Contact our team <span aria-hidden>→</span>
            </Link>{" "}
            when you are ready to discuss your requirement.
          </p>
          <div className="mt-8 grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCatalogCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>
      ) : null}

      <section className="bg-[#080a0c] py-12 sm:py-16">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-12">
          <p className="mb-6 text-sm text-[#8a9099]">
            <Link href="/mission-solution-builder" className={`${btnMarketingLink} inline-flex`}>
              Mission solution builder <span aria-hidden>→</span>
            </Link>
          </p>
          <MarketingSection variant="slide-up-stagger" staggerMs={60} className="!p-0">
            <div key={gridKey} className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-3 wh-grid-fade-in">
              {filtered.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState
                    message={
                      filters.search.trim()
                        ? `No systems match “${filters.search.trim()}”. Try a product code like TRECC or clear the search.`
                        : "No systems match these filters. Try clearing filters or adjusting your selection."
                    }
                  />
                </div>
              ) : (
                filtered.map((product) => (
                  <div key={product.slug} data-reveal-child>
                    <ProductCatalogCard product={product} />
                  </div>
                ))
              )}
            </div>
          </MarketingSection>
        </div>
      </section>
      <StickyContactBar />
    </>
  );
}
