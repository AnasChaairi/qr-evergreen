import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n";
import { effectivePlan, type Plan } from "./plans";

export type Account = {
  userId: string;
  email: string;
  workspaceId: string;
  plan: Plan;
};

// The signed-in user's profile and workspace, or a redirect to the login page.
// Cached per request, since the dashboard layout and page both ask.
export const requireAccount = cache(async (locale: Locale): Promise<Account> => {
  const loginPath = locale === "fr" ? "/fr/login" : "/login";
  if (!isSupabaseConfigured()) redirect(loginPath);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(loginPath);

  const [{ data: profile }, { data: membership }] = await Promise.all([
    supabase.from("profiles").select("email, plan, plan_status, current_period_end").eq("id", user.id).single(),
    supabase.from("workspace_members").select("workspace_id").eq("user_id", user.id).order("created_at").limit(1).single(),
  ]);
  if (!profile || !membership) throw new Error("Account setup is incomplete");

  return {
    userId: user.id,
    email: profile.email,
    workspaceId: membership.workspace_id,
    plan: effectivePlan(
      profile.plan,
      profile.plan_status,
      profile.current_period_end ? new Date(profile.current_period_end) : null,
    ),
  };
});
