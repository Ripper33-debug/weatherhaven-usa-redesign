import type { Metadata } from "next";
import { metadata as studioMetadata } from "next-sanity/studio";
import { isSanityConfigured } from "@/sanity/env";
import { StudioClient } from "./StudioClient";

/** The content studio. Needs the Sanity project ID (src/sanity/env.ts); explains itself until then. */
export const dynamic = "force-static";
export { viewport } from "next-sanity/studio";
export const metadata: Metadata = { ...studioMetadata, title: { absolute: "Weatherhaven Content" } };

export default function StudioPage() {
  if (!isSanityConfigured()) {
    return (
      <div style={{ minHeight: "100svh", display: "grid", placeItems: "center", background: "#0a0f17", color: "#eef2f6", padding: 24 }}>
        <div style={{ maxWidth: 560, fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
          <h1 style={{ fontSize: 28, margin: "0 0 12px" }}>The content studio isn’t connected yet</h1>
          <p style={{ margin: 0, color: "#a6b2c3" }}>
            It needs Weatherhaven’s Sanity project ID. Until then the site shows the content written into the code.
          </p>
        </div>
      </div>
    );
  }
  return <StudioClient />;
}
