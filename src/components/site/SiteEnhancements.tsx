"use client";

import { usePathname } from "next/navigation";
import { CustomCursor } from "@/components/CustomCursor";
import { PageTransition } from "@/components/PageTransition";
import { PlatformEffects } from "@/components/effects/PlatformEffects";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { MarketingMobileActionBar } from "@/components/marketing/MarketingMobileActionBar";
import { MarketingPageFlags } from "@/components/marketing/MarketingPageFlags";
import { PlatformPageFlags } from "@/components/platform/PlatformPageFlags";
import { CsrfBootstrap } from "@/components/site/CsrfBootstrap";
import { InitialLoadScreen } from "@/components/effects/InitialLoadScreen";
import { isMarketingPage, isPublicSitePage } from "@/lib/marketing-pages";
import { isLightPortalPath } from "@/lib/route-context";

export function SiteEnhancements({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
