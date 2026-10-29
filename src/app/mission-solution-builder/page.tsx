import type { Metadata } from "next";
import { Suspense } from "react";
import { MissionGuide, MissionGuideFallback, type GuideProduct } from "@/components/mission/MissionGuide";
import { PRODUCT_CONTENT } from "@/lib/product-content";
import { PRODUCT_COVERS, productCover } from "@/lib/product-covers";
import { blurProps } from "@/lib/image-blur";
import { pageMeta } from "@/lib/page-meta";
import { CONFIRMED_DEPLOYMENTS } from "@/lib/confirmed-deployments";
import { isPrecisePin, placeName } from "@/lib/deployment-pins";
import type { GuidePlace } from "@/lib/live-site";

export const metadata: Metadata = pageMeta({
  title: "Mission builder",
  description:
    "Answer five questions about the mission, climate, headcount, transport and timeline and watch a 3D camp take shape, with the Weatherhaven systems that fit and the published specs behind each match.",
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

/** Named places on the deployment map, for "build it where you're going". */
function guidePlaces(): GuidePlace[] {
  return CONFIRMED_DEPLOYMENTS.filter(isPrecisePin)
    .map((d) => ({ id: d.id, name: placeName(d), lat: d.lat, lng: d.lng }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function MissionSolutionBuilderPage() {
  const products = guideProducts();
  const places = guidePlaces();
  return (
    <div className="bg-ink pb-24 text-snow">
      <Suspense fallback={<MissionGuideFallback products={products} places={places} />}>
        <MissionGuide products={products} places={places} />
      </Suspense>
    </div>
  );
}
