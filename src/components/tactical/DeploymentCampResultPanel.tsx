"use client";

import Link from "next/link";
import { CampLayoutDiagram } from "@/components/mission/CampLayoutDiagram";
import { platformBtnOutline } from "@/components/platform/platform-ui";
import type { CampPlan } from "@/lib/campPlanner";
import { CAMP_ZONE_LABELS } from "@/lib/campPlanner";

type Props = {
  plan: CampPlan;
  coords: { lat: number; lng: number };
  onDismiss: () => void;
};

export function DeploymentCampResultPanel({ plan, coords, onDismiss }: Props) {
  return (
    <div className="mb-4 wh-marketing-panel overflow-hidden p-0">
      <div className="border-b border-white/[0.08] px-4 py-3">
        <p className="text-[10px] font-medium tracking-[0.12em] text-[#4d9fff] uppercase">Recommended layout</p>
        <p className="mt-1 text-sm font-medium text-white">{plan.title}</p>
        <p className="mt-0.5 text-[11px] text-[#8a9099]">{plan.subtitle}</p>
        <p className="mt-2 font-mono text-[10px] text-[#8a9099]">
          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} · {plan.packageId}
        </p>
      </div>

      <div className="border-b border-white/[0.08] bg-[#080a0c]/50 p-3">
        <CampLayoutDiagram zones={plan.zones} animate={false} />
      </div>

      <div className="max-h-32 overflow-y-auto px-4 py-3">
        <p className="text-[10px] font-medium tracking-[0.1em] text-[#8a9099] uppercase">Systems</p>
        <ul className="mt-2 space-y-1.5">
          {plan.lineItems.map((item) => (
            <li key={`${item.slug}-${item.zoneId}`} className="flex justify-between gap-2 text-[11px]">
              <span className="text-white">
                {item.qty}× {item.name}
              </span>
              <span className="shrink-0 text-[#8a9099]">{CAMP_ZONE_LABELS[item.zoneId]}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-2 border-t border-white/[0.08] p-3">
        <Link href="/mission-solution-builder/results" className={`text-center ${platformBtnOutline}`}>
          Full camp package
        </Link>
        <button type="button" onClick={onDismiss} className="text-xs text-[#8a9099] transition hover:text-white">
          Dismiss preview
        </button>
      </div>
    </div>
  );
}
