// Plan limits from the pricing table. Checked when something is created,
// never on redirect: a code over the limit keeps working.

export type Plan = "free" | "starter" | "business";

export type PlanLimits = {
  dynamicCodes: number;
  analyticsDays: number | null; // null = unlimited history
  csvExport: boolean;
  reviewKits: number;
  menus: number;
  teamMembers: number;
};

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: { dynamicCodes: 3, analyticsDays: 7, csvExport: false, reviewKits: 1, menus: 1, teamMembers: 1 },
  starter: { dynamicCodes: 25, analyticsDays: 365, csvExport: false, reviewKits: 1, menus: 1, teamMembers: 1 },
  business: { dynamicCodes: 250, analyticsDays: null, csvExport: true, reviewKits: 5, menus: 5, teamMembers: 3 },
};

// A lapsed paid plan falls back to free limits for creating and analytics;
// existing codes keep redirecting.
export function effectivePlan(plan: Plan, status: "active" | "past_due" | "canceled", periodEnd: Date | null, now = new Date()): Plan {
  if (plan === "free") return "free";
  if (status === "active") return plan;
  if (periodEnd && periodEnd > now) return plan;
  return "free";
}

export function canCreateDynamicCode(plan: Plan, existingCount: number): boolean {
  return existingCount < PLAN_LIMITS[plan].dynamicCodes;
}

// Basic abuse guard for new accounts: at most this many codes per hour.
export const CODES_PER_HOUR = 10;
