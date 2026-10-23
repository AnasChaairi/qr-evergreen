import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const SHORT_HOST = hostOf(process.env.NEXT_PUBLIC_SHORT_URL);
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function hostOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Short domain: qrev.link/AbC1234 is served by the redirect route.
  if (SHORT_HOST && request.headers.get("host")?.toLowerCase() === SHORT_HOST) {
    if (pathname === "/") return NextResponse.redirect(new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://qrevergreen.com"), 308);
    const url = request.nextUrl.clone();
    url.pathname = `/q${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Redirects, auth callbacks and public review pages are not localized pages.
  if (pathname.startsWith("/q/") || pathname.startsWith("/auth/") || pathname.startsWith("/r/")) return NextResponse.next();

  // Where the request goes: French pages as-is, English pages rewritten to /en.
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    // Keep one public URL per page: /en/... permanently redirects to the root.
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }
  const isFrench = pathname === "/fr" || pathname.startsWith("/fr/");
  const target = request.nextUrl.clone();
  if (!isFrench) target.pathname = `/en${pathname === "/" ? "" : pathname}`;
  const forward = () => (isFrench ? NextResponse.next({ request }) : NextResponse.rewrite(target, { request }));

  let response = forward();

  // Signed-in areas refresh the Supabase session on every request. Refreshed
  // cookies go on the forwarded request (so the page sees them) and the response.
  if (SUPABASE_URL && SUPABASE_KEY && /^(\/fr)?\/(dashboard|login)(\/|$)/.test(pathname)) {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = forward();
          for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        },
      },
    });
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  // Skip Next internals, API routes and any file with an extension (icons, sitemap.xml, robots.txt).
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
