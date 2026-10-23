-- QR Evergreen core schema.
-- Static codes are never stored; only dynamic codes, menus, review kits and scans.
-- Rule: billing never touches qr_codes.is_active, so printed codes keep redirecting.

create extension if not exists pgcrypto;

-- Plans -----------------------------------------------------------------------

create type public.plan as enum ('free', 'starter', 'business');
create type public.plan_status as enum ('active', 'past_due', 'canceled');
create type public.member_role as enum ('owner', 'editor');
create type public.code_type as enum ('url', 'wifi', 'whatsapp', 'review', 'vcard', 'menu', 'pdf');

-- Profiles and workspaces -----------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text,
  locale text not null default 'en' check (locale in ('en', 'fr')),
  plan public.plan not null default 'free',
  plan_status public.plan_status not null default 'active',
  current_period_end timestamptz,
  payment_customer_id text,
  created_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  custom_domain text unique,
  created_at timestamptz not null default now()
);

create index workspaces_owner_id_idx on public.workspaces (owner_id);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.member_role not null default 'editor',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index workspace_members_user_id_idx on public.workspace_members (user_id);

-- Dynamic codes ---------------------------------------------------------------

create table public.qr_codes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  short_slug text not null unique check (short_slug ~ '^[A-Za-z0-9]{7}$'),
  name text not null default '',
  type public.code_type not null default 'url',
  destination_url text not null check (destination_url ~* '^https?://'),
  payload jsonb not null default '{}'::jsonb,
  design jsonb not null default '{}'::jsonb,
  -- Only the owner archiving a code may set this false; never billing.
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index qr_codes_workspace_id_idx on public.qr_codes (workspace_id);

-- Scans, partitioned by month. No IP is stored: only coarse location and a
-- daily salted hash so unique scans can be counted for a single day.

create table public.scans (
  id bigint generated always as identity,
  qr_code_id uuid not null references public.qr_codes (id) on delete cascade,
  scanned_at timestamptz not null default now(),
  country text,
  city text,
  device text,
  os text,
  browser text,
  visitor_hash text,
  is_unique boolean not null default false,
  primary key (id, scanned_at)
) partition by range (scanned_at);

create index scans_code_time_idx on public.scans (qr_code_id, scanned_at);

-- Creates the monthly partition that holds `month` if it is missing.
create or replace function public.ensure_scans_partition(month date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  start_date date := date_trunc('month', month)::date;
  end_date date := (date_trunc('month', month) + interval '1 month')::date;
  partition_name text := format('scans_%s', to_char(start_date, 'YYYY_MM'));
begin
  execute format(
    'create table if not exists public.%I partition of public.scans for values from (%L) to (%L)',
    partition_name, start_date, end_date
  );
end;
$$;

-- A default partition catches anything outside the created months, so a
-- missing partition can never make a scan insert (or a redirect) fail.
create table public.scans_default partition of public.scans default;

revoke execute on function public.ensure_scans_partition(date) from public, anon, authenticated;

do $$
begin
  perform public.ensure_scans_partition(d::date)
  from generate_series(date_trunc('month', now()), date_trunc('month', now()) + interval '12 months', interval '1 month') as d;
end $$;

-- Menus and review kits (filled in by the next modules) -----------------------

create table public.menus (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  qr_code_id uuid references public.qr_codes (id) on delete set null,
  title text not null,
  languages text[] not null default array['en'],
  pdf_url text,
  sections jsonb not null default '[]'::jsonb,
  theme jsonb not null default '{}'::jsonb,
  opening_hours jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index menus_workspace_id_idx on public.menus (workspace_id);

create table public.review_kits (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  qr_code_id uuid references public.qr_codes (id) on delete set null,
  business_name text not null,
  google_place_id text,
  review_url text not null,
  extra_links jsonb not null default '[]'::jsonb,
  print_designs text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index review_kits_workspace_id_idx on public.review_kits (workspace_id);

-- updated_at ------------------------------------------------------------------

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger qr_codes_touch before update on public.qr_codes
  for each row execute function public.touch_updated_at();
create trigger menus_touch before update on public.menus
  for each row execute function public.touch_updated_at();
create trigger review_kits_touch before update on public.review_kits
  for each row execute function public.touch_updated_at();

-- New users get a profile, a workspace and an owner membership ---------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_workspace_id uuid;
  user_locale text := coalesce(new.raw_user_meta_data ->> 'locale', 'en');
begin
  if user_locale not in ('en', 'fr') then
    user_locale := 'en';
  end if;

  insert into public.profiles (id, email, name, locale)
  values (new.id, coalesce(new.email, ''), new.raw_user_meta_data ->> 'full_name', user_locale);

  insert into public.workspaces (owner_id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1), 'My workspace'))
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row-level security ----------------------------------------------------------

-- Workspaces the current user belongs to. security definer avoids RLS
-- recursion when policies on workspace_members call it.
create or replace function public.my_workspace_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select workspace_id from public.workspace_members where user_id = auth.uid()
$$;

create or replace function public.is_workspace_owner(ws uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.workspaces where id = ws and owner_id = auth.uid())
$$;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.qr_codes enable row level security;
alter table public.scans enable row level security;
alter table public.menus enable row level security;
alter table public.review_kits enable row level security;

-- Profiles: read your own. Plan columns are written only by the payment webhook (service role).
create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from authenticated;
grant update (name, locale) on public.profiles to authenticated;

create policy "workspaces: members read" on public.workspaces
  for select to authenticated using (id in (select public.my_workspace_ids()));
create policy "workspaces: owner updates" on public.workspaces
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
revoke update on public.workspaces from authenticated;
grant update (name) on public.workspaces to authenticated;

create policy "members: read own workspaces" on public.workspace_members
  for select to authenticated using (workspace_id in (select public.my_workspace_ids()));
create policy "members: owner manages" on public.workspace_members
  for all to authenticated using (public.is_workspace_owner(workspace_id))
  with check (public.is_workspace_owner(workspace_id));

-- Codes: members read and edit. Creation goes through the app (plan limits are
-- checked there with the service role), so there is no insert policy.
create policy "codes: members read" on public.qr_codes
  for select to authenticated using (workspace_id in (select public.my_workspace_ids()));
create policy "codes: members update" on public.qr_codes
  for update to authenticated using (workspace_id in (select public.my_workspace_ids()))
  with check (workspace_id in (select public.my_workspace_ids()));
create policy "codes: members delete" on public.qr_codes
  for delete to authenticated using (workspace_id in (select public.my_workspace_ids()));
revoke update on public.qr_codes from authenticated;
grant update (name, destination_url, payload, design, is_active) on public.qr_codes to authenticated;

-- Scans: members read; only the redirect (service role) writes.
create policy "scans: members read" on public.scans
  for select to authenticated using (
    qr_code_id in (select id from public.qr_codes where workspace_id in (select public.my_workspace_ids()))
  );

create policy "menus: members all" on public.menus
  for all to authenticated using (workspace_id in (select public.my_workspace_ids()))
  with check (workspace_id in (select public.my_workspace_ids()));
create policy "review_kits: members all" on public.review_kits
  for all to authenticated using (workspace_id in (select public.my_workspace_ids()))
  with check (workspace_id in (select public.my_workspace_ids()));

-- Daily scan counts for the analytics view (respects RLS through the caller).
create or replace function public.scan_daily_counts(code_ids uuid[], since timestamptz)
returns table (qr_code_id uuid, day date, scans bigint, unique_scans bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select s.qr_code_id, (s.scanned_at at time zone 'utc')::date as day, count(*), count(*) filter (where s.is_unique)
  from public.scans s
  where s.qr_code_id = any (code_ids) and s.scanned_at >= since
  group by 1, 2
  order by 2
$$;
