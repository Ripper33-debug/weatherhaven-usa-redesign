import type { Metadata } from "next";
import dynamic from "next/dynamic";

const MissionSolutionBuilder = dynamic(
  () =>
    import("@/components/mission/MissionSolutionBuilder").then((m) => m.MissionSolutionBuilder),
  {
    loading: () => (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8a9099]">
          Loading mission builder…
        </p>
      </div>
    ),
  },
);

export const metadata: Metadata = {
  title: "Mission Solution Builder — Weatherhaven USA",
  description:
    "Define operational parameters and explore indicative layouts. Planning tool only — not a formal quote. Submit to programs for engineering follow-up.",
};

export default function MissionSolutionBuilderPage() {
  return (
    <div className="bg-[#080a0c] pt-16 text-white lg:pt-[4.25rem]">
      <MissionSolutionBuilder />
    </div>
  );
}
