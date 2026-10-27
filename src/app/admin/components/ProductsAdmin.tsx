"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminDeleteCatalogProduct, adminSaveCatalogProduct } from "../actions";
import type { CatalogProductRow } from "@/lib/catalog-products";
import {
  catalogProductHref,
  createDefaultCatalogProduct,
  productSummary,
  slugifyProductName,
} from "@/lib/catalog-products";
import type { Product } from "@/lib/products";
import { PRODUCTS } from "@/lib/products";
import {
  AdminBanner,
  AdminEmpty,
  AdminSection,
  AdminTableShell,
  adminBtnDanger,
  adminBtnGhost,
  adminBtnPrimary,
  adminInputClass,
} from "./admin-ui";
import { AdminPhotoGallery } from "./AdminPhotoUpload";

type FormState = {
  id?: string;
  slug: string;
  status: "draft" | "published";
  sort_order: number;
  name: string;
  code: string;
  subtitle: string;
  tag: string;
  description: string;
  overviewText: string;
  data: Product;
};

function emptyForm(): FormState {
  const data = createDefaultCatalogProduct("new-system");
  return {
    slug: "",
    status: "draft",
    sort_order: 0,
    name: data.name,
    code: data.code,
    subtitle: data.subtitle,
    tag: data.tag,
    description: data.description,
    overviewText: data.overview.join("\n"),
    data,
  };
}

function formFromRow(row: CatalogProductRow): FormState {
  const p = row.data;
  return {
    id: row.id,
    slug: row.slug,
    status: row.status === "published" ? "published" : "draft",
    sort_order: row.sort_order,
    name: p.name,
    code: p.code,
    subtitle: p.subtitle,
    tag: p.tag,
    description: p.description,
    overviewText: p.overview.join("\n"),
    data: p,
  };
}

function buildProductFromForm(form: FormState, slug: string): Product {
  const overview = form.overviewText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    ...form.data,
    slug,
    name: form.name.trim() || form.data.name,
    code: form.code.trim() || form.data.code,
    subtitle: form.subtitle.trim(),
    tag: form.tag.trim(),
    description: form.description.trim(),
    overview: overview.length > 0 ? overview : form.data.overview,
    coverImageUrl: form.data.coverImageUrl?.trim() || undefined,
    galleryImageUrls: (form.data.galleryImageUrls ?? []).filter(Boolean),
  };
}

export function ProductsAdmin({
  products,
  setup,
}: {
  products: CatalogProductRow[];
  setup: { ready: boolean; message?: string };
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const [banner, setBanner] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [templateSlug, setTemplateSlug] = useState("");

  const sorted = useMemo(
    () => [...products].sort((a, b) => a.sort_order - b.sort_order || a.slug.localeCompare(b.slug)),
    [products],
  );

  function startCreate() {
    setForm(emptyForm());
    setTemplateSlug("");
    setEditing(true);
    setBanner(null);
  }

  function startEdit(row: CatalogProductRow) {
    setForm(formFromRow(row));
    setTemplateSlug("");
    setEditing(true);
    setBanner(null);
  }

  function cancelEdit() {
    setForm(emptyForm());
    setEditing(false);
    setTemplateSlug("");
  }

  function applyTemplate(slug: string) {
    const template = PRODUCTS.find((p) => p.slug === slug);
    if (!template) return;
    const next = { ...template, slug: `${template.slug}-copy` };
    setForm({
      slug: next.slug,
      status: "draft",
      sort_order: products.length,
      name: next.name,
      code: next.code,
      subtitle: next.subtitle,
      tag: next.tag,
      description: next.description,
      overviewText: next.overview.join("\n"),
      data: next,
    });
  }

  async function handleSave() {
    setPending(true);
    setBanner(null);
    const slugRaw = form.slug.trim() || slugifyProductName(form.name);
    const slug = slugRaw.length >= 2 ? slugRaw : slugifyProductName(form.name);
    const data = buildProductFromForm(form, slug);

    const res = await adminSaveCatalogProduct({
      id: form.id,
      slug,
      status: form.status,
      sort_order: form.sort_order,
      data,
    });
    setPending(false);
    if (res.ok) {
      setBanner({ type: "success", text: form.id ? "Product updated." : "Product created." });
      setEditing(false);
      setForm(emptyForm());
      router.refresh();
    } else {
      setBanner({ type: "error", text: res.error });
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this catalog product?")) return;
    setPending(true);
    const res = await adminDeleteCatalogProduct(id);
    setPending(false);
    if (res.ok) {
      setBanner({ type: "success", text: "Product deleted." });
      if (form.id === id) cancelEdit();
      router.refresh();
    } else {
      setBanner({ type: "error", text: res.error });
    }
  }

  const isStaticRow = (id: string) => id.startsWith("static-");

  return (
    <div>
      {!setup.ready && setup.message ? (
        <AdminBanner type="error" message={setup.message} />
      ) : null}
      {banner ? <AdminBanner type={banner.type} message={banner.text} /> : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          The CMS controls the public catalog — name, copy, photos, sort order, and publish status. Set{" "}
          <strong className="text-white">Published</strong> to go live on{" "}
          <strong className="text-white">/configurable-solutions</strong>, the homepage portfolio, mission builder, and
          sitemap. Use <strong className="text-white">Draft</strong> to hide a system without deleting it.
        </p>
        {!editing ? (
          <button type="button" onClick={startCreate} className={adminBtnPrimary}>
            New system
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="mb-8 rounded-xl border border-white/[0.06] bg-[#111113] p-6">
          <h3 className="text-sm font-medium text-white">{form.id ? "Edit system" : "New system"}</h3>
          {!form.id ? (
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <label className="block min-w-[200px] flex-1">
                <span className="text-xs text-zinc-500">Start from built-in template (optional)</span>
                <select
                  value={templateSlug}
                  onChange={(e) => {
                    const v = e.target.value;
                    setTemplateSlug(v);
                    if (v) applyTemplate(v);
                  }}
                  className={`${adminInputClass} mt-1.5`}
                >
                  <option value="">Blank defaults</option>
                  {PRODUCTS.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.code} — {p.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="block lg:col-span-2">
              <span className="text-xs text-zinc-500">Name</span>
              <input
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: f.slug || slugifyProductName(e.target.value),
                  }))
                }
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <label className="block">
              <span className="text-xs text-zinc-500">Slug (URL)</span>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className={`${adminInputClass} mt-1.5`}
                placeholder="auto-from-name"
              />
            </label>
            <label className="block">
              <span className="text-xs text-zinc-500">Product code</span>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <label className="block">
              <span className="text-xs text-zinc-500">Subtitle</span>
              <input
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <label className="block">
              <span className="text-xs text-zinc-500">Tag</span>
              <input
                value={form.tag}
                onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <label className="block">
              <span className="text-xs text-zinc-500">Sort order</span>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: Number.parseInt(e.target.value, 10) || 0 }))
                }
                className={`${adminInputClass} mt-1.5`}
              />
            </label>
            <label className="block">
              <span className="text-xs text-zinc-500">Status</span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as "draft" | "published" }))
                }
                className={`${adminInputClass} mt-1.5`}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label className="block lg:col-span-2">
              <span className="text-xs text-zinc-500">Short description (cards & SEO)</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className={`${adminInputClass} mt-1.5 resize-y`}
              />
            </label>
            <label className="block lg:col-span-2">
              <span className="text-xs text-zinc-500">Overview bullets (one per line)</span>
              <textarea
                value={form.overviewText}
                onChange={(e) => setForm((f) => ({ ...f, overviewText: e.target.value }))}
                rows={4}
                className={`${adminInputClass} mt-1.5 resize-y`}
              />
            </label>
            <AdminPhotoGallery
              label="Photos"
              hint="First photo is the cover on catalog cards and detail pages. JPEG, PNG, WebP, or GIF up to 8 MB. Save the product after uploading."
              coverUrl={form.data.coverImageUrl ?? ""}
              galleryUrls={form.data.galleryImageUrls ?? []}
              slug={form.slug.trim() || slugifyProductName(form.name)}
              disabled={pending}
              onCoverChange={(url) =>
                setForm((f) => ({
                  ...f,
                  data: { ...f.data, coverImageUrl: url || undefined },
                }))
              }
              onGalleryChange={(urls) =>
                setForm((f) => ({
                  ...f,
                  data: { ...f.data, galleryImageUrls: urls.length > 0 ? urls : undefined },
                }))
              }
            />
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" disabled={pending} onClick={() => void handleSave()} className={adminBtnPrimary}>
              Save product
            </button>
            <button type="button" onClick={cancelEdit} className={adminBtnGhost}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <AdminSection title="All systems" description="Sort order controls catalog and homepage order (lower first). Built-in templates are optional starting points for new systems.">
        {sorted.length === 0 ? (
          <AdminEmpty message="No catalog rows yet. Create a system above or run npm run sync:catalog to import the built-in product line." />
        ) : (
          <AdminTableShell>
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] tracking-wide text-zinc-500 uppercase">
                  <th className="px-5 py-3.5 font-medium">System</th>
                  <th className="px-5 py-3.5 font-medium">Order</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{row.data.name}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{productSummary(row.data)}</p>
                      <p className="mt-0.5 text-xs text-zinc-600">{catalogProductHref(row.slug)}</p>
                    </td>
                    <td className="px-5 py-4 tabular-nums text-zinc-500">{row.sort_order}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] ${
                          row.status === "published"
                            ? "border-emerald-500/40 text-emerald-400"
                            : "border-zinc-600 text-zinc-500"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {row.status === "published" ? (
                          <a
                            href={catalogProductHref(row.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={adminBtnGhost}
                          >
                            View
                          </a>
                        ) : null}
                        {!isStaticRow(row.id) ? (
                          <>
                            <button type="button" onClick={() => startEdit(row)} className={adminBtnGhost}>
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => void handleDelete(row.id)}
                              className={adminBtnDanger}
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-zinc-600">Built-in fallback</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableShell>
        )}
      </AdminSection>
    </div>
  );
}
