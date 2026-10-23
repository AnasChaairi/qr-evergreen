import "server-only";
import type { Interval, PaidPlan } from "./catalog";
import type { VariantMap } from "./subscription";

// Lemon Squeezy (merchant of record): hosted checkout, customer portal and
// subscription webhooks. Everything is configured by environment variables,
// and billing pages say "not set up yet" until they are present.

const API = "https://api.lemonsqueezy.com/v1";

const VARIANT_ENV: Record<PaidPlan, Record<Interval, string>> = {
  starter: { month: "LEMONSQUEEZY_VARIANT_STARTER_MONTHLY", year: "LEMONSQUEEZY_VARIANT_STARTER_YEARLY" },
  business: { month: "LEMONSQUEEZY_VARIANT_BUSINESS_MONTHLY", year: "LEMONSQUEEZY_VARIANT_BUSINESS_YEARLY" },
};

export function isBillingConfigured(): boolean {
  return Boolean(process.env.LEMONSQUEEZY_API_KEY && process.env.LEMONSQUEEZY_STORE_ID && process.env.LEMONSQUEEZY_WEBHOOK_SECRET);
}

export function variantMap(): VariantMap {
  const map: VariantMap = {};
  for (const plan of Object.keys(VARIANT_ENV) as PaidPlan[]) {
    for (const interval of Object.keys(VARIANT_ENV[plan]) as Interval[]) {
      const id = process.env[VARIANT_ENV[plan][interval]];
      if (id) map[id] = { plan, interval };
    }
  }
  return map;
}

async function api(path: string, init: RequestInit = {}): Promise<Record<string, unknown>> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    },
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Lemon Squeezy ${path} failed: ${response.status}`);
  return response.json();
}

// A one-off checkout URL that carries the user id back in the webhook.
export async function createCheckout(options: { plan: PaidPlan; interval: Interval; userId: string; email: string; redirectUrl: string }): Promise<string> {
  const variantId = process.env[VARIANT_ENV[options.plan][options.interval]];
  if (!variantId) throw new Error(`No variant configured for ${options.plan}/${options.interval}`);
  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: { email: options.email, custom: { user_id: options.userId } },
        product_options: { redirect_url: options.redirectUrl },
      },
      relationships: {
        store: { data: { type: "stores", id: String(process.env.LEMONSQUEEZY_STORE_ID) } },
        variant: { data: { type: "variants", id: String(variantId) } },
      },
    },
  };
  const json = await api("/checkouts", { method: "POST", body: JSON.stringify(body) });
  const url = (json.data as { attributes?: { url?: string } } | undefined)?.attributes?.url;
  if (!url) throw new Error("Lemon Squeezy checkout has no URL");
  return url;
}

// Signed customer portal link (valid for a day) for invoices, card and cancel.
export async function customerPortalUrl(subscriptionId: string): Promise<string> {
  const json = await api(`/subscriptions/${encodeURIComponent(subscriptionId)}`);
  const url = (json.data as { attributes?: { urls?: { customer_portal?: string } } } | undefined)?.attributes?.urls?.customer_portal;
  if (!url) throw new Error("Lemon Squeezy subscription has no portal URL");
  return url;
}
