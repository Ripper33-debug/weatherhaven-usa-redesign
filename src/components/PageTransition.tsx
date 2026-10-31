"use client";

import { useSitePathname } from "@/hooks/useSitePathname";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/effects/media";

type Phase = "idle" | "out" | "in";

export function PageTransition({
  children,
  marketing = false,
}: {
  children: React.ReactNode;
  marketing?: boolean;
}) {
  const pathname = useSitePathname();
  const [phase, setPhase] = useState<Phase>("in");
  const [displayChildren, setDisplayChildren] = useState(children);
  const [sweep, setSweep] = useState(false);
  const prevPath = useRef(pathname);
  const reduceMotion = useRef(false);
  const isFirst = useRef(true);

  useEffect(() => {
    reduceMotion.current = prefersReducedMotion();
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => setDisplayChildren(children));
    return () => cancelAnimationFrame(id);
  }, [children]);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      prevPath.current = pathname;
      return;
    }
    if (prevPath.current === pathname) return;
    prevPath.current = pathname;

    if (marketing || reduceMotion.current) {
      const id = requestAnimationFrame(() => {
        setPhase("in");
        setSweep(false);
      });
      return () => cancelAnimationFrame(id);
    }

    const startId = requestAnimationFrame(() => {
      setPhase("out");
      setSweep(true);
    });

    const outTimer = window.setTimeout(() => {
      setDisplayChildren(children);
      setPhase("in");
    }, 250);

    const sweepTimer = window.setTimeout(() => setSweep(false), 320);
    const hardIn = window.setTimeout(() => setPhase("in"), 600);

    return () => {
      cancelAnimationFrame(startId);
      window.clearTimeout(outTimer);
      window.clearTimeout(sweepTimer);
      window.clearTimeout(hardIn);
    };
  }, [pathname, children, marketing]);

  if (marketing) {
    return <div className="flex min-h-0 flex-1 flex-col">{children}</div>;
  }

  const className =
    phase === "out"
      ? "wh-page-slide-out pointer-events-none"
      : phase === "in"
        ? "wh-page-slide-in"
        : "wh-page-slide-in";

  return (
    <>
      {sweep && <div className="wh-page-sweep" aria-hidden />}
      <div className={`wh-page-transition flex min-h-0 flex-1 flex-col ${className}`}>{displayChildren}</div>
    </>
  );
}
