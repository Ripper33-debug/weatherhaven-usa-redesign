import Image from "next/image";
import { WEATHERHAVEN_BRAND } from "@/lib/brand";

type Props = {
  className?: string;
  priority?: boolean;
  /** Rendered logo height in CSS pixels. Width scales from official aspect ratio. */
  height?: number;
};

export function WeatherhavenLogo({ className = "", priority = false, height = 32 }: Props) {
  const width = Math.round((height * WEATHERHAVEN_BRAND.logoWidth) / WEATHERHAVEN_BRAND.logoHeight);

  return (
    <Image
      src={WEATHERHAVEN_BRAND.logoSrc}
      alt="Weatherhaven"
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={{ width, height: "auto", maxWidth: "100%" }}
    />
  );
}
