import { describe, expect, it } from "vitest";
import { LOCALES, SLUGS, alternatesFor, pageIdFromSlug, pathFor } from "./i18n";

describe("paths", () => {
  it("keeps English at the root and French under /fr", () => {
    expect(pathFor("en", "home")).toBe("/");
    expect(pathFor("fr", "home")).toBe("/fr");
    expect(pathFor("en", "wifi")).toBe("/wifi-qr-code");
    expect(pathFor("fr", "wifi")).toBe("/fr/qr-code-wifi");
  });

  it("maps every slug back to its page", () => {
    for (const [page, slugs] of Object.entries(SLUGS)) {
      for (const locale of LOCALES) expect(pageIdFromSlug(locale, slugs[locale])).toBe(page);
    }
    expect(pageIdFromSlug("en", "qr-code-wifi")).toBeNull();
  });

  it("slugs are unique per locale", () => {
    for (const locale of LOCALES) {
      const slugs = Object.values(SLUGS).map((s) => s[locale]);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it("builds hreflang alternates", () => {
    expect(alternatesFor("fr", "review").languages).toEqual({
      en: "https://qrevergreen.com/google-review-qr-code",
      fr: "https://qrevergreen.com/fr/qr-code-avis-google",
      "x-default": "https://qrevergreen.com/google-review-qr-code",
    });
  });
});
