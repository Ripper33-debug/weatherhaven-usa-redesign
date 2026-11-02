"use client";

import { useState } from "react";

/**
 * For browsers that can't run the 3D viewer (no WebGL, or WebGL drawn in software: common on
 * locked-down government laptops and remote desktops). The still stays, and the viewer's two
 * stories still get told: the deploy, as a short video recorded from the same model, and the inside,
 * as a render of the example fit-out.
 */
export function ViewerStillControls({
  name,
  video,
  interior,
  insideLabel,
}: {
  name: string;
  video?: string;
  interior?: string;
  insideLabel?: string;
}) {
  const [view, setView] = useState<"outside" | "inside" | "video">("outside");
  if (!video && !interior) return null;
  const button = (on: boolean) =>
    `h-9 px-3 text-[0.875rem] font-medium transition-colors sm:px-4 ${on ? "bg-snow text-ink" : "text-snow/80 hover:text-snow"}`;

  return (
    <>
      {view === "inside" && interior ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={interior}
          alt={`Inside a Weatherhaven ${name}: example fit-out${insideLabel ? `, ${insideLabel.toLowerCase()}` : ""} (render)`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      {view === "video" && video ? (
        <video
          src={video}
          className="absolute inset-0 h-full w-full bg-ink object-cover"
          autoPlay
          muted
          playsInline
          controls
          aria-label={`The ${name} deploying, recorded from the 3D model`}
        />
      ) : null}
      <div role="group" aria-label="View" className="absolute left-3 top-3 flex bg-ink/70 p-1 backdrop-blur-md sm:left-4 sm:top-4">
        <button type="button" aria-pressed={view === "outside"} onClick={() => setView("outside")} className={button(view === "outside")}>
          Outside
        </button>
        {interior ? (
          <button type="button" aria-pressed={view === "inside"} onClick={() => setView("inside")} className={button(view === "inside")}>
            Inside
          </button>
        ) : null}
        {video ? (
          <button type="button" aria-pressed={view === "video"} onClick={() => setView("video")} className={button(view === "video")}>
            Watch it deploy
          </button>
        ) : null}
      </div>
    </>
  );
}
