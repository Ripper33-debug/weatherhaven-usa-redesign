"use client";

import { useEffect, useState } from "react";

function DigitColumn({ digit, flash }: { digit: number; flash: boolean }) {
  return (
    <span
      className={`wh-odometer-digit inline-block overflow-hidden align-top leading-none ${flash ? "wh-odometer-flash" : ""}`}
    >
      <span
        className="wh-odometer-strip block leading-none transition-transform duration-500 ease-out"
        style={{ transform: `translateY(calc(${-digit} * var(--odometer-step, 1em)))` }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block h-[var(--odometer-step,1em)] leading-none tabular-nums">
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

export function OdometerValue({
  value,
  suffix = "",
  flash = false,
}: {
  value: number;
  suffix?: string;
  flash?: boolean;
}) {
  const digits = String(Math.max(0, Math.round(value))).split("").map(Number);

  return (
    <span className="inline-flex items-center leading-none">
      {digits.map((d, i) => (
        <DigitColumn key={`${i}-${digits.length}`} digit={d} flash={flash} />
      ))}
      {suffix && (
        <span className={`ml-0.5 ${flash ? "wh-suffix-pulse" : ""}`}>{suffix}</span>
      )}
    </span>
  );
}

export function useOdometerFlash(done: boolean) {
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    if (!done) return;
    let timeoutId = 0;
    const rafId = requestAnimationFrame(() => {
      setFlash(true);
      timeoutId = window.setTimeout(() => setFlash(false), 400);
    });
    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [done]);
  return flash;
}
