import Link from "next/link";
import { PhotoBand } from "@/components/site/PhotoBand";

const PHOTO = "/products/ehmecc/gallery/01-EH-EXTERIOR.jpg";

const CREDENTIALS = [
  { title: "ISO 9001:2015", body: "Certified quality management at the Burnaby and Brockville plants." },
  { title: "Developed with the US Army", body: "TRECC was co-developed with US Army DEVCOM and tested to MIL-STD-810G." },
  {
    title: "A US company for US contracts",
    body: "Weatherhaven Resources, Inc. in North Tonawanda, New York, holds the US registrations and contract vehicles.",
    link: { href: "/government", label: "Contracting details" },
  },
] as const;

/** A full-bleed photograph of shelters set up indoors, then who builds and supports the systems. */
export function HomeFactory() {
  return (
    <section aria-labelledby="factory-heading" className="v2-defer border-t border-line bg-hull">
      <PhotoBand
        src={PHOTO}
        alt="Deployed EHMECC expandable containers joined by connecting corridors inside a hall"
        position="50% 34%"
        fadeTo="hull"
        caption="EHMECCs set up indoors and joined into one complex. Weatherhaven photo."
      >
        <div className="v2-wrap pb-12 sm:pb-14">
          <h2 id="factory-heading" className="v2-h1 v2-reveal max-w-[15ch] text-snow">
            Built in Weatherhaven&rsquo;s own plants
          </h2>
        </div>
      </PhotoBand>
      <div className="v2-wrap pb-20 pt-10 sm:pb-28 sm:pt-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
          <p className="v2-lead v2-reveal max-w-[44ch]">
            The same company designs each system, manufactures it, delivers and installs it, takes it down when the
            mission ends, then refurbishes and stores it for the next one.
          </p>
          <ul className="v2-reveal-stagger border-t border-line">
            {CREDENTIALS.map((c) => (
              <li key={c.title} className="border-b border-line py-6">
                <p className="v2-h3 text-snow">{c.title}</p>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
                  {c.body}
                  {"link" in c ? (
                    <>
                      {" "}
                      <Link href={c.link.href} className="v2-link">
                        {c.link.label}
                      </Link>
                    </>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
