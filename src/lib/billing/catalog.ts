import type { Plan } from "@/lib/dynamic/plans";

// Prices in USD from the pricing table. Yearly is about two months free.
export type PaidPlan = Exclude<Plan, "free">;
export type Interval = "month" | "year";

export const PAID_PLANS: PaidPlan[] = ["starter", "business"];
export const INTERVALS: Interval[] = ["month", "year"];

export const PRICES: Record<PaidPlan, Record<Interval, number>> = {
  starter: { month: 5, year: 48 },
  business: { month: 12, year: 108 },
};

export function isPaidPlan(value: unknown): value is PaidPlan {
  return value === "starter" || value === "business";
}

export function isInterval(value: unknown): value is Interval {
  return value === "month" || value === "year";
}
