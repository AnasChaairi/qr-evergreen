"use server";

import { redirect } from "next/navigation";
import { SITE_URL, isLocale, type Locale } from "@/lib/i18n";
import { isInterval, isPaidPlan } from "@/lib/billing/catalog";
import { createCheckout, customerPortalUrl, isBillingConfigured } from "@/lib/billing/lemonsqueezy";
import { requireAccount } from "@/lib/dynamic/account";
import { createClient } from "@/lib/supabase/server";

function localeFrom(formData: FormData): Locale {
  const value = String(formData.get("locale") ?? "en");
  return isLocale(value) ? value : "en";
}

const billingPath = (locale: Locale) => `${locale === "fr" ? "/fr" : ""}/dashboard/billing`;

export async function startCheckout(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const account = await requireAccount(locale);
  const plan = formData.get("plan");
  const interval = formData.get("interval");
  if (!isBillingConfigured() || !isPaidPlan(plan) || !isInterval(interval)) redirect(`${billingPath(locale)}?error=checkout`);

  let url: string;
  try {
    url = await createCheckout({
      plan,
      interval,
      userId: account.userId,
      email: account.email,
      redirectUrl: `${SITE_URL}${billingPath(locale)}?status=thanks`,
    });
  } catch {
    redirect(`${billingPath(locale)}?error=checkout`);
  }
  redirect(url);
}

export async function openBillingPortal(formData: FormData): Promise<void> {
  const locale = localeFrom(formData);
  const account = await requireAccount(locale);
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("subscription_id").eq("id", account.userId).single();
  if (!isBillingConfigured() || !profile?.subscription_id) redirect(`${billingPath(locale)}?error=checkout`);

  let url: string;
  try {
    url = await customerPortalUrl(profile.subscription_id);
  } catch {
    redirect(`${billingPath(locale)}?error=checkout`);
  }
  redirect(url);
}
