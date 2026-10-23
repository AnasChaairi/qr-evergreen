import { NextResponse, type NextRequest } from "next/server";
import { isBillingConfigured, variantMap } from "@/lib/billing/lemonsqueezy";
import { isNewer, parseSubscriptionEvent, verifySignature } from "@/lib/billing/subscription";
import { createAdminClient } from "@/lib/supabase/admin";

// Lemon Squeezy subscription webhooks. Plan state only ever changes here; it
// never touches qr_codes, so a lapsed plan cannot switch a code off.
export async function POST(request: NextRequest) {
  if (!isBillingConfigured()) return NextResponse.json({ error: "billing not configured" }, { status: 503 });
  const raw = await request.text();
  if (!verifySignature(raw, request.headers.get("x-signature"), process.env.LEMONSQUEEZY_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const update = parseSubscriptionEvent(payload, variantMap());
  if (!update) return NextResponse.json({ ignored: true });

  const admin = createAdminClient();
  const query = admin.from("profiles").select("id, billing_synced_at");
  const { data: profile, error } = await (update.userId
    ? query.eq("id", update.userId)
    : query.eq("payment_customer_id", update.customerId)
  ).maybeSingle();
  // Errors are retried by Lemon Squeezy; an unknown user is not.
  if (error) return NextResponse.json({ error: "lookup failed" }, { status: 500 });
  if (!profile) return NextResponse.json({ ignored: "unknown user" });
  if (!isNewer(update, profile.billing_synced_at)) return NextResponse.json({ ignored: "stale" });

  const { error: updateError } = await admin
    .from("profiles")
    .update({
      plan: update.plan,
      plan_status: update.status,
      current_period_end: update.periodEnd,
      payment_customer_id: update.customerId,
      subscription_id: update.subscriptionId,
      billing_interval: update.interval,
      billing_synced_at: update.updatedAt,
    })
    .eq("id", profile.id);
  if (updateError) return NextResponse.json({ error: "update failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
