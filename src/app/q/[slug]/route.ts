import { after, type NextRequest } from "next/server";
import { CONTACT_EMAIL } from "@/content/pages";
import { escapeXml } from "@/lib/qr/frame";
import { lookupTarget } from "@/lib/dynamic/lookup";
import { decodeHeader, dailyVisitorHash, parseUserAgent } from "@/lib/dynamic/scan";
import { SLUG_PATTERN } from "@/lib/dynamic/slug";
import { createAdminClient } from "@/lib/supabase/admin";

// The redirect behind every dynamic code. It answers from cache, and logs the
// scan after the response is sent so logging never slows a scan down.
// Billing is never consulted here: a code redirects as long as it exists and
// its owner has not archived it.

export async function GET(request: NextRequest, { params }: RouteContext<"/q/[slug]">) {
  const { slug } = await params;
  if (!SLUG_PATTERN.test(slug)) return page(404, "notFound", slug);

  const target = await lookupTarget(slug);
  if (target === "error") return page(503, "unavailable", slug);
  if (!target) return page(404, "notFound", slug);
  if (!target.active) return page(410, "archived", slug);

  const ua = request.headers.get("user-agent") ?? "";
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "";
  const country = request.headers.get("x-vercel-ip-country");
  const city = decodeHeader(request.headers.get("x-vercel-ip-city"));

  after(() => logScan(target.id, ua, ip, country, city));

  return new Response(null, {
    status: 302,
    headers: { Location: target.destination, "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" },
  });
}

async function logScan(codeId: string, ua: string, ip: string, country: string | null, city: string | null) {
  const info = parseUserAgent(ua);
  if (info.device === "bot") return; // link previews are not scans
  try {
    const supabase = createAdminClient();
    const visitorHash = await dailyVisitorHash(ip, ua, process.env.SCAN_HASH_SALT ?? "dev-salt");
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("scans")
      .select("id", { count: "exact", head: true })
      .eq("qr_code_id", codeId)
      .eq("visitor_hash", visitorHash)
      .gte("scanned_at", startOfDay.toISOString());
    await supabase.from("scans").insert({
      qr_code_id: codeId,
      country,
      city,
      device: info.device,
      os: info.os,
      browser: info.browser,
      visitor_hash: visitorHash,
      is_unique: (count ?? 0) === 0,
    });
  } catch (error) {
    console.error("scan logging failed", error);
  }
}

const MESSAGES = {
  notFound: {
    title: "This QR code does not exist",
    body: "The link may have been mistyped. If you scanned a printed code, please let the business know.",
  },
  archived: {
    title: "This QR code was turned off by its owner",
    body: "The business that created this code has archived it. Please ask them for an updated link.",
  },
  unavailable: {
    title: "We could not open this code right now",
    body: "Please try again in a moment.",
  },
} as const;

// A small self-contained page in English and French, with a report link.
function page(status: number, kind: keyof typeof MESSAGES, slug: string) {
  const { title, body } = MESSAGES[kind];
  const report = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Report QR code ${slug}`)}`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeXml(title)}</title>
<style>body{font-family:system-ui,sans-serif;background:#fafaf9;color:#1c1917;margin:0;padding:48px 16px}main{max-width:480px;margin:auto}h1{font-size:1.4rem}a{color:#166534}</style></head>
<body><main><h1>${escapeXml(title)}</h1><p>${escapeXml(body)}</p><p><a href="${report}">Report this code</a> · <a href="https://qrevergreen.com">QR Evergreen</a></p></main></body></html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
