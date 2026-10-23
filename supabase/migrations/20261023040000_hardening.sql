-- Fixes from the Supabase security advisor on the first live project.

-- Scan partitions are tables of their own in the public schema, so the API
-- could read them directly, bypassing the policy on public.scans. Lock them
-- down: RLS on with no policies, and no grants for API roles. Reads go
-- through public.scans; writes come from the redirect with the service role.
do $$
declare
  part regclass;
begin
  for part in select inhrelid::regclass from pg_inherits where inhparent = 'public.scans'::regclass loop
    execute format('alter table %s enable row level security', part);
    execute format('revoke all on %s from anon, authenticated', part);
  end loop;
end $$;

-- New monthly partitions get the same treatment.
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
  execute format('alter table public.%I enable row level security', partition_name);
  execute format('revoke all on public.%I from anon, authenticated', partition_name);
end;
$$;

revoke execute on function public.ensure_scans_partition(date) from public, anon, authenticated;

-- Policy helpers: signed-in users need them (policies run as the caller),
-- anonymous visitors do not.
revoke execute on function public.my_workspace_ids() from public, anon;
revoke execute on function public.is_workspace_owner(uuid) from public, anon;
grant execute on function public.my_workspace_ids() to authenticated;
grant execute on function public.is_workspace_owner(uuid) to authenticated;

-- Fixed search_path for the updated_at trigger.
alter function public.touch_updated_at() set search_path = public;
