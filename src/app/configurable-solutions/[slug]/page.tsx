import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { StickyContactBar } from "@/components/marketing/StickyContactBar";
import { ProductDetailView } from "@/components/products/ProductDetailView";
import { contactUrl } from "@/lib/contact-url";
import { getProductDetailImages } from "@/lib/product-gallery";
import { getPublishedProductBySlug, listPublishedProducts } from "@/app/api/_lib/catalog-products";
import { resolveProductShareImageUrl, shareMetadataFromImage } from "@/lib/share-metadata";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await listPublishedProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) return { title: "System not found" };
  const shareImage = resolveProductShareImageUrl(product);
  return {
    title: `${product.name} — Weatherhaven USA`,
    description: product.description,
    ...shareMetadataFromImage(shareImage, product.name),
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const [product, catalog] = await Promise.all([getPublishedProductBySlug(slug), listPublishedProducts()]);
  if (!product) notFound();

  const galleryImages = getProductDetailImages(product.slug, {
    coverImageUrl: product.coverImageUrl,
    galleryImageUrls: product.galleryImageUrls,
  });

  return (
    <div className="bg-[#080a0c] text-white">
      <div className="mx-auto max-w-[1400px] px-6 pb-4 pt-24 sm:px-6 sm:pt-28 lg:px-12">
        <Link
          href="/configurable-solutions"
          className="text-sm font-medium text-[#8a9099] transition-colors duration-300 hover:text-white"
        >
          ← All shelter systems
        </Link>
      </div>
      <ProductDetailView product={product} galleryImages={galleryImages} showCompare catalog={catalog} />
      <StickyContactBar contactHref={contactUrl({ system: product.slug, inquiry: "Program Requirement" })} />
    </div>
  );
}
