"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};
const DATE_FMT = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" });

/** Today's date in the visitor's browser (empty in the server HTML, so nothing mismatches). */
export function TodayDate() {
  const today = useSyncExternalStore(
    noop,
    () => DATE_FMT.format(new Date()),
    () => "",
  );
  return <time suppressHydrationWarning>{today}</time>;
}

/** This page's address on whichever site the visitor is on (preview or live). */
export function PageUrl({ path }: { path: string }) {
  const origin = useSyncExternalStore(
    noop,
    () => window.location.host,
    () => "",
  );
  return <span suppressHydrationWarning>{origin ? `${origin}${path}` : path}</span>;
}

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="v2-btn">
      Print or save as PDF
    </button>
  );
}
