import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { LEGACY_PRODUCT_SLUG_REDIRECTS } from "@/lib/weatherhaven-product-lines";

function supabaseStorageHostname(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const supabaseHost = supabaseStorageHostname();

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy() },
];

/**
 * The site's Content-Security-Policy. The content studio (/studio) gets the same policy plus the
 * Sanity hosts it loads its scripts and fonts from; everything else keeps the strict one.
 */
function contentSecurityPolicy(studio = false): string {
  const directives = [
      "default-src 'self'",
      // 'wasm-unsafe-eval' and blob: workers: the Draco decoder behind the /ar page's model-viewer.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' https://va.vercel-scripts.com",
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      // blob: lets model-viewer (the /ar pages) read a model's embedded textures, which three.js
      // unpacks to blob: URLs; only the page's own scripts can create them.
      "connect-src 'self' blob: https: wss:",
      "frame-src 'self' https://www.google.com https://www.google.com/maps https://maps.google.com",
      "media-src 'self' blob: https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self' https://nexraft.com https://www.nexraft.com",
    ];
  if (!studio) return directives.join("; ");
  return directives
    .map((d) => {
      if (d.startsWith("script-src ")) return `${d} https://core.sanity-cdn.com https://*.sanity.io`;
      if (d.startsWith("font-src ")) return `${d} https://design-system-static.sanity.io https://*.sanity.io`;
      return d;
    })
    .join("; ");
}

const studioSecurityHeaders = securityHeaders.map((h) =>
  h.key === "Content-Security-Policy" ? { ...h, value: contentSecurityPolicy(true) } : h,
);

const nextConfig: NextConfig = {
  poweredByHeader: false,
  /** Product photos are static assets; prevent fs tracing from bundling public/products into lambdas. */
  outputFileTracingExcludes: {
    "/configurable-solutions/[slug]": ["./public/products/**/*"],
    "/configurable-solutions": ["./public/products/**/*"],
  },
  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "@supabase/supabase-js", "@supabase/ssr"],
    /** React <ViewTransition> on route changes (public pages use it for card → product morphs). */
    viewTransition: true,
  },
  async headers() {
    return [
      {
        // Everything except the content studio, which gets its own policy below (two CSP headers
        // on one response would both apply, so the studio must be left out here).
        source: "/((?!studio(?:/|$)).*)",
        headers: securityHeaders,
      },
      { source: "/studio", headers: studioSecurityHeaders },
      { source: "/studio/:path*", headers: studioSecurityHeaders },
      {
        // AR Quick Look on iPhone only opens USDZ files served with their own media type.
        source: "/models/ar/:name.usdz",
        headers: [
          { key: "Content-Type", value: "model/vnd.usdz+zip" },
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
      {
        source: "/models/ar/:name.glb",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        // The /ar page's model and Draco decoder. Vercel sends these types already; this makes
        // sure every host does, since model-viewer needs them.
        source: "/assets/models/:name.glb",
        headers: [
          { key: "Content-Type", value: "model/gltf-binary" },
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
      {
        // System models from public/models/<slug>/ (product-page viewer, /ar/<slug>, the 3D camp).
        source: "/models/:slug/:name.glb",
        headers: [
          { key: "Content-Type", value: "model/gltf-binary" },
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
      {
        source: "/assets/draco-ar/:name.wasm",
        headers: [
          { key: "Content-Type", value: "application/wasm" },
          { key: "Cache-Control", value: "public, max-age=604800" },
        ],
      },
      {
        // The deployment globe's own files: the page is shown inside /, /deployments and
        // /deployments/map, so it isn't indexed on its own; its assets are long-lived.
        source: "/deployment-globe/index.html",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
      {
        source: "/deployment-globe/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
      },
      {
        // Demo and preview copies on *.vercel.app stay out of search results, so they never
        // compete with the real site. The real domain is unaffected.
        source: "/:path*",
        has: [{ type: "host", value: ".*\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      // Photos uploaded in the content studio (Sanity's image CDN).
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" },
      {
        protocol: "https",
        hostname: "eiec269001.blob.core.windows.net",
        pathname: "/site-content/**",
      },
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
  async redirects() {
    return [
      { source: "/dashboard", destination: "/sof-solutions/secure", permanent: false },
      // The TRECC's AR page is /ar (links to it were already out); /ar/<slug> is every other system.
      { source: "/ar/trecc", destination: "/ar", permanent: true },
      { source: "/sof-solutions/secure/workspace", destination: "/sof-solutions/secure", permanent: false },
      { source: "/sof-solutions/secure/workspace/:path*", destination: "/sof-solutions/secure", permanent: false },
      { source: "/tactical-map", destination: "/sof-solutions/secure/deployment-planner", permanent: false },
      { source: "/request-access", destination: "/sof-solutions/request-access", permanent: false },
      { source: "/account", destination: "/sof-solutions/secure", permanent: false },
      { source: "/products", destination: "/configurable-solutions", permanent: true },
      {
        source: "/products/:slug([^.]+)",
        destination: "/configurable-solutions/:slug",
        permanent: true,
      },
      { source: "/ai-configurator", destination: "/mission-solution-builder", permanent: true },
      ...Object.entries(LEGACY_PRODUCT_SLUG_REDIRECTS).map(([from, to]) => ({
        source: `/configurable-solutions/${from}`,
        destination: `/configurable-solutions/${to}`,
        permanent: true,
      })),
    ];
  },
};

const sentryEnabled = Boolean(process.env.SENTRY_DSN?.trim());

export default sentryEnabled
  ? withSentryConfig(nextConfig, {
      silent: true,
      disableLogger: true,
      widenClientFileUpload: false,
    })
  : nextConfig;
