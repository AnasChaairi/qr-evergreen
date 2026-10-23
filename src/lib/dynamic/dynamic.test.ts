import { describe, expect, it } from "vitest";
import { PLAN_LIMITS, canCreateDynamicCode, effectivePlan } from "./plans";
import { checkDestination, checkDestinationSyntax } from "./safety";
import { dailyVisitorHash, parseUserAgent } from "./scan";
import { SLUG_PATTERN, generateSlug } from "./slug";

describe("plans", () => {
  it("free accounts get 3 dynamic codes", () => {
    expect(canCreateDynamicCode("free", 2)).toBe(true);
    expect(canCreateDynamicCode("free", 3)).toBe(false);
    expect(PLAN_LIMITS.business.dynamicCodes).toBe(250);
  });

  it("lapsed paid plans fall back to free limits after the period ends", () => {
    const now = new Date("2026-10-23T00:00:00Z");
    expect(effectivePlan("starter", "active", null, now)).toBe("starter");
    expect(effectivePlan("starter", "canceled", new Date("2026-11-01"), now)).toBe("starter");
    expect(effectivePlan("starter", "canceled", new Date("2026-10-01"), now)).toBe("free");
    expect(effectivePlan("business", "past_due", null, now)).toBe("free");
  });
});

describe("slugs", () => {
  it("are 7 base62 characters", () => {
    for (let i = 0; i < 100; i++) expect(generateSlug()).toMatch(SLUG_PATTERN);
  });

  it("skip biased bytes", () => {
    let call = 0;
    const slug = generateSlug((b) => b.fill(call++ === 0 ? 255 : 1));
    expect(slug).toBe("1111111");
  });
});

describe("destination safety", () => {
  const own = ["qrevergreen.com", "qrev.link"];

  it("normalizes good links", () => {
    expect(checkDestinationSyntax("example.com/menu", own)).toEqual({ ok: true, url: "https://example.com/menu" });
  });

  it("rejects shorteners and our own domains", () => {
    expect(checkDestinationSyntax("https://bit.ly/abc", own)).toEqual({ ok: false, reason: "shortener" });
    expect(checkDestinationSyntax("https://www.qrevergreen.com/q/AAAAAAA", own)).toEqual({ ok: false, reason: "self" });
    expect(checkDestinationSyntax("ftp://example.com", own)).toEqual({ ok: false, reason: "invalid" });
  });

  it("blocks Safe Browsing matches and fails closed on errors", async () => {
    const unsafe = async () => ({ ok: true, json: async () => ({ matches: [{ threatType: "MALWARE" }] }) });
    const safe = async () => ({ ok: true, json: async () => ({}) });
    const down = async () => ({ ok: false, json: async () => ({}) });
    expect(await checkDestination("evil.example", own, "key", unsafe)).toEqual({ ok: false, reason: "unsafe" });
    expect(await checkDestination("good.example", own, "key", safe)).toEqual({ ok: true, url: "https://good.example/" });
    expect(await checkDestination("good.example", own, "key", down)).toEqual({ ok: false, reason: "checkFailed" });
    expect(await checkDestination("good.example", own, undefined)).toEqual({ ok: true, url: "https://good.example/" });
  });
});

describe("scan info", () => {
  it("parses common user agents", () => {
    expect(
      parseUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"),
    ).toEqual({ device: "mobile", os: "iOS", browser: "Safari" });
    expect(
      parseUserAgent("Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0 Mobile Safari/537.36"),
    ).toEqual({ device: "mobile", os: "Android", browser: "Samsung Internet" });
    expect(
      parseUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edg/130.0"),
    ).toEqual({ device: "desktop", os: "Windows", browser: "Edge" });
    expect(parseUserAgent("WhatsApp/2.23 link preview bot").device).toBe("bot");
  });

  it("hashes visitors per day without exposing the IP", async () => {
    const day1 = new Date("2026-10-23T08:00:00Z");
    const day1Later = new Date("2026-10-23T22:00:00Z");
    const day2 = new Date("2026-10-24T08:00:00Z");
    const a = await dailyVisitorHash("203.0.113.5", "ua", "salt", day1);
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(a).not.toContain("203");
    expect(await dailyVisitorHash("203.0.113.5", "ua", "salt", day1Later)).toBe(a);
    expect(await dailyVisitorHash("203.0.113.5", "ua", "salt", day2)).not.toBe(a);
  });
});
