"use client";

import { useState } from "react";

/** An identifier (CAGE, UEI) with a button that copies it, for filling in procurement forms. */
export function CopyCode({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <span className="inline-flex items-center gap-3">
      <span className="v2-code text-[1.35rem] font-medium text-snow">{value}</span>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={`Copy ${label} ${value}`}
        className="v2-tech h-8 px-2.5 text-muted shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-colors hover:text-snow"
      >
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </span>
  );
}
