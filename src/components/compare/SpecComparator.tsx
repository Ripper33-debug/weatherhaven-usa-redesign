"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { ComparableSystem } from "@/lib/shelter-compare";
import { sideBySide } from "@/lib/spec-rows";
import type { ProductSpec } from "@/lib/products";

/**
 * Any two systems, side by side, from their published spec tables. Rows group differently named
 * specs ("Packed size", "Stowed footprint") so the figures line up. On phones the row name sits
 * above the two values; nothing scrolls sideways.
 */
function SystemSelect({
  label,
  value,
  onChange,
  systems,
}: {
  label: string;
  value: string;
  onChange: (slug: string) => void;
  systems: ComparableSystem[];
}) {
  const id = useId();
  const families = [...new Set(systems.map((s) => s.familyName))];
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="v2-tech block text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-11 w-full border border-line-strong bg-hull px-3 text-[0.95rem] text-snow"
      >
        {families.map((f) => (
          <optgroup key={f} label={f}>
            {systems
              .filter((s) => s.familyName === f)
              .map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

function Values({ row, specs, who }: { row: string; specs: ProductSpec[]; who: string }) {
  if (specs.length === 0)
    return (
      <p className="text-[0.95rem] text-muted">
        <span className="sr-only">{who}: </span>Not published
      </p>
    );
  return (
    <ul className="space-y-1.5" aria-label={who}>
      {specs.map((s) => (
        <li key={s.label} className="text-[0.95rem] leading-snug text-snow">
          {s.label.toLowerCase() !== row.toLowerCase() ? (
            <span className="block text-[0.8125rem] text-muted">{s.label}</span>
          ) : null}
          {s.value}
        </li>
      ))}
    </ul>
  );
}

export function SpecComparator({ systems, initial }: { systems: ComparableSystem[]; initial: [string, string] }) {
  const [a, setA] = useState(initial[0]);
  const [b, setB] = useState(initial[1]);
  const sa = systems.find((s) => s.slug === a) ?? systems[0];
  const sb = systems.find((s) => s.slug === b) ?? systems[1];
  const rows = useMemo(() => sideBySide(sa.specs, sb.specs), [sa, sb]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1fr)] sm:gap-6">
        <p className="hidden sm:block" aria-hidden />
        <SystemSelect label="First system" value={sa.slug} onChange={setA} systems={systems} />
        <SystemSelect label="Second system" value={sb.slug} onChange={setB} systems={systems} />
      </div>

      <div className="mt-8 border-t border-line" aria-live="polite">
        <div className="grid grid-cols-2 gap-4 border-b border-line py-5 sm:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1fr)] sm:gap-6">
          <p className="hidden text-[0.8125rem] text-muted sm:block">System</p>
          {[sa, sb].map((s) => (
            <div key={s.slug} className="min-w-0">
              <Link href={`/configurable-solutions/${s.slug}`} className="v2-link text-[1.1rem] font-semibold">
                {s.name}
              </Link>
              <p className="mt-1 text-[0.875rem] leading-snug text-muted">{s.keySpec}</p>
            </div>
          ))}
        </div>
        {rows.length === 0 ? (
          <p className="py-6 text-[0.95rem] text-muted">Neither system has published specifications yet.</p>
        ) : (
          <dl>
            {rows.map((r) => (
              <div
                key={r.row}
                className="grid grid-cols-2 gap-x-4 gap-y-2 border-b border-line py-4 sm:grid-cols-[11rem_minmax(0,1fr)_minmax(0,1fr)] sm:gap-x-6"
              >
                <dt className="col-span-2 text-[0.875rem] font-semibold text-snow sm:col-span-1 sm:font-normal sm:text-muted">{r.row}</dt>
                <dd className="min-w-0">
                  <Values row={r.row} specs={r.a} who={sa.name} />
                </dd>
                <dd className="min-w-0">
                  <Values row={r.row} specs={r.b} who={sb.name} />
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

/**
 * The comparator with its first system taken from ?a= (product pages link here with their own
 * system). Needs a Suspense boundary; the page renders the plain comparator as the fallback.
 */
export function SpecComparatorFromUrl({ systems, initial }: { systems: ComparableSystem[]; initial: [string, string] }) {
  const a = useSearchParams().get("a");
  const first = a && systems.some((s) => s.slug === a) ? a : initial[0];
  const second = first === initial[1] ? initial[0] : initial[1];
  return <SpecComparator key={first} systems={systems} initial={[first, second]} />;
}
