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

function cleanProgram(title: string, label: string): string {
  if (/^(commercial|defence|medical)/i.test(title)) {
    const parts = label.split(",");
    return parts[parts.length - 1].trim();
  }
  return title;
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
        label: cleanLabel(d.label, d.lat),
        program: cleanProgram(d.title, d.label),
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
