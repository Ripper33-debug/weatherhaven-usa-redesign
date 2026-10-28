"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconLock, IconMenu2, IconX } from "@tabler/icons-react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useMenuOpenForRoute } from "@/hooks/useMenuOpenForRoute";
import { NavAdminLink } from "@/components/navigation/NavAdminLink";
import { isPublicSitePage } from "@/lib/marketing-pages";
import { NAV_CTA, NAV_LINKS, NAV_SOF, SYSTEMS_BY_FAMILY } from "@/lib/site-nav";
import { COMPANY_CONTACT, companyPhoneHref } from "@/lib/company-facts";

function Logo({ height = 24, priority = false }: { height?: number; priority?: boolean }) {
  const width = Math.round((height * 560) / 53);
  return (
    <Image
      src="/weatherhaven-logo-reverse@2x.png"
      alt="Weatherhaven"
      width={width}
      height={height}
      priority={priority}
      unoptimized
      style={{ width, height: "auto" }}
    />
  );
}

function SystemsMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="v2-wrap grid gap-x-10 gap-y-8 py-10 lg:grid-cols-[1fr_1fr_1fr_1fr_minmax(0,0.9fr)]">
      {SYSTEMS_BY_FAMILY.map((family) => (
        <div key={family.id}>
          <p className="text-[0.95rem] font-semibold text-snow [font-variation-settings:'wdth'_110]">{family.name}</p>
          <ul className="mt-4 space-y-1">
            {family.systems.map((s) => (
              <li key={s.slug}>
                <Link
                  href={s.href}
                  onClick={onNavigate}
                  className="group -mx-3 block px-3 py-2 no-underline transition-colors hover:bg-white/[0.04]"
                >
                  <span className="block text-[0.95rem] font-medium text-snow group-hover:text-signal">{s.name}</span>
                  <span className="mt-0.5 block text-[0.8rem] leading-snug text-muted">{s.keySpec}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="hidden flex-col justify-between border-l border-line pl-8 lg:flex">
        <div>
          <p className="text-[0.95rem] font-semibold text-snow [font-variation-settings:'wdth'_110]">Not sure where to start?</p>
          <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">
            Describe the mission, climate and force size, and the mission builder suggests a starting camp layout.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <Link href="/mission-solution-builder" onClick={onNavigate} className="v2-btn v2-btn-ghost">
            Open mission builder
          </Link>
          <Link href="/configurable-solutions" onClick={onNavigate} className="v2-link text-[0.9rem]">
            Compare all systems
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const publicSite = isPublicSitePage(pathname);
  const [open, setOpen] = useMenuOpenForRoute();
  const [scrolled, setScrolled] = useState(false);
  const [systemsOpen, setSystemsOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedAt = useRef(0);
  const systemsButtonRef = useRef<HTMLButtonElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Close the systems menu on navigation (adjusting state during render, not in an effect).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setSystemsOpen(false);
  }

  useEffect(() => {
    if (!systemsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setSystemsOpen(false);
      systemsButtonRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [systemsOpen]);

  useBodyScrollLock(open);

  // Mobile menu: move focus in, keep Tab inside, close on Escape, hand focus back on close.
  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const returnTo = menuButtonRef.current;
    dialog?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = dialog.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      returnTo?.focus();
    };
  }, [open, setOpen]);

  const openSystems = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setSystemsOpen((was) => {
      if (!was) openedAt.current = Date.now();
      return true;
    });
  }, []);

  // A click right after hover (or a touch tap, which fires both) should open, not toggle shut.
  const onSystemsClick = () => {
    if (systemsOpen && Date.now() - openedAt.current < 400) return;
    if (!systemsOpen) openedAt.current = Date.now();
    setSystemsOpen(!systemsOpen);
  };

  const onSystemsBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSystemsOpen(false);
  };
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setSystemsOpen(false), 140);
  }, []);

  const solid = scrolled || systemsOpen || !publicSite;
  const systemsActive = pathname.startsWith("/configurable-solutions");

  if (isLogin) {
    return (
      <header data-global-nav className="sticky top-0 z-50 flex h-16 items-center justify-center bg-ink">
        <Link href="/" aria-label="Weatherhaven home">
          <Logo />
        </Link>
      </header>
    );
  }

  return (
    <>
      <header
        data-global-nav
        style={publicSite ? { viewTransitionName: "site-header" } : undefined}
        className={`${publicSite ? "fixed inset-x-0" : "sticky"} top-0 z-50 transition-[background-color,box-shadow] duration-300 ${
          solid ? "bg-ink/92 shadow-[0_1px_0_rgb(148_170_196/0.16)] backdrop-blur-xl" : "bg-transparent"
        }`}
        onMouseLeave={scheduleClose}
      >
        <div className="v2-wrap flex h-16 items-center gap-8 lg:h-[72px]">
          <Link href="/" aria-label="Weatherhaven home" className="shrink-0 no-underline">
            <Logo priority />
          </Link>

          <nav aria-label="Main" className="hidden flex-1 items-center gap-1 xl:flex">
            <div onBlur={onSystemsBlur}>
            <button
              ref={systemsButtonRef}
              type="button"
              aria-expanded={systemsOpen}
              aria-controls="systems-menu"
              onClick={onSystemsClick}
              onMouseEnter={openSystems}
              className={`flex h-10 items-center gap-1.5 whitespace-nowrap px-3 text-[0.95rem] font-medium transition-colors ${
                systemsOpen || systemsActive ? "text-snow" : "text-snow/80 hover:text-snow"
              }`}
            >
              Systems
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                aria-hidden
                className={`transition-transform duration-200 ${systemsOpen ? "rotate-180" : ""}`}
              >
                <path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            {systemsOpen ? (
              <div
                id="systems-menu"
                role="region"
                aria-label="Systems"
                onMouseEnter={openSystems}
                className="absolute inset-x-0 top-full border-t border-line bg-ink shadow-[0_24px_48px_rgb(0_0_0/0.35)]"
              >
                <SystemsMenu onNavigate={() => setSystemsOpen(false)} />
              </div>
            ) : null}
            </div>
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={scheduleClose}
                  className={`flex h-10 items-center whitespace-nowrap px-3 text-[0.95rem] font-medium no-underline transition-colors ${
                    active ? "text-snow" : "text-snow/80 hover:text-snow"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <span className="hidden xl:inline-flex">
              <NavAdminLink />
            </span>
            <Link
              href={NAV_SOF.href}
              className="hidden items-center gap-1.5 whitespace-nowrap text-[0.875rem] font-medium text-snow/70 no-underline transition-colors hover:text-snow md:inline-flex"
            >
              <IconLock size={15} stroke={1.75} aria-hidden />
              {NAV_SOF.label}
            </Link>
            <Link href={NAV_CTA.href} className="v2-btn hidden whitespace-nowrap !min-h-10 !py-2 !text-[0.9rem] sm:inline-flex">
              {NAV_CTA.label}
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              className="-mr-2 flex h-11 w-11 items-center justify-center text-snow xl:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <IconMenu2 size={24} stroke={1.5} />
            </button>
          </div>
        </div>

      </header>

      {open ? (
        <div
          ref={dialogRef}
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="wh-v2 fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-ink xl:hidden"
        >
          <div className="v2-wrap flex h-16 shrink-0 items-center justify-between">
            <Link href="/" aria-label="Weatherhaven home" onClick={() => setOpen(false)}>
              <Logo />
            </Link>
            <button
              type="button"
              data-autofocus
              className="-mr-2 flex h-11 w-11 items-center justify-center text-snow"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <IconX size={24} stroke={1.5} />
            </button>
          </div>
          <nav aria-label="Mobile" className="v2-wrap flex-1 pb-10 pt-4">
            <ul className="border-t border-line">
              {[{ href: "/configurable-solutions", label: "All systems" }, ...NAV_LINKS, NAV_SOF].map((l) => (
                <li key={l.href} className="border-b border-line">
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-4 text-[1.6rem] font-semibold text-snow no-underline [font-variation-settings:'wdth'_114]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              {SYSTEMS_BY_FAMILY.map((family) => (
                <div key={family.id}>
                  <p className="text-sm font-semibold text-muted">{family.name}</p>
                  <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {family.systems.map((s) => (
                      <li key={s.slug}>
                        <Link href={s.href} onClick={() => setOpen(false)} className="text-[1rem] text-snow no-underline">
                          {s.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-col gap-3">
              <Link href={NAV_CTA.href} onClick={() => setOpen(false)} className="v2-btn w-full">
                {NAV_CTA.label}
              </Link>
              <a href={companyPhoneHref(COMPANY_CONTACT.phone)} className="v2-btn v2-btn-ghost w-full">
                Call the US office: {COMPANY_CONTACT.phone}
              </a>
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
