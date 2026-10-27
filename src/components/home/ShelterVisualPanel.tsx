"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { ShelterViewMode } from "@/lib/shelter-view-mode";
import { useInView } from "@/hooks/useInView";
import { InteractiveShelterVisual } from "@/components/home/InteractiveShelterVisual";

const Shelter3DVisual = dynamic(
  () => import("@/components/home/Shelter3DVisual").then((m) => m.Shelter3DVisual),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#121820] to-[#080a0c]" aria-hidden />
    ),
  },
);

type Props = {
  activeView: ShelterViewMode;
  className?: string;
};

function VisualSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`${className ?? ""} animate-pulse bg-gradient-to-br from-[#121820] via-[#0d0f12] to-[#080a0c]`}
      aria-hidden
    />
  );
}

export function ShelterVisualPanel({ activeView, className }: Props) {
  const { ref, inView } = useInView<HTMLDivElement>("240px");
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <div ref={ref} className={className ?? "absolute inset-0"}>
      {!inView ? (
        <VisualSkeleton className="absolute inset-0" />
      ) : mobile ? (
        <InteractiveShelterVisual className="absolute inset-0" />
      ) : (
        <Shelter3DVisual activeView={activeView} className="absolute inset-0" />
      )}
    </div>
  );
}

export type { ShelterViewMode };
