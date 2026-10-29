import type { Metadata } from "next";
import { pageMeta } from "@/lib/page-meta";
import { HomeHero } from "@/components/home/v2/HomeHero";
import { HomeDataPlate } from "@/components/home/v2/HomeDataPlate";
import { HomeTreccScene } from "@/components/home/v2/HomeTreccScene";
import { HomeSystems } from "@/components/home/v2/HomeSystems";
import { HomeDeploymentGlobe } from "@/components/home/v2/HomeDeploymentGlobe";
import { HomeFactory } from "@/components/home/v2/HomeFactory";
import { HomeNews } from "@/components/home/v2/HomeNews";
import { HomeCta } from "@/components/home/v2/HomeCta";
import { getFieldExtremes } from "@/lib/field-weather";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Rapidly deployable shelters, camps and field hospitals",
    description:
      "Expandable containers, soft-wall, inflatable and polar shelters that ship as cargo and stand up in minutes. Fielded in 95+ countries since 1981.",
    path: "/",
    imageAlt: "Weatherhaven expandable shelter at dawn",
  }),
  title: { absolute: "Weatherhaven USA | Rapidly deployable shelters, camps and field hospitals" },
};

/** Cache homepage CMS sections; admin publish calls revalidatePath("/"). */
export const revalidate = 300;

export default async function HomePage() {
  // Live weather for the hero readout (cached for 30 minutes; null hides the readout).
  const field = await getFieldExtremes();
  return (
    <>
      <HomeHero field={field} />
      <HomeDataPlate />
      <HomeTreccScene />
      <HomeSystems />
      <HomeDeploymentGlobe />
      <HomeFactory />
      <HomeNews />
      <HomeCta />
    </>
  );
}
