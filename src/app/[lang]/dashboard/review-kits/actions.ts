"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { SITE_URL, isLocale, type Locale } from "@/lib/i18n";
import { requireAccount } from "@/lib/dynamic/account";
import { codeTag } from "@/lib/dynamic/lookup";
import { CODES_PER_HOUR, PLAN_LIMITS, canCreateDynamicCode } from "@/lib/dynamic/plans";
import { checkDestination } from "@/lib/dynamic/safety";
import { generateSlug, shortBaseUrl } from "@/lib/dynamic/slug";
import { encodeReview } from "@/lib/qr/payloads";
import { EXTRA_PLATFORMS, isPlatformUrl, kitDestination, normalizeColor, type ExtraLink } from "@/lib/review/kit";
import { searchPlaces, type PlaceResult } from "@/lib/review/places";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type KitActionState = { error?: string; ok?: boolean } | null;

const OWN_HOSTS = [new URL(SITE_URL).hostname, new URL(shortBaseUrl()).hostname].map((h) => h.replace(/^www\./, ""));

function localeFrom(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? "en");
  return isLocale(value) ? value : "en";
}

const kitsPath = (locale: Locale, suffix = "") => `${locale === "fr" ? "/fr" : ""}/dashboard/review-kits${suffix}`;
const publicPageUrl = (slug: string) => `${SITE_URL}/r/${slug}`;

// Signed-in users only, so the paid Places API cannot be used anonymously.
export async function findBusiness(locale: Locale, query: string): Promise<PlaceResult[] | null | "error"> {
  await requireAccount(locale);
  const trimmed = query.trim().slice(0, 120);
  if (trimmed.length < 3) return [];
  try {
    return await searchPlaces(trimmed, process.env.GOOGLE_PLACES_API_KEY, locale);
  } catch {
    return "error";
  }
}

type ParsedLinks = { reviewUrl: string; placeId: string | null; extras: ExtraLink[] } | { error: string };

async function parseLinks(formData: FormData): Promise<ParsedLinks> {
  const reviewInput = String(formData.get("review") ?? "").trim();
  const review = encodeReview({ placeIdOrUrl: reviewInput });
  if (!review.ok) return { error: "review" };
  const placeId = /^[A-Za-z0-9_-]{16,}$/.test(reviewInput) ? reviewInput : null;

  const extras: ExtraLink[] = [];
  for (const platform of EXTRA_PLATFORMS) {
    const raw = String(formData.get(`extra_${platform}`) ?? "").trim();
    if (!raw) continue;
    const checked = await checkDestination(raw, OWN_HOSTS, process.env.GOOGLE_SAFE_BROWSING_KEY);
    if (!checked.ok) return { error: checked.reason };
    if (!isPlatformUrl(platform, checked.url)) return { error: "extra" };
    extras.push({ platform, url: checked.url });
  }
  return { reviewUrl: review.data, placeId, extras };
}

export async function createKit(_prev: KitActionState, formData: FormData): Promise<KitActionState> {
  const locale = localeFrom(formData);
  const account = await requireAccount(locale);
  const businessName = String(formData.get("businessName") ?? "").trim().slice(0, 80);
  if (!businessName) return { error: "generic" };
  const links = await parseLinks(formData);
  if ("error" in links) return { error: links.error };

  const admin = createAdminClient();
  const hourAgo = new Date(Date.now() - 3600_000).toISOString();
  const [{ count: codes }, { count: recent }, { count: kits }] = await Promise.all([
    admin.from("qr_codes").select("id", { count: "exact", head: true }).eq("workspace_id", account.workspaceId),
    admin.from("qr_codes").select("id", { count: "exact", head: true }).eq("workspace_id", account.workspaceId).gte("created_at", hourAgo),
    admin.from("review_kits").select("id", { count: "exact", head: true }).eq("workspace_id", account.workspaceId),
  ]);
  if ((kits ?? 0) >= PLAN_LIMITS[account.plan].reviewKits) return { error: "kitLimit" };
  if (!canCreateDynamicCode(account.plan, codes ?? 0)) return { error: "limit" };
  if ((recent ?? 0) >= CODES_PER_HOUR) return { error: "rateLimit" };

  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug();
    const { data: code, error } = await admin
      .from("qr_codes")
      .insert({
        workspace_id: account.workspaceId,
        short_slug: slug,
        name: businessName,
        type: "review",
        destination_url: kitDestination(links.reviewUrl, links.extras, publicPageUrl(slug)),
      })
      .select("id")
      .single();
    if (error?.code === "23505") continue;
    if (!code) return { error: "generic" };

    const { data: kit } = await admin
      .from("review_kits")
      .insert({
        workspace_id: account.workspaceId,
        qr_code_id: code.id,
        business_name: businessName,
        google_place_id: links.placeId,
        review_url: links.reviewUrl,
        extra_links: links.extras,
        brand: { color: normalizeColor(String(formData.get("color") ?? "")), locale },
      })
      .select("id")
      .single();
    if (!kit) {
      await admin.from("qr_codes").delete().eq("id", code.id);
      return { error: "generic" };
    }
    revalidatePath(kitsPath(locale));
    redirect(kitsPath(locale, `/${kit.id}`));
  }
  return { error: "generic" };
}

export async function updateKitLinks(_prev: KitActionState, formData: FormData): Promise<KitActionState> {
  const locale = localeFrom(formData);
  await requireAccount(locale);
  const id = String(formData.get("id") ?? "");
  const links = await parseLinks(formData);
  if ("error" in links) return { error: links.error };

  // Runs as the user: row-level security limits this to their own kits.
  const supabase = await createClient();
  const { data: kit } = await supabase
    .from("review_kits")
    .update({ review_url: links.reviewUrl, google_place_id: links.placeId, extra_links: links.extras })
    .eq("id", id)
    .select("qr_code_id, qr_codes(short_slug)")
    .single();
  if (!kit?.qr_code_id) return { error: "generic" };
  const slug = (kit.qr_codes as unknown as { short_slug: string }).short_slug;
  await supabase
    .from("qr_codes")
    .update({ destination_url: kitDestination(links.reviewUrl, links.extras, publicPageUrl(slug)) })
    .eq("id", kit.qr_code_id);
  revalidateTag(codeTag(slug), { expire: 0 });
  revalidatePath(`/r/${slug}`);
  revalidatePath(kitsPath(locale, `/${id}`));
  return { ok: true };
}
