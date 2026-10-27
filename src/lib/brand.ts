/** Official Weatherhaven brand colors sampled from corporate logo artwork. */
export const WEATHERHAVEN_BRAND = {
  blue: "#134374",
  orange: "#F18522",
  logoSrc: "/weatherhaven-logo.png",
  logoSrc2x: "/weatherhaven-logo@2x.png",
  logoWidth: 280,
  logoHeight: 26,
} as const;

export function weatherhavenLogoAbsoluteUrl(siteUrl: string): string {
  return `${siteUrl.replace(/\/$/, "")}${WEATHERHAVEN_BRAND.logoSrc}`;
}

export function weatherhavenLogoEmailDimensions(height = 28): { width: number; height: number } {
  return {
    height,
    width: Math.round((height * WEATHERHAVEN_BRAND.logoWidth) / WEATHERHAVEN_BRAND.logoHeight),
  };
}
