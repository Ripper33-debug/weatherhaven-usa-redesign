import { beforeEach, describe, expect, it, vi } from "vitest";

const ilikeMock = vi.fn();

vi.mock("@/app/api/_lib/get-admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          ilike: ilikeMock,
        })),
      })),
    })),
  })),
}));

describe("hasApprovedSofAccess", () => {
  beforeEach(() => {
    ilikeMock.mockReset();
  });

  it("returns false for empty email without querying", async () => {
    const { hasApprovedSofAccess } = await import("./accessRequests");
    expect(await hasApprovedSofAccess("   ")).toBe(false);
    expect(ilikeMock).not.toHaveBeenCalled();
  });

  it("queries by approved status and normalized email", async () => {
    ilikeMock.mockResolvedValue({ data: [{ program: "special-forces" }], error: null });
    const { hasApprovedSofAccess } = await import("./accessRequests");
    expect(await hasApprovedSofAccess("Operator@Example.mil")).toBe(true);
    expect(ilikeMock).toHaveBeenCalledWith("email", "operator@example.mil");
  });

  it("returns false when approved row is not SOF program", async () => {
    ilikeMock.mockResolvedValue({ data: [{ program: "general platform" }], error: null });
    const { hasApprovedSofAccess } = await import("./accessRequests");
    expect(await hasApprovedSofAccess("user@example.com")).toBe(false);
  });

  it("returns false on query error", async () => {
    ilikeMock.mockResolvedValue({ data: null, error: { message: "db down" } });
    const { hasApprovedSofAccess } = await import("./accessRequests");
    expect(await hasApprovedSofAccess("user@example.com")).toBe(false);
  });
});
