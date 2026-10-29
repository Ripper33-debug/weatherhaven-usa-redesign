import Link from "next/link";
import type { ReactNode } from "react";

export type Crumb = { href?: string; label: string };

/** Interior page header for the public site: breadcrumb, H1, lead, optional actions. */
export function V2PageHeader({
  title,
  lead,
  crumbs,
  children,
  wide = false,
}: {
  title: ReactNode;
  lead?: ReactNode;
  crumbs?: Crumb[];
  children?: ReactNode;
  wide?: boolean;
}) {
  return (
    <header className="border-b border-line bg-ink pb-14 pt-32 sm:pb-16 sm:pt-36">
      <div className="v2-wrap">
        {crumbs && crumbs.length > 0 ? (
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="v2-tech flex flex-wrap items-center gap-x-2 gap-y-1 text-muted">
              {crumbs.map((c, i) => (
                <li key={`${c.label}-${i}`} className="flex items-center gap-2">
                  {i > 0 ? (
                    <span aria-hidden className="text-line-strong">
                      /
                    </span>
                  ) : null}
                  {c.href ? (
                    <Link href={c.href} className="text-muted no-underline hover:text-snow">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-snow">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <h1 className={`v2-h1 text-snow ${wide ? "max-w-[24ch]" : "max-w-[18ch]"}`}>{title}</h1>
        {lead ? <p className="v2-lead mt-5">{lead}</p> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </header>
  );
}
