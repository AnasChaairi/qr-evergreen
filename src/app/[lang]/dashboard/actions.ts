"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { SITE_URL, isLocale, type Locale } from "@/lib/i18n";
import { requireAccount } from "@/lib/dynamic/account";
import { codeTag } from "@/lib/dynamic/lookup";
import { CODES_PER_HOUR, canCreateDynamicCode } from "@/lib/dynamic/plans";
import { checkDestination } from "@/lib/dynamic/safety";
import { generateSlug, shortBaseUrl } from "@/lib/dynamic/slug";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; ok?: boolean } | null;

const OWN_HOSTS = [new URL(SITE_URL).hostname, new URL(shortBaseUrl()).hostname].map((h) => h.replace(/^www\./, ""));

function localeFrom(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? "en");
  return isLocale(value) ? value : "en";
}

function dashboardPath(locale: Locale, suffix = "") {
  return `${locale === "fr" ? "/fr" : ""}/dashboard${suffix}`;
}

export async function createCode(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const locale = localeFrom(formData);
  const account = await requireAccount(locale);
  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const destination = await checkDestination(String(formData.get("destination") ?? ""), OWN_HOSTS, process.env.GOOGLE_SAFE_BROWSING_KEY);
  if (!destination.ok) return { error: destination.reason };

  const admin = createAdminClient();
  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const [{ count: total }, { count: recent }] = await Promise.all([
    admin.from("qr_codes").select("id", { count: "exact", head: true }).eq("workspace_id", account.workspaceId),
    admin
      .from("qr_codes")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", account.workspaceId)
      .gte("created_at", hourAgo),
  ]);
  if (!canCreateDynamicCode(account.plan, total ?? 0)) return { error: "limit" };
  if ((recent ?? 0) >= CODES_PER_HOUR) return { error: "rateLimit" };

  // Retry on the (very unlikely) slug collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await admin
      .from("qr_codes")
      .insert({ workspace_id: account.workspaceId, short_slug: generateSlug(), name, destination_url: destination.url })
      .select("id")
      .single();
    if (data) {
      revalidatePath(dashboardPath(locale));
      redirect(dashboardPath(locale, `/codes/${data.id}`));
    }
    if (error?.code !== "23505") return { error: "generic" };
  }
  return { error: "generic" };
}

export async function updateDestination(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const locale = localeFrom(formData);
  await requireAccount(locale);
  const id = String(formData.get("id") ?? "");
  const destination = await checkDestination(String(formData.get("destination") ?? ""), OWN_HOSTS, process.env.GOOGLE_SAFE_BROWSING_KEY);
  if (!destination.ok) return { error: destination.reason };

  // Runs as the user: row-level security limits this to their own codes.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("qr_codes")
    .update({ destination_url: destination.url })
    .eq("id", id)
    .select("short_slug")
    .single();
  if (error || !data) return { error: "generic" };
  revalidateTag(codeTag(data.short_slug), { expire: 0 });
  revalidatePath(dashboardPath(locale, `/codes/${id}`));
  return { ok: true };
}

export async function setArchived(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  await requireAccount(locale);
  const id = String(formData.get("id") ?? "");
  const archived = formData.get("archived") === "true";
  const supabase = await createClient();
  const { data } = await supabase
    .from("qr_codes")
    .update({ is_active: !archived })
    .eq("id", id)
    .select("short_slug")
    .single();
  if (data) revalidateTag(codeTag(data.short_slug), { expire: 0 });
  revalidatePath(dashboardPath(locale, `/codes/${id}`));
}
