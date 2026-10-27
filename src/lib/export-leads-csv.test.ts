import { describe, expect, it } from "vitest";
import { unifiedLeadsToCsv } from "./export-leads-csv";

describe("export-leads-csv", () => {
  it("builds csv with header and escaped cells", () => {
    const csv = unifiedLeadsToCsv([
      {
        email: "test@example.com",
        fullName: 'Acme, Inc.',
        organization: "Org",
        pipelineStatus: "qualified",
        nextFollowUpAt: null,
        profileId: null,
        inquiryCount: 1,
        accessCount: 0,
        lastActivityAt: "2026-06-01T12:00:00Z",
        hasPendingAccess: false,
        hasOpenInquiry: true,
      },
    ]);
    expect(csv.split("\n")[0]).toContain("email");
    expect(csv).toContain('"Acme, Inc."');
    expect(csv).toContain("test@example.com");
  });
});
