import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Magic-link and Google sign-in land here with a one-time code.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  const login = next.startsWith("/fr") ? "/fr/login" : "/login";
  return NextResponse.redirect(`${origin}${login}?error=callback`);
}

// Only same-site paths, so the callback cannot be used as an open redirect.
function safeNext(value: string | null): string {
  return value && /^\/(?!\/)[\w\-/]*$/.test(value) ? value : "/dashboard";
}
