"use client";

import { useMemo, useState } from "react";
import type { SiteRow } from "@/lib/track-record";

const PAGE = 25;

const fieldClass = "h-10 border border-line-strong bg-hull px-3 text-[0.9rem] text-snow";

/**
 * The confirmed sites as a filterable table. The first 25 rows show until the visitor asks for the
 * rest; filtering always shows every match. On phones each row stacks into a short block.
 */
export function FieldedSitesTable({
  rows,
  regions,
  types,
}: {
  rows: SiteRow[];
  regions: readonly string[];
  types: readonly string[];
}) {
  const [region, setRegion] = useState("all");
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (region === "all" || r.region === region) &&
        (type === "all" || r.type === type) &&
        (!q || `${r.country} ${r.place}`.toLowerCase().includes(q)),
    );
  }, [rows, region, type, query]);

  const filtering = region !== "all" || type !== "all" || query.trim() !== "";
  const visible = filtering || showAll ? filtered : filtered.slice(0, PAGE);

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="flex">
          <span className="sr-only">Search country or place</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a country or place"
            className={`${fieldClass} w-full placeholder:text-muted sm:w-[15rem]`}
          />
        </label>
        <label className="flex">
          <span className="sr-only">Region</span>
          <select value={region} onChange={(e) => setRegion(e.target.value)} className={`${fieldClass} w-full sm:w-auto`}>
            <option value="all">Any region</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="flex">
          <span className="sr-only">Type</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className={`${fieldClass} w-full sm:w-auto`}>
            <option value="all">Any type</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <p className="v2-tnum text-[0.9rem] text-muted sm:ml-auto" aria-live="polite">
          {filtering ? `${filtered.length} of ${rows.length} sites` : `${rows.length} sites`}
        </p>
      </div>

      <table className="mt-6 w-full border-t border-line text-left">
        <caption className="sr-only">Confirmed Weatherhaven sites</caption>
        <thead className="hidden md:table-header-group">
          <tr className="border-b border-line">
            <th scope="col" className="v2-tech py-3 pr-6 font-medium text-muted">
              Country or mission
            </th>
            <th scope="col" className="v2-tech py-3 pr-6 font-medium text-muted">
              Place
            </th>
            <th scope="col" className="v2-tech py-3 pr-6 font-medium text-muted">
              Region
            </th>
            <th scope="col" className="v2-tech py-3 font-medium text-muted">
              Type
            </th>
          </tr>
        </thead>
        <tbody>
          {visible.map((r) => (
            <tr key={r.id} className="block border-b border-line py-3 md:table-row md:py-0">
              <td className="block text-[0.95rem] font-semibold text-snow md:table-cell md:py-3 md:pr-6">{r.country}</td>
              <td className="block text-[0.95rem] text-snow/85 md:table-cell md:py-3 md:pr-6">
                {r.place === r.country ? <span className="text-muted">Site not named</span> : r.place}
                <span className="mt-0.5 block text-[0.875rem] text-muted md:hidden">
                  {r.type}, {r.region}
                </span>
              </td>
              <td className="hidden text-[0.875rem] text-muted md:table-cell md:py-3 md:pr-6">{r.region}</td>
              <td className="hidden text-[0.875rem] text-muted md:table-cell md:py-3">{r.type}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 ? (
        <p className="mt-6 text-[0.95rem] text-muted">No confirmed site matches. Try another region, type or spelling.</p>
      ) : null}

      {!filtering && !showAll && filtered.length > PAGE ? (
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={() => setShowAll(true)} className="v2-btn v2-btn-ghost">
            Show all {filtered.length} sites
          </button>
        </div>
      ) : null}
    </div>
  );
}
