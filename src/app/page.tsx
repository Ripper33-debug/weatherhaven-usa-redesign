import { listPublishedProducts } from "@/app/api/_lib/catalog-products";
import { catalogProductHref } from "@/lib/catalog-products";
import type { Metadata } from "next";
import { company } from "@/lib/site";
import { HomeExecutiveStrip } from "@/components/marketing/HomeExecutiveStrip";
import { HomeNewsSection } from "@/components/news/HomeNewsSection";
import { ShieldHero } from "@/components/marketing/ShieldHero";
import { HomeMarketingChapters } from "@/components/marketing/HomeMarketingChapters";
import { MarketingQuickPaths } from "@/components/marketing/MarketingQuickPaths";
import { DeploymentMap } from "@/components/marketing/DeploymentMap";

export const metadata: Metadata = {
  title: "Weatherhaven USA — Deployable Shelter Systems",
  description: company.description,
};

/** Cache homepage CMS sections; admin publish calls revalidatePath("/"). */
export const revalidate = 300;

export default async function HomePage() {
  const products = await listPublishedProducts();
  const productLines = products.slice(0, 6).map((product) => ({
    name: product.name,
    desc: product.description,
    href: catalogProductHref(product.slug),
  }));

  return (
    <>
      <ShieldHero variant="home" />
      <HomeExecutiveStrip />
      <HomeNewsSection />
      <DeploymentMap />
      <MarketingQuickPaths />
      <HomeMarketingChapters productLines={productLines} />
    </>
  );
}
