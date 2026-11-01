import type { Metadata } from "next";
import { getHomepageCopy } from "@/sanity/content";
import { pageMeta } from "@/lib/page-meta";
import { HomeHero } from "@/components/home/v2/HomeHero";
import { HomeNumbers } from "@/components/home/v2/HomeNumbers";
import { HomeTreccScene } from "@/components/home/v2/HomeTreccScene";
import { HomeSystems } from "@/components/home/v2/HomeSystems";
import { HomeLineup } from "@/components/home/v2/HomeLineup";
import { HomeDeploymentGlobe } from "@/components/home/v2/HomeDeploymentGlobe";
import { HomeFactory } from "@/components/home/v2/HomeFactory";
import { HomeNews } from "@/components/home/v2/HomeNews";
import { HomeCta } from "@/components/home/v2/HomeCta";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Rapidly deployable shelters, camps and field hospitals",
    description:
      "Expandable containers, soft-wall, inflatable and polar shelters that ship as cargo and stand up in minutes. Fielded in 95+ countries since 1981.",
    path: "/",
    imageAlt: "A Weatherhaven TRECC on its trailer behind a JLTV",
  }),
  title: { absolute: "Weatherhaven USA | Rapidly deployable shelters, camps and field hospitals" },
};

/** Cache homepage CMS sections; admin publish calls revalidatePath("/"). */
export const revalidate = 300;

export default async function HomePage() {
  const copy = await getHomepageCopy();
  // Rhythm: the film; the company's figures (light); the TRECC in 3D (dark); the systems as a photo
  // mosaic (dark); the true-scale lineup (light); the map (dark); the plant photograph and
  // credentials; news (light); then the closing photograph.
  return (
    <>
      <HomeHero copy={copy} />
      <HomeNumbers />
      <HomeTreccScene />
      <HomeSystems />
      <HomeLineup />
      <HomeDeploymentGlobe />
      <HomeFactory />
      <HomeNews />
      <HomeCta copy={copy} />
    </>
  );
}
