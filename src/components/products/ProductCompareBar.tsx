"use client";

import { useProductCompare } from "@/contexts/ProductCompareContext";

export function ProductCompareBar() {
  const { selectedProducts, removeFromCompare, setCompareOpen } = useProductCompare();

  if (selectedProducts.length === 0) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-white/[0.1] bg-[#0d0f12] transition-transform duration-300"
      role="region"
      aria-label="Compare selection"
    >
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-12">
        <div className="flex flex-wrap items-center gap-3">
          {selectedProducts.map((p) => (
            <div
              key={p.slug}
              className="flex items-center gap-2 border border-white/10 bg-black/40 px-3 py-2"
            >
              <span className="font-mono text-[10px] text-[#4d9fff]">{p.code}</span>
              <span className="max-w-[120px] truncate text-xs text-white sm:max-w-[180px]">{p.name}</span>
              <button
                type="button"
                onClick={() => removeFromCompare(p.slug)}
                className="text-[#8a9099] hover:text-white"
                aria-label={`Remove ${p.code} from compare`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCompareOpen(true)}
          disabled={selectedProducts.length < 2}
          className="min-h-10 border border-white bg-white px-5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-black transition hover:bg-zinc-100 disabled:opacity-40"
        >
          Compare Selected
        </button>
      </div>
    </div>
  );
}
