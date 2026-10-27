import {
  getTheaterById,
  GLOBAL_DEPLOYMENTS,
  type GlobalDeployment,
} from "@/lib/global-deployments";
import type { DeploymentStoryCmsRow } from "@/lib/deployment-stories";
import { getProductImage, resolveProductImageSrc } from "@/lib/product-images";

export type DeploymentStory = {
  headline: string;
  eyebrow: string;
  systemCode: string;
  systemSlug: string;
  narrative: string;
  imageSources: string[];
  imageAlt: string;
  programCount: number;
  theaterLabel: string;
  theaterHeadline: string;
  category: string;
  environment: string;
  curated: boolean;
  cmsEdited: boolean;
};

function programDeploymentCount(title: string): number {
  return GLOBAL_DEPLOYMENTS.filter((d) => d.title === title).length;
}

function defaultNarrative(deployment: GlobalDeployment, programCount: number): string {
  const theater = getTheaterById(deployment.theaterId);
  const theaterLine = theater ? ` within the ${theater.label} theater` : "";
  const scale =
    programCount > 1
      ? ` One of ${programCount} documented Weatherhaven sites supporting ${deployment.title}.`
      : "";

  return (
    `Weatherhaven ${deployment.systemCode} systems have supported ${deployment.title} at ${deployment.label}` +
    ` — a ${deployment.category.toLowerCase()} mission in ${deployment.environment.toLowerCase()} conditions${theaterLine}.` +
    `${scale} Rapidly deployable shelters engineered for redeployment when the mission moves.`
  );
}

function imageSourcesFor(slug: string, coverUrl?: string | null): string[] {
  const sources: string[] = [];
  if (coverUrl?.trim()) sources.push(coverUrl.trim());
  const local = resolveProductImageSrc(slug, true);
  if (local) sources.push(local);
  const cdn = getProductImage(slug)?.src;
  if (cdn) sources.push(cdn);
  return sources;
}

export function buildDeploymentStory(
  deployment: GlobalDeployment,
  cms?: DeploymentStoryCmsRow | null,
): DeploymentStory {
  const theater = getTheaterById(deployment.theaterId);
  const programCount = programDeploymentCount(deployment.title);
  const imageSlug = cms?.image_slug?.trim() || deployment.systemSlug;
  const meta = getProductImage(imageSlug);

  const bundleHeadline = deployment.storyHeadline?.trim() || deployment.label;
  const bundleNarrative =
    deployment.storyNarrative?.trim() || defaultNarrative(deployment, programCount);

  const headline = cms?.headline?.trim() || bundleHeadline;
  const narrative = cms?.narrative?.trim() || bundleNarrative;
  const cmsEdited = Boolean(
    cms &&
      (cms.headline?.trim() ||
        cms.narrative?.trim() ||
        cms.image_slug?.trim() ||
        cms.cover_image_url?.trim() ||
        cms.featured),
  );

  return {
    headline,
    eyebrow: deployment.title,
    systemCode: deployment.systemCode,
    systemSlug: deployment.systemSlug,
    narrative,
    imageSources: imageSourcesFor(imageSlug, cms?.cover_image_url),
    imageAlt: meta?.alt ?? `Weatherhaven ${deployment.systemCode} deployment`,
    programCount,
    theaterLabel: theater?.label ?? deployment.theaterId,
    theaterHeadline: theater?.headline ?? "",
    category: deployment.category,
    environment: deployment.environment,
    curated: Boolean(deployment.storyNarrative?.trim() || cms?.featured),
    cmsEdited,
  };
}
