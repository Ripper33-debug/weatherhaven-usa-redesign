import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ResourcesLibrary = dynamic(
  () => import("@/components/resources/ResourcesLibrary").then((m) => m.ResourcesLibrary),
  {
    loading: () => (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8a9099]">
          Loading resources…
        </p>
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: "Resources — Weatherhaven USA",
  description: "Technical documents for authorized programs — capabilities briefs, spec sheets, and references.",
};

export default function ResourcesPage() {
  return (
    <div className="bg-[#080a0c] pt-16 text-white lg:pt-[4.25rem]">
      <ResourcesLibrary />
    </div>
  );
}
