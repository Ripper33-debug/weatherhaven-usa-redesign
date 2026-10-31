"use client";

import { useEffect, useState } from "react";
import type { FieldExtremes } from "@/lib/field-readout";
import { HeroFieldReadout } from "@/components/home/v2/HeroFieldReadout";

/** Loads the weather line after the page has hydrated (see src/app/api/field-extremes/route.ts). */
export function HeroFieldReadoutLive() {
  const [field, setField] = useState<FieldExtremes | null>(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/field-extremes")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: FieldExtremes | null) => {
        if (!cancelled && d?.cold && d?.hot) setField(d);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  if (!field) return <span />;
  return (
    <div className="motion-safe:animate-[v2-readout-in_700ms_ease-out]">
      <HeroFieldReadout field={field} />
    </div>
  );
}
