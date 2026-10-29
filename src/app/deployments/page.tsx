import type { Metadata } from "next";
import Link from "next/link";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { FieldStory, LeadStory } from "@/components/deployments/FieldStory";
import { HomeDeploymentMap } from "@/components/home/v2/HomeDeploymentMap";
import { DEPLOYMENT_STORIES, FIELD_NOTES, sourceHost } from "@/lib/field-stories";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Deployments",
  description:
    "Weatherhaven shelters in the field: Canada's Headquarters Shelter System, the US Army's Containerized Kitchen, COVID-19 field hospitals, Antarctic ice-core drilling and more, with sources.",
  path: "/deployments",
  image: "/products/series-4/gallery/13-S4-Truss-Little-Dome-EPICA-2.jpeg",
});

export default function DeploymentsPage() {
  const [lead, ...rest] = DEPLOYMENT_STORIES;
  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Deployments" }]}
        title="Where the shelters went to work."
        lead="Eight deployments, from ice-core drilling at 3,200 m in Antarctica to the Canadian Armed Forces' headquarters. The figures come from the governments, programs and scientists involved, and every story lists its sources."
        wide
      >
        <nav aria-label="Stories on this page">
          <ul className="grid gap-x-10 border-t border-line sm:grid-cols-2">
            {DEPLOYMENT_STORIES.map((s) => (
              <li key={s.id} className="border-b border-line">
                <a href={`#${s.id}`} className="group block py-3.5 no-underline">
                  <span className="min-w-0">
                    <span className="block text-[1rem] font-medium text-snow group-hover:text-signal">{s.title}</span>
                    <span className="block text-[0.85rem] text-muted">{s.place}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </V2PageHeader>

      <div className="bg-ink">
        <LeadStory story={lead} />
        {rest.map((s, i) => (
          <FieldStory key={s.id} story={s} flip={i % 2 === 1} />
        ))}

        <section id="more-from-the-field" aria-labelledby="notes-heading" className="scroll-mt-24 border-b border-line py-20 sm:py-24">
          <div className="v2-wrap">
            <h2 id="notes-heading" className="v2-h2 text-snow">
              More from the field
            </h2>
            <ul className="mt-10 grid gap-x-12 gap-y-8 md:grid-cols-2">
              {FIELD_NOTES.map((n) => (
                <li key={n.place} className="border-t border-line pt-5">
                  <p className="text-[1.05rem] font-semibold text-snow">{n.place}</p>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{n.text}</p>
                  <p className="mt-2 text-[0.8rem] text-muted">
                    Source:{" "}
                    <a
                      href={n.source.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted underline decoration-line-strong underline-offset-2 hover:text-snow"
                    >
                      {n.source.label === "Weatherhaven" ? sourceHost(n.source.href) : n.source.label}
                    </a>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <HomeDeploymentMap storiesLink={false} />

        <section className="bg-hull py-20 sm:py-24">
          <div className="v2-wrap grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <h2 className="v2-h2 max-w-[22ch] text-snow">Planning a deployment like one of these?</h2>
              <p className="v2-body mt-4">
                Answer five questions in the mission builder, or tell a Weatherhaven expert the mission, climate and
                headcount.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/mission-solution-builder" className="v2-btn">
                Open the mission builder
              </Link>
              <Link href="/contact" className="v2-btn v2-btn-ghost">
                Talk to an expert
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
