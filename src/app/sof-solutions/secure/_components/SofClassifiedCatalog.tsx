import Link from "next/link";
import { SofProductCatalogCard } from "../_components/SofProductCatalogCard";
import { SofTreccFeatured } from "../_components/SofTreccFeatured";
import { SOF_PRODUCTS } from "@/lib/sof-products";
import { btnMarketingOutline } from "@/lib/cta-buttons";

export function SofClassifiedCatalog() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <div className="max-w-3xl">
        <p className="text-[11px] font-medium tracking-[0.14em] text-[#4d9fff] uppercase">Authorized release</p>
        <h1 className="font-serif mt-4 text-3xl leading-tight text-white sm:text-4xl">SOF systems catalog</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#8a9099] sm:text-base">
          Configurations developed for special operations forces — not published on the public marketing site.
          Technical data, pricing, and export classifications are released through your program lead.
        </p>
        <p className="mt-4 border-l-2 border-[#4d9fff]/40 pl-4 text-xs leading-relaxed text-[#8a9099]">
          Distribution limited to authenticated SOF program members. Do not forward specifications outside your
          chain of command or program office.
        </p>
      </div>

      <SofTreccFeatured />

      <div className="mt-12">
        <p className="text-[11px] font-medium tracking-[0.12em] text-[#8a9099] uppercase">Restricted modules</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        {SOF_PRODUCTS.map((product) => (
          <SofProductCatalogCard key={product.slug} product={product} />
        ))}
      </div>

      <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.08] pt-10 sm:flex-row sm:flex-wrap sm:items-center">
        <Link href="/sof-solutions/secure/deployment-planner" className={btnMarketingOutline}>
          Deployment planner
        </Link>
        <Link href="/contact?inquiry=SOF%20Classified%20Brief" className={btnMarketingOutline}>
          Request classified brief
        </Link>
        <Link href="/privacy" className="text-sm text-[#8a9099] hover:text-white">
          Privacy policy
        </Link>
      </div>
    </div>
  );
}
