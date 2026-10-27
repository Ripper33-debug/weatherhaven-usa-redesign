"use client";

import { useEffect, useMemo } from "react";
import { Rectangle, Tooltip, useMap } from "react-leaflet";
import type { CampPlan } from "@/lib/campPlanner";
import { campGeoBounds, campZonesToGeo } from "@/lib/campGeoLayout";

type Props = {
  center: { lat: number; lng: number };
  plan: CampPlan;
  fitOnMount?: boolean;
};

function CampGeoFitBounds({ bounds }: { bounds: [[number, number], [number, number]] }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 16, animate: true, duration: 1.2 });
  }, [map, bounds]);

  return null;
}

export function CampGeoOverlay({ center, plan, fitOnMount = false }: Props) {
  const geoZones = useMemo(
    () => campZonesToGeo(center.lat, center.lng, plan.zones, plan.forceTier),
    [center.lat, center.lng, plan.zones, plan.forceTier],
  );

  const bounds = useMemo(
    () => campGeoBounds(center.lat, center.lng, plan.zones, plan.forceTier),
    [center.lat, center.lng, plan.zones, plan.forceTier],
  );

  if (geoZones.length === 0) return null;

  return (
    <>
      {fitOnMount && bounds ? <CampGeoFitBounds bounds={bounds} /> : null}
      {geoZones.map((zone) => (
        <Rectangle
          key={zone.id}
          bounds={zone.bounds}
          pathOptions={{
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: zone.fillOpacity,
            weight: 2,
            dashArray: zone.id === "entry" ? undefined : "6 4",
          }}
        >
          <Tooltip sticky direction="center" className="camp-geo-tooltip">
            {zone.label}
          </Tooltip>
        </Rectangle>
      ))}
    </>
  );
}
