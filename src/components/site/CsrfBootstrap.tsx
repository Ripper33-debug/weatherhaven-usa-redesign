"use client";

import { useEffect } from "react";
import { ensureCsrfToken } from "@/lib/csrf-client";
import { scheduleIdleTask } from "@/lib/schedule-idle";

/** Fetch CSRF token after initial paint so POST requests can include the header. */
export function CsrfBootstrap() {
  useEffect(() => {
    scheduleIdleTask(() => {
      void ensureCsrfToken();
    });
  }, []);
  return null;
}
