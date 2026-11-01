"use client";

import { useSitePathname } from "@/hooks/useSitePathname";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconLock, IconMenu2, IconX } from "@tabler/icons-react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useMenuOpenForRoute } from "@/hooks/useMenuOpenForRoute";
import { NavAdminLink } from "@/components/navigation/NavAdminLink";
import { isPublicSitePage } from "@/lib/marketing-pages";
import type { NAV_CAPABILITIES, SYSTEMS_BY_FAMILY } from "@/lib/site-nav";
import {
  NAV_CAPABILITIES_PAGE,
  NAV_CTA,
  NAV_GOV,
  NAV_LINKS,
  NAV_PROGRAMS,
  NAV_WHO_WE_SERVE,
  NAV_SOF,
} from "@/lib/site-nav-links";

/**
 * The menus' catalog data comes in as props from the root layout (a server component), so the
 * product and capability text behind it isn't bundled into the page JavaScript.
 */
export type NavMenuData = { systems: typeof SYSTEMS_BY_FAMILY; capabilities: typeof NAV_CAPABILITIES };
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

function SystemsMenu({ onNavigate, systems }: { onNavigate: () => void; systems: NavMenuData["systems"] }) {
  return (
    <div className="v2-home-menu-cols v2-wrap grid gap-x-10 gap-y-8 py-10 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(13rem,0.9fr)]">
      {systems.map((family) => (
        <div key={family.id}>
          <Link
            href={`/configurable-solutions?family=${family.id}`}
            onClick={onNavigate}
            className="group block no-underline"
          >
            <span className="relative block aspect-[16/9] overflow-hidden bg-hull">
              <Image
                src={family.cover}
                alt=""
                fill
                sizes="240px"
                className="v2-photo object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </span>
            <span className="mt-4 block text-[0.95rem] font-semibold text-snow [font-variation-settings:'wdth'_110] group-hover:text-signal">
              {family.name}
            </span>
          </Link>
          <ul className="mt-3 space-y-1">
            {family.systems.map((s) => (
              <li key={s.slug}>
                <Link
                  href={s.href}
                  onClick={onNavigate}
                  className="group -mx-3 block px-3 py-2 no-underline transition-colors hover:bg-white/[0.04]"
                >
                  <span className="block text-[0.95rem] font-medium text-snow group-hover:text-signal">{s.name}</span>
                  <span className="mt-0.5 block text-[0.875rem] leading-snug text-muted">{s.keySpec}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="hidden flex-col justify-between border-l border-line pl-8 lg:flex">
        <div>
          <p className="v2-tech text-muted">17 systems</p>
          <p className="mt-4 text-[0.95rem] font-semibold text-snow [font-variation-settings:'wdth'_110]">Not sure where to start?</p>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
            Describe the mission, climate and force size, and the mission builder suggests a starting camp layout.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <Link href="/mission-solution-builder" onClick={onNavigate} className="v2-btn v2-btn-ghost whitespace-nowrap">
            Open mission builder
          </Link>
          <Link href="/configurable-solutions/compare" onClick={onNavigate} className="v2-link text-[0.9rem]">
            Compare systems
          </Link>
        </div>
      </div>
    </div>
  );
}

function CapabilitiesMenu({ onNavigate, capabilities }: { onNavigate: () => void; capabilities: NavMenuData["capabilities"] }) {
  return (
    <div className="v2-home-menu-cols v2-wrap grid gap-x-12 gap-y-8 py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
      <div>
        <p className="v2-tech text-muted">What a camp needs</p>
        <ul className="mt-4 grid gap-x-6 sm:grid-cols-2">
          {capabilities.map((c) => (
            <li key={c.href}>
              <Link href={c.href} onClick={onNavigate} className="-mx-3 block px-3 py-2 text-[0.95rem] font-medium text-snow no-underline hover:bg-white/[0.04] hover:text-signal">
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
        <Link href={NAV_CAPABILITIES_PAGE.href} onClick={onNavigate} className="v2-link mt-4 inline-block text-[0.9rem]">
          All capabilities
        </Link>
      </div>
      <div>
        <p className="v2-tech text-muted">Who we serve</p>
        <ul className="mt-4 space-y-1">
          {NAV_PROGRAMS.map((p) => (
            <li key={p.href}>
              <Link href={p.href} onClick={onNavigate} className="group -mx-3 block px-3 py-2 no-underline hover:bg-white/[0.04]">
                <span className="block text-[0.95rem] font-medium text-snow group-hover:text-signal">{p.label}</span>
                <span className="mt-0.5 block text-[0.875rem] leading-snug text-muted">{p.note}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href={NAV_WHO_WE_SERVE.href} onClick={onNavigate} className="v2-link mt-4 inline-block text-[0.9rem]">
          {NAV_WHO_WE_SERVE.label}
        </Link>
      </div>
      <div className="v2-plate flex flex-col justify-between px-6 py-6">
        <div>
          <p className="text-[0.95rem] font-semibold text-snow [font-variation-settings:'wdth'_110]">{NAV_GOV.label}</p>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">
            CAGE code and UEI, NAICS codes, current Army and DLA contract vehicles, and how to request a
            configuration package.
          </p>
        </div>
        <Link href={NAV_GOV.href} onClick={onNavigate} className="v2-btn v2-btn-ghost mt-6">
          Contracting details
        </Link>
      </div>
    </div>
  );
}

type MenuId = "systems" | "capabilities";

/** How long a menu or the phone menu stays on screen after closing, for its exit animation. */
const MENU_EXIT_MS = 200;
const DRAWER_EXIT_MS = 240;

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Keeps something on screen for `ms` after it closes, so it can animate out (polish-home.css).
 * Returns whether it should still be rendered.
 */
function useLingering(open: boolean, ms: number) {
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);
  useEffect(() => {
    if (open || !shown) return;
    const t = window.setTimeout(() => setShown(false), reducedMotion() ? 0 : ms);
    return () => window.clearTimeout(t);
  }, [open, shown, ms]);
  return open || shown;
}

export function Navbar({ menuData }: { menuData: NavMenuData }) {
  const pathname = useSitePathname();
  const isLogin = pathname === "/login";
  const publicSite = isPublicSitePage(pathname);
  const [open, setOpen] = useMenuOpenForRoute();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState<MenuId | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openedAt = useRef(0);
  const menuButtons = useRef<Record<MenuId, HTMLButtonElement | null>>({ systems: null, capabilities: null });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Close the menus on navigation (adjusting state during render, not in an effect).
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenu(null);
  }

  // The open menu stays on screen briefly after closing (it lifts away). Opening one from nothing
  // drops it down from the bar; moving to the other menu, or back while one is closing, swaps the
  // contents in place.
  const [shownMenu, setShownMenu] = useState<MenuId | null>(null);
  const [menuEnter, setMenuEnter] = useState<"drop" | "swap">("drop");
  const [seenMenu, setSeenMenu] = useState<MenuId | null>(null);
  if (menu !== seenMenu) {
    setSeenMenu(menu);
    if (menu) {
      setMenuEnter(shownMenu ? "swap" : "drop");
      setShownMenu(menu);
    }
  }
  useEffect(() => {
    if (menu || !shownMenu) return;
    const t = window.setTimeout(() => setShownMenu(null), reducedMotion() ? 0 : MENU_EXIT_MS);
    return () => window.clearTimeout(t);
  }, [menu, shownMenu]);

  const drawerShown = useLingering(open, DRAWER_EXIT_MS);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenu(null);
      menuButtons.current[menu]?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

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

  // Times come from the events themselves (ms since the page loaded).
  const openMenu = useCallback((id: MenuId, at: number) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenu((was) => {
      if (was !== id) openedAt.current = at;
      return id;
    });
  }, []);

  // A click right after hover (or a touch tap, which fires both) should open, not toggle shut.
  const onMenuClick = (id: MenuId, at: number) => {
    if (menu === id && at - openedAt.current < 400) return;
    if (menu !== id) openedAt.current = at;
    setMenu(menu === id ? null : id);
  };

  const onMenuBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setMenu(null);
  };
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMenu(null), 140);
  }, []);

  const solid = scrolled || !!shownMenu || !publicSite;
  const active: Record<MenuId, boolean> = {
    systems: pathname.startsWith("/configurable-solutions"),
    capabilities: pathname.startsWith("/capabilities") || pathname.startsWith("/government") || pathname.startsWith("/who-we-serve"),
  };

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
            {(
              [
                { id: "systems", label: "Systems", panel: <SystemsMenu onNavigate={() => setMenu(null)} systems={menuData.systems} /> },
                { id: "capabilities", label: "Capabilities", panel: <CapabilitiesMenu onNavigate={() => setMenu(null)} capabilities={menuData.capabilities} /> },
              ] as const
            ).map((m) => (
              <div key={m.id} onBlur={onMenuBlur}>
                <button
                  ref={(el) => {
                    menuButtons.current[m.id] = el;
                  }}
                  type="button"
                  aria-expanded={menu === m.id}
                  aria-controls={`${m.id}-menu`}
                  onClick={(e) => onMenuClick(m.id, e.timeStamp)}
                  onMouseEnter={(e) => openMenu(m.id, e.timeStamp)}
                  className={`flex h-10 items-center gap-1.5 whitespace-nowrap px-3 text-[0.95rem] font-medium transition-colors ${
                    menu === m.id || active[m.id] ? "text-snow" : "text-snow/80 hover:text-snow"
                  }`}
                >
                  {m.label}
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    aria-hidden
                    className={`transition-transform duration-200 ${menu === m.id ? "rotate-180" : ""}`}
                  >
                    <path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
                {shownMenu === m.id ? (
                  <div
                    id={`${m.id}-menu`}
                    role="region"
                    aria-label={m.label}
                    data-state={menu === m.id ? "open" : "closed"}
                    data-enter={menuEnter}
                    inert={menu !== m.id}
                    onMouseEnter={(e) => openMenu(m.id, e.timeStamp)}
                    className="v2-home-menu absolute inset-x-0 top-full max-h-[calc(100svh-72px)] overflow-y-auto overscroll-contain border-t border-line bg-ink shadow-[0_24px_48px_rgb(0_0_0/0.35)]"
                  >
                    {m.panel}
                  </div>
                ) : null}
              </div>
            ))}
            {NAV_LINKS.map((link) => {
              const active = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onMouseEnter={scheduleClose}
                  className={`${"wideOnly" in link ? "hidden min-[1480px]:flex" : "flex"} h-10 items-center whitespace-nowrap px-3 text-[0.95rem] font-medium no-underline transition-colors ${
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

      {drawerShown ? (
        <div
          ref={dialogRef}
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          data-state={open ? "open" : "closed"}
          inert={!open}
          className="v2-home-drawer wh-v2 fixed inset-0 z-[100] flex flex-col overflow-y-auto overscroll-contain bg-ink xl:hidden"
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
            <ul className="v2-home-drawer-links border-t border-line">
              {[{ href: "/configurable-solutions", label: "All systems" }, NAV_CAPABILITIES_PAGE, { href: NAV_WHO_WE_SERVE.href, label: "Who we serve" }, ...NAV_LINKS, { href: "/about", label: "About" }, NAV_SOF].map((l) => (
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
            <div className="v2-home-drawer-more mt-10 grid gap-8 sm:grid-cols-2">
              {menuData.systems.map((family) => (
                <div key={family.id}>
                  <p className="text-[0.9375rem] font-semibold text-muted">{family.name}</p>
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
            <div className="v2-home-drawer-more mt-10 flex flex-col gap-3">
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
