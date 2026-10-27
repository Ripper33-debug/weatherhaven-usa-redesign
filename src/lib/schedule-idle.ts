/** Defer non-critical client work until the browser is idle. */
export function scheduleIdleTask(task: () => void): void {
  if (typeof window === "undefined") return;
  const idle = window.requestIdleCallback;
  if (typeof idle === "function") {
    idle(() => task(), { timeout: 3000 });
    return;
  }
  setTimeout(task, 1);
}
