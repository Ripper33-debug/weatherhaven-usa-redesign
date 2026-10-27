import Link from "next/link";
import type { NewsReleaseRow } from "@/lib/news-releases";
import {
  formatNewsDate,
  isExternalNewsLink,
  newsReleaseHref,
} from "@/lib/news-releases";

export function NewsReleaseList({
  releases,
  compact = false,
}: {
  releases: NewsReleaseRow[];
  compact?: boolean;
}) {
  if (releases.length === 0) {
    return (
      <p className={compact ? "text-sm text-[#8a9099]" : "text-base text-[#8a9099]"}>
        No news releases yet. Check back soon.
      </p>
    );
  }

  return (
    <ul className={compact ? "divide-y divide-white/[0.08]" : "mt-10 divide-y divide-white/[0.08]"}>
      {releases.map((item) => {
        const href = newsReleaseHref(item);
        const external = isExternalNewsLink(item);
        const linkClass =
          "mt-2 inline-flex text-base text-white transition hover:text-[#4d9fff] no-underline";

        return (
          <li key={item.id} className={compact ? "py-5 first:pt-0" : "py-6 first:pt-0"}>
            <p className="text-xs tracking-wide text-[#8a9099]">{formatNewsDate(item.published_at)}</p>
            {item.summary && !compact ? (
              <p className="mt-2 text-sm leading-relaxed text-[#8a9099]">{item.summary}</p>
            ) : null}
            {external ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {item.title} <span aria-hidden>→</span>
              </a>
            ) : (
              <Link href={href} className={linkClass}>
                {item.title} <span aria-hidden>→</span>
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
