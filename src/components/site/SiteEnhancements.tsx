"use client";

import { useSitePathname } from "@/hooks/useSitePathname";
import dynamic from "next/dynamic";
import { PageTransition } from "@/components/PageTransition";
import { MarketingMobileActionBar } from "@/components/marketing/MarketingMobileActionBar";
import { MarketingPageFlags } from "@/components/marketing/MarketingPageFlags";
import { PlatformPageFlags } from "@/components/platform/PlatformPageFlags";
import { isMarketingPage, isPublicSitePage } from "@/lib/marketing-pages";
import { isLightPortalPath } from "@/lib/route-context";

// Portal and admin-only extras: loaded only on the pages that render them, so public pages don't
// carry their code.
const CustomCursor = dynamic(() => import("@/components/CustomCursor").then((m) => m.CustomCursor));
const PlatformEffects = dynamic(() => import("@/components/effects/PlatformEffects").then((m) => m.PlatformEffects));
const ScrollProgress = dynamic(() => import("@/components/site/ScrollProgress").then((m) => m.ScrollProgress));
const CsrfBootstrap = dynamic(() => import("@/components/site/CsrfBootstrap").then((m) => m.CsrfBootstrap));
const InitialLoadScreen = dynamic(() => import("@/components/effects/InitialLoadScreen").then((m) => m.InitialLoadScreen));

export function SiteEnhancements({ children }: { children: React.ReactNode }) {
  const pathname = useSitePathname();
  const marketing = isMarketingPage(pathname);
  const publicSite = isPublicSitePage(pathname);
  const lightPortal = isLightPortalPath(pathname);
  const isMap =
    pathname === "/tactical-map" ||
    pathname.startsWith("/tactical-map/") ||
    pathname.includes("/deployment-planner");

  return (
    <>
      {publicSite ? null : <InitialLoadScreen />}
      {/* Public pages fetch the CSRF token only when a form is sent (fetchWithCsrf), not on every page load. */}
      {publicSite ? null : <CsrfBootstrap />}
      <MarketingPageFlags />
      <PlatformPageFlags />
      {!marketing && !lightPortal && <PlatformEffects />}
      {!marketing && !lightPortal && <ScrollProgress />}
      {!marketing && !lightPortal && !isMap && <CustomCursor />}
      <PageTransition marketing={marketing}>{children}</PageTransition>
      {marketing ? <MarketingMobileActionBar /> : null}
    </>
  );
}
