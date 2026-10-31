"use client";

import { useSitePathname } from "@/hooks/useSitePathname";
import { endSession, initClickTracking, startSession, trackEvent, trackPageView } from "@/lib/analytics";
import { isMarketingPage } from "@/lib/marketing-pages";
import { isSofSecurePath } from "@/lib/route-context";
import { trackLead } from "@/lib/track-lead";
import { useEffect, useRef } from "react";

const VIEWED_SECTIONS = new Set<string>();

function handleTrackedClick(event: MouseEvent) {
  if (isSofSecurePath(window.location.pathname)) return;

  const target = event.target as HTMLElement;
  const link = target.closest("a, button");
  if (!link) return;

  const href = link.getAttribute("href") ?? "";
  const text = (link.textContent ?? "").replace(/\s+/g, " ").trim();

  if (href.includes("/request-access") || text.toLowerCase().includes("request access")) {
    void trackEvent("click", "Request Access button");
    if (isMarketingPage(window.location.pathname)) {
      trackLead("cta_click", "Request Access");
    }
    return;
  }

  if (text.includes("Download Capabilities Brief")) {
    void trackEvent("click", "Download Capabilities Brief");
    return;
  }

  if (text.includes("Contact Defense Team")) {
    void trackEvent("click", "Contact Defense Team");
    return;
  }

  if (
    href.includes("/mission-solution-builder") ||
    text === "Mission Builder" ||
    text.includes("Mission Solution Builder")
  ) {
    void trackEvent("click", "Mission Builder");
    if (isMarketingPage(window.location.pathname)) {
      trackLead("cta_click", "Mission Builder");
    }
    return;
  }

  if (text.includes("View Capabilities")) {
    void trackEvent("click", "View Capabilities");
    return;
  }

  if (href === "/sof-solutions" || text === "Special Operations" || text === "SOF Portal") {
    void trackEvent("click", "SOF Solutions");
  }
}

function observeAnalyticsSections() {
  const configs: { key: string; selector: string; label: string }[] = [
    { key: "capabilities", selector: '[data-analytics-section="capabilities"]', label: "Capabilities section" },
    { key: "credibility", selector: '[data-analytics-section="credibility"]', label: "Credibility section" },
  ];

  const observers: IntersectionObserver[] = [];

  for (const { key, selector, label } of configs) {
    document.querySelectorAll(selector).forEach((el) => {
      const obs = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry?.isIntersecting || VIEWED_SECTIONS.has(key)) return;
          VIEWED_SECTIONS.add(key);
          void trackEvent("view", label);
        },
        { threshold: 0.3 },
      );
      obs.observe(el);
      observers.push(obs);
    });
  }

  return () => observers.forEach((o) => o.disconnect());
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = useSitePathname();
  const sessionStarted = useRef(false);
  const previousPath = useRef<string | null>(null);
  const trackActivity = !isSofSecurePath(pathname);

  useEffect(() => {
    if (!trackActivity) {
      sessionStarted.current = false;
      previousPath.current = null;
      void endSession();
      return;
    }

    if (sessionStarted.current) return;
    sessionStarted.current = true;

    // Fire and forget — never block rendering
    void startSession()
      .catch(console.error)
      .then(() => initClickTracking().catch(console.error));

    const onUnload = () => {
      void endSession();
    };
    window.addEventListener("beforeunload", onUnload);
    document.addEventListener("click", handleTrackedClick, true);

    return () => {
      window.removeEventListener("beforeunload", onUnload);
      document.removeEventListener("click", handleTrackedClick, true);
      void endSession();
    };
  }, [trackActivity]);

  useEffect(() => {
    if (!trackActivity) return;
    VIEWED_SECTIONS.clear();
    const cleanupSections = observeAnalyticsSections();
    void initClickTracking().catch(console.error);
    return cleanupSections;
  }, [pathname, trackActivity]);

  useEffect(() => {
    if (!trackActivity) return;
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    const title = typeof document !== "undefined" ? document.title : pathname;
    void trackPageView(pathname, title);
  }, [pathname, trackActivity]);

  return <>{children}</>;
}
