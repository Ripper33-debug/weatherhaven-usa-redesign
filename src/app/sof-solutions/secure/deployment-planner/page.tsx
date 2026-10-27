"use client";

import dynamic from "next/dynamic";

const TacticalMapClient = dynamic(() => import("@/app/tactical-map/TacticalMapClient"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-[calc(100dvh-4rem)] items-center justify-center bg-[#080a0c] lg:h-[calc(100dvh-4.25rem-3.5rem)]"
      style={{ minHeight: "calc(100vh - 64px)" }}
    >
      <p
        style={{
          color: "#c8a96e",
          fontFamily: "monospace",
          letterSpacing: "0.2em",
          fontSize: "11px",
        }}
      >
        LOADING MAP...
      </p>
    </div>
  ),
});

export default function SofDeploymentPlannerPage() {
  return (
    <div className="h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-4.25rem-3.5rem)]">
      <TacticalMapClient />
    </div>
  );
}
