"use client";

import { useEffect } from "react";

/**
 * Opens the print dialog once when the plan arrives with ?print=1 (the builder's "Download the plan
 * (PDF)"), after fonts and the logo have loaded, then drops the flag so a reload doesn't print again.
 */
export function AutoPrint() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("print") !== "1") return;
    url.searchParams.delete("print");
    window.history.replaceState(null, "", `${url.pathname}${url.search}`);
    let cancelled = false;
    const go = () => {
      if (!cancelled) window.setTimeout(() => window.print(), 300);
    };
    const ready = document.fonts?.ready ?? Promise.resolve();
    void ready.then(() => (document.readyState === "complete" ? go() : window.addEventListener("load", go, { once: true })));
    return () => {
      cancelled = true;
      window.removeEventListener("load", go);
    };
  }, []);
  return null;
}
