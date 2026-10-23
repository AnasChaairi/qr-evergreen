// Encoders that turn form input into the text stored inside a static QR code.
// Everything here is pure so it can run in the browser and be unit tested.

export type CodeType = "wifi" | "url" | "whatsapp" | "review" | "vcard";

export const CODE_TYPES: CodeType[] = ["wifi", "url", "whatsapp", "review", "vcard"];

export type WifiInput = {
  ssid: string;
  password: string;
  security: "WPA" | "WEP" | "nopass";
  hidden: boolean;
};

export type UrlInput = { url: string };

export type WhatsappInput = { phone: string; message: string };

export type ReviewInput = { placeIdOrUrl: string };

export type VcardInput = {
  firstName: string;
  lastName: string;
  organization: string;
  title: string;
  phone: string;
  email: string;
  website: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

export type PayloadInput = {
  wifi: WifiInput;
  url: UrlInput;
  whatsapp: WhatsappInput;
  review: ReviewInput;
  vcard: VcardInput;
};

export const EMPTY_INPUT: PayloadInput = {
  wifi: { ssid: "", password: "", security: "WPA", hidden: false },
  url: { url: "" },
  whatsapp: { phone: "", message: "" },
  review: { placeIdOrUrl: "" },
  vcard: {
    firstName: "",
    lastName: "",
    organization: "",
    title: "",
    phone: "",
    email: "",
    website: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
  },
};

// Result of encoding: either the text to put in the code, or a reason it is not ready yet.
export type EncodeResult = { ok: true; data: string } | { ok: false; error: EncodeError };

export type EncodeError =
  | "ssidRequired"
  | "passwordRequired"
  | "urlRequired"
  | "urlInvalid"
  | "phoneRequired"
  | "phoneInvalid"
  | "reviewRequired"
  | "reviewInvalid"
  | "nameRequired";

// WiFi strings escape \ ; , : and " with a backslash (ZXing "WIFI:" format).
export function escapeWifi(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export function encodeWifi(input: WifiInput): EncodeResult {
  if (!input.ssid.trim()) return { ok: false, error: "ssidRequired" };
  if (input.security !== "nopass" && !input.password) {
    return { ok: false, error: "passwordRequired" };
  }
  let data = `WIFI:T:${input.security};S:${escapeWifi(input.ssid)};`;
  if (input.security !== "nopass") data += `P:${escapeWifi(input.password)};`;
  if (input.hidden) data += "H:true;";
  return { ok: true, data: data + ";" };
}

export function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function encodeUrl(input: UrlInput): EncodeResult {
  if (!input.url.trim()) return { ok: false, error: "urlRequired" };
  const url = normalizeUrl(input.url);
  return url ? { ok: true, data: url } : { ok: false, error: "urlInvalid" };
}

// wa.me wants the full international number, digits only, no leading + or 00.
export function normalizePhoneForWhatsapp(raw: string): string | null {
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  else if (digits.startsWith("00")) digits = digits.slice(2);
  digits = digits.replace(/\+/g, "");
  return /^\d{7,15}$/.test(digits) ? digits : null;
}

export function encodeWhatsapp(input: WhatsappInput): EncodeResult {
  if (!input.phone.trim()) return { ok: false, error: "phoneRequired" };
  const phone = normalizePhoneForWhatsapp(input.phone);
  if (!phone) return { ok: false, error: "phoneInvalid" };
  const message = input.message.trim();
  const data = message
    ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${phone}`;
  return { ok: true, data };
}

// Google Place IDs are URL-safe base64-ish strings, usually starting with "ChIJ".
const PLACE_ID_PATTERN = /^[A-Za-z0-9_-]{16,}$/;

const REVIEW_HOSTS = ["g.page", "search.google.com", "www.google.com", "google.com", "maps.app.goo.gl", "goo.gl"];

export function googleReviewUrl(placeId: string): string {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}

export function encodeReview(input: ReviewInput): EncodeResult {
  const value = input.placeIdOrUrl.trim();
  if (!value) return { ok: false, error: "reviewRequired" };
  if (PLACE_ID_PATTERN.test(value)) return { ok: true, data: googleReviewUrl(value) };
  const url = normalizeUrl(value);
  if (!url) return { ok: false, error: "reviewInvalid" };
  const host = new URL(url).hostname.toLowerCase();
  if (!REVIEW_HOSTS.includes(host)) return { ok: false, error: "reviewInvalid" };
  return { ok: true, data: url };
}

// vCard 3.0 text values escape backslash, comma, semicolon and newlines.
export function escapeVcard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function encodeVcard(input: VcardInput): EncodeResult {
  const v = Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, escapeVcard(value.trim())]),
  ) as VcardInput;
  if (!v.firstName && !v.lastName && !v.organization) {
    return { ok: false, error: "nameRequired" };
  }
  const fullName = [v.firstName, v.lastName].filter(Boolean).join(" ") || v.organization;
  const lines = ["BEGIN:VCARD", "VERSION:3.0", `N:${v.lastName};${v.firstName};;;`, `FN:${fullName}`];
  if (v.organization) lines.push(`ORG:${v.organization}`);
  if (v.title) lines.push(`TITLE:${v.title}`);
  if (v.phone) lines.push(`TEL;TYPE=CELL:${v.phone}`);
  if (v.email) lines.push(`EMAIL:${v.email}`);
  if (v.website) lines.push(`URL:${normalizeUrl(input.website) ?? v.website}`);
  if (v.street || v.city || v.postalCode || v.country) {
    lines.push(`ADR;TYPE=WORK:;;${v.street};${v.city};;${v.postalCode};${v.country}`);
  }
  lines.push("END:VCARD");
  return { ok: true, data: lines.join("\r\n") };
}

export function encodePayload<T extends CodeType>(type: T, input: PayloadInput[T]): EncodeResult {
  switch (type) {
    case "wifi":
      return encodeWifi(input as WifiInput);
    case "url":
      return encodeUrl(input as UrlInput);
    case "whatsapp":
      return encodeWhatsapp(input as WhatsappInput);
    case "review":
      return encodeReview(input as ReviewInput);
    case "vcard":
      return encodeVcard(input as VcardInput);
    default:
      throw new Error(`Unknown code type: ${type satisfies never}`);
  }
}
