import { describe, expect, it } from "vitest";
import { isAuthGatePage, pathRequiresAuth, pathRequiresSofAuth } from "./auth-routes";

describe("auth-routes", () => {
  it("requires auth for admin routes only", () => {
    expect(pathRequiresAuth("/admin")).toBe(true);
    expect(pathRequiresAuth("/internal/program-intelligence")).toBe(true);
    expect(pathRequiresAuth("/programs/sof-lead-register")).toBe(true);
    expect(pathRequiresAuth("/dashboard")).toBe(false);
    expect(pathRequiresAuth("/contact")).toBe(false);
  });

  it("requires SOF auth for secure section", () => {
    expect(pathRequiresSofAuth("/sof-solutions/secure/deployment-planner")).toBe(true);
    expect(pathRequiresSofAuth("/sof-solutions")).toBe(false);
  });

  it("identifies auth gate pages", () => {
    expect(isAuthGatePage("/login")).toBe(true);
    expect(isAuthGatePage("/request-access")).toBe(false);
  });
});
