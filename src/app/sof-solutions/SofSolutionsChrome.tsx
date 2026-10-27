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
  const bare = isSofAuthGatePage(pathname) || pathRequiresSofAuth(pathname);

  if (bare) return <>{children}</>;

  return (
    <>
      {nav}
      {children}
      {footer}
    </>
  );
}

