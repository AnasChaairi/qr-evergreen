import { describe, expect, it } from "vitest";
import {
  EMPTY_INPUT,
  encodeReview,
  encodeUrl,
  encodeVcard,
  encodeWhatsapp,
  encodeWifi,
  normalizePhoneForWhatsapp,
} from "./payloads";

describe("encodeWifi", () => {
  it("builds a WPA network string", () => {
    expect(encodeWifi({ ssid: "Cafe", password: "secret", security: "WPA", hidden: false })).toEqual({
      ok: true,
      data: "WIFI:T:WPA;S:Cafe;P:secret;;",
    });
  });

  it("escapes special characters", () => {
    const result = encodeWifi({ ssid: 'My;Net,"1"', password: "a:b\\c", security: "WPA", hidden: true });
    expect(result).toEqual({ ok: true, data: 'WIFI:T:WPA;S:My\\;Net\\,\\"1\\";P:a\\:b\\\\c;H:true;;' });
  });

  it("omits the password for open networks", () => {
    expect(encodeWifi({ ssid: "Guest", password: "ignored", security: "nopass", hidden: false })).toEqual({
      ok: true,
      data: "WIFI:T:nopass;S:Guest;;",
    });
  });

  it("requires a network name and password", () => {
    expect(encodeWifi(EMPTY_INPUT.wifi)).toEqual({ ok: false, error: "ssidRequired" });
    expect(encodeWifi({ ...EMPTY_INPUT.wifi, ssid: "Cafe" })).toEqual({ ok: false, error: "passwordRequired" });
  });
});

describe("encodeUrl", () => {
  it("adds https when the scheme is missing", () => {
    expect(encodeUrl({ url: "example.com/menu" })).toEqual({ ok: true, data: "https://example.com/menu" });
  });

  it("rejects non-web schemes and bare words", () => {
    expect(encodeUrl({ url: "javascript:alert(1)" })).toEqual({ ok: false, error: "urlInvalid" });
    expect(encodeUrl({ url: "hello" })).toEqual({ ok: false, error: "urlInvalid" });
    expect(encodeUrl({ url: " " })).toEqual({ ok: false, error: "urlRequired" });
  });
});

describe("encodeWhatsapp", () => {
  it("normalizes international numbers", () => {
    expect(normalizePhoneForWhatsapp("+212 6 12-34-56-78")).toBe("212612345678");
    expect(normalizePhoneForWhatsapp("0033 6 12 34 56 78")).toBe("33612345678");
    expect(normalizePhoneForWhatsapp("123")).toBeNull();
  });

  it("encodes the pre-filled message", () => {
    expect(encodeWhatsapp({ phone: "+33612345678", message: "Bonjour, une table pour 2 ?" })).toEqual({
      ok: true,
      data: "https://wa.me/33612345678?text=Bonjour%2C%20une%20table%20pour%202%20%3F",
    });
  });
});

describe("encodeReview", () => {
  it("turns a Place ID into the review form link", () => {
    expect(encodeReview({ placeIdOrUrl: "ChIJN1t_tDeuEmsRUsoyG83frY4" })).toEqual({
      ok: true,
      data: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4",
    });
  });

  it("accepts Google review short links", () => {
    expect(encodeReview({ placeIdOrUrl: "https://g.page/r/CabcDEF123/review" })).toEqual({
      ok: true,
      data: "https://g.page/r/CabcDEF123/review",
    });
  });

  it("rejects links that are not Google", () => {
    expect(encodeReview({ placeIdOrUrl: "https://example.com/review" })).toEqual({
      ok: false,
      error: "reviewInvalid",
    });
  });
});

describe("encodeVcard", () => {
  it("builds a vCard 3.0 with escaped values", () => {
    const result = encodeVcard({
      ...EMPTY_INPUT.vcard,
      firstName: "Anas",
      lastName: "Chaairi",
      organization: "Cafe; Bar, Ltd",
      phone: "+212600000000",
      website: "example.com",
    });
    expect(result).toEqual({
      ok: true,
      data: [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:Chaairi;Anas;;;",
        "FN:Anas Chaairi",
        "ORG:Cafe\\; Bar\\, Ltd",
        "TEL;TYPE=CELL:+212600000000",
        "URL:https://example.com/",
        "END:VCARD",
      ].join("\r\n"),
    });
  });

  it("needs a name or organization", () => {
    expect(encodeVcard(EMPTY_INPUT.vcard)).toEqual({ ok: false, error: "nameRequired" });
  });
});
