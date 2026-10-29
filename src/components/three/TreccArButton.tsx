"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { TreccFinish } from "@/lib/three/treccFinishes";

/**
 * "See it full size": places a real-scale, deployed TRECC in the visitor's surroundings with the
 * phone's own AR viewer, in the finish they picked.
 * - iPhone and iPad: Apple's AR Quick Look opens the USDZ (scaling turned off, so it stays true
 *   size). In-app browsers that can't open it are asked to use Safari.
 * - Android: Google's Scene Viewer opens the GLB (resizing turned off). Phones without AR get the
 *   3D view instead; phones without Scene Viewer come back with #no-ar and are told so.
 * - Anything else (a desktop): a QR code that opens this page on a phone, ready to place it.
 * The models are simplified cuts of the TRECC CAD export, in metres (public/models/ar).
 */
type Mode = "quicklook" | "sceneviewer" | "safari" | "qr";
type Notice = "qr" | "safari" | "no-ar";
const FINISHES: TreccFinish[] = ["green", "tan", "arctic"];
const NO_AR = "#no-ar";

function detectMode(): Mode {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (ios) {
    const a = document.createElement("a");
    if (a.relList?.supports?.("ar")) return "quicklook";
    // Other iOS browsers hand Quick Look to the system; app web views (Instagram, LinkedIn) can't.
    return /CriOS\/|FxiOS\/|EdgiOS\/|GSA\/|DuckDuckGo\//.test(ua) ? "quicklook" : "safari";
  }
  if (/android/i.test(ua)) return "sceneviewer";
  return "qr";
}

// Read once on the client; the server renders as if neither is known.
const noSubscribe = () => () => undefined;
const onHashChange = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
const cameBackWithoutAr = () => window.location.hash === NO_AR;
const askedFinish = (): TreccFinish | null => {
  const asked = new URLSearchParams(window.location.search).get("ar") as TreccFinish | null;
  return asked && FINISHES.includes(asked) ? asked : null;
};

/** Link that opens the USDZ in AR Quick Look at true size (pinch-scaling off). */
export function quickLookHref(finish: TreccFinish): string {
  return `/models/ar/trecc-deployed-${finish}.usdz#allowsContentScaling=0`;
}

/** Intent link that opens the GLB in Google's Scene Viewer, in AR where the phone has it. */
export function sceneViewerHref(origin: string, finish: TreccFinish, backTo: string): string {
  const file = encodeURIComponent(`${origin}/models/ar/trecc-deployed-${finish}.glb`);
  const title = encodeURIComponent("Weatherhaven TRECC, deployed, full size");
  return (
    `intent://arvr.google.com/scene-viewer/1.0?file=${file}&mode=ar_preferred&resizable=false&title=${title}` +
    `#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;` +
    `S.browser_fallback_url=${encodeURIComponent(backTo)};end;`
  );
}

function launchAr(mode: Mode, finish: TreccFinish) {
  if (mode === "quicklook") {
    // Quick Look only opens from a rel="ar" link whose single child is an image.
    const a = document.createElement("a");
    a.rel = "ar";
    a.href = quickLookHref(finish);
    a.appendChild(document.createElement("img"));
    a.click();
  } else if (mode === "sceneviewer") {
    // Without Scene Viewer, Android opens the fallback: this page (minus ?ar) marked #no-ar.
    const back = new URL(window.location.href);
    back.searchParams.delete("ar");
    back.hash = NO_AR;
    window.location.href = sceneViewerHref(window.location.origin, finish, back.toString());
  }
}

function ArIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M10 2.5 16.5 6v8L10 17.5 3.5 14V6z" />
      <path d="M3.5 6 10 9.5 16.5 6M10 9.5v8" />
    </svg>
  );
}

/** QR code drawn as one SVG path (the library loads only when the dialog opens). */
function QrCode({ text }: { text: string }) {
  const [path, setPath] = useState<{ d: string; n: number; text: string } | null>(null);
  useEffect(() => {
    let cancelled = false;
    void import("qrcode-generator").then(({ default: qrcode }) => {
      const qr = qrcode(0, "M");
      qr.addData(text);
      qr.make();
      const n = qr.getModuleCount();
      let d = "";
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
      if (!cancelled) setPath({ d, n, text });
    });
    return () => {
      cancelled = true;
    };
  }, [text]);
  if (!path || path.text !== text) return <div className="aspect-square w-full bg-white" />;
  return (
    <svg
      viewBox={`-3 -3 ${path.n + 6} ${path.n + 6}`}
      className="aspect-square w-full bg-white"
      shapeRendering="crispEdges"
      role="img"
      aria-label="QR code that opens this page on a phone"
    >
      <path d={path.d} fill="#0a0f17" />
    </svg>
  );
}

/** `tall` matches the height of the finish picker it sits beside. */
export function TreccArButton({ finish, tall = false, className = "" }: { finish: TreccFinish; tall?: boolean; className?: string }) {
  const mode = useSyncExternalStore<Mode | null>(noSubscribe, detectMode, () => null);
  // A phone that arrived from the desktop QR code (?ar=<finish>) is offered the AR view straight
  // away (AR viewers only open from a tap). The offer is portalled so no section can cover it.
  const asked = useSyncExternalStore(noSubscribe, askedFinish, () => null);
  const noAr = useSyncExternalStore(onHashChange, cameBackWithoutAr, () => false);
  const [dismissed, setDismissed] = useState(false);
  const arrived = !dismissed && !noAr && asked && (mode === "quicklook" || mode === "sceneviewer") ? asked : null;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [notice, setNotice] = useState<Notice>("qr");
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const titleId = useId();

  const showNotice = useCallback((n: Notice) => {
    setNotice(n);
    if (n === "qr") setQrUrl(`${window.location.origin}${window.location.pathname}?ar=${finish}`);
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
  }, [finish]);

  const open = useCallback(() => {
    if (!mode) return;
    if (noAr) showNotice("no-ar");
    else if (mode === "qr" || mode === "safari") showNotice(mode);
    else launchAr(mode, finish);
  }, [mode, noAr, finish, showNotice]);

  // Back from Android without Scene Viewer: say so once, and drop the marker from the address.
  const toldNoAr = useRef(false);
  useEffect(() => {
    if (!noAr || toldNoAr.current) return;
    toldNoAr.current = true;
    showNotice("no-ar");
  }, [noAr, showNotice]);

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="See it full size"
        className={`flex items-center gap-2 bg-ink/70 font-medium text-snow backdrop-blur-md transition-colors hover:bg-ink/90 hover:text-signal-soft ${
          tall ? "h-[3.25rem] px-2.5 text-[0.85rem] sm:px-3 sm:text-[0.85rem]" : "h-9 px-3 text-[0.85rem]"
        } ${className}`}
      >
        <ArIcon />
        <span className="sm:hidden">Full size</span>
        <span className="hidden sm:inline">See it full size</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClick={(e) => {
          // A click on the backdrop (the dialog element itself) closes it.
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        onClose={() => {
          if (window.location.hash === NO_AR) window.history.replaceState(null, "", window.location.pathname + window.location.search);
        }}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] border border-line-strong bg-hull p-0 text-snow backdrop:bg-ink/80 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="v2-h3 text-snow">
              {notice === "qr" ? "See a TRECC full size" : notice === "safari" ? "Open this page in Safari" : "AR isn’t available on this phone"}
            </h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              className="-mr-2 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center text-muted hover:text-snow"
            >
              <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M3 3l10 10M13 3 3 13" />
              </svg>
            </button>
          </div>
          {notice === "qr" ? (
            <>
              <p className="v2-body mt-3">
                Scan this with your phone&rsquo;s camera, then tap to place a deployed TRECC, at its real size, wherever
                you are standing, and walk around it.
              </p>
              <div className="mx-auto mt-6 w-48 sm:w-52">{qrUrl ? <QrCode text={qrUrl} /> : null}</div>
              <p className="mt-5 text-[0.85rem] leading-relaxed text-muted">
                Works on iPhone and iPad, and on Android phones with Google&rsquo;s AR. The model is a simplified cut of
                Weatherhaven&rsquo;s CAD, in the finish you picked.
              </p>
            </>
          ) : notice === "safari" ? (
            <p className="v2-body mt-3">
              This browser can&rsquo;t open Apple&rsquo;s AR view. Open this page in Safari (from the share menu, choose
              Open in Safari), then tap See it full size again.
            </p>
          ) : (
            <p className="v2-body mt-3">
              This phone can&rsquo;t show AR: it doesn&rsquo;t have Google&rsquo;s 3D viewer. The 3D model on this page
              shows the same TRECC, and an iPhone or most recent Android phones can place it full size.
            </p>
          )}
        </div>
      </dialog>

      {arrived && mode
        ? createPortal(
            <div className="fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] z-[60] border border-line-strong bg-hull/95 p-4 shadow-[0_12px_40px_rgb(0_0_0/0.45)] backdrop-blur-md md:bottom-6 md:left-auto md:right-6 md:w-96">
              <p className="text-[0.95rem] font-semibold text-snow">Ready to see the TRECC full size</p>
              <p className="mt-1 text-[0.85rem] leading-snug text-muted">Point your phone at open floor or ground, then tap.</p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    launchAr(mode, arrived);
                    setDismissed(true);
                  }}
                  className="v2-btn !min-h-10 flex-1 text-[0.9rem]"
                >
                  Place it
                </button>
                <button type="button" onClick={() => setDismissed(true)} className="h-10 px-3 text-[0.85rem] text-muted hover:text-snow">
                  Not now
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
