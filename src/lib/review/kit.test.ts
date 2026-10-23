import { describe, expect, it } from "vitest";
import { designsForPlan, isPlatformUrl, itemLink, kitDestination, normalizeColor } from "./kit";

describe("review kit", () => {
  it("limits designs on the free plan", () => {
    expect(designsForPlan("free")).toEqual(["classic", "minimal"]);
    expect(designsForPlan("starter")).toHaveLength(4);
  });

  it("checks extra links belong to their platform", () => {
    expect(isPlatformUrl("tripadvisor", "https://www.tripadvisor.fr/Restaurant_Review-g1")).toBe(true);
    expect(isPlatformUrl("tripadvisor", "https://tripadvisor.co.uk/x")).toBe(true);
    expect(isPlatformUrl("facebook", "https://m.facebook.com/cafe/reviews")).toBe(true);
    expect(isPlatformUrl("trustpilot", "https://trustpilot.com.evil.example/x")).toBe(false);
    expect(isPlatformUrl("booking", "https://example.com/booking.com")).toBe(false);
    expect(isPlatformUrl("tripadvisor", "https://tripadvisor.evil.example/x")).toBe(false);
  });

  it("skips our page when Google is the only platform", () => {
    expect(kitDestination("https://g.page/r/x/review", [], "https://qrevergreen.com/r/AbC1234")).toBe("https://g.page/r/x/review");
    expect(
      kitDestination("https://g.page/r/x/review", [{ platform: "trustpilot", url: "https://trustpilot.com/review/x" }], "https://qrevergreen.com/r/AbC1234"),
    ).toBe("https://qrevergreen.com/r/AbC1234");
  });

  it("tags each print item", () => {
    expect(itemLink("https://qrev.link/AbC1234", "table-tent")).toBe("https://qrev.link/AbC1234?s=table-tent");
  });

  it("falls back to the brand green for bad colours", () => {
    expect(normalizeColor("#AABBCC")).toBe("#aabbcc");
    expect(normalizeColor("red")).toBe("#0f6b45");
  });
});
