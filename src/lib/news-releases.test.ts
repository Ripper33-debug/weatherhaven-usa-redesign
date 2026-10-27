import { describe, expect, it } from "vitest";
import { newsReleaseHref, slugifyNewsTitle } from "./news-releases";

describe("news-releases", () => {
  it("slugifies titles", () => {
    expect(slugifyNewsTitle("Weatherhaven 40th anniversary!")).toBe("weatherhaven-40th-anniversary");
    expect(slugifyNewsTitle("t")).toBe("release");
  });

  it("builds internal href when no external url", () => {
    expect(newsReleaseHref({ slug: "test-release", external_url: null })).toBe("/news/test-release");
  });

  it("prefers external url when set", () => {
    expect(newsReleaseHref({ slug: "test", external_url: "https://example.com/p" })).toBe(
      "https://example.com/p",
    );
  });
});
