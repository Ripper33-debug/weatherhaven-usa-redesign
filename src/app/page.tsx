import type { Metadata } from "next";
import { HomeHero } from "@/components/home/v2/HomeHero";
import { HomeDataPlate } from "@/components/home/v2/HomeDataPlate";
import { HomeDeploySequence } from "@/components/home/v2/HomeDeploySequence";
import { HomeSystems } from "@/components/home/v2/HomeSystems";
import { HomeDeploymentMap } from "@/components/home/v2/HomeDeploymentMap";
import { HomeFactory } from "@/components/home/v2/HomeFactory";
import { HomeTimeline } from "@/components/home/v2/HomeTimeline";
import { HomeNews } from "@/components/home/v2/HomeNews";
import { HomeCta } from "@/components/home/v2/HomeCta";

export const metadata: Metadata = {
  title: { absolute: "Weatherhaven USA | Rapidly deployable shelters, camps and field hospitals" },
  description:
    "Expandable containers, soft-wall, inflatable and polar shelters that ship as cargo and stand up in minutes. Fielded in 95+ countries since 1981.",
  alternates: { canonical: "/" },
};

/** Cache homepage CMS sections; admin publish calls revalidatePath("/"). */
export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeDataPlate />
      <HomeDeploySequence />
      <HomeSystems />
      <HomeDeploymentMap />
      <HomeFactory />
      <HomeTimeline />
      <HomeNews />
      <HomeCta />
    </>
  );
}
