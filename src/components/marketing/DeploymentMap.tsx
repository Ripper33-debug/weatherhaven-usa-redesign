"use client";

import dynamic from "next/dynamic";
import { GLOBAL_DEPLOYMENT_STATS } from "@/lib/global-deployment-stats";

const GlobalDeploymentMapClient = dynamic(
  () =>
    import("@/components/marketing/GlobalDeploymentMapClient").then((m) => m.GlobalDeploymentMapClient),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex aspect-[4/3] min-h-[280px] w-full items-center justify-center bg-[#0d0f12] sm:aspect-[16/10] sm:min-h-[420px] lg:min-h-[480px]"
        aria-hidden
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8a9099]">Loading global map…</p>
      </div>
    ),
  },
);

export function DeploymentMap() {
  return (
    <section className="border-t border-white/[0.08] bg-[#0d0f12] px-5 py-14 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-[1200px]">
        <p className="wh-marketing-eyebrow text-center">Global footprint</p>
        <h2 className="wh-marketing-display mx-auto mt-4 max-w-[640px] text-center text-[1.75rem] leading-[1.12] text-white sm:mt-6 sm:text-[44px]">
          Deployed where missions demand it.
        </h2>
        <p className="wh-marketing-lead mx-auto mt-3 max-w-[560px] text-center sm:mt-4">
          <span className="sm:hidden">{GLOBAL_DEPLOYMENT_STATS.pins} global deployments — tap a pin for its story.</span>
          <span className="hidden sm:inline">
            {GLOBAL_DEPLOYMENT_STATS.pins} deployments from Weatherhaven&apos;s global map — color-coded pins with
            filterable mission types. Click any pin for the deployment story.
          </span>
        </p>

        <div className="wh-marketing-panel relative mx-auto mt-8 w-full max-w-[1100px] overflow-hidden sm:mt-12">
          <GlobalDeploymentMapClient />
          <div className="hidden border-t border-white/[0.06] px-5 py-4 sm:block">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8a9099]">
              Data from Weatherhaven Google My Maps · pan, zoom, theater jump, global tour
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
