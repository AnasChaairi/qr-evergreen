-- Review QR kit: per-print-item scan sources and kit branding.

-- Which printed item a scan came from (counter stand, table tent…), taken from
-- the short link's ?s= parameter. Short slugs, never free text.
alter table public.scans
  add column source text check (source is null or source ~ '^[a-z][a-z0-9-]{0,23}$');

-- Colour and language for the kit's public page and print pack. The logo is
-- applied in the browser when the pack is generated and is not stored.
alter table public.review_kits
  add column brand jsonb not null default '{}'::jsonb;

create unique index review_kits_qr_code_id_key on public.review_kits (qr_code_id) where qr_code_id is not null;

-- Kits are created by the app after plan checks, like codes.
drop policy "review_kits: members all" on public.review_kits;
create policy "review_kits: members read" on public.review_kits
  for select to authenticated using (workspace_id in (select public.my_workspace_ids()));
create policy "review_kits: members update" on public.review_kits
  for update to authenticated using (workspace_id in (select public.my_workspace_ids()))
  with check (workspace_id in (select public.my_workspace_ids()));
create policy "review_kits: members delete" on public.review_kits
  for delete to authenticated using (workspace_id in (select public.my_workspace_ids()));
revoke update on public.review_kits from authenticated;
grant update (business_name, google_place_id, review_url, extra_links, print_designs, brand) on public.review_kits to authenticated;

-- Scans per printed item, for the kit dashboard (respects RLS through the caller).
create or replace function public.scan_source_counts(code_id uuid, since timestamptz)
returns table (source text, scans bigint)
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(s.source, 'direct'), count(*)
  from public.scans s
  where s.qr_code_id = code_id and s.scanned_at >= since
  group by 1
  order by 2 desc
$$;
