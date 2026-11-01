import Link from "next/link";
import { listNewsReleases } from "@/app/api/_lib/news-releases";
import { formatNewsDate, isExternalNewsLink, newsReleaseHref } from "@/lib/news-releases";

export async function HomeNews() {
  const releases = await listNewsReleases({ publishedOnly: true, limit: 3 });
  if (releases.length === 0) return null;

  return (
    <section aria-labelledby="news-heading" className="v2-defer v2-light bg-ink py-20 sm:py-24">
      <div className="v2-wrap">
        <div className="v2-reveal flex flex-wrap items-end justify-between gap-6">
          <h2 id="news-heading" className="v2-h2 text-snow">
            Latest from Weatherhaven
          </h2>
          <Link href="/news" className="v2-link text-[0.95rem]">
            All news
          </Link>
        </div>
        <ul className="v2-reveal-stagger mt-10 grid gap-px border-y border-line bg-line md:grid-cols-3 md:border-x">
          {releases.map((item) => {
            const href = newsReleaseHref(item);
            const external = isExternalNewsLink(item);
            return (
              <li key={item.id} className="bg-ink">
                <a
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  className="v2-press group flex h-full flex-col bg-ink px-1 py-7 no-underline transition-colors hover:bg-hull md:px-7"
                >
                  <time dateTime={item.published_at ?? undefined} className="v2-tech text-muted">
                    {formatNewsDate(item.published_at)}
                  </time>
                  <h3 className="mt-3 text-[1.2rem] font-semibold leading-snug text-snow transition-colors group-hover:text-signal [font-variation-settings:'wdth'_106]">
                    {item.title}
                  </h3>
                  {item.summary ? (
                    <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{item.summary}</p>
                  ) : null}
                  {external ? (
                    <span className="mt-auto pt-5 text-[0.875rem] text-muted">
                      Read on {new URL(href).hostname.replace(/^www\./, "")}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </span>
                  ) : null}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
