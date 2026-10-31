import "server-only";
import { withCmsProducts } from "@/sanity/content";

import { PRODUCTS } from "@/lib/products";
import type { Product } from "@/lib/products";
import {
  type CatalogProductInsert,
  type CatalogProductRow,
} from "@/lib/catalog-products";
import {
  applyStaticCatalogFallback,
  hasRealCatalogRows,
  publishedProductsFromRows,
  resolveCanonicalProductSlug,
  resolvePublishedProductBySlug,
} from "@/lib/catalog-published";
import { createAdminClient } from "@/app/api/_lib/get-admin";

function hasSupabaseAdminEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

function isMissingTableError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("catalog_products") &&
    (lower.includes("does not exist") ||
      lower.includes("schema cache") ||
      lower.includes("could not find the table"))
  );
}

function formatCatalogDbError(message: string): string {
  if (isMissingTableError(message)) {
    return "Product catalog table not set up yet. In Supabase SQL editor, run supabase/catalog_products.sql (see docs/PRODUCTION.md).";
  }
  if (message.toLowerCase().includes("duplicate")) {
    return "A product with this slug already exists. Choose a different slug.";
  }
  return "Something went wrong saving the product. Check Supabase logs or try again.";
}

function mapRow(raw: {
  id: string;
  slug: string;
  status: string;
  sort_order: number;
  data: Product;
  created_at: string | null;
  updated_at: string | null;
}): CatalogProductRow {
  return {
    id: raw.id,
    slug: raw.slug,
    status: raw.status,
    sort_order: raw.sort_order,
    data: raw.data,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
  };
}

export async function probeCatalogProductsTable(): Promise<{ ready: boolean; message?: string }> {
  if (!hasSupabaseAdminEnv()) {
    return {
      ready: false,
      message: "Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).",
    };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("catalog_products").select("id").limit(1);

  if (error) {
    return { ready: false, message: formatCatalogDbError(error.message) };
  }

  return { ready: true };
}

export async function listCatalogProducts(options?: {
  publishedOnly?: boolean;
}): Promise<CatalogProductRow[]> {
  if (!hasSupabaseAdminEnv()) {
    if (options?.publishedOnly) {
      return PRODUCTS.map((p, i) => ({
        id: `static-${p.slug}`,
        slug: p.slug,
        status: "published",
        sort_order: i,
        data: p,
        created_at: null,
        updated_at: null,
      }));
    }
    return [];
  }

  const supabase = createAdminClient();
  let query = supabase.from("catalog_products").select("*").order("sort_order", { ascending: true });

  if (options?.publishedOnly) {
    query = query.eq("status", "published");
  }

  const { data, error } = await query;

  if (error) {
    if (isMissingTableError(error.message)) {
      return options?.publishedOnly
        ? PRODUCTS.map((p, i) => ({
            id: `static-${p.slug}`,
            slug: p.slug,
            status: "published",
            sort_order: i,
            data: p,
            created_at: null,
            updated_at: null,
          }))
        : [];
    }
    return [];
  }

  return (data ?? []).map((row) => mapRow(row as CatalogProductRow));
}

export async function getCatalogProductBySlug(slug: string): Promise<CatalogProductRow | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  if (!hasSupabaseAdminEnv()) {
    const product = PRODUCTS.find((p) => p.slug === normalized);
    if (!product) return null;
    return {
      id: `static-${product.slug}`,
      slug: product.slug,
      status: "published",
      sort_order: 0,
      data: product,
      created_at: null,
      updated_at: null,
    };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("catalog_products")
    .select("*")
    .eq("slug", normalized)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error.message)) {
      const product = PRODUCTS.find((p) => p.slug === normalized);
      if (!product) return null;
      return {
        id: `static-${product.slug}`,
        slug: product.slug,
        status: "published",
        sort_order: 0,
        data: product,
        created_at: null,
        updated_at: null,
      };
    }
    return null;
  }

  return data ? mapRow(data as CatalogProductRow) : null;
}

/** Public catalog — CMS is source of truth when Supabase is seeded; static code is dev/fallback only. */
async function listPublishedProductsBase(): Promise<Product[]> {
  if (!hasSupabaseAdminEnv()) {
    return applyStaticCatalogFallback(PRODUCTS);
  }

  const rows = await listCatalogProducts();
  if (!hasRealCatalogRows(rows)) {
    return applyStaticCatalogFallback(PRODUCTS);
  }

  return publishedProductsFromRows(rows);
}

async function getPublishedProductBySlugBase(slug: string): Promise<Product | undefined> {
  const canonical = resolveCanonicalProductSlug(slug);

  if (!hasSupabaseAdminEnv()) {
    const base = PRODUCTS.find((p) => p.slug === canonical);
    return base ? applyStaticCatalogFallback([base])[0] : undefined;
  }

  const rows = await listCatalogProducts();
  if (!hasRealCatalogRows(rows)) {
    const base = PRODUCTS.find((p) => p.slug === canonical);
    return base ? applyStaticCatalogFallback([base])[0] : undefined;
  }

  const row = rows.find((entry) => entry.slug === canonical) ?? null;
  return resolvePublishedProductBySlug(slug, row, PRODUCTS);
}

/** Public catalog, with edits from the content studio (Sanity) layered on top when it's connected. */
export async function listPublishedProducts(): Promise<Product[]> {
  return withCmsProducts(await listPublishedProductsBase());
}

export async function getPublishedProductBySlug(slug: string): Promise<Product | undefined> {
  const base = await getPublishedProductBySlugBase(slug);
  return base ? (await withCmsProducts([base]))[0] : undefined;
}

export async function insertCatalogProduct(
  input: CatalogProductInsert,
): Promise<{ ok: true; row: CatalogProductRow } | { ok: false; error: string }> {
  if (!hasSupabaseAdminEnv()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = createAdminClient();
  const slug = input.slug.trim().toLowerCase();
  const payload = {
    slug,
    status: input.status ?? "draft",
    sort_order: input.sort_order ?? 0,
    data: { ...input.data, slug },
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("catalog_products").insert(payload).select("*").single();

  if (error) {
    return { ok: false, error: formatCatalogDbError(error.message) };
  }

  return { ok: true, row: mapRow(data as CatalogProductRow) };
}

export async function updateCatalogProduct(
  id: string,
  patch: Partial<CatalogProductInsert>,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasSupabaseAdminEnv()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = createAdminClient();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (patch.slug !== undefined) update.slug = patch.slug.trim().toLowerCase();
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.sort_order !== undefined) update.sort_order = patch.sort_order;
  if (patch.data !== undefined) {
    const slugForData = (patch.slug ?? patch.data.slug).trim().toLowerCase();
    update.data = { ...patch.data, slug: slugForData };
  }

  const { error } = await supabase.from("catalog_products").update(update).eq("id", id);

  if (error) {
    return { ok: false, error: formatCatalogDbError(error.message) };
  }

  return { ok: true };
}

export async function deleteCatalogProduct(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!hasSupabaseAdminEnv()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("catalog_products").delete().eq("id", id);

  if (error) {
    return { ok: false, error: formatCatalogDbError(error.message) };
  }

  return { ok: true };
}
