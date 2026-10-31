"use client";

import { useSitePathname } from "@/hooks/useSitePathname";
import Link from "next/link";
import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import { trackEvent } from "@/lib/analytics";
import { contactUrl } from "@/lib/contact-url";
import {
  COMPARE_SPEC_LABELS,
  getCompareSpecValues,
  type CompareSpecKey,
} from "@/lib/products";
import { useProductCompare } from "@/contexts/ProductCompareContext";

const SPEC_KEYS: CompareSpecKey[] = [
  "footprint",
  "personnel",
  "transport",
  "setupTime",
  "climate",
  "power",
  "priceRange",
];

const btnPrimary =
  "inline-flex w-full min-h-11 items-center justify-center border border-white bg-white px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-zinc-100";

export function ProductCompareOverlay() {
  const pathname = useSitePathname();
  const { compareOpen, setCompareOpen, selectedProducts, clearCompare } = useProductCompare();

  useEffect(() => {
    setCompareOpen(false);
  }, [pathname, setCompareOpen]);

  useEffect(() => {
    if (!compareOpen) return;
    void trackEvent("click", "Compare tool opened");
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCompareOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [compareOpen, setCompareOpen]);

  if (!compareOpen || selectedProducts.length < 2) return null;

  const bestForKey = (key: CompareSpecKey) => {
    if (key === "priceRange") return null;
    const scores = selectedProducts.map((p) => p.compareScores[key]);
    return Math.max(...scores);
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#080a0c]/98" role="dialog" aria-modal="true">
      <header className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-5 sm:px-8">
        <p className="wh-label">System Comparison</p>
        <button
          type="button"
          onClick={() => setCompareOpen(false)}
          className="p-2 text-[#8a9099] hover:text-white"
          aria-label="Close comparison"
        >
          <IconX size={22} stroke={1.5} />
        </button>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-8">
        <div
          className={`mx-auto grid max-w-[1200px] gap-0.5 ${
            selectedProducts.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"
          }`}
        >
          {selectedProducts.map((product) => {
            const values = getCompareSpecValues(product);
            return (
              <div key={product.slug} className="border border-white/[0.08] bg-[#0d0f12] p-6 sm:p-8">
                <p className="font-mono text-[11px] text-[#8a9099]">{product.code}</p>
                <h2 className="font-display mt-2 text-xl font-semibold text-white sm:text-2xl">{product.name}</h2>

                <dl className="mt-8 space-y-0">
                  {SPEC_KEYS.map((key) => {
                    const best = bestForKey(key);
                    const highlight = best !== null && product.compareScores[key] === best;
                    return (
                      <div
                        key={key}
                        className={`border-b border-white/[0.06] py-4 ${highlight ? "bg-[#4d9fff]/[0.06]" : ""}`}
                      >
                        <dt className="font-mono text-[10px] uppercase tracking-wider text-[#8a9099]">
                          {COMPARE_SPEC_LABELS[key]}
                        </dt>
                        <dd
                          className={`mt-1 text-sm ${highlight ? "text-[#4d9fff]" : "text-white"}`}
                        >
                          {values[key]}
                        </dd>
                      </div>
                    );
                  })}
                </dl>

                <Link
                  href={contactUrl({ system: product.slug, inquiry: "Program Requirement" })}
                  className={`${btnPrimary} mt-8`}
                  onClick={() =>
                    void trackEvent("click", `Request configuration — ${product.name}`)
                  }
                >
                  Request This Configuration
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="shrink-0 border-t border-white/[0.08] p-4 text-center">
        <button
          type="button"
          onClick={() => {
            clearCompare();
            setCompareOpen(false);
          }}
          className="font-mono text-[11px] uppercase tracking-wider text-[#8a9099] hover:text-white"
        >
          Clear comparison
        </button>
      </footer>
    </div>
  );
}
