import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { isNewer, parseSubscriptionEvent, verifySignature, type VariantMap } from "./subscription";

const VARIANTS: VariantMap = { "101": { plan: "starter", interval: "month" }, "202": { plan: "business", interval: "year" } };
const USER = "00000000-0000-4000-8000-00000000000a";

function event(name: string, attributes: Record<string, unknown>, custom: Record<string, unknown> = { user_id: USER }) {
  return {
    meta: { event_name: name, custom_data: custom },
    data: {
      type: "subscriptions",
      id: "sub_1",
      attributes: { customer_id: 77, variant_id: 101, status: "active", renews_at: "2026-11-23T00:00:00Z", ends_at: null, updated_at: "2026-10-23T10:00:00Z", ...attributes },
    },
  };
}

describe("webhook signature", () => {
  it("accepts the hex HMAC of the raw body and rejects anything else", () => {
    const body = JSON.stringify({ a: 1 });
    const signature = createHmac("sha256", "secret").update(body).digest("hex");
    expect(verifySignature(body, signature, "secret")).toBe(true);
    expect(verifySignature(body + " ", signature, "secret")).toBe(false);
    expect(verifySignature(body, "short", "secret")).toBe(false);
    expect(verifySignature(body, null, "secret")).toBe(false);
    expect(verifySignature(body, signature, "")).toBe(false);
  });
});

describe("subscription events", () => {
  it("maps an active subscription to its plan", () => {
    expect(parseSubscriptionEvent(event("subscription_created", {}), VARIANTS)).toEqual({
      userId: USER,
      customerId: "77",
      subscriptionId: "sub_1",
      plan: "starter",
      interval: "month",
      status: "active",
      periodEnd: "2026-11-23T00:00:00Z",
      updatedAt: "2026-10-23T10:00:00Z",
    });
  });

  it("keeps the plan until the end date when cancelled", () => {
    const update = parseSubscriptionEvent(event("subscription_cancelled", { variant_id: 202, status: "cancelled", ends_at: "2027-10-01T00:00:00Z" }), VARIANTS);
    expect(update).toMatchObject({ plan: "business", interval: "year", status: "canceled", periodEnd: "2027-10-01T00:00:00Z" });
  });

  it("marks failed payments past due", () => {
    expect(parseSubscriptionEvent(event("subscription_updated", { status: "past_due" }), VARIANTS)?.status).toBe("past_due");
    expect(parseSubscriptionEvent(event("subscription_paused", { status: "paused" }), VARIANTS)).toMatchObject({ status: "canceled", periodEnd: null });
  });

  it("ignores invoices, unknown variants, unknown statuses and bad user ids", () => {
    const invoice = { ...event("subscription_payment_success", {}), data: { type: "subscription-invoices", id: "1", attributes: {} } };
    expect(parseSubscriptionEvent(invoice, VARIANTS)).toBeNull();
    expect(parseSubscriptionEvent(event("order_created", {}), VARIANTS)).toBeNull();
    expect(parseSubscriptionEvent(event("subscription_updated", { variant_id: 999 }), VARIANTS)).toBeNull();
    expect(parseSubscriptionEvent(event("subscription_updated", { status: "weird" }), VARIANTS)).toBeNull();
    expect(parseSubscriptionEvent(event("subscription_updated", {}, { user_id: "1 or 1=1" }), VARIANTS)?.userId).toBeNull();
    expect(parseSubscriptionEvent(null, VARIANTS)).toBeNull();
  });

  it("applies only newer snapshots", () => {
    const update = parseSubscriptionEvent(event("subscription_updated", {}), VARIANTS)!;
    expect(isNewer(update, null)).toBe(true);
    expect(isNewer(update, "2026-10-23T09:00:00Z")).toBe(true);
    expect(isNewer(update, "2026-10-23T10:00:00Z")).toBe(false);
  });
});
