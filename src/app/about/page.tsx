import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { PhotoBand } from "@/components/site/PhotoBand";
import { CopyCode } from "@/components/site/CopyCode";
import { HomeTimeline } from "@/components/home/v2/HomeTimeline";
import { COMPANY_CONTACT, companyPhoneHref } from "@/lib/company-facts";
import { PROCUREMENT } from "@/lib/procurement";
import { CONFIRMED_DEPLOYMENTS } from "@/lib/confirmed-deployments";
import { getFlagshipStories } from "@/lib/stories";
import { getTeam, type TeamMember } from "@/lib/team";
import { contactUrl } from "@/lib/contact-url";
import { NAV_CTA } from "@/lib/site-nav-links";
import { blurProps } from "@/lib/image-blur";
import { pageMeta } from "@/lib/page-meta";

const PHOTO = "/products/ehmecc/gallery/01-EH-EXTERIOR.jpg";
/** The opening band: polar work is where the company started. */
const BAND = "/products/polar-chief/gallery/01-com-PolarChief149.jpg";

export const metadata: Metadata = pageMeta({
  title: "About Weatherhaven",
  description:
    "Weatherhaven designs, builds, delivers and supports deployable shelters, camps and field hospitals. Founded in British Columbia in 1981; Weatherhaven Resources, Inc. is the US company (CAGE 0EYW4).",
  path: "/about",
  image: PHOTO,
});

function Person({ person }: { person: TeamMember }) {
  return (
    <li className="border-t border-line pt-6">
      {person.photo ? (
        <div className="relative mb-5 aspect-square w-28 overflow-hidden bg-hull">
          <Image src={person.photo} alt="" fill sizes="112px" className="object-cover" />
        </div>
      ) : null}
      <p className="text-[1.1rem] font-semibold text-snow">{person.name}</p>
      <p className="mt-1 text-[0.95rem] text-muted">{person.title}</p>
      {person.focus ? <p className="mt-3 text-[0.95rem] text-snow/85">{person.focus}</p> : null}
      {person.bio ? <p className="mt-3 max-w-[48ch] text-[0.95rem] leading-relaxed text-muted">{person.bio}</p> : null}
      {person.email || person.phone ? (
        <p className="mt-4 flex flex-col gap-1 text-[0.95rem]">
          {person.email ? (
            <a href={`mailto:${person.email}`} className="v2-link self-start">
              {person.email}
            </a>
          ) : null}
          {person.phone ? (
            <a href={companyPhoneHref(person.phone)} className="v2-link self-start">
              {person.phone}
            </a>
          ) : null}
        </p>
      ) : null}
    </li>
  );
}

export default async function AboutPage() {
  const [team, stories] = await Promise.all([getTeam(), getFlagshipStories()]);
  const numbers = [
    { value: "1981", label: "Founded in British Columbia" },
    { value: "95+", label: "Countries Weatherhaven shelters have gone to" },
    { value: "7", label: "Continents, Antarctica included" },
    { value: String(CONFIRMED_DEPLOYMENTS.length), label: "Confirmed sites that can be shown publicly", href: "/deployments/map" },
  ];

  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "About" }]}
        title="About Weatherhaven"
        lead="Weatherhaven designs, builds, delivers and supports deployable shelters, camps and field hospitals for military, medical and polar work. It was founded in British Columbia in 1981. In the United States, programs contract with Weatherhaven Resources, Inc."
        wide
      />

      {/* The numbers, over the opening photograph */}
      <PhotoBand
        src={BAND}
        alt="Red Polar Chief shelters on snow below a mountain, a helicopter landing beside them"
        caption="Polar Chief shelters in a snow camp."
        position="50% 72%"
      >
        <section aria-label="Weatherhaven in numbers" className="bg-gradient-to-t from-ink via-ink/80 to-transparent pb-14 pt-28 sm:pb-16 sm:pt-36">
          <div className="v2-wrap">
            <dl className="grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4">
              {numbers.map((n) => (
                <div key={n.label} className="min-w-0 border-t border-snow/40 pt-4">
                  <dt className="sr-only">{n.label}</dt>
                  <dd className="v2-figure v2-tnum text-[clamp(2rem,4.4vw,3.4rem)] leading-none text-snow">{n.value}</dd>
                  <dd className="mt-2.5 text-[0.9375rem] leading-snug text-snow/85">
                    {n.href ? (
                      <Link href={n.href} className="text-snow/85 underline decoration-snow/40 underline-offset-2 hover:text-snow">
                        {n.label}
                      </Link>
                    ) : (
                      n.label
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </PhotoBand>

      <div className="bg-ink">
        {/* What the company does */}
        <section aria-labelledby="what-heading" className="border-b border-line">
          <div className="v2-wrap grid gap-10 py-20 sm:py-28 lg:grid-cols-12 lg:items-center lg:gap-14">
            <figure className="v2-reveal lg:col-span-7">
              <div className="relative aspect-[16/10] overflow-hidden bg-hull">
                <Image
                  src={PHOTO}
                  alt="Deployed EHMECC expandable containers joined by connecting corridors inside a hall"
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="v2-photo object-cover"
                  {...blurProps(PHOTO)}
                />
              </div>
              <figcaption className="mt-3 text-[0.875rem] text-muted">EHMECCs set up indoors and joined into one complex.</figcaption>
            </figure>
            <div className="v2-reveal lg:col-span-5">
              <h2 id="what-heading" className="v2-h2 max-w-[18ch] text-snow">
                One company, from the drawing to the teardown
              </h2>
              <p className="v2-body mt-5 text-[1.05rem] text-snow/85">
                The same company designs each system, manufactures it, delivers and installs it, takes it down when the
                mission ends, then refurbishes and stores it for the next one.
              </p>
              <p className="v2-body mt-4 text-snow/85">
                It was started in 1981 by the founders of an expedition company and a Vancouver construction firm.
              </p>
              <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem]">
                <Link href="/configurable-solutions" className="v2-link">
                  The systems
                </Link>
                <Link href="/deployments" className="v2-link">
                  Where they&rsquo;ve deployed
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* Plants and the US company */}
        <section aria-labelledby="where-heading" className="v2-light py-20 sm:py-28">
          <div className="v2-wrap">
            <h2 id="where-heading" className="v2-h2 v2-reveal text-snow">
              Where it&rsquo;s built, and who you contract with
            </h2>
            <div className="v2-reveal-stagger mt-12 grid gap-8 lg:grid-cols-2 lg:gap-8">
              <div className="v2-plate px-6 py-7 sm:px-8 sm:py-8">
                <h3 className="v2-h3 text-snow">The plants</h3>
                <p className="mt-3 max-w-[52ch] text-[0.975rem] leading-relaxed text-snow/85">
                  Weatherhaven builds in its own plants in Burnaby, British Columbia, and Brockville, Ontario, both
                  certified to ISO 9001:2015.
                </p>
                <dl className="mt-6 space-y-4 text-[0.95rem]">
                  <div>
                    <dt className="text-muted">Global headquarters</dt>
                    <dd className="mt-1 text-snow">
                      {COMPANY_CONTACT.globalLegalName}
                      <br />
                      {COMPANY_CONTACT.globalHeadquartersAddress}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">Phone</dt>
                    <dd className="mt-1">
                      <a href={companyPhoneHref(COMPANY_CONTACT.globalPhone)} className="v2-link">
                        {COMPANY_CONTACT.globalPhone}
                      </a>
                    </dd>
                  </div>
                </dl>
                <a href={COMPANY_CONTACT.isoCertificateUrl} target="_blank" rel="noopener noreferrer" className="v2-link mt-6 inline-block text-[0.95rem]">
                  ISO 9001:2015 certificate (PDF)
                </a>
              </div>

              <div className="v2-plate px-6 py-7 sm:px-8 sm:py-8">
                <h3 className="v2-h3 text-snow">Weatherhaven USA</h3>
                <p className="mt-3 max-w-[52ch] text-[0.975rem] leading-relaxed text-snow/85">
                  {PROCUREMENT.legalName} is the US company: US programs order through it, as a new requirement or under
                  an existing agreement.
                </p>
                <dl className="mt-6 space-y-4 text-[0.95rem]">
                  <div>
                    <dt className="text-muted">US office</dt>
                    <dd className="mt-1 text-snow">{COMPANY_CONTACT.headquartersAddress.replace(", United States", "")}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Phone</dt>
                    <dd className="mt-1">
                      <a href={companyPhoneHref(COMPANY_CONTACT.phone)} className="v2-link">
                        {COMPANY_CONTACT.phone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">CAGE code</dt>
                    <dd className="mt-1">
                      <CopyCode value={PROCUREMENT.cage} label="CAGE code" />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted">UEI</dt>
                    <dd className="mt-1">
                      <CopyCode value={PROCUREMENT.uei} label="UEI" />
                    </dd>
                  </div>
                </dl>
                <Link href="/government" className="v2-link mt-6 inline-block text-[0.95rem]">
                  How to buy: NAICS codes and contracts on record
                </Link>
              </div>
            </div>
          </div>
        </section>

        {team.length > 0 ? (
          <section aria-labelledby="team-heading" className="py-20 sm:py-28">
            <div className="v2-wrap">
              <h2 id="team-heading" className="v2-h2 v2-reveal text-snow">
                The Weatherhaven USA team
              </h2>
              <ul className="v2-reveal-stagger mt-10 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {team.map((p) => (
                  <Person key={p.name} person={p} />
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <HomeTimeline />

        {/* Stories */}
        <section aria-labelledby="stories-heading" className="border-t border-line py-20 sm:py-28">
          <div className="v2-wrap">
            <div className="v2-reveal flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
              <h2 id="stories-heading" className="v2-h2 text-snow">
                Three programs in depth
              </h2>
              <Link href="/stories" className="v2-link text-[0.95rem]">
                All stories
              </Link>
            </div>
            <ul className={`v2-reveal-stagger mt-12 grid gap-x-8 gap-y-12 ${stories.length % 3 === 0 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
              {stories.map((s) => (
                <li key={s.slug}>
                  <Link href={`/stories/${s.slug}`} className="v2-press group block no-underline">
                    <span className="v2-media-zoom relative block aspect-[3/2] bg-hull">
                      <Image
                        src={s.hero.src}
                        alt={s.hero.alt}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="v2-photo object-cover"
                        {...blurProps(s.hero.src)}
                      />
                      {s.hero.model ? (
                        <span className="absolute bottom-2 left-2 bg-ink/80 px-2 py-1 text-[0.8125rem] text-snow/90">3D model</span>
                      ) : null}
                    </span>
                    <span className="mt-4 block text-[0.9375rem] text-muted">{s.place}</span>
                    <span className="mt-1.5 block text-[1.2rem] font-semibold leading-snug text-snow transition-colors group-hover:text-signal [font-variation-settings:'wdth'_106]">
                      {s.title}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Next step */}
        <section aria-label="Contact" className="border-t border-line bg-hull py-20 sm:py-24">
          <div className="v2-wrap v2-reveal flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="v2-h2 max-w-[22ch] text-snow">Talk to the people who build it</p>
              <p className="mt-4 max-w-[60ch] text-[0.95rem] text-muted">
                Ethics and compliance concerns go to{" "}
                <a href={`mailto:${COMPANY_CONTACT.ethicsEmail}`} className="underline decoration-line-strong underline-offset-2 hover:text-snow">
                  {COMPANY_CONTACT.ethicsEmail}
                </a>
                .
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={NAV_CTA.href} className="v2-btn">
                {NAV_CTA.label}
              </Link>
              <Link href={contactUrl({ inquiry: "Engineer Call" })} className="v2-btn v2-btn-ghost">
                Talk to an engineer
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
