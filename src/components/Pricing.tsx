"use client";

import Link from "next/link";
import { useState } from "react";
import { BILLING } from "@/content/billing";
import { PRICES, type Interval } from "@/lib/billing/catalog";
import type { Plan } from "@/lib/dynamic/plans";
import type { Locale } from "@/lib/i18n";
import { CheckIcon, ShieldIcon } from "./Icons";

const PLANS: Plan[] = ["free", "starter", "business"];

// The written promise, shown on the pricing page and before checkout.
export function PricingPromise({ locale }: { locale: Locale }) {
  const t = BILLING[locale].promise;
  return (
    <section className="flex flex-wrap items-start gap-5 rounded-3xl bg-brand-50 p-6 sm:p-8">
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-white">
        <ShieldIcon className="h-7 w-7" />
      </span>
      <div className="min-w-0 flex-[1_1_380px] space-y-3">
        <h2 className="text-2xl font-bold text-brand-900">{t.heading}</h2>
        <ul className="space-y-2.5 text-base leading-relaxed text-brand-900">
          {t.points.map((point) => (
            <li key={point} className="flex gap-3">
              <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-brand-700" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function PricingTable({ locale }: { locale: Locale }) {
  const t = BILLING[locale];
  const prefix = locale === "fr" ? "/fr" : "";
  const [interval, setInterval] = useState<Interval>("month");
  const toggle = (value: Interval, label: string, extra?: string) => (
    <button
      type="button"
      aria-pressed={interval === value}
      onClick={() => setInterval(value)}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-[15px] font-semibold transition-colors ${
        interval === value ? "bg-stone-900 text-white" : "text-stone-800 hover:bg-stone-100"
      }`}
    >
      {label}
      {extra && <span className="rounded-full bg-sun-300 px-2 py-0.5 text-xs font-bold text-sun-900">{extra}</span>}
    </button>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div role="group" className="inline-flex gap-1 rounded-full border border-stone-300 bg-white p-1">
          {toggle("month", t.pricing.monthly)}
          {toggle("year", t.pricing.yearly, t.pricing.yearlySaving)}
        </div>
      </div>
      <div className="grid items-stretch gap-5 md:grid-cols-3">
        {PLANS.map((plan) => {
          const featured = plan === "starter";
          return (
            <div
              key={plan}
              className={`flex flex-col gap-5 rounded-3xl p-7 ${
                featured ? "bg-stone-900 text-white shadow-lift" : "border border-stone-200 bg-white text-stone-900"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-sans text-xl font-bold tracking-normal">{t.planNames[plan]}</h2>
                {featured && <span className="chip bg-sun-300 text-sun-900">{t.pricing.popular}</span>}
              </div>
              <p className="font-display text-5xl font-extrabold tracking-tight">
                ${plan === "free" ? 0 : PRICES[plan][interval]}
                {plan !== "free" && (
                  <span className={`font-sans text-base font-medium tracking-normal ${featured ? "text-stone-300" : "text-stone-500"}`}>
                    {interval === "month" ? t.pricing.perMonth : t.pricing.perYear}
                  </span>
                )}
              </p>
              <Link
                href={`${prefix}/dashboard${plan === "free" ? "" : "/billing"}`}
                className={`btn w-full rounded-2xl ${featured ? "btn-sun" : plan === "free" ? "btn-secondary" : "btn-primary"}`}
              >
                {plan === "free" ? t.pricing.startFree : `${t.pricing.choose} ${t.planNames[plan]}`}
              </Link>
              <ul className="space-y-3 text-[15px] leading-snug">
                {t.pricing.rows.map((row) => (
                  <li key={row.label} className="flex gap-3">
                    <CheckIcon className={`mt-0.5 h-5 w-5 shrink-0 ${featured ? "text-sun-300" : "text-brand-700"}`} />
                    <span>
                      <span className={featured ? "text-stone-300" : "text-stone-500"}>{row.label}:</span> {row.values[plan]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="text-center text-sm text-stone-500">{t.pricing.localPricing}</p>
    </div>
  );
}
