import Link from "next/link";
import tzlookup from "@photostructure/tz-lookup";
import worldDots from "@/data/world-dots.json";
import { GLOBAL_DEPLOYMENTS } from "@/lib/global-deployments";
import { deploymentPinKind } from "@/lib/deployment-pin-style";
import { DeploymentMapClient, type MapPin } from "@/components/home/v2/DeploymentMapClient";
import { cleanLabel, isPrecisePin, splitTitle } from "@/lib/deployment-pins";

/**
 * Plain geographic regions, derived from each pin's country. (The theater tags in the imported
 * My Maps data are unreliable, e.g. Tokyo filed under CENTCOM, so the homepage doesn't use them.)
 */
const REGIONS = [
  { id: "north-america", label: "North America" },
  { id: "latin-america", label: "Latin America and the Caribbean" },
  { id: "europe", label: "Europe" },
  { id: "africa", label: "Africa" },
  { id: "middle-east", label: "Middle East and Central Asia" },
  { id: "asia-pacific", label: "Asia-Pacific" },
  { id: "polar", label: "Arctic and Antarctic" },
] as const;

const REGION_COUNTRIES: Record<string, string[]> = {
  "north-america": ["Canada", "United States"],
  "latin-america": ["Argentina", "Belize", "Bolivia", "Brazil", "Chile", "Colombia", "Cuba", "Ecuador", "French Guiana", "Guatemala", "Guyana", "Haiti", "Mexico", "Panama", "Peru", "Suriname", "Trinidad & Tobago", "Venezuela"],
  europe: ["Belgium", "Bosnia & Herzegovina", "Croatia", "France", "Germany", "Greece", "Iceland", "Ireland", "Italy", "Kosovo", "Latvia", "Lithuania", "Macedonia", "Netherlands", "Norway", "Poland", "Romania", "Sweden", "Switzerland", "Turkey", "United Kingdom"],
  africa: ["Algeria", "Angola", "Burkina Faso", "Burundi", "Congo", "Cote d’Ivoire", "Democratic Republic of the Congo", "Eritrea", "Ethiopia", "Ghana", "Guinea", "Lesotho", "Mali", "Mauritania", "Morocco", "Mozambique", "Namibia", "Niger", "Rwanda", "Seychelles", "Sierra Leone", "Somalia", "South Africa", "South Sudan", "Sudan", "Tanzania", "Western Sahara"],
  "middle-east": ["Afghanistan", "Iraq", "Jordan", "Kazakhstan", "Kuwait", "Kyrgyzstan", "Lebanon", "Qatar", "Saudi Arabia", "UAE"],
  "asia-pacific": ["Australia", "Cambodia", "East Timor", "India", "Indonesia", "Japan", "South Korea", "Marshall Islands", "Mongolia", "Nepal", "New Zealand", "Papua New Guinea", "Singapore"],
  polar: ["Antarctica", "Greenland"],
};

function regionFor(country: string, lat: number, lng: number): string {
  if (Math.abs(lat) >= 66) return "polar";
  for (const [id, countries] of Object.entries(REGION_COUNTRIES)) if (countries.includes(country)) return id;
  // Fallback by coordinates for anything the list doesn't name.
  if (lng < -30) return lat > 15 ? "north-america" : "latin-america";
  if (lng < 40) return lat > 35 ? "europe" : "africa";
  if (lng < 75 && lat > 12) return "middle-east";
  return "asia-pacific";
}

/** `storiesLink`: link to the deployment stories page (off on that page itself). */
export function HomeDeploymentMap({ storiesLink = true }: { storiesLink?: boolean } = {}) {
  const pins: MapPin[] = GLOBAL_DEPLOYMENTS.flatMap((d) => {
    const xy = (worldDots.pins as Record<string, number[]>)[d.id];
    if (!xy) return [];
    const { country, program } = splitTitle(d.title, d.label);
    return [
      {
        id: d.id,
        x: xy[0],
        y: xy[1],
        lat: d.lat,
        lng: d.lng,
        tz: tzlookup(d.lat, d.lng),
        precise: isPrecisePin(d),
        kind: deploymentPinKind(d.category),
        label: cleanLabel(d.label, d.lat).replace(/\bGemany\b/g, "Germany"),
        country,
        program,
        theater: regionFor(country, d.lat, d.lng),
      },
    ];
  });

  const theaters = REGIONS.filter((r) => pins.some((p) => p.theater === r.id)).map((r) => ({ id: r.id, label: r.label }));

  return (
    <section id="deployments" aria-labelledby="map-heading" className="scroll-mt-20 border-t border-line bg-ink py-20 sm:py-28">
      <div className="v2-wrap">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)] lg:items-end">
          <h2 id="map-heading" className="v2-h1 max-w-[16ch] text-snow">
            Deployed from the Arctic to the South Pole.
          </h2>
          <div className="lg:justify-self-end">
            <p className="v2-body">
              {pins.length} documented Weatherhaven deployments for defense, humanitarian and research programs. Select
              a site to see who it served; named places also show their weather right now.
            </p>
            {storiesLink ? (
              <Link href="/deployments" className="v2-link mt-4 inline-block text-[0.95rem]">
                Read the deployment stories
              </Link>
            ) : null}
          </div>
        </div>
        <DeploymentMapClient
          pins={pins}
          theaters={theaters}
          width={worldDots.width}
          height={worldDots.height}
        />
      </div>
    </section>
  );
}
