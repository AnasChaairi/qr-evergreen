// Destination checks for dynamic codes. A phishing link on our short domain
// could get the whole domain blocklisted and break every customer's code.

import { normalizeUrl } from "@/lib/qr/payloads";

// Public shorteners hide the real destination, so we refuse to chain them.
const SHORTENER_HOSTS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "cutt.ly", "rebrand.ly",
  "shorturl.at", "tiny.cc", "rb.gy", "s.id", "t.ly", "v.gd", "qr.io", "qrco.de", "bl.ink", "lnkd.in",
]);

export type DestinationCheck =
  | { ok: true; url: string }
  | { ok: false; reason: "invalid" | "shortener" | "self" | "unsafe" | "checkFailed" };

export function checkDestinationSyntax(raw: string, ownHosts: string[]): DestinationCheck {
  const url = normalizeUrl(raw);
  if (!url) return { ok: false, reason: "invalid" };
  const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  if (SHORTENER_HOSTS.has(host)) return { ok: false, reason: "shortener" };
  if (ownHosts.some((own) => host === own || host.endsWith(`.${own}`))) return { ok: false, reason: "self" };
  return { ok: true, url };
}

type FetchLike = (input: string, init: RequestInit) => Promise<Pick<Response, "ok" | "json">>;

// Google Safe Browsing Lookup API v4. Without a key (local development) the
// check is skipped; in production the key must be set.
export async function checkSafeBrowsing(
  url: string,
  apiKey: string | undefined,
  fetchImpl: FetchLike = fetch,
): Promise<"safe" | "unsafe" | "unchecked" | "error"> {
  if (!apiKey) return "unchecked";
  try {
    const response = await fetchImpl(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: { clientId: "qr-evergreen", clientVersion: "1.0" },
          threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }],
          },
        }),
      },
    );
    if (!response.ok) return "error";
    const body = (await response.json()) as { matches?: unknown[] };
    return body.matches && body.matches.length > 0 ? "unsafe" : "safe";
  } catch {
    return "error";
  }
}

export async function checkDestination(raw: string, ownHosts: string[], apiKey: string | undefined, fetchImpl?: FetchLike): Promise<DestinationCheck> {
  const syntax = checkDestinationSyntax(raw, ownHosts);
  if (!syntax.ok) return syntax;
  const verdict = await checkSafeBrowsing(syntax.url, apiKey, fetchImpl);
  if (verdict === "unsafe") return { ok: false, reason: "unsafe" };
  // Fail closed in production if Google cannot be reached.
  if (verdict === "error") return { ok: false, reason: "checkFailed" };
  return syntax;
}
