"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useMenuOpenForRoute } from "@/hooks/useMenuOpenForRoute";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { NavAdminLink } from "@/components/navigation/NavAdminLink";
import { NavSignOut } from "@/components/navigation/NavSignOut";
import { WeatherhavenLogoLink } from "@/components/brand/WeatherhavenLogoLink";
import { btnMarketingOutline, btnMarketingPrimary } from "@/lib/cta-buttons";
import {
  SOF_LOGIN_PATH,
  SOF_REQUEST_ACCESS_PATH,
  SOF_SECURE_HOME,
} from "@/lib/sof-auth";

function NavHamburgerButton({
  onClick,
  expanded,
}: {
  onClick: () => void;
  expanded: boolean;
}) {
  return (
    <button
      type="button"
      className="flex p-2 text-[#8a9099] transition-opacity hover:opacity-70 md:hidden"
      aria-label={expanded ? "Close menu" : "Open menu"}
      aria-expanded={expanded}
      aria-controls="sof-mobile-menu"
      onClick={onClick}
    >
      <IconMenu2 size={22} stroke={1.5} />
    </button>
  );
}

export function SofNav() {
  const pathname = usePathname();
  const [open, setOpen] = useMenuOpenForRoute();
  const [scrolled, setScrolled] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    const id = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setSignedIn(Boolean(session?.user));
    });
  }, [pathname]);

  useBodyScrollLock(open);

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-[80] overflow-visible transition-[background-color,border-color,backdrop-filter] duration-300 ${
          scrolled ? "border-b border-white/[0.08] backdrop-blur-[12px]" : "border-b border-transparent bg-transparent"
        }`}
        style={{ backgroundColor: scrolled ? "rgba(8,10,12,0.92)" : "transparent" }}
      >
        <div className="mx-auto grid h-16 max-w-[1600px] grid-cols-[1fr_auto] items-center gap-4 px-6 md:grid-cols-[1fr_auto_1fr] lg:h-[4.25rem] lg:px-20">
          <WeatherhavenLogoLink
            href="/sof-solutions"
            height={28}
            suffix="· SOF"
            ariaLabel="Weatherhaven SOF solutions home"
          />

          <div className="hidden items-center justify-center gap-6 justify-self-center md:flex">
            <Link href="/sof-solutions" className="text-sm text-white/75 hover:text-white">
              Overview
            </Link>
            <Link href={SOF_REQUEST_ACCESS_PATH} className="text-sm text-white/75 hover:text-white">
              Request access
            </Link>
          </div>

          <div className="col-start-2 flex items-center justify-end gap-3 justify-self-end md:col-start-3">
            <div className="hidden items-center gap-3 md:flex">
              <NavAdminLink />
              {signedIn ? (
                <>
                  <Link href={SOF_SECURE_HOME} className={`${btnMarketingPrimary} px-5 py-2.5 text-sm`}>
                    Secure SOF systems
                  </Link>
                  <NavSignOut />
                </>
              ) : (
                <Link href={SOF_LOGIN_PATH} className={`${btnMarketingOutline} px-5 py-2.5 text-sm`}>
                  Member sign-in
                </Link>
              )}
            </div>
            <NavHamburgerButton onClick={() => setOpen(true)} expanded={open} />
          </div>
        </div>
      </header>

      {open ? (
        <div
          id="sof-mobile-menu"
          className="fixed inset-0 z-[100] flex flex-col bg-[#080a0c] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="SOF navigation menu"
        >
          <div className="flex h-14 items-center justify-between border-b border-white/[0.08] px-4">
            <WeatherhavenLogoLink href="/sof-solutions" height={28} suffix="· SOF" ariaLabel="Weatherhaven SOF solutions home" />
            <button type="button" className="p-2 text-white" aria-label="Close menu" onClick={() => setOpen(false)}>
              <IconX size={22} />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
            <Link href="/sof-solutions" className="py-4 text-lg text-white" onClick={() => setOpen(false)}>
              Overview
            </Link>
            <Link href={SOF_REQUEST_ACCESS_PATH} className="py-4 text-lg text-white" onClick={() => setOpen(false)}>
              Request access
            </Link>
            {signedIn ? (
              <Link href={SOF_SECURE_HOME} className="py-4 text-lg text-[#4d9fff]" onClick={() => setOpen(false)}>
                Secure SOF systems
              </Link>
            ) : (
              <Link href={SOF_LOGIN_PATH} className="py-4 text-lg text-white" onClick={() => setOpen(false)}>
                Member sign-in
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </>
  );
}
