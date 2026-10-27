"use client";

import Link from "next/link";
import { ProductGallery } from "@/components/products/ProductGallery";
import { trackEvent } from "@/lib/analytics";
import { btnMarketingOutline, btnMarketingPrimary } from "@/lib/cta-buttons";
import { getSofTreccGalleryImages } from "@/lib/sof-product-images";
import { sofSystemPath } from "@/lib/sof-products";

const treccImages = getSofTreccGalleryImages();

export function SofTreccFeatured() {
  return (
    <section className="mt-10 overflow-hidden border border-[#4d9fff]/25 bg-gradient-to-br from-[#0d0f12] via-[#080a0c] to-[#0a1628]">
      <div className="grid lg:grid-cols-[1.1fr_1fr]">
        <div className="relative min-h-[220px] sm:min-h-[280px] lg:min-h-[360px]">
          <ProductGallery
            slug="trecc"
            images={treccImages}
            brightness={0.72}
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
          <div
            className="pointer-events-none absolute inset-0 z-[2]"
            style={{
              background:
                "linear-gradient(105deg, rgba(8,10,12,0.35) 0%, rgba(8,10,12,0.15) 45%, rgba(8,10,12,0.85) 100%)",
            }}
          />
          <p className="absolute left-5 top-5 z-[3] text-[10px] font-medium tracking-[0.12em] text-[#4d9fff] uppercase sm:left-8 sm:top-8">
            Featured sustainment
          </p>
        </div>

        <div className="flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <p className="font-mono text-[11px] text-[#8a9099]">TRECC</p>
          <h2 className="font-serif mt-2 text-2xl leading-tight text-white sm:text-3xl">
            Tactical Rapidly Expandable Command Center
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#8a9099] sm:text-base">
            Self-contained field sanitation and kitchen capability — the sustainment spine for forward SOF camps.
            Plan a site in the deployment planner and TRECC slots into the recommended layout when logistics or
            force size demands it.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={sofSystemPath("trecc")}
              className={btnMarketingPrimary}
              onClick={() => void trackEvent("click", "SOF featured — TRECC brief")}
            >
              View TRECC brief
            </Link>
            <Link
              href="/sof-solutions/secure/deployment-planner"
              className={btnMarketingOutline}
              onClick={() => void trackEvent("click", "SOF featured — plan with TRECC")}
            >
              Plan camp on map
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
