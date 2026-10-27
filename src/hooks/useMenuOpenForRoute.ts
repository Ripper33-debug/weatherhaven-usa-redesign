"use client";

import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";

/** Mobile nav open state that auto-closes when the route changes (no pathname effect). */
export function useMenuOpenForRoute() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = useCallback(
    (next: boolean) => {
      setOpenPath(next ? pathname : null);
    },
    [pathname],
  );
  return [open, setOpen] as const;
}
