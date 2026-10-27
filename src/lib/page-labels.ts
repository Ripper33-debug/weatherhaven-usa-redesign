const PAGE_LABELS: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/sof-solutions": "SOF Solutions",
  "/capabilities": "Capabilities",
  "/configurable-solutions": "Shelter Systems",
  "/mission-solution-builder": "Mission Builder",
  "/mission-solution-builder/results": "Camp Package",
  "/resources": "Resources Library",
  "/events": "Events & Briefings",
  "/news": "News & Releases",
  "/contact": "Contact",
  "/sof-solutions/secure": "SOF systems",
  "/sof-solutions/secure/deployment-planner": "Deployment planner",
  "/sof-solutions/login": "SOF sign-in",
  "/sof-solutions/request-access": "SOF access request",
  "/account": "Account Settings",
  "/admin": "Admin Dashboard",
  "/request-access": "Request Access",
  "/login": "Login",
};

export function getPageLabel(path: string): string {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  if (path.startsWith("/configurable-solutions/")) {
    const slug = path.split("/").pop()?.replace(/-/g, " ") ?? "Product";
    return slug.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return path.replace(/^\//, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Page";
}

