-- Plans and payments: subscription state synced from Lemon Squeezy webhooks.
-- Only the webhook (service role) writes these; members cannot update them
-- because profiles only grant update on name and locale.

alter table public.profiles
  add column subscription_id text,
  add column billing_interval text check (billing_interval is null or billing_interval in ('month', 'year')),
  -- updated_at of the last subscription snapshot applied, so late webhooks
  -- cannot overwrite newer state.
  add column billing_synced_at timestamptz;

create index profiles_payment_customer_id_idx on public.profiles (payment_customer_id) where payment_customer_id is not null;
