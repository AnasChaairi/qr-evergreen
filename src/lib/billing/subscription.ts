import { createHmac, timingSafeEqual } from "node:crypto";
import type { Interval, PaidPlan } from "./catalog";

// Lemon Squeezy subscription webhooks, reduced to the profile fields we keep.
// Pure functions so they can be tested without the API.

export type VariantMap = Record<string, { plan: PaidPlan; interval: Interval }>;

export type SubscriptionUpdate = {
  userId: string | null; // from checkout custom data
  customerId: string;
  subscriptionId: string;
  plan: PaidPlan;
  interval: Interval;
  status: "active" | "past_due" | "canceled";
  periodEnd: string | null;
  updatedAt: string;
};

// X-Signature is the hex HMAC-SHA256 of the raw body with the webhook secret.
export function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"), "utf8");
  const received = Buffer.from(signature, "utf8");
  return expected.length === received.length && timingSafeEqual(expected, received);
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Lapsed or paused subscriptions keep their plan until periodEnd, then the
// account falls back to free limits (see effectivePlan). Codes never stop.
function mapStatus(status: string, renewsAt: string | null, endsAt: string | null): Pick<SubscriptionUpdate, "status" | "periodEnd"> | null {
  switch (status) {
    case "active":
    case "on_trial":
      return { status: "active", periodEnd: renewsAt };
    case "past_due":
    case "unpaid":
      return { status: "past_due", periodEnd: renewsAt };
    case "cancelled":
    case "expired":
      return { status: "canceled", periodEnd: endsAt };
    case "paused":
      return { status: "canceled", periodEnd: null };
    default:
      return null;
  }
}

// Returns null for events we do not act on (invoices, orders, unknown
// variants); those are acknowledged and ignored.
export function parseSubscriptionEvent(payload: unknown, variants: VariantMap): SubscriptionUpdate | null {
  if (!payload || typeof payload !== "object") return null;
  const { meta, data } = payload as { meta?: Record<string, unknown>; data?: Record<string, unknown> };
  if (typeof meta?.event_name !== "string" || !meta.event_name.startsWith("subscription_")) return null;
  if (data?.type !== "subscriptions" || !data.attributes || typeof data.attributes !== "object") return null;
  const a = data.attributes as Record<string, unknown>;
  const variant = variants[String(a.variant_id)];
  if (!variant) return null;
  const mapped = mapStatus(String(a.status), (a.renews_at as string | null) ?? null, (a.ends_at as string | null) ?? null);
  if (!mapped) return null;
  const userId = (meta.custom_data as Record<string, unknown> | undefined)?.user_id;
  return {
    userId: typeof userId === "string" && UUID.test(userId) ? userId : null,
    customerId: String(a.customer_id),
    subscriptionId: String(data.id),
    ...variant,
    ...mapped,
    updatedAt: String(a.updated_at ?? new Date().toISOString()),
  };
}

// Webhooks can arrive out of order; only apply a snapshot newer than the last.
export function isNewer(update: SubscriptionUpdate, lastSyncedAt: string | null): boolean {
  return !lastSyncedAt || Date.parse(update.updatedAt) > Date.parse(lastSyncedAt);
}
