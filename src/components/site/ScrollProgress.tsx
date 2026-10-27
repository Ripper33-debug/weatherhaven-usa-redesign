"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function ScrollProgressInner() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? scrollTop / max : 0);
    };
    const id = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[100] h-[2px] bg-[#4d9fff] transition-[width] duration-150 ease-out"
      style={{ width: `${progress * 100}%` }}
      aria-hidden
    />
  );
}

export function ScrollProgress() {
  const pathname = usePathname();
  return <ScrollProgressInner key={pathname} />;
}
