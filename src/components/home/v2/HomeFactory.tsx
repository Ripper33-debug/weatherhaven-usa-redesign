import Image from "next/image";
import Link from "next/link";
import { blurProps } from "@/lib/image-blur";

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

/** Factory photograph band, then who builds and supports the systems. */
export function HomeFactory() {
  return (
    <section aria-labelledby="factory-heading" className="v2-defer border-t border-line bg-hull">
      <div className="relative h-[46svh] min-h-[320px] overflow-hidden">
        <Image
          src={PHOTO}
          alt="Deployed EHMECC expandable containers joined by connecting corridors inside a hall"
          fill
          sizes="100vw"
          className="object-cover object-[50%_55%]"
          {...blurProps(PHOTO)}
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-hull via-hull/20 to-transparent" />
      </div>
      <div className="v2-wrap relative -mt-20 pb-20 sm:pb-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2 id="factory-heading" className="v2-h1 max-w-[16ch] text-snow">
              Built in Weatherhaven&rsquo;s own plants
            </h2>
            <p className="v2-lead mt-6 max-w-[48ch]">
              The same company designs each system, manufactures it, delivers and installs it, takes it down when
              the mission ends, then refurbishes and stores it for the next one.
            </p>
          </div>
          <ul className="self-end border-t border-line">
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
        <p className="mt-10 text-right text-[0.8125rem] text-muted">EHMECCs set up indoors and joined into one complex. Weatherhaven photo.</p>
      </div>
    </section>
  );
}
