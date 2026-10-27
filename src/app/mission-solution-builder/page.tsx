import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { pageMeta } from "@/lib/page-meta";

const MissionSolutionBuilder = dynamic(
  () => import("@/components/mission/MissionSolutionBuilder").then((m) => m.MissionSolutionBuilder),
  {
    loading: () => (
      <div className="flex min-h-[50vh] items-center justify-center px-6">
        <p className="text-[0.95rem] text-muted">Loading the mission builder</p>
      </div>
    ),
  },
);

export const metadata: Metadata = pageMeta({
  title: "Mission builder",
  description:
    "Describe the mission, climate, mobility and force size to get an indicative Weatherhaven camp layout and parts list. A planning tool, not a quote.",
  path: "/mission-solution-builder",
});

export default function MissionSolutionBuilderPage() {
  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Mission builder" }]}
        title="Sketch a camp in a few minutes."
        lead="Describe the mission, climate, mobility and force size. The builder suggests an indicative layout and parts list you can export and send to a Weatherhaven expert. It is a planning tool, not a quote."
      />
      <div className="bg-ink pb-20 text-snow">
        <MissionSolutionBuilder />
      </div>
    </>
  );
}
