"use client";

/**
 * Weatherhaven branding for the content studio (/studio): colours, type, the logo in the top bar
 * and the workspace icon. The sign-in screen stays Sanity's own.
 */
import Link from "next/link";
import { buildLegacyTheme, useColorSchemeValue, type LogoProps } from "sanity";

const INK = "#0a0f17";
const SNOW = "#eef2f6";
const SIGNAL = "#f18522";

export const STUDIO_TITLE = "Weatherhaven Content";

export const studioTheme = buildLegacyTheme({
  "--font-family-base": "var(--font-archivo), system-ui, sans-serif",
  "--black": INK,
  "--white": SNOW,
  "--gray-base": INK,
  "--gray": "#6b7a8c",
  "--brand-primary": SIGNAL,
  "--component-bg": SNOW,
  "--component-text-color": INK,
  "--default-button-color": "#4b5a6b",
  "--default-button-primary-color": SIGNAL,
  "--default-button-success-color": "#2f8a57",
  "--default-button-warning-color": "#c98a12",
  "--default-button-danger-color": "#c2412d",
  "--focus-color": SIGNAL,
  "--main-navigation-color": INK,
  "--main-navigation-color--inverted": SNOW,
  "--state-info-color": "#3b6fb6",
  "--state-success-color": "#2f8a57",
  "--state-warning-color": "#c98a12",
  "--state-danger-color": "#c2412d",
});

/** The orange-and-white Weatherhaven mark, for the workspace menu. */
export function WeatherhavenMark() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/apple-icon.png" alt="" width={25} height={25} style={{ display: "block", borderRadius: 4 }} />
  );
}

/** The wordmark in the top bar, light or dark to suit the studio's colour scheme, then "Content". */
export function StudioLogo(props: LogoProps) {
  const scheme = useColorSchemeValue();
  return (
    <Link
      href="/studio"
      aria-label={props.title}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px", height: "100%", textDecoration: "none" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={scheme === "dark" ? "/weatherhaven-logo-reverse@2x.png" : "/weatherhaven-logo@2x.png"}
        alt="Weatherhaven"
        height={18}
        style={{ display: "block", height: 18, width: "auto" }}
      />
      <span
        style={{
          fontFamily: "var(--font-archivo), system-ui, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: scheme === "dark" ? SNOW : INK,
          opacity: 0.75,
          whiteSpace: "nowrap",
        }}
      >
        Content
      </span>
    </Link>
  );
}
