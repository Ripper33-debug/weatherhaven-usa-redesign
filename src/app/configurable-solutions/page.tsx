import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";
import Link from "next/link";
import { Suspense } from "react";
import { listPublishedProducts } from "@/app/api/_lib/catalog-products";
import { SystemsCatalog } from "@/components/systems/SystemsCatalog";
import { V2PageHeader } from "@/components/site/V2PageHeader";

export const metadata: Metadata = pageMeta({
  title: "Shelter systems",
  description:
    "Published specifications for Weatherhaven expandable containers, soft-wall, inflatable and polar shelters. Filter by family, mission, environment and transport.",
  path: "/configurable-solutions",
  image: "/products/hqss.jpg",
});

/** CMS-backed catalog; admin publish revalidates this route. */
export const revalidate = 60;

export default async function SystemsPage() {
  const products = await listPublishedProducts();
  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Systems" }]}
        title="Every system, with the numbers."
        lead="Published specifications for Weatherhaven expandable containers, soft-wall, inflatable and polar shelters. Filter by family or mission, then open a system for its full spec sheet."
      />
      <Suspense>
        <SystemsCatalog products={products} />
      </Suspense>
      <section className="border-t border-line bg-hull py-20 sm:py-24">
        <div className="v2-wrap grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h2 className="v2-h2 max-w-[22ch] text-snow">Need a configuration package for a solicitation or J&amp;A?</h2>
            <p className="v2-body mt-4">
              Weatherhaven assembles bounded option sets and technical narratives from your mission inputs, not from
              a generic cut sheet.
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
