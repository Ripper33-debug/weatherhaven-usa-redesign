"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { CapabilityHeroVisual } from "@/components/capabilities/CapabilityHeroVisual";
import { ProductCatalogCard } from "@/components/products/ProductCatalogCard";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { btnMarketingLink, btnMarketingPrimary } from "@/lib/cta-buttons";
import { contactUrl } from "@/lib/contact-url";
import { trackEvent } from "@/lib/analytics";
import {
  CAPABILITY_CATEGORIES,
  type CapabilityCategoryId,
} from "@/lib/capabilitiesExplorer";
import { getProductsBySlugs } from "@/lib/products";

export function CapabilitiesExplorer() {
  const [activeId, setActiveId] = useState<CapabilityCategoryId>("shelter");
  const [fade, setFade] = useState(true);

  const category = CAPABILITY_CATEGORIES.find((c) => c.id === activeId)!;
  const relatedProducts = getProductsBySlugs(category.relatedSlugs);
  const heroSlug = category.relatedSlugs[0] ?? "ehmecc";

  const select = (id: CapabilityCategoryId) => {
    if (id === activeId) return;
    void trackEvent("click", `Capability category — ${CAPABILITY_CATEGORIES.find((c) => c.id === id)?.label ?? id}`);
    setFade(false);
    window.setTimeout(() => {
      setActiveId(id);
      setFade(true);
    }, 150);
  };

  return (
    <>
      <PageHero
        label="Capabilities"
        title="Deployable shelter and camp infrastructure for every climate and terrain."
        description="Explore a capability category, then open related systems or contact our team — two steps to your next conversation."
      />

      <section className="bg-[#080a0c]">
        <div className="mx-auto max-w-[1400px] px-6 py-10 sm:px-6 lg:px-12 lg:py-14">
          <div>
            <div
              className="flex flex-wrap gap-2 border-b border-white/[0.08] pb-3 lg:hidden"
              role="tablist"
              aria-label="Capability categories"
            >
              {CAPABILITY_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={activeId === c.id}
                  aria-controls="capability-panel"
                  id={`capability-tab-mobile-${c.id}`}
                  onClick={() => select(c.id)}
                  className={`shrink-0 border px-3 py-2 text-[11px] font-medium tracking-wide transition ${
                    activeId === c.id
                      ? "border-[#4d9fff] bg-[#4d9fff]/10 text-[#4d9fff]"
                      : "border-white/10 text-[#8a9099] hover:border-white/25 hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="grid lg:grid-cols-12 lg:gap-12">
              <nav className="hidden lg:col-span-4 lg:block" aria-label="Capability categories">
                <ul className="py-2" role="tablist">
                  {CAPABILITY_CATEGORIES.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={activeId === c.id}
                        aria-controls="capability-panel"
                        id={`capability-tab-${c.id}`}
                        onClick={() => select(c.id)}
                        className={`w-full border-l-2 px-6 py-4 text-left text-sm transition ${
                          activeId === c.id
                            ? "border-[#4d9fff] bg-[#4d9fff]/[0.06] text-white"
                            : "border-transparent text-[#8a9099] hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {c.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              <div
                id="capability-panel"
                role="tabpanel"
                aria-labelledby={`capability-tab-${activeId}`}
                className={`p-6 transition-opacity duration-300 sm:p-8 lg:col-span-8 ${
                  fade ? "opacity-100" : "opacity-0"
                }`}
              >
                <p className="wh-marketing-label">{category.label}</p>
                <h2 className="wh-marketing-display mt-4 text-2xl leading-[1.08] text-white sm:text-3xl lg:text-4xl">
                  {category.headline}
                </h2>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-[#8a9099] sm:text-base">
                  {category.paragraphs.map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                </div>
                <ul className="mt-6 space-y-2">
                  {category.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm text-[#8a9099]">
                      <span className="mt-2 h-1 w-1 shrink-0 bg-[#4d9fff]" />
                      {f}
                    </li>
                  ))}
                </ul>

                <CapabilityHeroVisual productSlug={heroSlug} diagramLabel={category.diagramLabel} />

                <p className="mt-10 wh-marketing-label">Related systems</p>
                <div className="mt-4 grid gap-0.5 sm:grid-cols-2">
                  {relatedProducts.map((p) => (
                    <ProductCatalogCard key={p.slug} product={p} />
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap gap-6">
                  <Link href="/configurable-solutions" className={`inline-flex ${btnMarketingLink}`}>
                    View all shelter systems <span aria-hidden>→</span>
                  </Link>
                  <Link
                    href={contactUrl({ system: heroSlug, inquiry: "Program Requirement" })}
                    className={`inline-flex ${btnMarketingLink}`}
                  >
                    Discuss this capability <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <MarketingSection className="mx-auto max-w-[1400px] px-6 py-20 sm:px-6 sm:py-28 lg:px-12">
        <p data-reveal-child className="wh-marketing-eyebrow">
          Program engagement
        </p>
        <h2 data-reveal-child className="wh-marketing-display mt-6 max-w-2xl text-3xl text-white sm:text-4xl">
          Talk to a Weatherhaven Expert about your requirement.
        </h2>
        <p data-reveal-child className="wh-marketing-lead mt-4 max-w-2xl">
          Controlled technical exchanges matched to clearance and program status.
        </p>
        <Link data-reveal-child href="/contact" className={`mt-8 inline-flex ${btnMarketingPrimary}`}>
          Contact our team
        </Link>
      </MarketingSection>
    </>
  );
}
