/** Weatherhaven global deployments — Google My Maps (https://www.google.com/maps/d/) */
export const GOOGLE_MY_MAPS_MID =
  process.env.NEXT_PUBLIC_GOOGLE_MY_MAPS_MID?.trim() || "1WjBWwEmcEb7M-4sl1pXu_b3MwyBTUm96";

export const GOOGLE_MY_MAPS_DEFAULT_VIEW = {
  lat: -35.508440707878655,
  lng: 34.93633625680411,
  zoom: 2,
} as const;

export function googleMyMapsEmbedUrl(
  mid = GOOGLE_MY_MAPS_MID,
  view = GOOGLE_MY_MAPS_DEFAULT_VIEW,
): string {
  const params = new URLSearchParams({
    mid,
    ehbc: "2D",
    ll: `${view.lat},${view.lng}`,
    z: String(view.zoom),
  });
  return `https://www.google.com/maps/d/embed?${params.toString()}`;
}

export function googleMyMapsViewerUrl(
  mid = GOOGLE_MY_MAPS_MID,
  view = GOOGLE_MY_MAPS_DEFAULT_VIEW,
): string {
  const params = new URLSearchParams({
    mid,
    ll: `${view.lat},${view.lng}`,
    z: String(view.zoom),
  });
  return `https://www.google.com/maps/d/viewer?${params.toString()}`;
}
