"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { contactUrl } from "@/lib/contact-url";
import { PRODUCTS, getProductBySlug } from "@/lib/products";
import {
  decodeMarkerNotes,
  encodeMarkerNotes,
  markerDisplayLabel,
} from "@/lib/tactical-marker-meta";
import { platformBtnOutline, platformBtnPrimary } from "@/components/platform/platform-ui";
import {
  TacticalBoundsSync,
  TacticalCoordGrid,
  TacticalMeasureTool,
  TacticalMinimap,
  haversineKm,
} from "@/components/tactical/TacticalMapEnhancements";
import { DeploymentCampPlannerModal } from "@/components/tactical/DeploymentCampPlannerModal";
import { DeploymentCampResultPanel } from "@/components/tactical/DeploymentCampResultPanel";
import { CampGeoOverlay } from "@/components/tactical/CampGeoOverlay";
import { TacticalDeploymentMarkers } from "@/components/tactical/TacticalDeploymentMarkers";
import { ensureLeafletDefaultIcon, pulsingMarkerIcon } from "@/lib/leaflet-marker-icon";
import {
  buildDeploymentExportRows,
  deploymentExportFilename,
  deploymentLocationsToCsv,
} from "@/lib/tactical-deployment-export";
import {
  TACTICAL_COMMAND_FILTERS,
  TACTICAL_DEPLOYMENT_LEGEND,
  tacticalDeploymentsForCommand,
  type TacticalCommandRegion,
} from "@/lib/tactical-deployment-locations";
import {
  MISSION_BUILDER_STORAGE_KEY,
  type CampPlan,
} from "@/lib/campPlanner";
import type { MissionBuilderState } from "@/lib/missionBuilder";
import "./tactical-map.css";

type TacticalMarker = {
  id: string;
  user_id: string;
  label: string | null;
  notes: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
};

type ContextMenuState = {
  x: number;
  y: number;
  lat: number;
  lng: number;
} | null;

const QUICK_JUMPS = [
  { id: "centcom", label: "CENTCOM", center: [26, 45] as [number, number], zoom: 5 },
  { id: "africom", label: "AFRICOM", center: [2, 20] as [number, number], zoom: 4 },
  { id: "eucom", label: "EUCOM", center: [50, 15] as [number, number], zoom: 4 },
  { id: "indopacom", label: "INDOPACOM", center: [10, 140] as [number, number], zoom: 4 },
  { id: "northcom", label: "NORTHCOM", center: [45, -100] as [number, number], zoom: 4 },
  { id: "southcom", label: "SOUTHCOM", center: [-15, -60] as [number, number], zoom: 4 },
];

const MAP_ONBOARD_KEY = "wh-map-onboarded";
const goldIcon = pulsingMarkerIcon();

function MapController({
  onCenterChange,
  onZoomChange,
  onMapReady,
  onContextMenu,
  onMapClick,
  mapClickEnabled,
}: {
  onCenterChange: (lat: number, lng: number) => void;
  onZoomChange: (zoom: number) => void;
  onMapReady: (map: L.Map) => void;
  onContextMenu: (lat: number, lng: number, x: number, y: number) => void;
  onMapClick: (lat: number, lng: number) => void;
  mapClickEnabled: boolean;
}) {
  const map = useMap();
  useMapEvents({
    moveend: () => {
      const c = map.getCenter();
      onCenterChange(c.lat, c.lng);
      onZoomChange(map.getZoom());
    },
    zoomend: () => onZoomChange(map.getZoom()),
    click(e) {
      if (!mapClickEnabled) return;
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
    contextmenu(e) {
      e.originalEvent.preventDefault();
      onContextMenu(e.latlng.lat, e.latlng.lng, e.originalEvent.clientX, e.originalEvent.clientY);
    },
  });
  useEffect(() => {
    onMapReady(map);
    onCenterChange(map.getCenter().lat, map.getCenter().lng);
    onZoomChange(map.getZoom());
  }, [map, onCenterChange, onMapReady, onZoomChange]);
  return null;
}

function MarkerSidebarItem({
  marker,
  index,
  onFlyTo,
}: {
  marker: TacticalMarker;
  index: number;
  onFlyTo: () => void;
}) {
  const { systemSlug, text } = decodeMarkerNotes(marker.notes);
  const product = systemSlug ? getProductBySlug(systemSlug) : undefined;
  const title = markerDisplayLabel(index, marker.label, product?.name ?? null);
  const deploymentLine = `${marker.latitude.toFixed(4)}, ${marker.longitude.toFixed(4)}`;

  return (
    <div className="mb-2 wh-marketing-panel overflow-hidden p-0">
      <button type="button" onClick={onFlyTo} className="w-full px-3 py-2.5 text-left">
        <p className="text-sm font-medium text-white">{title}</p>
        {product ? (
          <p className="mt-0.5 text-[11px] text-[#4d9fff]">{product.code}</p>
        ) : null}
        <p className="mt-1 font-mono text-[10px] text-[#8a9099]">{deploymentLine}</p>
        {text ? <p className="mt-1 line-clamp-2 text-[11px] text-[#8a9099]">{text}</p> : null}
      </button>
      {systemSlug ? (
        <div className="flex border-t border-white/[0.06]">
          <Link
            href={`/configurable-solutions/${systemSlug}`}
            className="flex-1 px-2 py-2 text-center text-[10px] text-[#8a9099] transition hover:text-white"
          >
            System
          </Link>
          <Link
            href={contactUrl({
              system: systemSlug,
              inquiry: "Program Requirement",
              deployment: `Coordinates: ${deploymentLine}${text ? `\nNotes: ${text}` : ""}`,
            })}
            className="flex-1 border-l border-white/[0.06] px-2 py-2 text-center text-[10px] text-[#4d9fff] transition hover:text-white"
          >
            Engineering
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export default function TacticalMapClient() {
  const [markers, setMarkers] = useState<TacticalMarker[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [centerLabel, setCenterLabel] = useState("20.0000, 0.0000");
  const [zoomLevel, setZoomLevel] = useState(3);
  const [layers, setLayers] = useState({
    satellite: false,
    markers: true,
    grid: true,
    tacticalOverlay: false,
  });
  const [measureMode, setMeasureMode] = useState(false);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  const [measurePts, setMeasurePts] = useState<{
    a: { lat: number; lng: number } | null;
    b: { lat: number; lng: number } | null;
  }>({ a: null, b: null });
  const [mobileControlsOpen, setMobileControlsOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [systemSlugDraft, setSystemSlugDraft] = useState("");
  const [pendingPoint, setPendingPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [campPlannerPoint, setCampPlannerPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [campResult, setCampResult] = useState<{
    coords: { lat: number; lng: number };
    plan: CampPlan;
    fitKey: number;
  } | null>(null);
  const [commandFilter, setCommandFilter] = useState<TacticalCommandRegion>("ALL");
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return sessionStorage.getItem(MAP_ONBOARD_KEY) !== "1";
    } catch {
      return true;
    }
  });
  const mapRef = useRef<L.Map | null>(null);

  const visibleDeployments = useMemo(
    () => tacticalDeploymentsForCommand(commandFilter),
    [commandFilter],
  );

  useEffect(() => {
    ensureLeafletDefaultIcon();
  }, []);

  const tileUrl = useMemo(
    () =>
      layers.satellite
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    [layers.satellite],
  );

  const tileAttribution = layers.satellite
    ? "&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community"
    : "&copy; OpenStreetMap contributors &copy; CARTO";

  const measureDistance =
    measurePts.a && measurePts.b
      ? haversineKm(measurePts.a.lat, measurePts.a.lng, measurePts.b.lat, measurePts.b.lng)
      : null;

  const loadMarkers = useCallback(async (uid: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("tactical_markers")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    setMarkers((data ?? []) as TacticalMarker[]);
  }, []);

  useEffect(() => {
    void trackEvent("view", "Deployment planner opened");
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        void loadMarkers(user.id);
      }
    });
  }, [loadMarkers]);

  const onCenterChange = useCallback((lat: number, lng: number) => {
    setCenterLabel(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoomLevel(zoom);
  }, []);

  const onMeasurePoints = useCallback(
    (a: { lat: number; lng: number } | null, b: { lat: number; lng: number } | null) => {
      setMeasurePts({ a, b });
    },
    [],
  );

  async function placeMarker(
    lat: number,
    lng: number,
    opts?: { userNotes?: string; systemSlug?: string | null },
  ) {
    if (!userId) return;
    const product = opts?.systemSlug ? getProductBySlug(opts.systemSlug) : undefined;
    const encodedNotes = encodeMarkerNotes(opts?.systemSlug ?? null, opts?.userNotes ?? "");
    const label = markerDisplayLabel(markers.length, null, product?.name ?? null);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("tactical_markers")
      .insert({
        user_id: userId,
        label,
        notes: encodedNotes,
        latitude: lat,
        longitude: lng,
      })
      .select("*")
      .single();
    if (!error && data) {
      setMarkers((prev) => [data as TacticalMarker, ...prev]);
      void trackEvent("click", "Deployment marker placed");
    }
  }

  async function deleteMarker(id: string) {
    const supabase = createClient();
    await supabase.from("tactical_markers").delete().eq("id", id);
    setMarkers((prev) => prev.filter((m) => m.id !== id));
  }

  async function clearAllMarkers() {
    if (!userId || !window.confirm("Clear all deployment points?")) return;
    const supabase = createClient();
    await supabase.from("tactical_markers").delete().eq("user_id", userId);
    setMarkers([]);
  }

  function exportMarkers() {
    const blob = new Blob([JSON.stringify(markers, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weatherhaven-deployment-planner.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportLocations() {
    const rows = buildDeploymentExportRows(visibleDeployments, markers);
    const csv = deploymentLocationsToCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = deploymentExportFilename();
    a.click();
    URL.revokeObjectURL(url);
    void trackEvent("click", "Deployment locations exported");
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(search.trim())}&limit=1`,
    );
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (data[0] && mapRef.current) {
      mapRef.current.flyTo([Number(data[0].lat), Number(data[0].lon)], 6, { duration: 1.2 });
    }
  }

  function quickJump(center: [number, number], zoom: number, label: string) {
    mapRef.current?.flyTo(center, zoom, { duration: 1.2 });
    void trackEvent("click", `Quick jump — ${label}`);
  }

  function openPlacementDialog(lat: number, lng: number) {
    setPendingPoint({ lat, lng });
    setNoteDraft("");
    setSystemSlugDraft("");
  }

  function openCampPlanner(lat: number, lng: number) {
    setCampPlannerPoint({ lat, lng });
    setCampResult(null);
  }

  function applyCampPlan(
    lat: number,
    lng: number,
    state: MissionBuilderState,
    plan: CampPlan,
  ) {
    setLayers((prev) => ({ ...prev, satellite: true }));
    setCampResult({ coords: { lat, lng }, plan, fitKey: Date.now() });
    setCampPlannerPoint(null);
    dismissOnboarding();

    try {
      sessionStorage.setItem(MISSION_BUILDER_STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }

    const primarySlug = plan.lineItems[0]?.slug ?? "ateps";
    void placeMarker(lat, lng, {
      userNotes: `Camp package ${plan.packageId}\n${plan.title}`,
      systemSlug: primarySlug,
    });
    void trackEvent("click", "Deployment camp layout generated");
  }

  function dismissOnboarding() {
    try {
      sessionStorage.setItem(MAP_ONBOARD_KEY, "1");
    } catch {
      /* ignore */
    }
    setShowOnboarding(false);
  }

  const layerButtonClass = (active: boolean) =>
    `w-full border px-3 py-2.5 text-left text-sm transition ${
      active
        ? "border-[#4d9fff]/50 bg-[#4d9fff]/10 text-[#4d9fff]"
        : "border-white/[0.08] bg-[#080a0c]/80 text-white hover:border-white/20"
    }`;

  const commandFilterClass = (active: boolean) =>
    `border px-2 py-1.5 text-[10px] font-medium tracking-wide transition ${
      active
        ? "border-[#c8a96e]/50 bg-[#c8a96e]/10 text-[#c8a96e]"
        : "border-white/[0.08] bg-[#080a0c]/80 text-white hover:border-white/20"
    }`;

  const mapControls = (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      {campResult ? (
        <DeploymentCampResultPanel
          plan={campResult.plan}
          coords={campResult.coords}
          onDismiss={() => setCampResult(null)}
        />
      ) : null}

      <div>
        <p className="text-[11px] font-medium tracking-[0.12em] text-[#8a9099] uppercase">Deployment legend</p>
        <ul className="mt-3 space-y-2">
          {TACTICAL_DEPLOYMENT_LEGEND.map((item) => (
            <li key={item.type} className="flex items-center gap-2 text-xs text-[#8a9099]">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden
              />
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-[0.12em] text-[#8a9099] uppercase">Command region</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {TACTICAL_COMMAND_FILTERS.map((command) => (
            <button
              key={command}
              type="button"
              onClick={() => setCommandFilter(command)}
              className={commandFilterClass(commandFilter === command)}
            >
              {command}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-[0.12em] text-[#8a9099] uppercase">Search</p>
        <form className="mt-3" onSubmit={handleSearch}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="City, base, or region"
            className="w-full border border-white/[0.12] bg-[#080a0c] px-3 py-2.5 text-sm text-white outline-none placeholder:text-[#8a9099] focus:border-[#4d9fff]/40"
          />
        </form>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <p className="text-[11px] font-medium tracking-[0.12em] text-[#8a9099] uppercase">
          Saved points ({markers.length})
        </p>
        <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
          {markers.length === 0 ? (
            <p className="text-sm text-[#8a9099]">
              Click the map to plan a camp site, or right-click to add a deployment point.
            </p>
          ) : (
            markers.map((m, i) => (
              <MarkerSidebarItem
                key={m.id}
                marker={m}
                index={i}
                onFlyTo={() => mapRef.current?.flyTo([m.latitude, m.longitude], 8)}
              />
            ))
          )}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-[0.12em] text-[#8a9099] uppercase">Map layers</p>
        <div className="mt-3 space-y-2">
          <button
            type="button"
            onClick={() => setLayers((prev) => ({ ...prev, satellite: !prev.satellite }))}
            className={layerButtonClass(layers.satellite)}
          >
            {layers.satellite ? "Satellite imagery" : "Dark map"}
          </button>
          <button
            type="button"
            onClick={() => setMeasureMode((m) => !m)}
            className={layerButtonClass(measureMode)}
          >
            Measure distance {measureMode ? "(active)" : ""}
          </button>
          {(
            [
              ["markers", "Show markers"],
              ["grid", "Coordinate grid"],
              ["tacticalOverlay", "Tactical overlay"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center justify-between border border-white/[0.08] bg-[#080a0c]/80 px-3 py-2.5 text-sm text-white"
            >
              <span>{label}</span>
              <input
                type="checkbox"
                checked={layers[key]}
                onChange={(e) => setLayers((prev) => ({ ...prev, [key]: e.target.checked }))}
                className="accent-[#4d9fff]"
              />
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-[0.12em] text-[#8a9099] uppercase">Map center</p>
        <p className="mt-2 font-mono text-xs text-white">{centerLabel}</p>
        <p className="mt-1 text-xs text-[#8a9099]">Zoom {zoomLevel}</p>
      </div>

      <div>
        <p className="text-[11px] font-medium tracking-[0.12em] text-[#8a9099] uppercase">Theater quick jump</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {QUICK_JUMPS.map((region) => (
            <button
              key={region.id}
              type="button"
              onClick={() => quickJump(region.center, region.zoom, region.label)}
              className="border border-white/[0.08] bg-[#080a0c]/80 px-2 py-2 text-xs text-white transition hover:border-[#4d9fff]/35"
            >
              {region.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t border-white/[0.08] pt-4">
        <Link href="/mission-solution-builder?form=full" className={`block w-full text-center ${platformBtnOutline}`}>
          Mission builder
        </Link>
        <Link href="/sof-solutions/secure" className={`block w-full text-center text-sm text-[#8a9099] hover:text-white`}>
          Back to SOF systems
        </Link>
      </div>
    </div>
  );

  return (
    <div className="platform-console flex h-[calc(100dvh-4rem)] flex-col bg-[#080a0c] lg:h-[calc(100dvh-4.25rem)]">
      <header className="flex shrink-0 flex-col gap-3 border-b border-white/[0.08] bg-[#0d0f12]/95 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tracking-[0.14em] text-[#4d9fff] uppercase">Platform</p>
          <h1 className="platform-display text-xl text-white sm:text-2xl">Deployment planner</h1>
          <p className="mt-1 hidden text-xs text-[#8a9099] sm:block">
            Sketch operating locations — link points to shelter systems and engineering follow-up.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-3">
          <span className="hidden font-mono text-xs text-[#8a9099] lg:inline">{centerLabel}</span>
          <button
            type="button"
            onClick={() => void clearAllMarkers()}
            className="text-xs text-[#8a9099] transition hover:text-white"
          >
            Clear all
          </button>
          <button type="button" onClick={exportMarkers} className="text-xs text-[#8a9099] transition hover:text-white">
            Export JSON
          </button>
          <button type="button" onClick={exportLocations} className="text-xs text-[#8a9099] transition hover:text-white">
            Export locations
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[300px] shrink-0 flex-col border-r border-white/[0.08] bg-[#0d0f12] p-5 lg:flex">
          {mapControls}
        </aside>

        <div className="relative min-w-0 flex-1">
          <MapContainer center={[20, 0]} zoom={3} maxZoom={layers.satellite ? 19 : undefined} className="h-full w-full">
            <TileLayer
              key={tileUrl}
              url={tileUrl}
              attribution={tileAttribution}
              maxNativeZoom={layers.satellite ? 19 : undefined}
              maxZoom={layers.satellite ? 19 : undefined}
            />
            <MapController
              onCenterChange={onCenterChange}
              onZoomChange={onZoomChange}
              onMapReady={(map) => {
                mapRef.current = map;
              }}
              onContextMenu={(lat, lng, x, y) => {
                setContextMenu({ x, y, lat, lng });
              }}
              onMapClick={(lat, lng) => openCampPlanner(lat, lng)}
              mapClickEnabled={!measureMode && !pendingPoint && !campPlannerPoint}
            />
            <TacticalBoundsSync onBounds={setMapBounds} />
            <TacticalMeasureTool enabled={measureMode} onPoints={onMeasurePoints} />
            {campResult && layers.satellite ? (
              <CampGeoOverlay
                key={campResult.fitKey}
                center={campResult.coords}
                plan={campResult.plan}
                fitOnMount
              />
            ) : null}
            <TacticalDeploymentMarkers deployments={visibleDeployments} />
            {layers.markers &&
              markers.map((m, i) => {
                const { systemSlug, text } = decodeMarkerNotes(m.notes);
                const product = systemSlug ? getProductBySlug(systemSlug) : undefined;
                return (
                  <Marker key={m.id} position={[m.latitude, m.longitude]} icon={goldIcon}>
                    <Popup>
                      <div className="min-w-[160px] text-xs text-zinc-900">
                        <p className="font-medium">{markerDisplayLabel(i, m.label, product?.name ?? null)}</p>
                        <p className="mt-1 font-mono text-[10px] text-zinc-600">
                          {m.latitude.toFixed(5)}, {m.longitude.toFixed(5)}
                        </p>
                        {text ? <p className="mt-2 text-zinc-700">{text}</p> : null}
                        <button
                          type="button"
                          onClick={() => void deleteMarker(m.id)}
                          className="mt-2 text-[#4d9fff] underline"
                        >
                          Remove
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>

          {layers.tacticalOverlay ? (
            <div className="wh-tactical-scanlines pointer-events-none absolute inset-0" />
          ) : null}
          {layers.grid && <TacticalCoordGrid zoom={zoomLevel} />}
          <TacticalMinimap bounds={mapBounds} />

          {measureDistance != null && (
            <div className="pointer-events-none absolute left-1/2 top-4 z-[400] -translate-x-1/2 wh-marketing-panel px-4 py-2 text-sm text-[#4d9fff]">
              Distance: {measureDistance.toFixed(1)} km · {(measureDistance * 0.621371).toFixed(1)} mi
            </div>
          )}

          {showOnboarding && markers.length === 0 ? (
            <div className="pointer-events-none absolute inset-0 z-[350] flex items-end justify-center p-6 sm:items-center">
              <div className="pointer-events-auto max-w-md wh-marketing-panel p-6 sm:p-8">
                <p className="text-[11px] font-medium tracking-[0.14em] text-[#4d9fff] uppercase">Quick start</p>
                <p className="platform-display mt-2 text-lg text-white">Plan a deployment layout</p>
                <ul className="mt-4 space-y-2 text-sm text-[#8a9099]">
                  <li>Click anywhere on the map to plan a camp — answer a few questions for a recommended layout.</li>
                  <li>Satellite imagery opens with shelter zones drawn on the terrain for your site.</li>
                  <li>Right-click to add a simple deployment point or use measure mode for distances.</li>
                </ul>
                <button type="button" onClick={dismissOnboarding} className={`mt-6 w-full ${platformBtnPrimary}`}>
                  Got it
                </button>
              </div>
            </div>
          ) : null}

          {contextMenu && (
            <div
              className="fixed z-[500] min-w-[200px] overflow-hidden wh-marketing-panel py-1 text-sm text-white shadow-xl"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              <button
                type="button"
                className="block w-full px-4 py-2.5 text-left hover:bg-white/5"
                onClick={() => {
                  openCampPlanner(contextMenu.lat, contextMenu.lng);
                  setContextMenu(null);
                }}
              >
                Plan camp site here
              </button>
              <button
                type="button"
                className="block w-full px-4 py-2.5 text-left hover:bg-white/5"
                onClick={() => {
                  openPlacementDialog(contextMenu.lat, contextMenu.lng);
                  setContextMenu(null);
                }}
              >
                Add deployment point
              </button>
              <button
                type="button"
                className="block w-full px-4 py-2.5 text-left hover:bg-white/5"
                onClick={() => {
                  void navigator.clipboard.writeText(`${contextMenu.lat.toFixed(6)}, ${contextMenu.lng.toFixed(6)}`);
                  setContextMenu(null);
                }}
              >
                Copy coordinates
              </button>
            </div>
          )}

          <div
            className={`pointer-events-none fixed inset-x-0 bottom-0 z-[600] flex flex-col border-t border-white/[0.08] bg-[#0d0f12] transition-transform duration-300 ease-out lg:hidden ${
              mobileControlsOpen ? "translate-y-0" : "translate-y-[calc(100%-3rem)]"
            }`}
          >
            <button
              type="button"
              className="pointer-events-auto flex w-full items-center justify-center gap-2 py-3 text-sm font-medium text-white"
              onClick={() => setMobileControlsOpen((o) => !o)}
              aria-expanded={mobileControlsOpen}
            >
              Planner controls
            </button>
            <div className="pointer-events-auto max-h-[60vh] overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {mapControls}
            </div>
          </div>

          {campPlannerPoint ? (
            <DeploymentCampPlannerModal
              point={campPlannerPoint}
              onClose={() => setCampPlannerPoint(null)}
              onComplete={({ state, plan }) =>
                applyCampPlan(campPlannerPoint.lat, campPlannerPoint.lng, state, plan)
              }
            />
          ) : null}

          {pendingPoint && (
            <div className="absolute inset-0 z-[400] flex items-center justify-center bg-black/60 p-4">
              <div className="w-full max-w-md wh-marketing-panel p-6 sm:p-8">
                <p className="text-[11px] font-medium tracking-[0.14em] text-[#4d9fff] uppercase">New deployment point</p>
                <p className="mt-2 font-mono text-xs text-[#8a9099]">
                  {pendingPoint.lat.toFixed(5)}, {pendingPoint.lng.toFixed(5)}
                </p>
                <label className="mt-5 block">
                  <span className="text-xs font-medium text-[#8a9099]">Shelter system (optional)</span>
                  <select
                    value={systemSlugDraft}
                    onChange={(e) => setSystemSlugDraft(e.target.value)}
                    className="mt-2 w-full border border-white/[0.12] bg-[#080a0c] px-3 py-2.5 text-sm text-white outline-none focus:border-[#4d9fff]/40"
                  >
                    <option value="">— Not specified —</option>
                    {PRODUCTS.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="mt-4 block">
                  <span className="text-xs font-medium text-[#8a9099]">Notes (optional)</span>
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Terrain, access, or mission context"
                    className="mt-2 h-24 w-full resize-none border border-white/[0.12] bg-[#080a0c] p-3 text-sm text-white outline-none focus:border-[#4d9fff]/40"
                  />
                </label>
                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    className={`flex-1 ${platformBtnPrimary}`}
                    onClick={() => {
                      void placeMarker(pendingPoint.lat, pendingPoint.lng, {
                        userNotes: noteDraft,
                        systemSlug: systemSlugDraft || null,
                      });
                      setPendingPoint(null);
                      dismissOnboarding();
                    }}
                  >
                    Save point
                  </button>
                  <button
                    type="button"
                    className={`flex-1 ${platformBtnOutline}`}
                    onClick={() => setPendingPoint(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
