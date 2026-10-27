import Link from "next/link";
import type { ReactNode } from "react";
import { WeatherhavenLogo } from "@/components/brand/WeatherhavenLogo";

type Props = {
  href?: string;
  height?: number;
  className?: string;
  linkClassName?: string;
  suffix?: ReactNode;
  priority?: boolean;
  centered?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
};

export function WeatherhavenLogoLink({
  href = "/",
  height = 32,
  className = "",
  linkClassName = "",
  suffix,
  priority = false,
  centered = false,
  onClick,
  ariaLabel = "Weatherhaven home",
}: Props) {
  const mark = (
    <span className={`inline-flex items-center gap-2 ${centered ? "w-full justify-center" : ""} ${className}`}>
      <WeatherhavenLogo height={height} priority={priority} />
      {suffix ? <span className="text-sm font-medium tracking-tight text-white">{suffix}</span> : null}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`inline-flex shrink-0 no-underline transition hover:opacity-90 ${linkClassName}`}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {mark}
      </Link>
    );
  }

  return mark;
}
