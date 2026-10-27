"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  FILTER_ENVIRONMENT_OPTIONS,
  FILTER_MISSION_OPTIONS,
  FILTER_MOBILITY_OPTIONS,
  filterProducts,
  type Product,
  type ProductFilterEnvironment,
  type ProductFilterMission,
  type ProductFilterMobility,
} from "@/lib/products";
import { PRODUCT_CONTENT, PRODUCT_FAMILIES, type ProductFamily } from "@/lib/product-content";
import { SystemCard } from "@/components/systems/SystemCard";
import { FAMILY_ORDER } from "@/lib/site-nav";

type FamilyFilter = ProductFamily | "all";

const familyOf = (slug: string): ProductFamily | undefined => PRODUCT_CONTENT[slug]?.family;

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { value: string; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="flex">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="h-10 min-w-[9.5rem] border border-line-strong bg-hull px-3 text-[0.9rem] text-snow"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.value === "all" ? `Any ${label.toLowerCase()}` : o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function SystemsCatalog({ products }: { products: Product[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  // The family filter lives in the URL, so menu links and the back button always agree with the list.
  const familyParam = params.get("family");
  const family: FamilyFilter = PRODUCT_FAMILIES.some((f) => f.id === familyParam)
    ? (familyParam as ProductFamily)
    : "all";
  const [mission, setMission] = useState<ProductFilterMission>("all");
  const [environment, setEnvironment] = useState<ProductFilterEnvironment>("all");
  const [mobility, setMobility] = useState<ProductFilterMobility>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      filterProducts(products, { mission, environment, mobility, size: "all", search }).filter(
        (p) => family === "all" || familyOf(p.slug) === family,
      ),
    [products, mission, environment, mobility, search, family],
  );

  const anyFilter = family !== "all" || mission !== "all" || environment !== "all" || mobility !== "all" || search.trim() !== "";

  const chooseFamily = (f: FamilyFilter) => {
    const q = new URLSearchParams(params.toString());
    if (f === "all") q.delete("family");
    else q.set("family", f);
    router.replace(q.toString() ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  const reset = () => {
    chooseFamily("all");
    setMission("all");
    setEnvironment("all");
    setMobility("all");
    setSearch("");
  };

  const groups = PRODUCT_FAMILIES.map((f) => ({
    ...f,
    items: filtered
      .filter((p) => familyOf(p.slug) === f.id)
      .sort((a, b) => FAMILY_ORDER.indexOf(a.slug) - FAMILY_ORDER.indexOf(b.slug)),
  })).filter((g) => g.items.length > 0);
  const ungrouped = filtered.filter((p) => !familyOf(p.slug));

  return (
    <div className="bg-ink pb-24">
      <div className="z-30 border-b border-line bg-ink/95 backdrop-blur-xl sm:sticky sm:top-16 lg:top-[72px]">
        <div className="v2-wrap flex flex-col gap-3 py-3 xl:flex-row xl:items-center xl:justify-between">
          <div role="group" aria-label="Shelter family" className="flex flex-wrap gap-2">
            {[{ id: "all" as const, name: "All systems" }, ...PRODUCT_FAMILIES].map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={family === f.id}
                onClick={() => chooseFamily(f.id)}
                className={`h-10 px-4 text-[0.9rem] font-medium transition-colors ${
                  family === f.id ? "bg-snow text-ink" : "text-snow shadow-[inset_0_0_0_1px_rgb(148_170_196/0.32)] hover:bg-white/[0.05]"
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex">
              <span className="sr-only">Search systems</span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search: TRECC, polar, 463L"
                className="h-10 w-[13.5rem] border border-line-strong bg-hull px-3 text-[0.9rem] text-snow placeholder:text-muted/80"
              />
            </label>
            <Select label="Mission" value={mission} options={FILTER_MISSION_OPTIONS} onChange={setMission} />
            <Select label="Environment" value={environment} options={FILTER_ENVIRONMENT_OPTIONS} onChange={setEnvironment} />
            <Select label="Transport" value={mobility} options={FILTER_MOBILITY_OPTIONS} onChange={setMobility} />
          </div>
        </div>
      </div>

      <div className="v2-wrap pt-10">
        <p className="v2-tnum text-[0.9rem] text-muted" aria-live="polite">
          {filtered.length === products.length
            ? `${products.length} systems`
            : `${filtered.length} of ${products.length} systems match`}
          {anyFilter ? (
            <button type="button" onClick={reset} className="v2-link ml-4">
              Clear filters
            </button>
          ) : null}
        </p>

        {filtered.length === 0 ? (
          <div className="mt-10 border border-line p-8">
            <p className="v2-h3 text-snow">No system matches every filter.</p>
            <p className="mt-2 text-muted">
              Remove a filter, or tell a Weatherhaven expert what you need and they will recommend a configuration.
            </p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={reset} className="v2-btn v2-btn-ghost">
                Clear filters
              </button>
              <a href="/contact" className="v2-btn">
                Talk to an expert
              </a>
            </div>
          </div>
        ) : null}

        {groups.map((g) => (
          <section key={g.id} aria-labelledby={`fam-${g.id}`} className="mt-14 first-of-type:mt-10">
            <div className="flex flex-col gap-2 border-b border-line pb-5 sm:flex-row sm:items-end sm:justify-between">
              <h2 id={`fam-${g.id}`} className="v2-h2 text-snow">
                {g.name}
              </h2>
              <p className="max-w-[56ch] text-[0.95rem] leading-relaxed text-muted sm:text-right">{g.summary}</p>
            </div>
            <div className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((p) => (
                <SystemCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        ))}
        {ungrouped.length > 0 ? (
          <section className="mt-14">
            <h2 className="v2-h2 border-b border-line pb-5 text-snow">More systems</h2>
            <div className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {ungrouped.map((p) => (
                <SystemCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
