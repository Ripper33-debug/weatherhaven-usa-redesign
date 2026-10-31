"use client";

import { useSitePathname } from "@/hooks/useSitePathname";
import { ViewTransition, useEffect, useState } from "react";
import { isAuthGatePage } from "@/lib/auth-routes";
import { isAdminPath } from "@/lib/route-context";
import { SkipToContent } from "@/components/navigation/SkipToContent";
import { isPublicSitePage } from "@/lib/marketing-pages";

/**
 * View-transition class for the page cross-fade. Suspense reveals and other transitions inside a
 * page are "updates" to the same boundary as a route change, so the fade is only switched on for
 * the render where the path differs from the last one shown.
 */
function usePageFade(pathname: string) {
  const [shownPath, setShownPath] = useState(pathname);
  useEffect(() => {
    if (shownPath === pathname) return;
    const id = requestAnimationFrame(() => setShownPath(pathname));
    return () => cancelAnimationFrame(id);
  }, [pathname, shownPath]);
  return shownPath === pathname ? "none" : "v2-page";
}

export function SiteChrome({
  children,
  nav,
  footer,
}: {
  children: React.ReactNode;
  nav: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = useSitePathname();
  const bare = isAuthGatePage(pathname);
  const adminConsole = isAdminPath(pathname);
  // The content studio (/studio) is a full-screen app of its own.
  const studio = pathname === "/studio" || pathname.startsWith("/studio/");
  // The SOF portal pages keep their own nav and footer; the public /sof-solutions page uses the site's.
  const sofMicrosite = pathname.startsWith("/sof-solutions/");
  const publicSite = isPublicSitePage(pathname);
  const pageFade = usePageFade(pathname);

  if (bare || adminConsole || studio) {
    return (
      <>
        <SkipToContent />
        {children}
      </>
    );
  }

  return (
    <div className={`min-w-0 max-w-full overflow-x-clip ${publicSite ? "wh-v2" : ""}`}>
      <SkipToContent />
      {!sofMicrosite && nav}
      {publicSite ? (
        // Public pages cross-fade between routes; the SOF portal and admin keep their own transitions.
        <ViewTransition default={pageFade}>
          <div className="min-w-0 max-w-full overflow-x-clip">{children}</div>
        </ViewTransition>
      ) : (
        <div className="min-w-0 max-w-full overflow-x-clip">{children}</div>
      )}
      {!sofMicrosite && footer}
    </div>
  );
}
