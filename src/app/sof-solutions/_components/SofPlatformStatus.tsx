"use client";

import { useSyncExternalStore } from "react";

function formatStatusDate() {
  return new Date()
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export function SofPlatformStatus() {
  const lastUpdated = useSyncExternalStore(
    () => () => {},
    formatStatusDate,
    () => "—",
  );

  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] tracking-[0.1em] text-[#8a9099]">
      <span className="inline-flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping bg-emerald-500/40" />
          <span className="relative inline-flex h-2 w-2 bg-emerald-500" />
        </span>
        PLATFORM ACTIVE
      </span>
      <span aria-hidden>·</span>
      <span>LAST UPDATED: {lastUpdated}</span>
      <span aria-hidden>·</span>
      <span>AUTHORIZED USERS ONLY</span>
    </div>
  );
}
