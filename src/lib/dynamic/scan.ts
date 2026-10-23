// What we record about a scan: coarse location, device family and a daily
// salted hash. Never the IP address itself.

export type ScanInfo = {
  device: "mobile" | "tablet" | "desktop" | "bot" | "other";
  os: string;
  browser: string;
};

export function parseUserAgent(ua: string): ScanInfo {
  const s = ua.toLowerCase();
  const device: ScanInfo["device"] = /bot|crawler|spider|preview|curl|wget|python-requests|headless/.test(s)
    ? "bot"
    : /ipad|tablet|(android(?!.*mobile))/.test(s)
      ? "tablet"
      : /mobi|iphone|ipod|android/.test(s)
        ? "mobile"
        : /windows|macintosh|linux|cros/.test(s)
          ? "desktop"
          : "other";

  const os = /iphone|ipad|ipod/.test(s)
    ? "iOS"
    : /android/.test(s)
      ? "Android"
      : /windows/.test(s)
        ? "Windows"
        : /cros/.test(s)
          ? "ChromeOS"
          : /mac os x|macintosh/.test(s)
            ? "macOS"
            : /linux/.test(s)
              ? "Linux"
              : "Other";

  const browser = /edg\//.test(s)
    ? "Edge"
    : /samsungbrowser/.test(s)
      ? "Samsung Internet"
      : /opr\/|opera/.test(s)
        ? "Opera"
        : /firefox|fxios/.test(s)
          ? "Firefox"
          : /chrome|crios/.test(s)
            ? "Chrome"
            : /safari/.test(s)
              ? "Safari"
              : "Other";

  return { device, os, browser };
}

// sha256(salt | day | ip | ua), truncated. Changes every UTC day, so a visitor
// cannot be followed across days, and the IP cannot be recovered.
export async function dailyVisitorHash(ip: string, ua: string, salt: string, now = new Date()): Promise<string> {
  const day = now.toISOString().slice(0, 10);
  const bytes = new TextEncoder().encode(`${salt}|${day}|${ip}|${ua}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest).slice(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Vercel sends the city URL-encoded.
export function decodeHeader(value: string | null): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
