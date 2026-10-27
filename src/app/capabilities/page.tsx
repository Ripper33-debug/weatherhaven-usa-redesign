import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CapabilitiesExplorer = dynamic(
  () => import("@/components/capabilities/CapabilitiesExplorer").then((m) => m.CapabilitiesExplorer),
  {
    loading: () => (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#080a0c] px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8a9099]">
          Loading capabilities…
        </p>
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: "Capabilities — Weatherhaven USA",
  description:
    "Weatherhaven shelter systems, environmental control, power, flooring, command and control, medical, aviation support, and camp integration — field-proven on all seven continents.",
};

export default function CapabilitiesPage() {
  return <CapabilitiesExplorer />;
}
