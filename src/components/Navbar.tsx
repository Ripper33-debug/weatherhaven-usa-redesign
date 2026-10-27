"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useMenuOpenForRoute } from "@/hooks/useMenuOpenForRoute";
import {
  NavDesktopCenter,
  NavHamburgerButton,
  NavMobileOverlay,
  NavRequestAccessCta,
} from "@/components/navigation/SiteNavBlocks";
import { NavAdminLink } from "@/components/navigation/NavAdminLink";
import { WeatherhavenLogoLink } from "@/components/brand/WeatherhavenLogoLink";
import { isMarketingPage } from "@/lib/marketing-pages";

export function Navbar() {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const marketing = isMarketingPage(pathname);
  const [open, setOpen] = useMenuOpenForRoute();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!marketing) return;
    const handleScroll = () => setScrolled(window.scrollY > 60);
    const id = requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [marketing, pathname]);

  useBodyScrollLock(open);

  const navSolid = !marketing || scrolled;

  return (
    <>
      <header
        data-global-nav
        className={`${marketing ? "fixed" : "sticky"} top-0 z-50 w-full max-w-full overflow-x-hidden overflow-y-visible transition-[background-color,border-color,box-shadow,backdrop-filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          navSolid
            ? "border-b border-[var(--geist-border)] shadow-[0_1px_2px_rgba(0,0,0,0.24),0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
        style={{ backgroundColor: navSolid ? "rgba(8,10,12,0.88)" : "transparent" }}
      >
        <div
          className={`mx-auto grid h-14 max-w-[1400px] items-center px-4 sm:h-[72px] sm:px-6 lg:px-12 ${
            isLogin ? "grid-cols-1" : "grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr]"
          }`}
        >
          {isLogin ? (
            <WeatherhavenLogoLink href="/" centered linkClassName="justify-self-center" height={28} className="sm:h-8" />
          ) : (
            <WeatherhavenLogoLink
              href="/"
              linkClassName="justify-self-start"
              height={28}
              className="sm:h-8"
              priority={marketing}
            />
          )}

          {!isLogin && (
            <>
              <div
                className={`hidden justify-self-center md:col-start-2 md:block ${
                  navSolid ? "text-white/80" : "text-white/90"
                }`}
              >
                <NavDesktopCenter />
              </div>

              <div className="col-start-2 flex items-center justify-end gap-4 justify-self-end md:col-start-3">
                <div className="hidden items-center gap-4 md:flex">
                  <NavAdminLink />
                  <NavRequestAccessCta />
                </div>
                <NavHamburgerButton open={open} onClick={() => setOpen(true)} />
              </div>
            </>
          )}
        </div>
      </header>

      {!isLogin && (
        <NavMobileOverlay open={open} onClose={() => setOpen(false)} showWordmark />
      )}
    </>
  );
}
