"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { liveLine, placeAtPoint, type GuidePlace, type LiveConditions } from "@/lib/live-site";

/**
 * "Build it where you're going": pick a real place, by searching the places Weatherhaven has
 * deployed or by clicking anywhere on the map, and the 3D camp is built in that place's weather
 * and light right now. The search box is the keyboard way in; the map is an extra for pointers.
 */
const SUGGESTED = [
  "greenland-thule-greenland",
  "antarctica-mcmurdo-station-antarctica",
  "saudi-arabia-riyadh-saudi-arabia",
  "afghanistan-nato-kabul-afghanistan",
  "canada-alert-nunavut",
  "brazil-manaus-brazil",
];

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

type MapData = { land: string; project: (lng: number, lat: number) => [number, number]; invert: (x: number, y: number) => [number, number] };

function PickMap({ places, value, onPick }: { places: GuidePlace[]; value: GuidePlace | null; onPick: (p: GuidePlace) => void }) {
  const [map, setMap] = useState<MapData | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    let cancelled = false;
    void import("@/components/home/v2/world-dot-path").then((m) => {
      if (!cancelled) setMap({ land: m.worldDotPath(), project: m.project, invert: m.invert });
    });
    return () => {
      cancelled = true;
    };
  }, []);
  const pins = useMemo(() => (map ? places.map((p) => ({ p, xy: map.project(p.lng, p.lat) })) : []), [map, places]);
  const picked = map && value ? map.project(value.lng, value.lat) : null;

  const onClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || !map) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()?.inverse());
    const [lng, lat] = map.invert(pt.x, pt.y);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lng) > 180 || Math.abs(lat) > 85) return;
    // A click on (or right beside) a documented place picks that place.
    const near = pins.find(({ xy }) => Math.hypot(xy[0] - pt.x, xy[1] - pt.y) < 7);
    onPick(near ? near.p : placeAtPoint(lat, lng, places));
  };

  return (
    <div className="mt-3 border border-line bg-ink/60">
      <svg
        ref={svgRef}
        viewBox="0 0 1000 508"
        className="block h-auto w-full cursor-crosshair select-none"
        onClick={onClick}
        aria-hidden
      >
        <path d={map?.land ?? "M0 0"} className="v2-map-dots" style={{ strokeWidth: 3.2, opacity: map ? 1 : 0, transition: "opacity 400ms" }} />
        {pins.map(({ p, xy }) => (
          <circle key={p.id} cx={xy[0]} cy={xy[1]} r={3.6} fill="#8ec5e6" opacity={0.75} />
        ))}
        {picked ? (
          <g>
            <circle cx={picked[0]} cy={picked[1]} r={13} fill="none" stroke="#f18522" strokeWidth={2} />
            <circle cx={picked[0]} cy={picked[1]} r={5} fill="#f18522" />
          </g>
        ) : null}
      </svg>
      <p className="px-3 py-2 text-[0.78rem] text-muted">Click anywhere, or on a blue dot for a place Weatherhaven has deployed.</p>
    </div>
  );
}

export function PlacePicker({
  places,
  value,
  live,
  onPick,
  onClear,
}: {
  places: GuidePlace[];
  value: GuidePlace | null;
  live: LiveConditions | "loading" | "error" | null;
  onPick: (p: GuidePlace) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [mapOpen, setMapOpen] = useState(false);
  const listId = useId();
  const inputId = useId();

  const results = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return SUGGESTED.map((id) => places.find((p) => p.id === id)).filter((p): p is GuidePlace => !!p);
    const starts = places.filter((p) => fold(p.name).startsWith(q));
    const contains = places.filter((p) => !fold(p.name).startsWith(q) && fold(p.name).includes(q));
    return [...starts, ...contains].slice(0, 7);
  }, [query, places]);

  const pick = (p: GuidePlace) => {
    onPick(p);
    setQuery("");
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      if (results.length) setActive((i) => (i + (e.key === "ArrowDown" ? 1 : -1) + results.length) % results.length);
    } else if (e.key === "Enter" && open && results[active]) {
      e.preventDefault();
      pick(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const now = new Date();

  return (
    <div className="mt-8 border border-line-strong bg-hull/50 p-4 sm:p-5">
      <p className="text-[1rem] font-semibold text-snow">Build it where you&rsquo;re going</p>
      <p className="mt-1 text-[0.9rem] leading-snug text-muted">
        Pick the real place and the camp is built in its weather and light right now.
      </p>

      {value ? (
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3 border-l-2 border-signal pl-3">
          <div className="min-w-0" aria-live="polite">
            <p className="text-[0.95rem] font-semibold text-snow">{value.name}</p>
            <p className="mt-0.5 text-[0.85rem] leading-snug text-muted">
              {live === "loading" || live === null
                ? "Checking the weather there…"
                : live === "error"
                  ? "Couldn’t get the weather there right now; the camp shows the usual climate."
                  : `Right now: ${liveLine(live, now)}`}
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setMapOpen((o) => !o)} className="h-9 px-3 text-[0.85rem] text-snow shadow-[inset_0_0_0_1px_rgb(148_170_196/0.32)] hover:bg-white/[0.05]">
              {mapOpen ? "Hide map" : "Change"}
            </button>
            <button type="button" onClick={onClear} className="h-9 px-3 text-[0.85rem] text-muted hover:text-snow">
              Remove
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative mt-4">
        <label htmlFor={inputId} className="sr-only">
          Search places Weatherhaven has deployed
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={open && results.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={open && results[active] ? `${listId}-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder={value ? "Search another place" : "Search places, e.g. Thule"}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={onKey}
            className="h-11 min-w-0 flex-1 border border-line-strong bg-ink px-3 text-[1rem] text-snow placeholder:text-muted/80 focus:border-signal focus:outline-none"
          />
          {!value ? (
            <button
              type="button"
              onClick={() => setMapOpen((o) => !o)}
              aria-expanded={mapOpen}
              className="h-11 shrink-0 px-4 text-[0.9rem] font-medium text-snow shadow-[inset_0_0_0_1px_rgb(148_170_196/0.32)] hover:bg-white/[0.05]"
            >
              {mapOpen ? "Hide map" : "Pick on the map"}
            </button>
          ) : null}
        </div>
        {open && results.length > 0 ? (
          <ul
            id={listId}
            role="listbox"
            aria-label={query.trim() ? "Matching places" : "Suggested places"}
            className="absolute inset-x-0 top-[calc(100%+4px)] z-30 max-h-72 overflow-y-auto border border-line-strong bg-hull shadow-[0_16px_40px_rgb(0_0_0/0.45)] sm:right-auto sm:w-[min(28rem,100%)]"
          >
            {!query.trim() ? <li role="presentation" className="px-3 pb-1 pt-2.5 text-[0.75rem] text-muted">Places Weatherhaven has deployed</li> : null}
            {results.map((p, i) => (
              <li
                key={p.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(p)}
                onMouseEnter={() => setActive(i)}
                className={`cursor-pointer px-3 py-2.5 text-[0.95rem] ${i === active ? "bg-white/[0.07] text-snow" : "text-snow/85"}`}
              >
                {p.name}
              </li>
            ))}
          </ul>
        ) : null}
        {open && query.trim() && results.length === 0 ? (
          <p className="mt-2 text-[0.85rem] text-muted">No documented place by that name. Pick it on the map instead.</p>
        ) : null}
      </div>

      {mapOpen ? (
        <PickMap
          places={places}
          value={value}
          onPick={(p) => {
            onPick(p);
          }}
        />
      ) : null}
    </div>
  );
}
