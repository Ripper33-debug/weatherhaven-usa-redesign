import Image from "next/image";
import Link from "next/link";
import { SYSTEMS_BY_FAMILY, type NavSystem } from "@/lib/site-nav";
import { blurProps } from "@/lib/image-blur";

function SystemList({ systems, columns = 1 }: { systems: NavSystem[]; columns?: 1 | 2 }) {
  return (
    <ul className={`grid border-t border-line ${columns === 2 ? "sm:grid-cols-2 sm:gap-x-8" : ""}`}>
      {systems.map((s) => (
        <li key={s.slug} className="border-b border-line">
          <Link
            href={s.href}
            className="group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 py-3.5 no-underline"
          >
            <span>
              <span className="block text-[1.05rem] font-semibold text-snow transition-colors group-hover:text-signal [font-variation-settings:'wdth'_106]">
                {s.name}
              </span>
              <span className="mt-0.5 block text-[0.875rem] leading-snug text-muted">{s.keySpec}</span>
            </span>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-signal">
              <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function HomeSystems() {
  const [lead, ...rest] = SYSTEMS_BY_FAMILY;

  return (
    <section aria-labelledby="systems-heading" className="border-t border-line bg-ink py-20 sm:py-28">
      <div className="v2-wrap">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-end">
          <h2 id="systems-heading" className="v2-h1 max-w-[21ch] text-snow">
            From a polar tent to a full field hospital.
          </h2>
          <p className="v2-body lg:justify-self-end">
            Four families of shelter, all designed and built by Weatherhaven, all engineered to be struck and
            redeployed when the mission moves.
          </p>
        </div>

        {/* Lead family: expandable containers */}
        <article className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12">
          <Link href={`/configurable-solutions?family=${lead.id}`} className="group relative block aspect-[4/3] overflow-hidden bg-hull lg:aspect-auto lg:min-h-[520px]">
            <Image
              src={lead.cover}
              alt="Weatherhaven expandable container command post lit at dusk"
              {...blurProps(lead.cover)}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </Link>
          <div className="flex flex-col">
            <h3 className="v2-h2 text-snow">{lead.name}</h3>
            <p className="v2-body mt-3">{lead.summary}</p>
            <div className="mt-7">
              <SystemList systems={lead.systems} />
            </div>
          </div>
        </article>

        {/* Other families */}
        <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {rest.map((family) => (
            <article key={family.id} className="flex flex-col">
              <Link
                href={`/configurable-solutions?family=${family.id}`}
                className="group relative block aspect-[4/3] overflow-hidden bg-hull"
              >
                <Image
                  src={family.cover}
                  alt={`Weatherhaven ${family.name.toLowerCase()}`}
                  {...blurProps(family.cover)}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </Link>
              <h3 className="v2-h3 mt-6 text-snow">{family.name}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{family.summary}</p>
              <div className="mt-5">
                <SystemList systems={family.systems} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
