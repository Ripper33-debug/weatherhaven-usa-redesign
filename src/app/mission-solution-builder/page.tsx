import type { Metadata } from "next";
import { Suspense } from "react";
import { V2PageHeader } from "@/components/site/V2PageHeader";
import { MissionBuilderIntro, MissionGuide, MissionGuideFallback, type GuideProduct } from "@/components/mission/MissionGuide";
import { PRODUCT_CONTENT } from "@/lib/product-content";
import { PRODUCT_COVERS, productCover } from "@/lib/product-covers";
import { blurProps } from "@/lib/image-blur";
import { pageMeta } from "@/lib/page-meta";

export const metadata: Metadata = pageMeta({
  title: "Mission builder",
  description:
    "Answer five questions about the mission, climate, headcount, transport and timeline to see which Weatherhaven systems fit, with the published specs behind each match.",
  path: "/mission-solution-builder",
});

/** Rendered per request, so a shared plan link (or ?form=full from the SOF planner) arrives
 * already showing its result instead of flashing the first question. */
export const dynamic = "force-dynamic";

/** Names, photos and lead facts for every system the builder can recommend. */
function guideProducts(): Record<string, GuideProduct> {
  return Object.fromEntries(
    Object.entries(PRODUCT_CONTENT).map(([slug, c]) => {
      const cover = productCover(slug);
      return [
        slug,
        {
          slug,
          name: c.name,
          subtitle: c.fullName,
          cover,
          blur: blurProps(cover).blurDataURL,
          representative: PRODUCT_COVERS[slug]?.representative,
          specs: c.specs.slice(0, 3),
        },
      ];
    }),
  );
}

const GUIDE_TITLE = "Plan a deployment in five questions.";
const GUIDE_LEAD =
  "Tell us the mission, climate, headcount, transport and timeline. You'll see the Weatherhaven systems that fit, with the published specs behind each match, and you can send the plan to an expert.";

export default function MissionSolutionBuilderPage() {
  const products = guideProducts();
  return (
    <>
      <V2PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "Mission builder" }]}
        title={
          <Suspense fallback={GUIDE_TITLE}>
            <MissionBuilderIntro guideTitle={GUIDE_TITLE} detailedTitle="Describe the full mission requirement." />
          </Suspense>
        }
        lead={
          <Suspense fallback={GUIDE_LEAD}>
            <MissionBuilderIntro
              guideTitle={GUIDE_LEAD}
              detailedTitle="Environment, function, mobility, timeline and power in one form. It builds an indicative camp layout and parts list you can send to a Weatherhaven expert. A planning tool, not a quote."
            />
          </Suspense>
        }
      />
      <div className="bg-ink pb-24 text-snow">
        <Suspense fallback={<MissionGuideFallback products={products} />}>
          <MissionGuide products={products} />
        </Suspense>
      </div>
    </>
  );
}
