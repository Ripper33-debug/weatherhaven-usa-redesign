"use client";

import { ViewTransition, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const bare = isAuthGatePage(pathname);
  const adminConsole = isAdminPath(pathname);
  const sofMicrosite = pathname === "/sof-solutions" || pathname.startsWith("/sof-solutions/");
  const publicSite = isPublicSitePage(pathname);
  const pageFade = usePageFade(pathname);

  if (bare || adminConsole) {
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
