"use client";

import { useEffect, useState } from "react";
import { MapContainer, Rectangle, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function TacticalCoordGrid({ zoom }: { zoom: number }) {
  const step = zoom >= 6 ? 2 : zoom >= 4 ? 5 : 10;
  const lines: React.ReactNode[] = [];
  for (let lat = -80; lat <= 80; lat += step) {
    lines.push(
      <div
        key={`lat-${lat}`}
        className="pointer-events-none absolute left-0 right-0 border-t border-[rgba(200,169,110,0.06)]"
        style={{ top: `${((90 - lat) / 180) * 100}%` }}
        aria-hidden
      />,
    );
  }
  for (let lng = -180; lng < 180; lng += step * 2) {
    lines.push(
      <div
        key={`lng-${lng}`}
        className="pointer-events-none absolute top-0 bottom-0 border-l border-[rgba(200,169,110,0.06)]"
        style={{ left: `${((lng + 180) / 360) * 100}%` }}
        aria-hidden
      />,
    );
  }
  return <div className="pointer-events-none absolute inset-0 z-[250]">{lines}</div>;
}

export function TacticalMinimap({ bounds }: { bounds: L.LatLngBounds | null }) {
  if (!bounds) return null;
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  return (
    <div className="pointer-events-none absolute bottom-4 right-4 z-[350] h-[120px] w-[160px] overflow-hidden border border-[rgba(200,169,110,0.25)] bg-[#0d0f12]/95">
      <MapContainer center={[20, 0]} zoom={1} className="h-full w-full" zoomControl={false} attributionControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <Rectangle
          bounds={[
            [sw.lat, sw.lng],
            [ne.lat, ne.lng],
          ]}
          pathOptions={{ color: "#4d9fff", weight: 1, fillOpacity: 0.1 }}
        />
      </MapContainer>
      <p className="absolute bottom-1 left-2 font-mono text-[8px] text-[#8a9099]">VIEWPORT</p>
    </div>
  );
}

export function TacticalBoundsSync({ onBounds }: { onBounds: (b: L.LatLngBounds) => void }) {
  const map = useMap();
  useEffect(() => {
    const update = () => onBounds(map.getBounds());
    update();
    map.on("moveend", update);
    map.on("zoomend", update);
    return () => {
      map.off("moveend", update);
      map.off("zoomend", update);
    };
  }, [map, onBounds]);
  return null;
}

function TacticalMeasureToolInner({
  onPoints,
}: {
  onPoints: (a: { lat: number; lng: number } | null, b: { lat: number; lng: number } | null) => void;
}) {
  const [, setPoints] = useState<{ lat: number; lng: number }[]>([]);

  useMapEvents({
    click(e) {
      setPoints((prev) => {
        const next = [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }].slice(-2);
        onPoints(next[0] ?? null, next[1] ?? null);
        return next;
      });
    },
  });

  return null;
}

export function TacticalMeasureTool({
  enabled,
  onPoints,
}: {
  enabled: boolean;
  onPoints: (a: { lat: number; lng: number } | null, b: { lat: number; lng: number } | null) => void;
}) {
  useEffect(() => {
    if (enabled) return;
    onPoints(null, null);
  }, [enabled, onPoints]);

  if (!enabled) return null;

  return <TacticalMeasureToolInner key="measure-on" onPoints={onPoints} />;
}

export { pulsingMarkerIcon } from "@/lib/leaflet-marker-icon";
