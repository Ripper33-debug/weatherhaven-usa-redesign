import Link from "next/link";
import { DeploymentGlobe } from "@/components/deployments/DeploymentGlobe";
import { CONFIRMED_DEPLOYMENTS } from "@/lib/confirmed-deployments";

/**
 * The homepage's deployment map: Weatherhaven's deployment globe, opening on its flat map, as a
 * full-width band. The globe carries its own title, figures, tour and cards; the line under it
 * points to the sourced stories and the full-screen map.
 */
export function HomeDeploymentGlobe() {
  return (
    <section id="deployments" aria-label="Where Weatherhaven has deployed" className="scroll-mt-16 border-t border-line bg-[#03080F]">
      <DeploymentGlobe view="map" title="Map of Weatherhaven deployments" />
      <div className="v2-wrap flex flex-col gap-3 border-t border-line py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.95rem] text-muted">
          {CONFIRMED_DEPLOYMENTS.length} confirmed deployments. The stories behind eight of them, with their sources, are on the
          deployments page.
        </p>
        <div className="flex shrink-0 flex-wrap gap-x-6 gap-y-2 text-[0.95rem]">
          <Link href="/deployments" className="v2-link">
            Read the deployment stories
          </Link>
          <Link href="/deployments/map" className="v2-link">
            Open the full map
          </Link>
        </div>
      </div>
    </section>
  );
}
