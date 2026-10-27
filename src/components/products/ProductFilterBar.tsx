"use client";

import { useState } from "react";
import {
  FILTER_ENVIRONMENT_OPTIONS,
  FILTER_MISSION_OPTIONS,
  FILTER_MOBILITY_OPTIONS,
  FILTER_SIZE_OPTIONS,
  type ProductFilterEnvironment,
  type ProductFilterMission,
  type ProductFilterMobility,
  type ProductFilterSize,
} from "@/lib/products";
import { useProductCompare } from "@/contexts/ProductCompareContext";

export type ProductFilters = {
  mission: ProductFilterMission;
  environment: ProductFilterEnvironment;
  mobility: ProductFilterMobility;
  size: ProductFilterSize;
  search: string;
};

type Props = {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
  onClear: () => void;
  sticky?: boolean;
  /** When true, filters are hidden until the user expands (faster path to the grid). */
  defaultCollapsed?: boolean;
};

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1.5">
      <span className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-[#8a9099]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-9 border border-white/10 bg-[#080a0c] px-3 py-2 font-mono text-[11px] text-white outline-none transition-colors hover:border-white/20 focus:border-[#4d9fff]/50"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#080a0c]">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ProductFilterBar({ filters, onChange, onClear, sticky = true, defaultCollapsed = false }: Props) {
  const [expanded, setExpanded] = useState(!defaultCollapsed);
  const { selectedSlugs, setCompareOpen } = useProductCompare();

  const activeTags: { key: keyof ProductFilters; label: string }[] = [];
  if (filters.mission !== "all") {
    activeTags.push({
      key: "mission",
      label: FILTER_MISSION_OPTIONS.find((o) => o.value === filters.mission)?.label ?? filters.mission,
    });
  }
  if (filters.environment !== "all") {
    activeTags.push({
      key: "environment",
      label: FILTER_ENVIRONMENT_OPTIONS.find((o) => o.value === filters.environment)?.label ?? filters.environment,
    });
  }
  if (filters.mobility !== "all") {
    activeTags.push({
      key: "mobility",
      label: FILTER_MOBILITY_OPTIONS.find((o) => o.value === filters.mobility)?.label ?? filters.mobility,
    });
  }
  if (filters.size !== "all") {
    activeTags.push({
      key: "size",
      label: FILTER_SIZE_OPTIONS.find((o) => o.value === filters.size)?.label ?? filters.size,
    });
  }
  if (filters.search.trim()) {
    activeTags.push({
      key: "search",
      label: `Search: ${filters.search.trim()}`,
    });
  }

  return (
    <div
      className={`border-b border-white/[0.08] bg-[#0d0f12] ${sticky ? "sticky top-14 z-40 sm:top-16" : ""}`}
    >
      <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6 lg:px-12">
        <label className="block">
          <span className="sr-only">Search shelter systems</span>
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            placeholder="Search by name or code — e.g. TRECC, EHMECC, MECC"
            className="w-full border border-white/10 bg-[#080a0c] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-[#8a9099] focus:border-[#4d9fff]/50"
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-sm font-medium text-white/80 transition hover:text-white"
            aria-expanded={expanded}
          >
            {expanded ? "Hide filters" : "Refine results"}
            <span className="ml-1 text-[#8a9099]" aria-hidden>
              {expanded ? "↑" : "↓"}
            </span>
          </button>
          {selectedSlugs.length >= 2 && (
            <button
              type="button"
              onClick={() => setCompareOpen(true)}
              className="min-h-9 border border-white/20 bg-transparent px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition hover:border-[#4d9fff]/50 hover:text-[#4d9fff]"
            >
              Compare ({selectedSlugs.length})
            </button>
          )}
        </div>

        {expanded && (
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-4 pb-1 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Mission Type"
              value={filters.mission}
              options={FILTER_MISSION_OPTIONS}
              onChange={(v) => onChange({ ...filters, mission: v as ProductFilterMission })}
            />
            <FilterSelect
              label="Environment"
              value={filters.environment}
              options={FILTER_ENVIRONMENT_OPTIONS}
              onChange={(v) => onChange({ ...filters, environment: v as ProductFilterEnvironment })}
            />
            <FilterSelect
              label="Mobility"
              value={filters.mobility}
              options={FILTER_MOBILITY_OPTIONS}
              onChange={(v) => onChange({ ...filters, mobility: v as ProductFilterMobility })}
            />
            <FilterSelect
              label="Size"
              value={filters.size}
              options={FILTER_SIZE_OPTIONS}
              onChange={(v) => onChange({ ...filters, size: v as ProductFilterSize })}
            />
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onClear}
              className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#8a9099] transition hover:text-white"
            >
              Clear filters
            </button>
          </div>
        </div>
        )}

        {activeTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeTags.map((tag) => (
              <button
                key={tag.key}
                type="button"
                onClick={() =>
                  onChange({
                    ...filters,
                    ...(tag.key === "search" ? { search: "" } : { [tag.key]: "all" }),
                  })
                }
                className="inline-flex items-center gap-2 border border-[#4d9fff]/30 bg-[#4d9fff]/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#4d9fff] transition hover:bg-[#4d9fff]/20"
              >
                {tag.label}
                <span aria-hidden>×</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
