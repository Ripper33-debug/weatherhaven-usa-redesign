import type { Metadata } from "next";
import { listPublishedProducts } from "@/app/api/_lib/catalog-products";
import { ConfigurableSolutionsShowcase } from "@/components/products/ConfigurableSolutionsShowcase";
import { MarketingCtaSection } from "@/components/marketing/MarketingCtaSection";

export const metadata: Metadata = {
  title: "Configurable Solutions — Weatherhaven USA",
  description:
    "Browse Weatherhaven shelter system building blocks — filter by mission type, environment, mobility, and force size.",
};

/** CMS-backed catalog; admin publish revalidates this route. */
export const revalidate = 60;

export default async function ConfigurableSolutionsPage() {
  const products = await listPublishedProducts();
  return (
    <>
      <ConfigurableSolutionsShowcase products={products} />
      <MarketingCtaSection
        title="Need a configuration package for a solicitation or J&A?"
        description="We assemble bounded option sets and technical narratives from mission inputs—not from a generic cut sheet."
        primary={{ href: "/contact", label: "Contact our team" }}
      />
    </>
  );
}
