import { describe, expect, it } from "vitest";
import { firstSentence, proofFor } from "@/lib/product-proof";
import { buyingRecordsFor, specMailto } from "@/lib/product-buying";

describe("proofFor", () => {
  it("finds the stories that name a system", () => {
    expect(proofFor("mecc", "MECC").stories.map((s) => s.story.id)).toEqual(["nato-headquarters", "army-containerized-kitchen"]);
    expect(proofFor("polarhaven", "Polarhaven").stories.map((s) => s.story.id)).toEqual(["109th-airlift-wing", "nasa-endurance"]);
    expect(proofFor("airbeam-hp", "Airmax HP").stories).toEqual([]);
  });

  it("matches field notes by the system's whole name only", () => {
    expect(proofFor("rdmss", "RDMSS").notes.map((n) => n.place)).toEqual(["Ukraine"]);
    expect(proofFor("series-4", "Series 4").notes.map((n) => n.place)).toEqual(["Quellaveco, Peru"]);
    expect(proofFor("mecc", "MECC").notes).toEqual([]);
  });

  it("drops a figure the spec table already shows", () => {
    const trecc = proofFor("trecc", "TRECC", [{ value: "MIL-STD-810G; TRL 9 (TRECC-T)" }]).stories.find((s) => s.story.id === "trecc-us-army");
    expect(trecc?.facts.map((f) => f.value)).toEqual(["43"]);
  });

  it("takes a story's opening sentence", () => {
    expect(firstSentence("Two TRECCs went. They worked. Then more.")).toBe("Two TRECCs went.");
    expect(firstSentence("Ends with C$168M. Next.")).toBe("Ends with C$168M.");
  });
});

describe("buying records", () => {
  it("lists only what is on public record", () => {
    expect(buyingRecordsFor("mecc").flatMap((r) => r.ids)).toEqual(["W911N222A0009", "W911N222A0010", "NSN 5340-01-486-2219"]);
    expect(buyingRecordsFor("polar-chief").flatMap((r) => r.ids)).toEqual(["W50S8J20P0023"]);
    expect(buyingRecordsFor("ehmecc")).toEqual([]);
    for (const r of [...buyingRecordsFor("mecc"), ...buyingRecordsFor("polarhaven"), ...buyingRecordsFor("rdmss")]) {
      expect(r.source?.href).toMatch(/^https:\/\//);
    }
  });

  it("builds a forwardable email with no recipient", () => {
    const href = specMailto(
      { slug: "trecc", name: "TRECC", description: "A shelter.", specs: [{ label: "Setup", value: "Under 3 min" }] },
      "https://example.test/",
    );
    expect(href.startsWith("mailto:?subject=")).toBe(true);
    const body = decodeURIComponent(href.split("&body=")[1]);
    expect(body).toContain("https://example.test/configurable-solutions/trecc/spec-sheet");
    expect(body).toContain("CAGE 0EYW4");
    expect(body).toContain("- Setup: Under 3 min");
  });
});
