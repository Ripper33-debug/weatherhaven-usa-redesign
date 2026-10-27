import Link from "next/link";
import type { ReactNode } from "react";
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
    <div className="bg-ink text-snow">
      <div className="v2-wrap max-w-[860px] pb-24 pt-32 sm:pt-36">
        <h1 className="v2-h1 text-snow">{title}</h1>
        {subtitle ? <p className="v2-lead mt-5">{subtitle}</p> : null}
        <p className="mt-6 text-[0.9rem] text-muted">Last updated {updated}</p>
        <div className="mt-10 space-y-6 text-[1rem] leading-relaxed text-snow/80 [&_a]:text-snow [&_a]:underline [&_a]:decoration-signal/60 [&_h2]:mt-10 [&_h2]:text-[1.35rem] [&_h2]:font-semibold [&_h2]:text-snow [&_h3]:font-semibold [&_h3]:text-snow">
          {children}
        </div>
        <nav aria-label="Legal" className="mt-14 flex flex-wrap gap-6 border-t border-line pt-8 text-[0.95rem]">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted no-underline hover:text-snow">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
