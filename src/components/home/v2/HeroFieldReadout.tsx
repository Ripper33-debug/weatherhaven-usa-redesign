"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatCoords,
  isStale,
  localTimeFormatter,
  signedDegrees,
  toFahrenheit,
  type FieldExtremes,
  type FieldReading,
} from "@/lib/field-readout";
import { lightAt, type Light } from "@/lib/solar";

/**
 * Instrument strip along the bottom of the hero film: the coldest and hottest places on
 * Weatherhaven's deployment map right now, with a running UTC clock and each place's local time.
 * Temperatures come from the server (MET Norway, cached for 30 minutes); clocks start on mount so
 * server and browser HTML match. If the page was served from an old cache, the strip says it shows
 * the latest reading and gives local times for that hour instead of now.
 */
const ICE = "#8fc1ec";

function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // Tick on the second boundary so the clock never skips or doubles a second.
    let timer = 0;
    const tick = () => {
      const d = new Date();
      setNow(d);
      timer = window.setTimeout(tick, 1000 - d.getMilliseconds() + 5);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, []);
  return now;
}

const UTC_FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
const UTC_HM = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

function LightIcon({ light }: { light: Light }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden
      className={light === "daylight" ? "text-signal-soft" : light === "twilight" ? "text-snow/60" : "text-muted"}
    >
      {light === "dark" ? (
        <path d="M6.6 1.2A4 4 0 1 0 8.8 7.4 3.2 3.2 0 0 1 6.6 1.2z" fill="currentColor" />
      ) : (
        <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
          <circle cx="5" cy="5" r="1.9" fill="currentColor" />
          <path d="M5 .6v1.1M5 8.3v1.1M.6 5h1.1M8.3 5h1.1M1.9 1.9l.8.8M7.3 7.3l.8.8M1.9 8.1l.8-.8M7.3 2.7l.8-.8" />
        </g>
      )}
    </svg>
  );
}

function Reading({ kind, r, at }: { kind: "cold" | "hot"; r: FieldReading; at: Date | null }) {
  const local = useMemo(() => localTimeFormatter(r.tz), [r.tz]);
  const light = at ? lightAt(at, r.lat, r.lng) : null;
  const f = signedDegrees(toFahrenheit(r.tempC));
  const c = signedDegrees(r.tempC);
  return (
    <div className="min-w-0 border-l-2 pl-3 sm:pl-4" style={{ borderColor: kind === "cold" ? ICE : "var(--v2-signal)" }}>
      <p className="text-[0.8rem] text-muted">{kind === "cold" ? "Coldest" : "Hottest"}</p>
      <p className="mt-1 flex items-baseline gap-2 whitespace-nowrap">
        <span className="v2-figure text-[1.7rem] leading-none text-snow sm:text-[2rem]">
          {f}
          <span className="ml-0.5 text-[0.6em]">°F</span>
        </span>
        <span className="v2-figure text-[0.95rem] text-muted">{c} °C</span>
      </p>
      <p className="mt-1.5 text-[0.82rem] leading-snug text-snow/90 sm:truncate sm:text-[0.88rem]">{r.name}</p>
      <p className="v2-tnum mt-0.5 hidden flex-wrap gap-x-3 text-[0.78rem] text-muted sm:flex">
        <span>{formatCoords(r.lat, r.lng)}</span>
        {local ? (
          <span className="inline-flex items-center gap-1.5">
            <time>{at ? local.format(at) : "--:--"}</time> local
            {light ? (
              <>
                <LightIcon light={light} />
                <span>{light}</span>
              </>
            ) : null}
          </span>
        ) : null}
      </p>
    </div>
  );
}

function MetCredit() {
  return (
    <a href="https://www.met.no/en" className="underline decoration-line-strong underline-offset-2 hover:text-snow">
      MET Norway
    </a>
  );
}

export function HeroFieldReadout({ field }: { field: FieldExtremes }) {
  const now = useNow();
  const stale = now ? isStale(field.at, now) : false;
  // Local times and daylight are for the reading's hour when the reading is old.
  const at = now ? (stale ? new Date(field.at) : now) : null;
  const clock = stale ? (
    <>
      Reading for <time>{UTC_HM.format(new Date(field.at))}</time> UTC
    </>
  ) : (
    <>
      <time>{now ? UTC_FMT.format(now) : "--:--:--"}</time> UTC
    </>
  );
  return (
    <section aria-label="Weather at places Weatherhaven has deployed" className="min-w-0 flex-1">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:gap-x-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-10">
        <div className="col-span-2 sm:flex sm:items-baseline sm:justify-between sm:gap-4 lg:col-span-1 lg:block">
          <p className="text-[0.82rem] font-semibold leading-snug text-snow [font-variation-settings:'wdth'_108] sm:text-[0.85rem]">
            {stale ? "Latest reading" : "Right now"}, where Weatherhaven has deployed
          </p>
          <p className="v2-figure hidden shrink-0 text-[0.95rem] text-muted sm:block lg:mt-1.5 lg:text-[1.05rem]">{clock}</p>
          <p className="mt-1.5 hidden text-[0.75rem] leading-snug text-muted/80 lg:block">
            The hour&rsquo;s forecast from <MetCredit />, at places on Weatherhaven&rsquo;s deployment map.
          </p>
        </div>
        <Reading kind="cold" r={field.cold} at={at} />
        <Reading kind="hot" r={field.hot} at={at} />
        <div className="col-span-2 flex items-baseline justify-between gap-4 text-[0.72rem] leading-snug text-muted/80 sm:block lg:hidden">
          <p className="v2-figure shrink-0 text-[0.8rem] text-muted sm:hidden">{clock}</p>
          <p className="text-right sm:text-left">
            <span className="sm:hidden">
              Forecast: <MetCredit />
            </span>
            <span className="hidden sm:inline">
              The hour&rsquo;s forecast from <MetCredit />, at places on Weatherhaven&rsquo;s deployment map.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
