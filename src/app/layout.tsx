import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import localFont from "next/font/local";
import { Playfair_Display } from "next/font/google";
import "./globals.css";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SiteEnhancements } from "@/components/site/SiteEnhancements";
import { SiteChrome } from "@/components/site/SiteChrome";
import { AuthHashRedirect } from "@/components/auth/AuthHashRedirect";
import { getSiteUrl, shareImageUrl } from "@/lib/site-url";
import { NAV_CAPABILITIES, SYSTEMS_BY_FAMILY } from "@/lib/site-nav";

/*
 * Geist, Geist Mono and Playfair are the SOF portal and admin faces; the public site renders in
 * Archivo. Geist Mono (the odd code) and Playfair now load when a page uses them instead of being
 * preloaded on every page. Geist isn't preloaded either: public pages (and their phone action bar)
 * render entirely in Archivo, so preloading it cost every phone 68 KB on the critical path.
 * Same files and settings as the `geist` package's exports; the const names keep the family names.
 */
const GeistSans = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  preload: false,
});
const GeistMono = localFont({
  src: "../../node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2",
  variable: "--font-geist-mono",
  adjustFontFallback: false,
  fallback: ["ui-monospace", "SFMono-Regular", "Roboto Mono", "Menlo", "Monaco", "Liberation Mono", "DejaVu Sans Mono", "Courier New", "monospace"],
  weight: "100 900",
  preload: false,
});
const geistSans = GeistSans;
const geistMono = GeistMono;

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  preload: false,
});

/**
 * Marketing typeface: Archivo, self-hosted and trimmed to the weights (400–700) and widths (100–118)
 * the site uses, 55 KB instead of Google's 90 KB (src/app/fonts/README.md). Headlines use its
 * expanded widths.
 */
const archivo = localFont({
  src: [{ path: "./fonts/archivo-var.woff2", weight: "400 700", style: "normal" }],
  variable: "--font-archivo",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "100% 118%" }],
  adjustFontFallback: "Arial",
});

/** Archivo's condensed figures (.v2-figure): a 14 KB static cut, loaded only where figures appear. */
const archivoFigures = localFont({
  src: [{ path: "./fonts/archivo-figures.woff2", weight: "600", style: "normal" }],
  variable: "--font-archivo-figures",
  display: "swap",
  preload: false,
  adjustFontFallback: "Arial",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  title: {
    default: "Weatherhaven USA | Rapidly deployable shelters, camps and field hospitals",
    template: "%s | Weatherhaven",
  },
  description:
    "Expandable containers, soft-wall, inflatable and polar shelters that ship as cargo and stand up in minutes. Fielded in 95+ countries since 1981.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Weatherhaven USA",
    title: "Weatherhaven USA | Rapidly deployable shelters, camps and field hospitals",
    description:
      "Expandable containers, soft-wall, inflatable and polar shelters that ship as cargo and stand up in minutes.",
    images: [{ url: shareImageUrl("/og-image.jpg"), width: 1200, height: 630, alt: "Weatherhaven expandable shelter at dusk: Ships in a container. Stands up in minutes." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Weatherhaven USA | Rapidly deployable shelters, camps and field hospitals",
    description:
      "Expandable containers, soft-wall, inflatable and polar shelters that ship as cargo and stand up in minutes.",
    images: [shareImageUrl("/og-image.jpg")],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f17",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${archivo.variable} ${archivoFigures.variable} h-full overflow-x-clip`}
    >
      <body className="flex min-h-full min-w-0 flex-col overflow-x-clip font-sans text-zinc-100 antialiased">
        <AuthHashRedirect />
        <AnalyticsProvider>
          <SiteEnhancements>
            <SiteChrome
              nav={<Navbar menuData={{ systems: SYSTEMS_BY_FAMILY, capabilities: NAV_CAPABILITIES }} />}
              footer={<Footer />}
            >
              <main id="main-content" className="min-w-0 flex-1 overflow-x-clip focus:outline-none">
                {children}
              </main>
            </SiteChrome>
          </SiteEnhancements>
        </AnalyticsProvider>
        <Analytics />
      </body>
    </html>
  );
}
