import { describe, expect, it } from "vitest";
import { userHasSofAccessFromMetadata } from "./sof-membership";

describe("userHasSofAccessFromMetadata", () => {
  it("returns false when user is null", () => {
    expect(userHasSofAccessFromMetadata(null)).toBe(false);
  });

  it("returns true when sof_approved metadata is set", () => {
    expect(
      userHasSofAccessFromMetadata({
        id: "1",
        app_metadata: {},
        user_metadata: { sof_approved: true },
        aud: "authenticated",
        created_at: "",
      }),
    ).toBe(true);
  });

  it("returns false when metadata is missing", () => {
    expect(
      userHasSofAccessFromMetadata({
        id: "1",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: "",
      }),
    ).toBe(false);
  });
});
