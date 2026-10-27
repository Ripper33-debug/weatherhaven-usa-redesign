import { describe, expect, it } from "vitest";
import { buildUnifiedLeads, filterUnifiedLeads } from "./lead-management";
import { inferPipelineStatus } from "./lead-pipeline-status";

describe("lead-pipeline-status", () => {
  it("infers approved when access approved", () => {
    expect(inferPipelineStatus({ accessStatuses: ["approved"], inquiryStatuses: [] })).toBe("approved");
  });

  it("infers qualified when access pending", () => {
    expect(inferPipelineStatus({ accessStatuses: ["pending"], inquiryStatuses: [] })).toBe("qualified");
  });
});

describe("lead-management", () => {
  it("merges contact and access rows by email", () => {
    const unified = buildUnifiedLeads({
      contactLeads: [
        {
          id: "1",
          email: "a@example.com",
          full_name: "Alex",
          organization: "Org A",
          submitted_at: "2026-06-01T10:00:00Z",
          status: "new",
          user_id: null,
          role: null,
          inquiry_type: null,
          program: null,
          subject: null,
          message: null,
          contact_method: null,
          phone: null,
        },
      ],
      accessRequests: [
        {
          id: "2",
          email: "a@example.com",
          full_name: "Alex",
          organization: "Org A",
          submitted_at: "2026-06-02T10:00:00Z",
          status: "pending",
          role: null,
          program: null,
          requirements: null,
          reference: null,
        },
      ],
      profiles: [],
    });

    expect(unified).toHaveLength(1);
    expect(unified[0]?.inquiryCount).toBe(1);
    expect(unified[0]?.accessCount).toBe(1);
    expect(unified[0]?.hasPendingAccess).toBe(true);
  });

  it("filters unified leads by query", () => {
    const unified = buildUnifiedLeads({
      contactLeads: [],
      accessRequests: [
        {
          id: "1",
          email: "ops@unit.com",
          full_name: "Jordan",
          organization: "Unit 7",
          submitted_at: null,
          status: "pending",
          role: null,
          program: null,
          requirements: null,
          reference: null,
        },
      ],
      profiles: [],
    });
    expect(filterUnifiedLeads(unified, "unit")).toHaveLength(1);
    expect(filterUnifiedLeads(unified, "missing")).toHaveLength(0);
  });
});
