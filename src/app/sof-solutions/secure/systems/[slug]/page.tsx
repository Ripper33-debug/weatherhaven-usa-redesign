import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SofProductDetailView } from "../../_components/SofProductDetailView";
import { getSofProductBySlug, SOF_PRODUCTS, SOF_CATALOG_PATH } from "@/lib/sof-products";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SOF_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getSofProductBySlug(slug);
  if (!product) return { title: "System not found", robots: { index: false, follow: false } };
  return {
    title: `${product.name} — SOF Restricted`,
    description: product.description,
    robots: { index: false, follow: false },
  };
}

export default async function SofProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getSofProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="bg-[#080a0c] text-white">
      <div className="mx-auto max-w-[1280px] px-4 pb-4 pt-6 sm:px-6 lg:px-10">
        <Link href={SOF_CATALOG_PATH} className="text-sm text-[#8a9099] transition hover:text-white">
          ← SOF systems catalog
        </Link>
      </div>
      <SofProductDetailView product={product} />
    </div>
  );
}
