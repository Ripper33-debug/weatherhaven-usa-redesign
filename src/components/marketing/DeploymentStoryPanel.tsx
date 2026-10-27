"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { btnMarketingLink, btnMarketingOutline, btnMarketingPrimary } from "@/lib/cta-buttons";
import { buildDeploymentStory } from "@/lib/deployment-story";
import { DEPLOYMENT_PIN_LEGEND, deploymentPinKind } from "@/lib/deployment-pin-style";
import { contactUrl } from "@/lib/contact-url";
import type { DeploymentStoryCmsRow } from "@/lib/deployment-stories";
import type { GlobalDeployment } from "@/lib/global-deployments";

type Props = {
  deployment: GlobalDeployment;
  cmsOverride?: DeploymentStoryCmsRow | null;
  onClose: () => void;
};

export function DeploymentStoryPanel({ deployment, cmsOverride, onClose }: Props) {
  const story = buildDeploymentStory(deployment, cmsOverride);
  const pinKind = deploymentPinKind(deployment.category);
  const pinColor = DEPLOYMENT_PIN_LEGEND.find((item) => item.kind === pinKind)?.color ?? "#4d9fff";
  const [imageIndex, setImageIndex] = useState(0);
  const imageSrc = story.imageSources[imageIndex];
  const imageFailed = imageIndex >= story.imageSources.length;

  return (
    <aside
      className="wh-deployment-story pointer-events-auto absolute inset-x-2 top-2 z-[500] flex max-h-[min(58vh,480px)] flex-col overflow-hidden border border-white/[0.12] bg-[#080a0c]/97 shadow-[0_20px_64px_rgba(0,0,0,0.6)] backdrop-blur-md sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-5 sm:max-h-[min(72vh,560px)] sm:w-[min(100%,360px)]"
      aria-label={`Deployment story — ${story.headline}`}
    >
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-[#121820]">
        {!imageFailed && imageSrc ? (
          <Image
            key={imageSrc}
            src={imageSrc}
            alt={story.imageAlt}
            fill
            className="object-cover object-center"
            sizes="360px"
            onError={() => setImageIndex((i) => i + 1)}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(145deg, #121820 0%, #080a0c 50%, #0d0f12 100%)",
            }}
          />
        )}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(8,10,12,0.92) 0%, rgba(8,10,12,0.2) 55%, transparent 100%)",
          }}
        />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-[#080a0c]/80 text-lg text-[#8a9099] transition hover:border-white/40 hover:text-white"
          aria-label="Close deployment story"
        >
          ×
        </button>
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#4d9fff]">
            {story.systemCode}
            {story.curated ? " · Featured deployment" : null}
            {story.cmsEdited ? " · CMS" : null}
          </p>
          <h3 className="mt-1 text-lg font-medium leading-snug text-white">{story.headline}</h3>
          <p className="mt-0.5 text-xs text-[#8a9099]">{story.eyebrow}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 [scrollbar-width:thin]">
        <p className="text-sm leading-relaxed text-[#c8cdd4]">{story.narrative}</p>

        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div>
            <dt className="text-[#8a9099]">Mission type</dt>
            <dd className="mt-0.5 flex items-center gap-2 text-white">
              <span
                className="inline-block h-2 w-2 shrink-0 rotate-45 border border-[#080a0c]"
                style={{ backgroundColor: pinColor }}
                aria-hidden
              />
              {story.category}
            </dd>
          </div>
          <div>
            <dt className="text-[#8a9099]">Environment</dt>
            <dd className="mt-0.5 text-white">{story.environment}</dd>
          </div>
          <div>
            <dt className="text-[#8a9099]">Theater</dt>
            <dd className="mt-0.5 text-white">{story.theaterLabel}</dd>
          </div>
          <div>
            <dt className="text-[#8a9099]">Program scale</dt>
            <dd className="mt-0.5 text-white">
              {story.programCount > 1 ? `${story.programCount} documented sites` : "Single documented site"}
            </dd>
          </div>
        </dl>

        {story.theaterHeadline ? (
          <p className="mt-3 border-l-2 border-[#4d9fff]/35 pl-3 text-xs leading-relaxed text-[#8a9099]">
            {story.theaterHeadline}
          </p>
        ) : null}

        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={`/configurable-solutions/${story.systemSlug}`}
            className={`w-full justify-center text-sm no-underline ${btnMarketingPrimary}`}
          >
            View {story.systemCode} system
          </Link>
          <Link
            href={contactUrl({
              system: story.systemSlug,
              inquiry: "Program Requirement",
              deployment: `${story.headline} — ${story.eyebrow}`,
            })}
            className={`w-full justify-center text-sm no-underline ${btnMarketingOutline}`}
          >
            Discuss this deployment
          </Link>
          <button type="button" onClick={onClose} className={`w-full justify-center text-xs ${btnMarketingLink}`}>
            Explore map
          </button>
        </div>
      </div>
    </aside>
  );
}
