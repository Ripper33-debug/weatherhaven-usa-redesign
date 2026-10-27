import { describe, expect, it } from "vitest";
import { deploymentPinKind } from "./deployment-pin-style";

describe("deployment-pin-style", () => {
  it("maps categories to pin kinds", () => {
    expect(deploymentPinKind("Defence/Peacekeeping")).toBe("military");
    expect(deploymentPinKind("Medical/Disaster Relief")).toBe("humanitarian");
    expect(deploymentPinKind("Commercial/Scientific")).toBe("scientific");
  });
});
