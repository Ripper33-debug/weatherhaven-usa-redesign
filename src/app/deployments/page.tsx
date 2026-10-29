import type { Metadata } from "next";
import Link from "next/link";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { BriefStory, FeatureStory, LeadStory } from "@/components/deployments/FieldStory";
import { DeploymentGlobe } from "@/components/deployments/DeploymentGlobe";
import { CONFIRMED_DEPLOYMENTS } from "@/lib/confirmed-deployments";
import { DEPLOYMENT_STORIES, FIELD_NOTES, sourceHost } from "@/lib/field-stories";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Deployments",
  description:
    "Weatherhaven shelters in the field: Canada's Headquarters Shelter System, TRECC with the US Army, a NATO headquarters, COVID-19 field hospitals, Antarctic ice-core drilling and more, with public sources.",
  path: "/deployments",
  image: "/products/series-4/gallery/13-S4-Truss-Little-Dome-EPICA-2.jpeg",
});

/** Photo placement for each feature story, chosen per photograph rather than alternated. */
const FEATURE_LAYOUT: Record<string, "wide" | "left" | "right"> = {
  "trecc-us-army": "left",
  "beyond-epica": "wide",
  "nato-headquarters": "right",
};

export default function DeploymentsPage() {
  const lead = DEPLOYMENT_STORIES.find((s) => s.weight === "lead");
  const features = DEPLOYMENT_STORIES.filter((s) => s.weight === "feature");
  const briefs = DEPLOYMENT_STORIES.filter((s) => s.weight === "brief");
  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Deployments" }]}
        title="Selected deployments"
        lead="Headquarters shelters for Canada, TRECC with the US Army, a drill shelter at 3,200 m in Antarctica and five more programs. Government and research sources are linked where they exist."
        wide
      >
        <nav aria-label="Stories on this page">
          <ul className="grid gap-x-10 border-t border-line sm:grid-cols-2">
            {DEPLOYMENT_STORIES.map((s) => (
              <li key={s.id} className="border-b border-line">
                <a href={`#${s.id}`} className="group block py-3.5 no-underline">
                  <span className="block text-[1rem] font-medium text-snow group-hover:text-signal">{s.title}</span>
                  <span className="block text-[0.875rem] text-muted">{s.place}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-6 text-[0.95rem] text-muted">
          <Link href="/deployments/record" className="v2-link">
            Full track record
          </Link>
          : contracts on public record and all {CONFIRMED_DEPLOYMENTS.length} confirmed sites in one table.
        </p>
      </V2PageHeader>

      <div className="bg-ink">
        {lead ? <LeadStory story={lead} /> : null}
        {features.map((s) => (
          <FeatureStory key={s.id} story={s} layout={FEATURE_LAYOUT[s.id] ?? "left"} />
        ))}

        <section aria-labelledby="briefs-heading" className="border-b border-line py-20 sm:py-24">
          <div className="v2-wrap">
            <h2 id="briefs-heading" className="v2-h2 text-snow">
              Kitchens, field hospitals and polar camps
            </h2>
            <div className="mt-10 grid gap-x-14 gap-y-14 md:grid-cols-2">
              {briefs.map((s) => (
                <BriefStory key={s.id} story={s} />
              ))}
            </div>
          </div>
        </section>

        <section id="more-from-the-field" aria-labelledby="notes-heading" className="scroll-mt-24 border-b border-line py-16 sm:py-20">
          <div className="v2-wrap grid gap-8 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)] lg:gap-16">
            <h2 id="notes-heading" className="v2-h3 text-snow">
              More from the field
            </h2>
            <ul className="divide-y divide-line border-y border-line">
              {FIELD_NOTES.map((n) => (
                <li key={n.place} className="grid gap-1 py-4 sm:grid-cols-[13rem_1fr] sm:gap-6">
                  <p className="text-[0.95rem] font-semibold text-snow">{n.place}</p>
                  <p className="text-[0.95rem] leading-relaxed text-muted">
                    {n.text}
                    {n.source ? (
                      <>
                        {" "}
                        <a
                          href={n.source.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Source: ${n.source.label} (opens in a new tab)`}
                          className="whitespace-nowrap text-[0.875rem] text-muted underline decoration-line-strong underline-offset-2 hover:text-snow"
                        >
                          {sourceHost(n.source.href)}
                        </a>
                      </>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section aria-labelledby="globe-heading" className="border-b border-line bg-[#03080F]">
          <div className="v2-wrap flex flex-col gap-4 py-14 sm:flex-row sm:items-end sm:justify-between sm:py-16">
            <div>
              <h2 id="globe-heading" className="v2-h2 text-snow">
                Confirmed sites on the map
              </h2>
              <p className="v2-body mt-3 max-w-[56ch]">
                The {CONFIRMED_DEPLOYMENTS.length} confirmed sites that can be shown publicly. Weatherhaven shelters have
                gone to more than 95 countries in all.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-x-6 gap-y-2 text-[0.95rem]">
              <Link href="/deployments/record" className="v2-link">
                Full track record
              </Link>
              <Link href="/deployments/map" className="v2-link">
                Open the full map
              </Link>
            </div>
          </div>
          <DeploymentGlobe title="Globe of Weatherhaven deployments" />
        </section>

        <section className="bg-hull py-20 sm:py-24">
          <div className="v2-wrap grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <h2 className="v2-h2 max-w-[24ch] text-snow">Need a headquarters, clinic or polar camp of your own?</h2>
              <p className="v2-body mt-4 max-w-[52ch]">
                The mission builder turns five answers into a starting camp layout you can send to the US office.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/mission-solution-builder" className="v2-btn">
                Open the mission builder
              </Link>
              <Link href="/contact?inquiry=Program%20Requirement" className="v2-btn v2-btn-ghost">
                Contact the US office
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
