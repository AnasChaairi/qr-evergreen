import { NextResponse, type NextRequest } from "next/server";

// English pages live at the root ("/wifi-qr-code") but are rendered by the
// internal /en route; French pages are served as-is under /fr.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/fr" || pathname.startsWith("/fr/")) return NextResponse.next();

  // Keep one public URL per page: /en/... permanently redirects to the root.
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals, API routes and any file with an extension (icons, sitemap.xml, robots.txt).
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
