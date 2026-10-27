import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { listPublishedProducts } from "@/app/api/_lib/catalog-products";

const CampPlanResults = dynamic(
  () => import("@/components/mission/CampPlanResults").then((m) => m.CampPlanResults),
  {
    loading: () => (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8a9099]">
          Loading camp package…
        </p>
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: "Camp Package — Mission Solution Builder",
  description: "Indicative camp layout and parts list from your mission inputs.",
  robots: { index: false, follow: false },
};

export default async function CampPlanResultsPage() {
  const products = await listPublishedProducts();
  return (
    <div className="bg-[#080a0c] pt-16 text-white lg:pt-[4.25rem]">
      <CampPlanResults products={products} />
    </div>
  );
}
