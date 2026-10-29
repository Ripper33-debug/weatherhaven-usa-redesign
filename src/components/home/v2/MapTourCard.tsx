"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { TourStop } from "@/lib/map-tour";
import { describeSky, localTimeFormatter, signedDegrees, toFahrenheit, toMph, type Conditions } from "@/lib/field-readout";
import { sourceHost } from "@/lib/field-stories";
import { lightAt } from "@/lib/solar";

export type TourPoint = TourStop & { x: number; y: number; tz: string | null };

const KIND: Record<TourStop["kind"], { label: string; color: string }> = {
  military: { label: "Defense and peacekeeping", color: "#f18522" },
  humanitarian: { label: "Medical and disaster relief", color: "#eef2f6" },
  scientific: { label: "Research and commercial", color: "#8ec5e6" },
};

/**
 * One stop of the guided tour. Every stop is rendered in the same grid cell and only the current
 * one is shown, so the card is always as tall as the longest stop and the page below never moves
 * while the tour plays.
 */
/** Keeps a number and its unit on one line ("3,200 m", "130-ft" stays as written). */
const keepUnits = (t: string) => t.replace(/(\d) (m|ft|km|mph)\b/g, "$1\u00a0$2");

export function MapTourSlide({
  stop,
  index,
  count,
  current,
  now,
  weather,
}: {
  stop: TourPoint;
  index: number;
  count: number;
  current: boolean;
  now: Date | null;
  weather: Conditions | "error" | undefined;
}) {
  const kind = KIND[stop.kind];
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${count}: ${stop.where}`}
      aria-hidden={!current}
      inert={!current}
      className={`[grid-area:1/1] ${current ? "v2-tour-slide-in visible" : "invisible"}`}
    >
      <p className="flex items-center gap-2 text-[0.85rem] font-medium" style={{ color: kind.color }}>
        <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: kind.color }} />
        {kind.label}
      </p>
      <h3 className="v2-h3 mt-2 text-snow">{keepUnits(stop.title)}</h3>
      <p className="mt-1.5 text-[0.9rem] text-snow/80">
        {stop.where}
        {stop.when ? <span className="text-muted">. {stop.when}</span> : null}
      </p>
      <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">{keepUnits(stop.line)}</p>

      {stop.figures.length ? (
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4">
          {stop.figures.map((f) => (
            <div key={f.label}>
              <dt className="sr-only">{f.label}</dt>
              <dd className="v2-figure text-[1.5rem] leading-none text-snow">{f.value}</dd>
              <dd className="mt-1.5 text-[0.8rem] leading-snug text-muted">{f.label}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {!stop.area && stop.tz ? (
        <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-line pt-4 text-[0.9rem]">
          <dt className="text-muted">Local time</dt>
          <dd className="v2-tnum text-snow">{current && now ? <LocalTime now={now} tz={stop.tz} lat={stop.lat} lng={stop.lng} /> : " "}</dd>
          <dt className="text-muted">This hour</dt>
          {/* Two lines reserved, so a long reading doesn't make the card grow. */}
          <dd className="min-h-[2.9em] text-snow">{current ? <WeatherNow value={weather} /> : " "}</dd>
        </dl>
      ) : null}

      {stop.systems.length ? (
        <p className="mt-4 text-[0.9rem] text-muted">
          {stop.systems.length > 1 ? "Systems: " : "System: "}
          {stop.systems.map((s, i) => (
            <span key={s.slug}>
              {i ? ", " : null}
              <Link href={`/configurable-solutions/${s.slug}`} className="text-snow underline decoration-line-strong underline-offset-2 hover:text-signal-soft">
                {s.name}
              </Link>
            </span>
          ))}
        </p>
      ) : null}

      <p className="mt-3 text-[0.8rem] leading-relaxed text-muted">
        {stop.sources.length > 1 ? "Sources: " : "Source: "}
        {stop.sources.map((s, i) => (
          <span key={s.href}>
            {i ? ", " : null}
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              title={s.label}
              className="underline decoration-line-strong underline-offset-2 hover:text-snow"
            >
              {sourceHost(s.href)}
            </a>
          </span>
        ))}
        {stop.attribution ? <span className="block">{stop.attribution}</span> : null}
      </p>
      <Link href={stop.more} className="v2-link mt-4 inline-block text-[0.9rem]">
        Read the full story
      </Link>
    </div>
  );
}

function LocalTime({ now, tz, lat, lng }: { now: Date; tz: string; lat: number; lng: number }) {
  const fmt = useMemo(() => localTimeFormatter(tz), [tz]);
  if (!fmt) return null;
  return (
    <>
      <time>{fmt.format(now)}</time>, {lightAt(now, lat, lng)}
    </>
  );
}

function WeatherNow({ value }: { value: Conditions | "error" | undefined }) {
  if (value === undefined) return <span className="text-muted">Checking…</span>;
  if (value === "error") return <span className="text-muted">Not available right now</span>;
  const sky = describeSky(value.symbol);
  const wind = value.windMs === null ? null : `wind ${Math.round(toMph(value.windMs))} mph`;
  return (
    <>
      <span className="v2-figure">
        {signedDegrees(toFahrenheit(value.tempC))} °F ({signedDegrees(value.tempC)} °C)
      </span>
      {[sky?.toLowerCase(), wind].filter(Boolean).map((part) => `, ${part}`)}
    </>
  );
}
