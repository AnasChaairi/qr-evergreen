import { NextResponse, type NextRequest } from "next/server";
import { PAID_COOKIE } from "@/components/PlanCookie";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const locale = request.nextUrl.searchParams.get("locale") === "fr" ? "/fr" : "";
  const response = NextResponse.redirect(new URL(`${locale}/login`, request.url), 303);
  response.cookies.delete(PAID_COOKIE);
  return response;
}
