"use client";

import { Marker, Popup } from "react-leaflet";
import {
  tacticalDeploymentTypeColor,
  tacticalDeploymentTypeLabel,
  type TacticalDeploymentLocation,
} from "@/lib/tactical-deployment-locations";
import { tacticalDeploymentMarkerIcon } from "@/lib/leaflet-marker-icon";

type Props = {
  deployments: TacticalDeploymentLocation[];
};

export function TacticalDeploymentMarkers({ deployments }: Props) {
  return (
    <>
      {deployments.map((site) => {
        const color = tacticalDeploymentTypeColor(site.type);
        const typeLabel = tacticalDeploymentTypeLabel(site.type);
        return (
          <Marker
            key={`${site.name}-${site.lat}-${site.lng}`}
            position={[site.lat, site.lng]}
            icon={tacticalDeploymentMarkerIcon(site.type)}
          >
            <Popup className="wh-tactical-deploy-popup" closeButton={false}>
              <div className="wh-tactical-deploy-popup__inner">
                <p className="wh-tactical-deploy-popup__title">{site.name}</p>
                <p className="wh-tactical-deploy-popup__badge" style={{ color, borderColor: `${color}66` }}>
                  {typeLabel}
                </p>
                <p className="wh-tactical-deploy-popup__meta">{site.command}</p>
                <p className="wh-tactical-deploy-popup__note">Weatherhaven deployed</p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
