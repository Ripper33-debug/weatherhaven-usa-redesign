import worldDots from "@/data/world-dots.json";
import { DEPLOYMENT_THEATERS, GLOBAL_DEPLOYMENTS } from "@/lib/global-deployments";
import { deploymentPinKind } from "@/lib/deployment-pin-style";
import { DeploymentMapClient, type MapPin } from "@/components/home/v2/DeploymentMapClient";

/** Coordinates-only labels from My Maps ("-84.41, -24.04") read better as a region. */
function cleanLabel(label: string, lat: number): string {
  if (/^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(label.trim())) {
    return lat < -60 ? "Antarctic interior" : "Remote site";
  }
  return label;
}

const COUNTRY_FIXES: Record<string, string> = { Gemany: "Germany" };
const PROGRAM_NAMES: Record<string, string> = {
  UN: "United Nations",
  NATO: "NATO",
  Coalition: "Coalition forces",
  "UN and Coalition": "United Nations and coalition forces",
};

/** My Maps titles read "Somalia (UN)": split into the country and the program it served. */
function splitTitle(title: string, label: string): { country: string; program?: string } {
  let country = title;
  if (/^(commercial|defence|medical)/i.test(title)) {
    const parts = label.split(",");
    country = parts[parts.length - 1].trim();
  }
  const m = country.match(/^(.*?)\s*\((.+)\)\s*$/);
  if (m && !/\b(UN|NATO|Coalition)\b/.test(m[2])) {
    // "Sudan (South)" is a place, not a program.
    const place = `${m[2]} ${m[1]}`.trim();
    return { country: place };
  }
  const base = (m ? m[1] : country).trim();
  const program = m?.[2]?.replace(/^including\s+/i, "").replace("&", "and").trim();
  return { country: COUNTRY_FIXES[base] ?? base, program: program ? (PROGRAM_NAMES[program] ?? program) : undefined };
}

export function HomeDeploymentMap() {
  const pins: MapPin[] = GLOBAL_DEPLOYMENTS.flatMap((d) => {
    const xy = (worldDots.pins as Record<string, number[]>)[d.id];
    if (!xy) return [];
    return [
      {
        id: d.id,
        x: xy[0],
        y: xy[1],
        lat: d.lat,
        kind: deploymentPinKind(d.category),
        label: cleanLabel(d.label, d.lat).replace(/\bGemany\b/g, "Germany"),
        ...splitTitle(d.title, d.label),
        theater: d.theaterId,
      },
    ];
  });

  const theaters = DEPLOYMENT_THEATERS.map((t) => ({ id: t.id, label: t.label, region: t.headline }));

  // Build the dot path once on the server: one path, round caps, zero-length segments.
  const dots = worldDots.dots as number[];
  let d = "";
  for (let i = 0; i < dots.length; i += 2) d += `M${dots[i]} ${dots[i + 1]}h0`;

  return (
    <section id="deployments" aria-labelledby="map-heading" className="scroll-mt-20 border-t border-line bg-ink py-20 sm:py-28">
      <div className="v2-wrap">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)] lg:items-end">
          <h2 id="map-heading" className="v2-h1 max-w-[16ch] text-snow">
            Deployed from the Arctic to the South Pole.
          </h2>
          <p className="v2-body lg:justify-self-end">
            {pins.length} documented Weatherhaven deployments for defense, humanitarian and research programs. Select
            a site to see who it served.
          </p>
        </div>
        <DeploymentMapClient
          pins={pins}
          theaters={theaters}
          dotPath={d}
          width={worldDots.width}
          height={worldDots.height}
        />
      </div>
    </section>
  );
}
