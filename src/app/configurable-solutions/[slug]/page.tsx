import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SystemDetail } from "@/components/systems/SystemDetail";
import { getProductDetailImages } from "@/lib/product-gallery";
import { orderProductGallery } from "@/lib/product-gallery-order";
import { getPublishedProductBySlug, listPublishedProducts } from "@/app/api/_lib/catalog-products";
import { pageMeta } from "@/lib/page-meta";
import { productCover } from "@/lib/product-covers";
import { pickProductsFromCatalog } from "@/lib/published-catalog";
import { EXCLUDED_PRODUCT_IMAGES, showsFullName } from "@/lib/product-content";

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
  // "TRECC: Tactical Redeployable…"; for names that aren't acronyms the subtitle already reads as a title.
  const subtitleNamesIt = product.subtitle?.toLowerCase().includes(product.name.toLowerCase());
  const title = showsFullName(product.name, product.subtitle)
    ? `${product.name}: ${product.subtitle}`
    : subtitleNamesIt
      ? product.subtitle
      : product.name;
  return pageMeta({
    title,
    description: product.description,
    path: `/configurable-solutions/${product.slug}`,
    image: productCover(product.slug, EXCLUDED_PRODUCT_IMAGES.has(product.coverImageUrl?.trim() ?? "") ? undefined : product.coverImageUrl),
    imageAlt: `Weatherhaven ${product.name}`,
  });
}

export default async function SystemPage({ params }: Props) {
  const { slug } = await params;
  const [product, catalog] = await Promise.all([getPublishedProductBySlug(slug), listPublishedProducts()]);
  if (!product) notFound();

  const gallery = getProductDetailImages(product.slug, {
    coverImageUrl: product.coverImageUrl,
    galleryImageUrls: product.galleryImageUrls,
  });
  const cover = productCover(product.slug, EXCLUDED_PRODUCT_IMAGES.has(product.coverImageUrl?.trim() ?? "") ? undefined : product.coverImageUrl);
  const images = orderProductGallery(product.slug, [cover, ...gallery.filter((src) => src !== cover)]);
  const related = pickProductsFromCatalog(catalog, product.relatedSlugs).slice(0, 3);

  return <SystemDetail product={product} images={images} related={related} />;
}
