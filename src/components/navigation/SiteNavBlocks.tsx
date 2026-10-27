"use client";

import Link from "next/link";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { WeatherhavenLogoLink } from "@/components/brand/WeatherhavenLogoLink";
import { WeatherhavenLogo } from "@/components/brand/WeatherhavenLogo";
import { navContactLink, navDiscoverLinks, navPrimaryLinks } from "@/lib/site";

const navLinkClass =
  "whitespace-nowrap text-[14px] font-medium text-white/80 no-underline transition-colors duration-150 ease-out hover:text-white";

export function NavDesktopCenter({ className = "" }: { className?: string }) {
  return (
    <nav
      className={`flex max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-6 lg:gap-x-8 ${className}`}
    >
      {navPrimaryLinks.map((item) => (
        <Link key={item.href} href={item.href} className={navLinkClass}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function NavRequestAccessCta({
  className = "",
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={navContactLink.href}
      onClick={onNavigate}
      className={`whitespace-nowrap text-[14px] font-medium text-white/80 no-underline transition-colors duration-150 ease-out hover:text-white ${className}`}
    >
      Get in touch
    </Link>
  );
}

export function NavMobileOverlay({
  open,
  onClose,
  showWordmark = true,
}: {
  open: boolean;
  onClose: () => void;
  showWordmark?: boolean;
}) {
  if (!open) return null;

  const close = () => onClose();

  return (
    <div
      id="mobile-nav-dialog"
      className="fixed inset-0 z-[100] flex flex-col bg-[#080a0c] md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[rgba(255,255,255,0.1)] px-4 sm:h-16">
        {showWordmark ? (
          <WeatherhavenLogoLink href="/" height={28} onClick={close} />
        ) : (
          <WeatherhavenLogo height={28} />
        )}
        <button
          type="button"
          className="flex p-2 text-white transition-opacity hover:opacity-70"
          aria-label="Close menu"
          onClick={close}
        >
          <IconX size={22} stroke={1.5} />
        </button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-4">
        {navPrimaryLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border-b border-[rgba(255,255,255,0.08)] py-5 text-[22px] leading-snug text-white no-underline transition-opacity hover:opacity-70"
            onClick={close}
          >
            {item.label}
          </Link>
        ))}
        <p className="mt-8 mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40">Discover</p>
        {navDiscoverLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border-b border-[rgba(255,255,255,0.06)] py-4 text-[17px] leading-snug text-white/75 no-underline transition-opacity hover:opacity-70"
            onClick={close}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex shrink-0 flex-col gap-4 border-t border-[rgba(255,255,255,0.1)] p-4">
        <NavRequestAccessCta className="w-full py-2 text-center" onNavigate={close} />
      </div>
    </div>
  );
}

export function NavHamburgerButton({ onClick, open = false }: { onClick: () => void; open?: boolean }) {
  return (
    <button
      type="button"
      className="flex p-2 text-[#8a9099] transition-opacity hover:opacity-70 md:hidden"
      aria-expanded={open}
      aria-controls="mobile-nav-dialog"
      aria-label={open ? "Close menu" : "Open menu"}
      onClick={onClick}
    >
      <IconMenu2 size={22} stroke={1.5} />
    </button>
  );
}
