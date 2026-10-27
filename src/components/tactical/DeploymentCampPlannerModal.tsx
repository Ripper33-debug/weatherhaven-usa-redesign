"use client";

import { useEffect, useMemo, useState } from "react";
import {
  campPlanMinimumReady,
  generateCampPlan,
  type CampPlan,
} from "@/lib/campPlanner";
import {
  applyHighAltitudeIfNeeded,
  fetchElevationMeters,
  inferEnvironmentFromCoordinates,
} from "@/lib/climate-from-coordinates";
import {
  MISSION_BUILDER_DEFAULTS,
  type MissionBuilderState,
} from "@/lib/missionBuilder";
import { PRODUCTS } from "@/lib/products";
import { platformBtnOutline, platformBtnPrimary } from "@/components/platform/platform-ui";

const selectClass =
  "mt-2 w-full border border-white/[0.12] bg-[#080a0c] px-3 py-2.5 text-sm text-white outline-none focus:border-[#4d9fff]/40";
const inputClass =
  "mt-2 w-full border border-white/[0.12] bg-[#080a0c] px-3 py-2.5 text-sm text-white outline-none focus:border-[#4d9fff]/40";

type Props = {
  point: { lat: number; lng: number };
  onClose: () => void;
  onComplete: (result: { state: MissionBuilderState; plan: CampPlan }) => void;
};

export function DeploymentCampPlannerModal({ point, onClose, onComplete }: Props) {
  const initialClimate = useMemo(
    () => inferEnvironmentFromCoordinates(point.lat, point.lng),
    [point.lat, point.lng],
  );
  const [climateHint, setClimateHint] = useState(initialClimate);
  const [state, setState] = useState<MissionBuilderState>(() => ({
    ...MISSION_BUILDER_DEFAULTS,
    environment: initialClimate.environment,
    notes: `Site coordinates: ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}\nSuggested climate: ${initialClimate.label} — ${initialClimate.detail}`,
  }));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void fetchElevationMeters(point.lat, point.lng).then((elevation) => {
      if (cancelled) return;
      const inferred = applyHighAltitudeIfNeeded(initialClimate, elevation);
      setClimateHint(inferred);
      setState((prev) => ({
        ...prev,
        environment: inferred.environment,
        elevation: elevation != null ? String(Math.round(elevation)) : prev.elevation,
        notes: `Site coordinates: ${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}\nSuggested climate: ${inferred.label} — ${inferred.detail}`,
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [initialClimate, point.lat, point.lng]);

  const ready = useMemo(() => campPlanMinimumReady(state), [state]);

  function patch<K extends keyof MissionBuilderState>(key: K, value: MissionBuilderState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function handleGenerate() {
    if (!ready) {
      setError("Select environment, primary function, and personnel count.");
      return;
    }
    const plan = generateCampPlan(state, PRODUCTS);
    if (!plan) {
      setError("Could not generate a camp layout for these inputs.");
      return;
    }
    onComplete({ state, plan });
  }

  return (
    <div className="absolute inset-0 z-[400] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden wh-marketing-panel sm:max-h-none sm:rounded-none">
        <div className="overflow-y-auto p-6 sm:p-8">
          <p className="text-[11px] font-medium tracking-[0.14em] text-[#4d9fff] uppercase">Camp site planner</p>
          <h2 className="platform-display mt-2 text-lg text-white sm:text-xl">Plan a camp at this location</h2>
          <p className="mt-2 font-mono text-xs text-[#8a9099]">
            {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
          </p>
          <p className="mt-3 rounded border border-[#4d9fff]/25 bg-[#4d9fff]/10 px-3 py-2 text-sm text-[#cfe6ff]">
            Suggested climate zone: <span className="font-medium text-white">{climateHint.label}</span>
            <span className="mt-1 block text-xs text-[#8a9099]">{climateHint.detail} (approximate)</span>
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#8a9099]">
            Answer a few mission questions. We will switch to satellite imagery and recommend a camp layout with
            shelter zones sized to your needs — including TRECC sustainment when appropriate.
          </p>

          <div className="mt-6 space-y-4">
            <label className="block text-xs font-medium uppercase tracking-wide text-[#8a9099]">
              Environment
              <select
                className={selectClass}
                value={state.environment}
                onChange={(e) => patch("environment", e.target.value)}
              >
                <option value="">Select…</option>
                <option value="arctic">Arctic</option>
                <option value="desert">Desert</option>
                <option value="tropical">Tropical</option>
                <option value="maritime">Maritime</option>
                <option value="highalt">High altitude</option>
                <option value="temperate">Temperate</option>
              </select>
            </label>

            <label className="block text-xs font-medium uppercase tracking-wide text-[#8a9099]">
              Primary function
              <select
                className={selectClass}
                value={state.primaryFunction}
                onChange={(e) => patch("primaryFunction", e.target.value)}
              >
                <option value="">Select…</option>
                <option value="c2">Command & control</option>
                <option value="medical">Medical</option>
                <option value="maintenance">Maintenance</option>
                <option value="accommodation">Accommodation</option>
                <option value="scif">SCIF</option>
                <option value="logistics">Logistics / sustainment</option>
              </select>
            </label>

            <label className="block text-xs font-medium uppercase tracking-wide text-[#8a9099]">
              Personnel count
              <input
                type="number"
                min={1}
                className={inputClass}
                value={state.personnelCount}
                onChange={(e) => patch("personnelCount", e.target.value)}
                placeholder="e.g. 36"
              />
            </label>

            <label className="block text-xs font-medium uppercase tracking-wide text-[#8a9099]">
              Deployment duration
              <select
                className={selectClass}
                value={state.deploymentDuration}
                onChange={(e) => patch("deploymentDuration", e.target.value)}
              >
                <option value="">Select…</option>
                <option value="72hours">Up to 72 hours</option>
                <option value="2weeks">Up to 2 weeks</option>
                <option value="6months">Up to 6 months</option>
                <option value="12plus">12+ months</option>
              </select>
            </label>
          </div>

          {error ? (
            <p className="mt-4 border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-200" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col gap-2 border-t border-white/[0.08] p-4 sm:flex-row sm:p-6">
          <button type="button" className={`flex-1 ${platformBtnPrimary}`} onClick={handleGenerate}>
            Show satellite & camp layout
          </button>
          <button type="button" className={`flex-1 ${platformBtnOutline}`} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
