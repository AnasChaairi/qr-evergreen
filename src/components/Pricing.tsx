import Link from "next/link";
import { BILLING } from "@/content/billing";
import { PRICES } from "@/lib/billing/catalog";
import type { Plan } from "@/lib/dynamic/plans";
import type { Locale } from "@/lib/i18n";

const PLANS: Plan[] = ["free", "starter", "business"];

// The written promise, shown on the pricing page and before checkout.
export function PricingPromise({ locale }: { locale: Locale }) {
  const t = BILLING[locale].promise;
  return (
    <section className="space-y-3 rounded-2xl border border-brand-600/30 bg-brand-50 p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-brand-900">{t.heading}</h2>
      <ul className="space-y-2 text-sm leading-relaxed text-brand-900">
        {t.points.map((point) => (
          <li key={point} className="flex gap-2">
            <span aria-hidden="true">✓</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PricingTable({ locale }: { locale: Locale }) {
  const t = BILLING[locale];
  const prefix = locale === "fr" ? "/fr" : "";
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <div
            key={plan}
            className={`flex flex-col gap-4 rounded-2xl border bg-white p-5 ${plan === "starter" ? "border-brand-700 ring-2 ring-brand-700/20" : "border-stone-200"}`}
          >
            <h2 className="text-lg font-semibold text-stone-900">{t.planNames[plan]}</h2>
            {plan === "free" ? (
              <p className="text-3xl font-bold text-stone-900">$0</p>
            ) : (
              <div>
                <p className="text-3xl font-bold text-stone-900">
                  ${PRICES[plan].month}
                  <span className="text-base font-normal text-stone-500">{t.pricing.perMonth}</span>
                </p>
                <p className="text-sm text-stone-600">
                  ${PRICES[plan].year}
                  {t.pricing.perYear} · {t.pricing.yearlySaving}
                </p>
              </div>
            )}
            <ul className="flex-1 space-y-1.5 text-sm text-stone-700">
              {t.pricing.rows.map((row) => (
                <li key={row.label}>
                  <span className="text-stone-500">{row.label}:</span> {row.values[plan]}
                </li>
              ))}
            </ul>
            <Link
              href={`${prefix}/dashboard${plan === "free" ? "" : "/billing"}`}
              className={`rounded-lg px-4 py-2 text-center text-sm font-semibold ${
                plan === "starter" ? "bg-brand-700 text-white hover:bg-brand-800" : "border border-brand-700 text-brand-800 hover:bg-brand-50"
              }`}
            >
              {plan === "free" ? t.pricing.startFree : `${t.pricing.choose} ${t.planNames[plan]}`}
            </Link>
          </div>
        ))}
      </div>
      <p className="text-sm text-stone-500">{t.pricing.localPricing}</p>
    </div>
  );
}
