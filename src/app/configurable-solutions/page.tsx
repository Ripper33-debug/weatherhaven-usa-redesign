import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";
import Link from "next/link";
import { Suspense } from "react";
import { listPublishedProducts } from "@/app/api/_lib/catalog-products";
import { SystemsCatalog, SystemsCatalogFallback } from "@/components/systems/SystemsCatalog";
import { blurProps } from "@/lib/image-blur";
import { productCover } from "@/lib/product-covers";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { SizeLineup } from "@/components/systems/SizeLineup";

export const metadata: Metadata = pageMeta({
  title: "Shelter systems",
  description:
    "Published specifications for Weatherhaven expandable containers, soft-wall, inflatable and polar shelters. Filter by family, mission, environment and transport.",
  path: "/configurable-solutions",
  image: "/products/ehmecc/gallery/08-EHMECC.jpg",
});

/** CMS-backed catalog; admin publish revalidates this route. */
export const revalidate = 60;

export default async function SystemsPage() {
  const products = await listPublishedProducts();
  const blurs = Object.fromEntries(
    products.flatMap((p) => {
      const data = blurProps(productCover(p.slug, p.coverImageUrl)).blurDataURL;
      return data ? [[p.slug, data]] : [];
    }),
  );
  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Systems" }]}
        title="Shelter systems"
        lead="Weatherhaven's expandable containers, soft-wall, inflatable and polar shelters, with their specifications."
      >
        <p className="flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem]">
          <Link href="/configurable-solutions/compare" className="v2-link">
            Compare shelter types side by side
          </Link>
          <Link href="/tested-and-proven" className="v2-link">
            Ratings, setup times and test record
          </Link>
        </p>
      </V2PageHeader>
      <Suspense fallback={<SystemsCatalogFallback products={products} blurs={blurs} />}>
        <SystemsCatalog products={products} blurs={blurs} />
      </Suspense>
      <section id="to-scale" aria-labelledby="scale-heading" className="scroll-mt-24 border-t border-line bg-ink py-20 sm:py-24">
        <div className="v2-wrap">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-end">
            <h2 id="scale-heading" className="v2-h2 max-w-[18ch] text-snow">
              Floor plans compared
            </h2>
            <p className="v2-body lg:justify-self-end">
              Smallest to largest, each with its packed size inside its deployed size, beside a 20-ft ISO container.
            </p>
          </div>
          <div className="mt-12">
            <SizeLineup />
          </div>
        </div>
      </section>
      <section className="border-t border-line bg-hull py-20 sm:py-24">
        <div className="v2-wrap grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h2 className="v2-h2 max-w-[22ch] text-snow">Need a configuration package for a solicitation or J&amp;A?</h2>
            <p className="v2-body mt-4">
              Weatherhaven assembles bounded option sets and technical narratives from your mission inputs.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/contact?inquiry=Program%20Requirement" className="v2-btn">
              Request a configuration
            </Link>
            <Link href="/mission-solution-builder" className="v2-btn v2-btn-ghost">
              Open mission builder
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
