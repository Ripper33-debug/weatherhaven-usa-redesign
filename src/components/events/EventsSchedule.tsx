import Image from "next/image";
import Link from "next/link";
import {
  companyEventTypeLabel,
  formatEventDate,
  formatEventDateBadge,
  type CompanyEventRow,
} from "@/lib/company-events";
import { contactUrl } from "@/lib/contact-url";
import { btnMarketingLink, btnMarketingOutline } from "@/lib/cta-buttons";
import type { NewsReleaseRow } from "@/lib/news-releases";
import { newsReleaseHref } from "@/lib/news-releases";

function eventContactHref(event: CompanyEventRow): string {
  return contactUrl({
    inquiry: companyEventTypeLabel(event.event_type),
    deployment: `${event.title}${event.location ? ` — ${event.location}` : ""}`,
  });
}

function EventCard({
  event,
  relatedNews,
  ctaLabel,
}: {
  event: CompanyEventRow;
  relatedNews?: NewsReleaseRow | null;
  ctaLabel: string;
}) {
  const badge = formatEventDateBadge(event.starts_at, event.timezone);
  const externalRegister = event.registration_url?.trim();
  const href = externalRegister || eventContactHref(event);
  const isExternal = Boolean(externalRegister);

  return (
    <article className="flex flex-col overflow-hidden border border-white/[0.08] bg-[#0d0f12] sm:flex-row">
      <div className="flex shrink-0 items-stretch border-b border-white/[0.08] sm:w-[120px] sm:flex-col sm:border-r sm:border-b-0">
        <div className="flex min-w-[88px] flex-col items-center justify-center bg-[#121820] px-4 py-5 sm:min-w-0 sm:flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#4d9fff]">{badge.weekday}</p>
          <p className="wh-marketing-display mt-1 text-3xl leading-none text-white">{badge.day}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-[#8a9099]">{badge.month}</p>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col sm:flex-row">
        {event.cover_image_url ? (
          <div className="relative hidden aspect-[16/10] w-full shrink-0 overflow-hidden bg-[#121820] sm:block sm:w-[200px] lg:w-[240px]">
            <Image
              src={event.cover_image_url}
              alt=""
              fill
              className="object-cover"
              sizes="240px"
            />
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#4d9fff]">
            {companyEventTypeLabel(event.event_type)}
          </p>
          <h3 className="mt-2 text-xl font-medium text-white">{event.title}</h3>
          {event.summary ? (
            <p className="mt-2 text-sm leading-relaxed text-[#8a9099]">{event.summary}</p>
          ) : null}
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-[11px] uppercase tracking-wide text-[#8a9099]">When</dt>
              <dd className="mt-0.5 text-white">
                {event.schedule_type === "on_demand"
                  ? "Schedule on request"
                  : formatEventDate(event.starts_at, event.timezone)}
              </dd>
            </div>
            {event.location ? (
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-[#8a9099]">Where</dt>
                <dd className="mt-0.5 text-white">{event.location}</dd>
              </div>
            ) : null}
          </dl>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {isExternal ? (
              <a href={href} target="_blank" rel="noopener noreferrer" className={`${btnMarketingOutline} justify-center text-sm`}>
                {ctaLabel}
              </a>
            ) : (
              <Link href={href} className={`${btnMarketingOutline} justify-center text-sm`}>
                {ctaLabel}
              </Link>
            )}
            {relatedNews ? (
              <Link href={newsReleaseHref(relatedNews)} className={`${btnMarketingLink} justify-center text-sm`}>
                Related news <span aria-hidden>→</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

type Props = {
  upcoming: CompanyEventRow[];
  onDemand: CompanyEventRow[];
  past: CompanyEventRow[];
  newsBySlug: Record<string, NewsReleaseRow>;
};

export function EventsSchedule({ upcoming, onDemand, past, newsBySlug }: Props) {
  return (
    <div className="space-y-16">
      <section aria-labelledby="events-upcoming-heading">
        <h2 id="events-upcoming-heading" className="wh-marketing-eyebrow">
          Upcoming schedule
        </h2>
        {upcoming.length === 0 ? (
          <p className="mt-6 text-sm text-[#8a9099]">
            No dated sessions are posted right now. Request a capability briefing below or contact programs.
          </p>
        ) : (
          <ul className="mt-6 space-y-5">
            {upcoming.map((event) => (
              <li key={event.id}>
                <EventCard
                  event={event}
                  relatedNews={
                    event.related_news_slug ? newsBySlug[event.related_news_slug] ?? null : null
                  }
                  ctaLabel="Request to attend"
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {onDemand.length > 0 ? (
        <section aria-labelledby="events-briefings-heading">
          <h2 id="events-briefings-heading" className="wh-marketing-eyebrow">
            Available briefings
          </h2>
          <p className="mt-3 text-sm text-[#8a9099]">
            On-demand and recurring sessions — contact our team to schedule.
          </p>
          <ul className="mt-6 space-y-5">
            {onDemand.map((event) => (
              <li key={event.id}>
                <EventCard
                  event={event}
                  relatedNews={
                    event.related_news_slug ? newsBySlug[event.related_news_slug] ?? null : null
                  }
                  ctaLabel="Schedule briefing"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {past.length > 0 ? (
        <section aria-labelledby="events-past-heading">
          <h2 id="events-past-heading" className="wh-marketing-eyebrow">
            Recent sessions
          </h2>
          <ul className="mt-6 space-y-5 opacity-90">
            {past.slice(0, 3).map((event) => (
              <li key={event.id}>
                <EventCard
                  event={event}
                  relatedNews={
                    event.related_news_slug ? newsBySlug[event.related_news_slug] ?? null : null
                  }
                  ctaLabel="Follow up with programs"
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
