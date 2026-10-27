import type { Metadata } from "next";
import Link from "next/link";
import { listCompanyEvents } from "@/app/api/_lib/company-events";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { companyEventTypeLabel, formatEventDate, partitionCompanyEvents, type CompanyEventRow } from "@/lib/company-events";
import { contactUrl } from "@/lib/contact-url";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Briefings and events",
  description:
    "Book a Weatherhaven capability briefing for your program, or meet the team at defense shows in North America, Europe and Asia-Pacific.",
  path: "/events",
});

export const revalidate = 300;

/** 2026 show appearances, each documented on weatherhaven.com. */
const SHOWS_2026 = [
  {
    name: "Battlefield 2027",
    dates: "October 12–14, 2026",
    place: "Washington, D.C.",
    note: "TRECC rapidly deployable infrastructure on show.",
    url: "https://weatherhaven.com/Article?name=Weatherhaven%20Battlefield",
  },
  {
    name: "LAND FORCES 2026",
    dates: "October 6–8, 2026",
    place: "Perth, Western Australia",
    note: "With Supacat Asia Pacific; partnership announced at the show.",
    url: "https://weatherhaven.com/Article?name=Weatherhaven%20at%20LAND%20FORCES%202026",
  },
  {
    name: "DVD 2026",
    dates: "September 16–17, 2026",
    place: "UTAC Millbrook, United Kingdom",
    note: "Two new MECC expandable modules and TRECC.",
    url: "https://weatherhaven.com/Article?name=Weatherhaven%20DVD%202026",
  },
  {
    name: "MSPO 2026",
    dates: "September 8–11, 2026",
    place: "Kielce, Poland",
    note: "Command, accommodation, medical and logistics infrastructure in the Canadian Pavilion.",
    url: "https://weatherhaven.com/Article?name=Weatherhaven%20MSPO%202026%20in%20Kielce%2C%20Poland%20",
  },
] as const;

const BRIEFINGS = [
  {
    title: "Capability briefing",
    body: "A closed-door walkthrough of systems and camp layouts matched to your program requirements and release controls.",
    inquiry: "Demo Request",
    subject: "Capability briefing request",
  },
  {
    title: "Mission builder walkthrough",
    body: "A guided session in the mission builder: inputs, layout zones, parts list and the PDF export for procurement packages.",
    inquiry: "Demo Request",
    subject: "Mission builder walkthrough request",
  },
  {
    title: "Post-show follow-up",
    body: "Met us at a show? Pick up the conversation with the specialist for your system and theater.",
    inquiry: "Program Requirement",
    subject: "Follow-up from a trade show",
  },
] as const;

function EventRow({ event }: { event: CompanyEventRow }) {
  return (
    <li className="grid gap-2 border-b border-line py-6 md:grid-cols-[14rem_minmax(0,1fr)_auto] md:gap-8">
      <div className="text-[0.9rem] text-muted">
        <p className="text-snow">{event.starts_at ? formatEventDate(event.starts_at, event.timezone) : "On request"}</p>
        <p className="mt-1">{companyEventTypeLabel(event.event_type)}</p>
      </div>
      <div>
        <h3 className="text-[1.15rem] font-semibold text-snow">{event.title}</h3>
        {event.summary ? <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{event.summary}</p> : null}
        {event.location ? <p className="mt-2 text-[0.85rem] text-muted">{event.location.replace(" — ", ", ")}</p> : null}
      </div>
      <div className="md:text-right">
        {event.registration_url ? (
          <a href={event.registration_url} target="_blank" rel="noopener noreferrer" className="v2-link text-[0.95rem]">
            Register
          </a>
        ) : null}
      </div>
    </li>
  );
}

export default async function EventsPage() {
  const events = await listCompanyEvents({ publishedOnly: true });
  const { upcoming, past } = partitionCompanyEvents(events);

  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Events" }]}
        title="Briefings and events."
        lead="Book a capability briefing at a time that suits your program, or meet the Weatherhaven team at a defense show."
      />

      <section aria-labelledby="book-heading" className="bg-ink py-16 sm:py-20">
        <div className="v2-wrap">
          <h2 id="book-heading" className="v2-h2 text-snow">
            Book a briefing
          </h2>
          <ul className="mt-10 grid gap-px bg-line md:grid-cols-3">
            {BRIEFINGS.map((b) => (
              <li key={b.title} className="flex flex-col bg-ink py-6 md:px-6 md:first:pl-0">
                <h3 className="v2-h3 text-snow">{b.title}</h3>
                <p className="mt-3 flex-1 text-[0.95rem] leading-relaxed text-muted">{b.body}</p>
                <Link href={contactUrl({ inquiry: b.inquiry, subject: b.subject })} className="v2-link mt-6 self-start text-[0.95rem]">
                  Request this briefing
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="upcoming-heading" className="border-t border-line bg-ink py-16 sm:py-20">
        <div className="v2-wrap">
          <h2 id="upcoming-heading" className="v2-h2 text-snow">
            Upcoming
          </h2>
          {upcoming.length > 0 ? (
            <ul className="mt-8 border-t border-line">
              {upcoming.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </ul>
          ) : (
            <p className="v2-body mt-4">
              No public sessions are on the calendar right now. New shows and webinars are posted here as they are
              confirmed; in the meantime, a briefing can be booked for any date.
            </p>
          )}
        </div>
      </section>

      <section aria-labelledby="shows-heading" className="border-t border-line bg-hull py-16 sm:py-20">
        <div className="v2-wrap">
          <h2 id="shows-heading" className="v2-h2 text-snow">
            On the show floor in 2026
          </h2>
          <ul className="mt-10 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {SHOWS_2026.map((s) => (
              <li key={s.name} className="border-t-2 border-signal pt-5">
                <p className="text-[0.85rem] text-muted">{s.dates}</p>
                <h3 className="mt-2 text-[1.2rem] font-semibold text-snow [font-variation-settings:'wdth'_108]">{s.name}</h3>
                <p className="text-[0.9rem] text-snow/80">{s.place}</p>
                <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">{s.note}</p>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="v2-link mt-4 inline-block text-[0.9rem]">
                  Read the announcement<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {past.length > 0 ? (
        <section aria-labelledby="past-heading" className="border-t border-line bg-ink py-16 sm:py-20">
          <div className="v2-wrap">
            <h2 id="past-heading" className="v2-h2 text-snow">
              Past sessions
            </h2>
            <ul className="mt-8 border-t border-line">
              {past.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
