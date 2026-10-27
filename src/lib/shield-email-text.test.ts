import { describe, expect, it } from "vitest";
import {
  accessRequestDeniedEmailText,
  contactConfirmationEmailText,
  platformAccessApprovedEmailText,
  sofAccessApprovedEmailText,
  sofRequestAccessConfirmationEmailText,
} from "./shield-email-text";
import { adminEventLabel } from "./admin-event-labels";

describe("shield-email-text", () => {
  it("includes reference in SOF request confirmation", () => {
    const text = sofRequestAccessConfirmationEmailText({
      name: "Jane Doe",
      reference: "WH-SOF-ABC123",
    });
    expect(text).toContain("WH-SOF-ABC123");
    expect(text).toContain("four-digit");
  });

  it("includes credentials in SOF approved plain text", () => {
    const text = sofAccessApprovedEmailText({
      email: "jane@example.mil",
      pin: "1234",
      loginUrl: "https://example.com/sof-solutions/login",
    });
    expect(text).toContain("1234");
    expect(text).toContain("jane@example.mil");
  });

  it("includes password in platform welcome plain text", () => {
    const text = platformAccessApprovedEmailText({
      email: "user@example.com",
      password: "WH-TEMP123",
      loginUrl: "https://example.com/login",
    });
    expect(text).toContain("WH-TEMP123");
  });

  it("formats contact confirmation", () => {
    const text = contactConfirmationEmailText({
      fullName: "Alex Smith",
      organization: "Unit 1",
      inquiryType: "Demo Request",
      program: "TRECC",
    });
    expect(text).toContain("Hi Alex");
    expect(text).toContain("TRECC");
  });

  it("formats access denied plain text", () => {
    const text = accessRequestDeniedEmailText({
      name: "Jane Doe",
      reference: "WH-RA-ABC123",
      isSof: true,
    });
    expect(text).toContain("WH-RA-ABC123");
    expect(text).toContain("unable to approve");
  });

  it("labels admin audit actions", () => {
    expect(adminEventLabel("access_request.denied")).toBe("Access denied");
  });
});
