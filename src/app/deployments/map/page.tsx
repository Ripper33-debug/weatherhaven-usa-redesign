import type { Metadata } from "next";
import { DeploymentGlobe } from "@/components/deployments/DeploymentGlobe";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Deployment map",
  description:
    "Interactive globe and map of confirmed Weatherhaven deployments on every continent: defense and peacekeeping, research and commercial camps, medical and disaster relief.",
  path: "/deployments/map",
  image: "/deployment-globe/assets/og.jpg",
});

/** The deployment globe full screen, under the site header, with its list, filters and timeline. */
export default function DeploymentMapPage() {
  return (
    <div className="bg-[#03080F] pt-16 lg:pt-[72px]">
      <h1 className="sr-only">Where Weatherhaven has deployed</h1>
      <div className="h-[calc(100svh-64px)] min-h-[520px] lg:h-[calc(100svh-72px)]">
        <DeploymentGlobe embed={false} ambient={false} height="100%" title="Weatherhaven deployment globe" />
      </div>
    </div>
  );
}
