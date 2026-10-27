export type ProductIconKey =
  | "shelter"
  | "camp"
  | "ai"
  | "ecu"
  | "power"
  | "floor"
  | "layout"
  | "c2"
  | "aviation"
  | "secure"
  | "default";

export function ProductCardIcon({ name, className }: { name: ProductIconKey; className?: string }) {
  const cn = className ?? "h-10 w-10 text-amber-600/85";
  switch (name) {
    case "shelter":
      return (
        <svg className={cn} viewBox="0 0 40 40" fill="none" aria-hidden>
          <path d="M6 32 L20 10 L34 32 Z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M12 32 V22 L20 14 L28 22 V32" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        </svg>
      );
    case "camp":
      return (
        <svg className={cn} viewBox="0 0 40 40" fill="none" aria-hidden>
          <rect x="8" y="18" width="10" height="14" stroke="currentColor" strokeWidth="1.1" rx="1" />
          <rect x="22" y="14" width="10" height="18" stroke="currentColor" strokeWidth="1.1" rx="1" />
          <path d="M6 32 H34" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
        </svg>
      );
    case "ai":
      return (
        <svg className={cn} viewBox="0 0 40 40" fill="none" aria-hidden>
          <rect x="10" y="12" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.1" />
          <path d="M14 20 H26 M20 16 V24" stroke="currentColor" strokeWidth="1" />
          <circle cx="20" cy="28" r="2" fill="currentColor" opacity="0.5" />
        </svg>
      );
    case "ecu":
      return (
        <svg className={cn} viewBox="0 0 40 40" fill="none" aria-hidden>
          <rect x="9" y="11" width="22" height="18" rx="2" stroke="currentColor" strokeWidth="1.1" />
          <path d="M13 18 H27 M13 23 H22" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        </svg>
      );
    case "power":
      return (
        <svg className={cn} viewBox="0 0 40 40" fill="none" aria-hidden>
          <path d="M22 8 L14 22 H19 L17 32 L26 17 H20 L22 8Z" fill="currentColor" opacity="0.85" />
        </svg>
      );
    case "floor":
      return (
        <svg className={cn} viewBox="0 0 40 40" fill="none" aria-hidden>
          <path d="M8 26 L20 18 L32 26" stroke="currentColor" strokeWidth="1.1" />
          <path d="M8 30 L20 22 L32 30" stroke="currentColor" strokeWidth="1.1" opacity="0.6" />
          <path d="M12 22 L20 16 L28 22" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        </svg>
      );
    case "layout":
      return (
        <svg className={cn} viewBox="0 0 40 40" fill="none" aria-hidden>
          <rect x="8" y="10" width="9" height="9" stroke="currentColor" strokeWidth="1" />
          <rect x="23" y="10" width="9" height="9" stroke="currentColor" strokeWidth="1" />
          <rect x="8" y="23" width="24" height="8" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case "c2":
      return (
        <svg className={cn} viewBox="0 0 40 40" fill="none" aria-hidden>
          <circle cx="20" cy="14" r="4" stroke="currentColor" strokeWidth="1.1" />
          <path d="M10 30 C10 24 30 24 30 30" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "aviation":
      return (
        <svg className={cn} viewBox="0 0 40 40" fill="none" aria-hidden>
          <path d="M8 22 L18 18 L32 20 L18 24 L8 22Z" stroke="currentColor" strokeWidth="1.1" />
          <path d="M18 18 V12 L22 10" stroke="currentColor" strokeWidth="1" opacity="0.7" />
        </svg>
      );
    case "secure":
      return (
        <svg className={cn} viewBox="0 0 40 40" fill="none" aria-hidden>
          <rect x="12" y="17" width="16" height="15" rx="1" stroke="currentColor" strokeWidth="1.1" />
          <path d="M14 17 V14 C14 10 26 10 26 14 V17" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    default:
      return (
        <svg className={cn} viewBox="0 0 40 40" fill="none" aria-hidden>
          <rect x="10" y="10" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
  }
}
