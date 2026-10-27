import Link from "next/link";
import type { ReactNode } from "react";
import { WeatherhavenLogoLink } from "@/components/brand/WeatherhavenLogoLink";
import { legalLinks } from "@/lib/site";

export function LegalDocumentLayout({
  title,
  subtitle,
  updated,
  children,
}: {
  title: string;
  subtitle?: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-[#080a0c] text-white">
      <div className="mx-auto max-w-3xl px-6 py-16 sm:px-8 sm:py-24 lg:py-28">
        <WeatherhavenLogoLink href="/" height={28} className="sm:h-8" />
        <h1 className="font-serif mt-4 text-3xl leading-tight sm:text-4xl">{title}</h1>
        {subtitle ? <p className="mt-4 text-sm leading-relaxed text-[#8a9099]">{subtitle}</p> : null}
        <p className="mt-6 text-xs text-[#8a9099]">Last updated {updated}</p>
        <div className="prose-legal mt-10 space-y-6 text-sm leading-relaxed text-[#c4c8cf]">{children}</div>
        <nav className="mt-14 flex flex-wrap gap-4 border-t border-white/[0.08] pt-8 text-sm">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-[#8a9099] hover:text-white">
              {link.label}
            </Link>
          ))}
          <Link href="/" className="text-[#4d9fff] hover:underline">
            Back to site
          </Link>
        </nav>
      </div>
    </div>
  );
}
