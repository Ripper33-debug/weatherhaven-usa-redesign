import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { listPublishedProducts } from "@/app/api/_lib/catalog-products";

const CampPlanResults = dynamic(
  () => import("@/components/mission/CampPlanResults").then((m) => m.CampPlanResults),
  {
    loading: () => (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <p className="text-[0.95rem] text-muted">
          Loading your camp package
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
    <div className="bg-ink text-snow">
      <CampPlanResults products={products} />
    </div>
  );
}
