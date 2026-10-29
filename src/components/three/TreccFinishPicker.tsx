"use client";

import { TRECC_FINISHES, type TreccFinish } from "@/lib/three/treccFinishes";

/** Finish swatches for the TRECC 3D views. */
export function TreccFinishPicker({ value, onChange }: { value: TreccFinish; onChange: (f: TreccFinish) => void }) {
  return (
    <div role="group" aria-label="Shell finish" className="flex items-center gap-3 bg-ink/70 px-3 py-2 backdrop-blur-md">
      <span className="text-[0.85rem] font-medium text-muted">Finish</span>
      <div className="flex gap-1.5">
        {TRECC_FINISHES.map((f) => {
          const on = f.id === value;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={on}
              aria-label={f.label}
              title={f.label}
              onClick={() => onChange(f.id)}
              className={`flex h-9 items-center gap-2 px-2.5 text-[0.85rem] font-medium transition-colors ${
                on ? "bg-white/[0.08] text-snow shadow-[inset_0_0_0_1px_rgb(241_133_34/0.8)]" : "text-muted hover:text-snow"
              }`}
            >
              <span aria-hidden className="h-3.5 w-3.5 rounded-full shadow-[inset_0_0_0_1px_rgb(255_255_255/0.25)]" style={{ background: f.swatch }} />
              <span className="hidden sm:inline">{f.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
