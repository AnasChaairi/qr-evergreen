import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { openBillingPortal, startCheckout } from "@/app/[lang]/dashboard/billing/actions";
import { PricingPromise } from "@/components/Pricing";
import { AppHeader } from "@/components/SiteChrome";
import { BILLING } from "@/content/billing";
import { isLocale } from "@/lib/i18n";
import { INTERVALS, PAID_PLANS, PRICES } from "@/lib/billing/catalog";
import { isBillingConfigured } from "@/lib/billing/lemonsqueezy";
import { requireAccount } from "@/lib/dynamic/account";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/[lang]/dashboard/billing">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { title: BILLING[lang].dashboard.metaTitle, robots: { index: false } };
}

const buttonClass = "btn btn-primary";
const outlineClass = "btn btn-secondary w-full";

export default async function BillingPage({ params, searchParams }: PageProps<"/[lang]/dashboard/billing">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = BILLING[lang];
  const account = await requireAccount(lang);
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_status, current_period_end, subscription_id")
    .eq("id", account.userId)
    .single();
  const { status, error } = await searchParams;
  const configured = isBillingConfigured();
  const date = (iso: string) => new Intl.DateTimeFormat(lang, { dateStyle: "long" }).format(new Date(iso));
  const lapsed = profile && profile.plan !== "free" && account.plan === "free";
  const periodEnd = profile?.current_period_end;

  return (
    <>
      <AppHeader locale={lang} path="/dashboard/billing" signedIn />
      <main id="main" className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-10 sm:px-6">
        <h1 className="page-title">{t.dashboard.h1}</h1>

        {status === "thanks" && <p className="notice">{t.dashboard.thanks}</p>}
        {error && (
          <p role="alert" className="notice-error">
            {configured ? t.dashboard.checkoutFailed : t.dashboard.notConfigured}
          </p>
        )}

        <section className="space-y-2 card">
          <p className="text-[15px] text-stone-600">{t.dashboard.current}</p>
          <p className="page-title">{t.planNames[account.plan]}</p>
          {profile && profile.plan !== "free" && !lapsed && (
            <p className="text-[15px] text-stone-600">
              {t.dashboard.status[profile.plan_status as keyof typeof t.dashboard.status]}
              {periodEnd && ` · ${profile.plan_status === "active" ? t.dashboard.renews(date(periodEnd)) : t.dashboard.ends(date(periodEnd))}`}
            </p>
          )}
          {lapsed && <p className="text-sm text-amber-800">{t.dashboard.lapsed}</p>}
          {profile?.subscription_id && configured && (
            <form action={openBillingPortal} className="pt-2">
              <input type="hidden" name="locale" value={lang} />
              <button type="submit" className="btn-link text-[15px]">
                {t.dashboard.manage}
              </button>
            </form>
          )}
        </section>

        {/* Paid subscribers change plan in the portal, so they never hold two subscriptions. */}
        {account.plan === "free" && (
          <section className="grid gap-4 sm:grid-cols-2">
            {PAID_PLANS.map((plan) => (
              <div key={plan} className="space-y-4 card">
                <div>
                  <h2 className="text-xl font-bold text-stone-900">{t.planNames[plan]}</h2>
                  <p className="text-[15px] text-stone-600">
                    {t.pricing.rows[1].label}: {t.pricing.rows[1].values[plan]} · {t.pricing.rows[5].label}: {t.pricing.rows[5].values[plan]}
                  </p>
                </div>
                {configured ? (
                  <div className="space-y-2">
                    {INTERVALS.map((interval) => (
                      <form key={interval} action={startCheckout}>
                        <input type="hidden" name="locale" value={lang} />
                        <input type="hidden" name="plan" value={plan} />
                        <input type="hidden" name="interval" value={interval} />
                        <button type="submit" className={interval === "year" ? buttonClass : outlineClass}>
                          {interval === "year" ? t.dashboard.yearly(PRICES[plan].year) : t.dashboard.monthly(PRICES[plan].month)}
                          {interval === "year" && <span className="ms-2 text-xs font-normal opacity-90">({t.pricing.yearlySaving})</span>}
                        </button>
                      </form>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-stone-500">{t.dashboard.notConfigured}</p>
                )}
              </div>
            ))}
          </section>
        )}

        <PricingPromise locale={lang} />
      </main>
    </>
  );
}
