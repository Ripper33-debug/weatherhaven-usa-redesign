"use client";

import { usePathname } from "next/navigation";
import { isSofAuthGatePage, pathRequiresSofAuth } from "@/lib/auth-routes";

export function SofSolutionsChrome({
  children,
  nav,
  footer,
}: {
  children: React.ReactNode;
  nav: React.ReactNode;
  footer: React.ReactNode;
}) {
  const pathname = usePathname();
  // The public SOF page is part of the main site (its nav, footer and design); see SiteChrome.
  if (pathname === "/sof-solutions") return <>{children}</>;

  const bare = isSofAuthGatePage(pathname) || pathRequiresSofAuth(pathname);

  return (
    <div className="sof-solutions-root">
      {bare ? (
        children
      ) : (
        <>
          {nav}
          {children}
          {footer}
        </>
      )}
    </div>
  );
}

