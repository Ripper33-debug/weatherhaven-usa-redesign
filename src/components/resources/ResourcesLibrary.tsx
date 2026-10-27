"use client";

import { IconLock } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { EmptyState } from "@/components/site/EmptyState";
import { trackEvent } from "@/lib/analytics";
import { PRODUCTS } from "@/lib/products";
import {
  RESOURCE_DOCUMENTS,
  RESOURCE_DOC_TYPES,
  type ResourceClassification,
} from "@/lib/resources";
import { MarketingSection } from "@/components/marketing/MarketingSection";

export function ResourcesLibrary() {
  const [docType, setDocType] = useState<string>("All");
  const [system, setSystem] = useState<string>("All");
  const systemOptions = useMemo(() => {
    const names = new Set(RESOURCE_DOCUMENTS.map((d) => d.system));
    PRODUCTS.forEach((p) => names.add(p.code));
    return ["All", ...Array.from(names).sort()];
  }, []);

  const filtered = useMemo(() => {
    return RESOURCE_DOCUMENTS.filter((d) => {
      if (docType !== "All" && d.docType !== docType) return false;
      if (system !== "All" && d.system !== system) return false;
      return true;
    });
  }, [docType, system]);

  return (
    <>
      <PageHero
        label="Public resources"
        title="Weatherhaven reference materials."
        description="Official company pages, sector overviews, and the ISO 9001:2015 certificate — hosted on weatherhaven.com."
      />

      <MarketingSection variant="slide-up-stagger" staggerMs={70} className="bg-[#080a0c] px-4 py-12 sm:px-6 sm:py-16 lg:px-12">
        <div className="mx-auto max-w-[1400px]">
          <div data-reveal-child className="flex flex-wrap gap-4 border-b border-white/[0.08] pb-4 sm:gap-6">
            <FilterGroup
              label="Document type"
              options={RESOURCE_DOC_TYPES}
              value={docType}
              onChange={setDocType}
            />
            <FilterGroup label="System" options={systemOptions} value={system} onChange={setSystem} />
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 ? (
              <div data-reveal-child className="col-span-full">
                <EmptyState
                  title="No documents match your filters"
                  message="Try adjusting document type or system."
                />
              </div>
            ) : null}
            {filtered.map((doc) => (
              <article
                key={doc.id}
                data-reveal-child
                className="flex flex-col border border-white/[0.08] bg-[#0d0f12] p-5 transition-all duration-300 hover:border-white/[0.2] hover:bg-white/[0.02] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.15em] text-[#4d9fff]">
                    {doc.docType}
                  </span>
                  <ClassificationBadge classification={doc.classification} />
                </div>
                <h2 className="mt-4 text-base font-medium text-white">{doc.title}</h2>
                <p className="mt-1 text-[13px] text-[#8a9099]">{doc.system}</p>
                <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                  <div className="flex items-center gap-3 text-[11px] text-[#8a9099]">
                    <span className="border border-white/[0.12] px-2 py-0.5 font-mono uppercase">{doc.format}</span>
                    <span>{doc.size}</span>
                  </div>
                  {doc.classification === "CUI" ? (
                    <div className="flex items-center gap-2 text-[11px] text-amber-500/90">
                      <IconLock size={14} aria-hidden />
                      <span>Clearance verification required</span>
                    </div>
                  ) : (
                    <a
                      href={doc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => void trackEvent("click", `Resource open — ${doc.title}`)}
                      className="border border-white/20 bg-transparent px-3 py-2 text-[11px] font-medium text-white transition hover:border-white/40"
                    >
                      {doc.format === "PDF" ? "Download" : "Open"}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </MarketingSection>
    </>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="shrink-0">
      <p className="wh-marketing-label mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`whitespace-nowrap border px-3 py-1.5 text-[11px] uppercase tracking-wider transition ${
              value === opt
                ? "border-[#4d9fff] text-[#4d9fff]"
                : "border-white/[0.12] text-[#8a9099] hover:border-white/25 hover:text-white"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function ClassificationBadge({ classification }: { classification: ResourceClassification }) {
  const isCui = classification === "CUI";
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-wider ${
        isCui ? "text-amber-500/90" : "text-[#8a9099]"
      }`}
    >
      {classification}
    </span>
  );
}
