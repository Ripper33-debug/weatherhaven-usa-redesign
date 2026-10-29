import type { Metadata } from "next";
import { listNewsReleases } from "@/app/api/_lib/news-releases";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { formatNewsDate, isExternalNewsLink, newsReleaseHref } from "@/lib/news-releases";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "News",
  description: "Partnerships, deliveries, product news and show appearances from Weatherhaven.",
  path: "/news",
});

export const revalidate = 300;

export default async function NewsPage() {
  const releases = await listNewsReleases({ publishedOnly: true });
  const byYear = new Map<string, typeof releases>();
  for (const r of releases) {
    const y = r.published_at ? new Date(r.published_at).getUTCFullYear().toString() : "Undated";
    byYear.set(y, [...(byYear.get(y) ?? []), r]);
  }

  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "News" }]}
        title="News from Weatherhaven."
        lead="Partnerships, deliveries, product news and show appearances. Releases published on weatherhaven.com open in a new tab."
      />
      <div className="bg-ink py-14 sm:py-20">
        <div className="v2-wrap space-y-16">
          {[...byYear.entries()].map(([year, items]) => (
            <section key={year} aria-labelledby={`y-${year}`} className="grid gap-6 lg:grid-cols-[10rem_minmax(0,1fr)] lg:gap-12">
              <h2 id={`y-${year}`} className="v2-figure text-[2.5rem] leading-none text-snow lg:sticky lg:top-28 lg:self-start">
                {year}
              </h2>
              <ul className="border-t border-line">
                {items.map((item) => {
                  const href = newsReleaseHref(item);
                  const external = isExternalNewsLink(item);
                  return (
                    <li key={item.id} className="border-b border-line">
                      <a
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="group grid gap-2 py-6 no-underline md:grid-cols-[11rem_minmax(0,1fr)] md:gap-8"
                      >
                        <time dateTime={item.published_at ?? undefined} className="v2-tech text-muted">
                          {formatNewsDate(item.published_at)}
                        </time>
                        <span>
                          <span className="block text-[1.2rem] font-semibold leading-snug text-snow transition-colors group-hover:text-signal [font-variation-settings:'wdth'_106]">
                            {item.title}
                          </span>
                          {item.summary ? (
                            <span className="mt-2 block max-w-[70ch] text-[0.95rem] leading-relaxed text-muted">{item.summary}</span>
                          ) : null}
                          {external ? (
                            <span className="mt-3 block text-[0.85rem] text-muted">
                              {new URL(href).hostname.replace(/^www\./, "")}
                              <span className="sr-only"> (opens in a new tab)</span>
                            </span>
                          ) : null}
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
