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
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:",
      "frame-src 'self' https://www.google.com https://www.google.com/maps https://maps.google.com",
      "media-src 'self' blob: https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self' https://nexraft.com https://www.nexraft.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  /** Product photos are static assets; prevent fs tracing from bundling public/products into lambdas. */
  outputFileTracingExcludes: {
    "/configurable-solutions/[slug]": ["./public/products/**/*"],
    "/configurable-solutions": ["./public/products/**/*"],
  },
  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "@supabase/supabase-js", "@supabase/ssr"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
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
