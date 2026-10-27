"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { validateCmsMediaFile, type CmsMediaContext } from "@/lib/cms-media";
import { fetchWithCsrf } from "@/lib/csrf-client";
import { adminBtnGhost, adminBtnPrimary } from "./admin-ui";

type UploadResponse = { ok?: boolean; url?: string; error?: string };

export function AdminPhotoUpload({
  label,
  hint,
  value,
  onChange,
  context,
  slug,
  disabled = false,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (url: string) => void;
  context: CmsMediaContext;
  slug: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(file: File | null) {
    if (!file) return;
    setError(null);

    const validationError = validateCmsMediaFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!slug.trim()) {
      setError("Enter a name or slug before uploading.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("context", context);
      formData.set("slug", slug);

      const res = await fetchWithCsrf("/api/admin/upload-media", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as UploadResponse;

      if (!res.ok || !data.url) {
        setError(data.error ?? "Upload failed.");
        return;
      }

      onChange(data.url);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const preview = value.trim();
  const isRemote = preview.startsWith("http");

  return (
    <div className="block lg:col-span-2">
      <span className="text-xs text-zinc-500">{label}</span>
      {hint ? <p className="mt-1 text-xs leading-relaxed text-zinc-600">{hint}</p> : null}

      {preview ? (
        <div className="mt-3 flex flex-wrap items-start gap-4">
          <div className="relative h-28 w-40 overflow-hidden rounded-lg border border-white/[0.08] bg-black/40">
            <Image
              src={preview}
              alt=""
              fill
              unoptimized={isRemote}
              className="object-cover"
              sizes="160px"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
              className={adminBtnGhost}
            >
              Replace photo
            </button>
            <button
              type="button"
              disabled={disabled || uploading}
              onClick={() => onChange("")}
              className={adminBtnGhost}
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className={`${adminBtnPrimary} mt-3`}
        >
          {uploading ? "Uploading…" : "Upload photo"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(e) => void handleFileChange(e.target.files?.[0] ?? null)}
      />

      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

export function AdminPhotoGallery({
  label,
  hint,
  coverUrl,
  galleryUrls,
  onCoverChange,
  onGalleryChange,
  slug,
  disabled = false,
  maxPhotos = 12,
}: {
  label: string;
  hint?: string;
  coverUrl: string;
  galleryUrls: string[];
  onCoverChange: (url: string) => void;
  onGalleryChange: (urls: string[]) => void;
  slug: string;
  disabled?: boolean;
  maxPhotos?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photos = galleryUrls.filter(Boolean);
  const totalCount = (coverUrl.trim() ? 1 : 0) + photos.length;

  async function handleFileChange(file: File | null) {
    if (!file) return;
    setError(null);

    const validationError = validateCmsMediaFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!slug.trim()) {
      setError("Enter a product name or slug before uploading.");
      return;
    }

    if (totalCount >= maxPhotos) {
      setError(`Maximum ${maxPhotos} photos per product.`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("context", "products");
      formData.set("slug", slug);

      const res = await fetchWithCsrf("/api/admin/upload-media", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as UploadResponse;

      if (!res.ok || !data.url) {
        setError(data.error ?? "Upload failed.");
        return;
      }

      if (!coverUrl.trim()) {
        onCoverChange(data.url);
      } else {
        onGalleryChange([...photos, data.url]);
      }
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removePhoto(url: string) {
    if (coverUrl === url) {
      const [next, ...rest] = photos;
      onCoverChange(next ?? "");
      onGalleryChange(rest);
      return;
    }
    onGalleryChange(photos.filter((item) => item !== url));
  }

  function setAsCover(url: string) {
    const others = [coverUrl, ...photos].filter((item) => item && item !== url);
    onCoverChange(url);
    onGalleryChange(others.filter(Boolean));
  }

  const allPhotos = [coverUrl, ...photos].filter(Boolean);

  return (
    <div className="block lg:col-span-2">
      <span className="text-xs text-zinc-500">{label}</span>
      {hint ? <p className="mt-1 text-xs leading-relaxed text-zinc-600">{hint}</p> : null}

      {allPhotos.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-3">
          {allPhotos.map((url) => {
            const isCover = url === coverUrl;
            const isRemote = url.startsWith("http");
            return (
              <li
                key={url}
                className="relative w-36 overflow-hidden rounded-lg border border-white/[0.08] bg-black/40"
              >
                <div className="relative h-24 w-full">
                  <Image src={url} alt="" fill unoptimized={isRemote} className="object-cover" sizes="144px" />
                </div>
                <div className="flex flex-wrap gap-1 border-t border-white/[0.06] p-2">
                  {isCover ? (
                    <span className="text-[10px] uppercase tracking-wide text-emerald-400">Cover</span>
                  ) : (
                    <button
                      type="button"
                      disabled={disabled || uploading}
                      onClick={() => setAsCover(url)}
                      className="cursor-pointer border-0 bg-transparent p-0 text-[10px] text-[#4d9fff] hover:underline"
                    >
                      Set cover
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={disabled || uploading}
                    onClick={() => removePhoto(url)}
                    className="cursor-pointer border-0 bg-transparent p-0 text-[10px] text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <button
        type="button"
        disabled={disabled || uploading || totalCount >= maxPhotos}
        onClick={() => inputRef.current?.click()}
        className={`${adminBtnPrimary} mt-3`}
      >
        {uploading ? "Uploading…" : allPhotos.length === 0 ? "Upload photo" : "Add another photo"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(e) => void handleFileChange(e.target.files?.[0] ?? null)}
      />

      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
