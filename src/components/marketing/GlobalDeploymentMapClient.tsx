"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DeploymentStoryCmsRow } from "@/lib/deployment-stories";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { btnMarketingLink } from "@/lib/cta-buttons";
import {
  DEPLOYMENT_THEATERS,
  DEPLOYMENT_TOUR_THEATER_IDS,
  type DeploymentTheater,
  type GlobalDeployment,
  GLOBAL_DEPLOYMENT_STATS,
  GLOBAL_DEPLOYMENTS,
  featuredDeploymentForTheater,
  getTheaterById,
} from "@/lib/global-deployments";
import { DeploymentStoryPanel } from "@/components/marketing/DeploymentStoryPanel";
import {
  DEPLOYMENT_PIN_LEGEND,
  deploymentPinKind,
  type DeploymentPinKind,
} from "@/lib/deployment-pin-style";
import { pulsingMarkerIcon } from "@/lib/leaflet-marker-icon";
import "./global-deployment-map.css";

const MAP_CENTER: [number, number] = [18, 10];
const MAP_ZOOM = 2;
const MARKER_ZOOM = 5;
const TOUR_THEATER_MS = 3800;
const TOUR_DEPLOYMENT_MS = 2800;

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function MapFlyController({
  target,
}: {
  target: { center: [number, number]; zoom: number; token: number } | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    map.flyTo(target.center, target.zoom, { duration: 1.6, easeLinearity: 0.25 });
  }, [map, target]);

  return null;
}

function TheaterBanner({
  theater,
  touring,
}: {
  theater: DeploymentTheater;
  touring: boolean;
}) {
  return (
    <div
      className={`pointer-events-none absolute left-2 top-2 z-[500] max-w-[min(calc(100%-1rem),280px)] border border-[#4d9fff]/25 bg-[#080a0c]/92 px-3 py-2 backdrop-blur-md sm:left-5 sm:top-5 sm:max-w-[min(100%,320px)] sm:px-4 sm:py-3 ${touring ? "wh-global-tour-active" : ""}`}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#4d9fff] sm:text-[10px] sm:tracking-[0.16em]">{theater.label}</p>
      <p className="mt-0.5 text-xs font-medium text-white sm:mt-1 sm:text-sm">{theater.headline}</p>
      <p className="mt-0.5 hidden text-xs text-[#8a9099] sm:block">{theater.stat}</p>
    </div>
  );
}

export function GlobalDeploymentMapClient() {
  const [selected, setSelected] = useState<GlobalDeployment | null>(null);
  const [activeTheater, setActiveTheater] = useState<DeploymentTheater | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ center: [number, number]; zoom: number; token: number } | null>(
    null,
  );
  const [touring, setTouring] = useState(false);
  const [cmsOverrides, setCmsOverrides] = useState<Record<string, DeploymentStoryCmsRow>>({});
  const [pinFilter, setPinFilter] = useState<DeploymentPinKind | null>(null);
  const tourAbortRef = useRef(false);
  const flyTokenRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/deployment-stories")
      .then((res) => (res.ok ? res.json() : { overrides: {} }))
      .then((data: { overrides?: Record<string, DeploymentStoryCmsRow> }) => {
        if (!cancelled) setCmsOverrides(data.overrides ?? {});
      })
      .catch(() => {
        if (!cancelled) setCmsOverrides({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const flyTo = useCallback((center: [number, number], zoom: number) => {
    flyTokenRef.current += 1;
    setFlyTarget({ center, zoom, token: flyTokenRef.current });
  }, []);

  const selectDeployment = useCallback(
    (deployment: GlobalDeployment) => {
      setSelected(deployment);
      setActiveTheater(getTheaterById(deployment.theaterId) ?? null);
      flyTo([deployment.lat, deployment.lng], MARKER_ZOOM);
    },
    [flyTo],
  );

  const selectTheater = useCallback(
    (theater: DeploymentTheater) => {
      setActiveTheater(theater);
      setSelected(null);
      flyTo(theater.center, theater.zoom);
    },
    [flyTo],
  );

  const resetView = useCallback(() => {
    setSelected(null);
    setActiveTheater(null);
    flyTo(MAP_CENTER, MAP_ZOOM);
  }, [flyTo]);

  const runGlobalTour = useCallback(async () => {
    if (touring) {
      tourAbortRef.current = true;
      setTouring(false);
      return;
    }

    tourAbortRef.current = false;
    setTouring(true);
    setSelected(null);

    for (const theaterId of DEPLOYMENT_TOUR_THEATER_IDS) {
      if (tourAbortRef.current) break;
      const theater = getTheaterById(theaterId);
      if (!theater) continue;

      setActiveTheater(theater);
      flyTo(theater.center, theater.zoom);
      await sleep(TOUR_THEATER_MS);
      if (tourAbortRef.current) break;

      const featured = featuredDeploymentForTheater(theaterId);
      if (featured) {
        setSelected(featured);
        flyTo([featured.lat, featured.lng], MARKER_ZOOM);
        await sleep(TOUR_DEPLOYMENT_MS);
        if (tourAbortRef.current) break;
        setSelected(null);
      }
    }

    if (!tourAbortRef.current) {
      resetView();
    }
    setTouring(false);
  }, [flyTo, resetView, touring]);

  useEffect(() => {
    return () => {
      tourAbortRef.current = true;
    };
  }, []);

  const theaterChips = useMemo(() => DEPLOYMENT_THEATERS, []);

  const togglePinFilter = useCallback((kind: DeploymentPinKind) => {
    setPinFilter((prev) => (prev === kind ? null : kind));
  }, []);

  return (
    <div className="wh-global-map relative aspect-[4/3] w-full min-h-[280px] sm:aspect-[16/10] sm:min-h-[420px] lg:min-h-[480px]">
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        minZoom={2}
        maxZoom={8}
        className="absolute inset-0 z-0 h-full w-full"
        scrollWheelZoom={false}
        attributionControl
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />
        <MapFlyController target={flyTarget} />
        {GLOBAL_DEPLOYMENTS.map((deployment) => {
          const kind = deploymentPinKind(deployment.category);
          const dimmed = pinFilter !== null && pinFilter !== kind;
          return (
            <Marker
              key={deployment.id}
              position={[deployment.lat, deployment.lng]}
              icon={pulsingMarkerIcon(selected?.id === deployment.id, kind, dimmed)}
              zIndexOffset={selected?.id === deployment.id ? 1000 : dimmed ? 0 : 100}
              eventHandlers={{
                click: () => selectDeployment(deployment),
              }}
            />
          );
        })}
      </MapContainer>

      <div className="wh-global-map-vignette absolute inset-0 z-[100]" aria-hidden />
      <div className="wh-global-map-grid absolute inset-0 z-[110]" aria-hidden />

      {activeTheater && !selected ? <TheaterBanner theater={activeTheater} touring={touring} /> : null}
      {selected ? (
        <DeploymentStoryPanel
          deployment={selected}
          cmsOverride={cmsOverrides[selected.id] ?? null}
          onClose={() => setSelected(null)}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] bg-gradient-to-t from-[#080a0c] via-[#080a0c]/95 to-transparent px-2 pb-2 pt-8 sm:px-5 sm:pb-4 sm:pt-10">
        <div className="pointer-events-auto mb-2 flex items-center gap-2 sm:mb-3 sm:flex-wrap">
          <div className="wh-mobile-scroll-x flex min-w-0 flex-1 items-center gap-2 sm:flex-wrap sm:overflow-visible">
            {DEPLOYMENT_PIN_LEGEND.map((item) => {
              const active = pinFilter === item.kind;
              return (
                <button
                  key={item.kind}
                  type="button"
                  disabled={touring}
                  onClick={() => togglePinFilter(item.kind)}
                  aria-pressed={active}
                  className={`inline-flex shrink-0 items-center gap-1.5 border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition disabled:opacity-50 sm:text-[10px] sm:tracking-[0.12em] ${
                    active
                      ? "border-white/25 bg-white/[0.08] text-white"
                      : "border-transparent text-[#8a9099] hover:border-white/15 hover:text-white"
                  }`}
                >
                  <span
                    className="inline-block h-2 w-2 shrink-0 rotate-45 border border-[#080a0c] sm:h-2.5 sm:w-2.5"
                    style={{ backgroundColor: item.color }}
                    aria-hidden
                  />
                  {item.label}
                </button>
              );
            })}
          </div>
          {pinFilter ? (
            <button
              type="button"
              onClick={() => setPinFilter(null)}
              className="shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-[#4d9fff] hover:text-white sm:text-[10px] sm:tracking-[0.12em]"
            >
              All
            </button>
          ) : null}
        </div>
        <div className="pointer-events-auto flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          <div className="wh-mobile-scroll-x flex gap-1.5 sm:flex-wrap sm:overflow-visible">
            {theaterChips.map((theater) => (
              <button
                key={theater.id}
                type="button"
                disabled={touring}
                onClick={() => selectTheater(theater)}
                className={`shrink-0 border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition disabled:opacity-50 sm:px-2.5 sm:py-1.5 sm:text-[10px] sm:tracking-[0.12em] ${
                  activeTheater?.id === theater.id
                    ? "border-[#4d9fff]/50 bg-[#4d9fff]/15 text-white"
                    : "border-white/[0.1] bg-[#0d0f12]/90 text-[#8a9099] hover:border-white/20 hover:text-white"
                }`}
              >
                {theater.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-end sm:gap-2">
            <p className="hidden font-mono text-[10px] uppercase tracking-[0.12em] text-[#8a9099] sm:block">
              {GLOBAL_DEPLOYMENT_STATS.pins} map pins · {GLOBAL_DEPLOYMENT_STATS.countries} countries
            </p>
            <button
              type="button"
              onClick={() => void runGlobalTour()}
              className={`${btnMarketingLink} text-[11px] no-underline sm:text-xs ${touring ? "text-[#4d9fff]" : ""}`}
            >
              {touring ? "Stop tour" : "Global tour"}
              <span aria-hidden>{touring ? "■" : "→"}</span>
            </button>
            {!touring ? (
              <button type="button" onClick={resetView} className={`${btnMarketingLink} text-[11px] no-underline sm:text-xs`}>
                Reset
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
