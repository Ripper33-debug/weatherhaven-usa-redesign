"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { liveLine, placeAtPoint, type GuidePlace, type LiveConditions } from "@/lib/live-site";

/**
 * "Build it where you're going": pick a real place, by searching the places Weatherhaven has
 * deployed or by clicking anywhere on the map, and the 3D camp is built in that place's weather
 * and light this hour. The search box (an ARIA combobox) is the keyboard way in; the map is an
 * extra for pointers and stays out of the tab order.
 */
const SUGGESTED = [
  "greenland-thule-greenland",
  "antarctica-mcmurdo-station-antarctica",
  "saudi-arabia-riyadh-saudi-arabia",
  "afghanistan-nato-kabul-afghanistan",
  "canada-alert-nunavut",
  "brazil-manaus-brazil",
];

const fold = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

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
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm || !map) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const [lng, lat] = map.invert(pt.x, pt.y);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lng) > 180 || Math.abs(lat) > 85) return;
    // A click within 8 screen pixels of a documented place (a tap within 14) picks that place,
    // the nearest one; anywhere else picks the point itself.
    const reach = (window.matchMedia("(pointer: coarse)").matches ? 14 : 8) / ctm.a;
    let near: GuidePlace | null = null;
    let best = reach;
    for (const { p, xy } of pins) {
      const d = Math.hypot(xy[0] - pt.x, xy[1] - pt.y);
      if (d < best) {
        best = d;
        near = p;
      }
    }
    onPick(near ?? placeAtPoint(lat, lng, places));
  };

  return (
    <div className="mt-3 border border-line bg-ink/60">
      <svg ref={svgRef} viewBox="0 0 1000 508" className="block h-auto w-full cursor-crosshair select-none" onClick={onClick} aria-hidden>
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
  climateLabel,
  onPick,
  onClear,
  onInteract,
}: {
  places: GuidePlace[];
  value: GuidePlace | null;
  live: LiveConditions | "loading" | "error" | null;
  /** The climate answer the place set, shown so a wrong guess can be changed. */
  climateLabel: string | null;
  onPick: (p: GuidePlace) => void;
  onClear: () => void;
  /** Any use of the picker (so the page doesn't move on underneath it). */
  onInteract: () => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  // -1: nothing highlighted until the visitor types or uses the arrow keys.
  const [active, setActive] = useState(-1);
  const [mapOpen, setMapOpen] = useState(false);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return SUGGESTED.map((id) => places.find((p) => p.id === id)).filter((p): p is GuidePlace => !!p);
    const starts = places.filter((p) => fold(p.name).startsWith(q));
    const contains = places.filter((p) => !fold(p.name).startsWith(q) && fold(p.name).includes(q));
    return [...starts, ...contains].slice(0, 7);
  }, [query, places]);

  useEffect(() => {
    if (active < 0) return;
    listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(`${listId}-${active}`)}`)?.scrollIntoView({ block: "nearest" });
  }, [active, listId]);

  const shown = open && results.length > 0;
  const noMatch = open && query.trim() !== "" && results.length === 0;

  const pick = (p: GuidePlace) => {
    onPick(p);
    setQuery("");
    setOpen(false);
    setActive(-1);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onInteract();
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      if (results.length) setActive((i) => (e.key === "ArrowDown" ? (i + 1) % results.length : i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && shown && active >= 0 && results[active]) {
      e.preventDefault();
      pick(results[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div className="mt-8 border border-line-strong bg-hull/50 p-4 sm:p-5">
      <p className="text-[1rem] font-semibold text-snow">Build it where you&rsquo;re going</p>
      <p className="mt-1 text-[0.9rem] leading-snug text-muted">
        Pick the real place and the camp is built in its weather and light this hour.
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
                  : `This hour: ${liveLine(live)}`}
            </p>
            {climateLabel ? (
              <p className="mt-1 text-[0.85rem] leading-snug text-muted">
                Climate set to <span className="text-snow">{climateLabel.toLowerCase()}</span>. Change it below if that&rsquo;s not right.
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => {
              onClear();
              inputRef.current?.focus();
            }}
            className="h-9 px-3 text-[0.85rem] text-muted shadow-[inset_0_0_0_1px_rgb(148_170_196/0.32)] hover:text-snow"
          >
            Remove place
          </button>
        </div>
      ) : null}

      <div className="relative mt-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-label={value ? "Search another place Weatherhaven has deployed" : "Search places Weatherhaven has deployed"}
            aria-expanded={shown}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={shown && active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
            placeholder={value ? "Search another place" : "Search places, e.g. Thule"}
            value={query}
            onChange={(e) => {
              onInteract();
              setQuery(e.target.value);
              setActive(e.target.value.trim() ? 0 : -1);
              setOpen(true);
            }}
            onFocus={() => {
              onInteract();
              setOpen(true);
              setActive(-1);
            }}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={onKey}
            className="h-11 w-full min-w-0 border border-line-strong sm:w-auto sm:flex-1 bg-ink px-3 text-[1rem] text-snow placeholder:text-muted/80 focus:border-signal focus:outline-none"
          />
          {/* The map only works with a pointer; keyboard and screen-reader users have the search. */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={() => {
              onInteract();
              setMapOpen((o) => !o);
            }}
            className="h-11 shrink-0 px-4 text-[0.9rem] font-medium text-snow shadow-[inset_0_0_0_1px_rgb(148_170_196/0.32)] hover:bg-white/[0.05]"
          >
            {mapOpen ? "Hide map" : "Pick on the map"}
          </button>
        </div>
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label={query.trim() ? "Matching places" : "Suggested places"}
          hidden={!shown}
          className="absolute inset-x-0 top-[calc(100%+4px)] z-30 max-h-72 overflow-y-auto border border-line-strong bg-hull shadow-[0_16px_40px_rgb(0_0_0/0.45)] sm:right-auto sm:w-[min(28rem,100%)]"
        >
          {!query.trim() ? (
            <li role="presentation" className="px-3 pb-1 pt-2.5 text-[0.75rem] text-muted">
              Places Weatherhaven has deployed
            </li>
          ) : null}
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
        <p role="status" className="mt-2 min-h-0 text-[0.85rem] text-muted empty:hidden">
          {noMatch ? "No documented place by that name. Pick it on the map instead." : ""}
        </p>
      </div>

      {mapOpen ? <PickMap places={places} value={value} onPick={(p) => onPick(p)} /> : null}

      <p className="mt-3 text-[0.75rem] text-muted/80">
        Weather: this hour&rsquo;s forecast from{" "}
        <a href="https://www.met.no/en" className="underline decoration-line-strong underline-offset-2 hover:text-snow">
          MET Norway
        </a>
        .
      </p>
    </div>
  );
}
