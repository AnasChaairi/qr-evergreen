-- Menu QR: an uploaded PDF or image, or a menu built in the dashboard.

-- Uploaded files live in Storage; the row keeps the object path, not a URL.
alter table public.menus drop column pdf_url;
alter table public.menus
  add column mode text not null default 'file' check (mode in ('file', 'builder')),
  add column file_path text check (file_path is null or file_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[A-Za-z0-9_-]+\.(pdf|jpg|png|webp)$'),
  add column file_type text check (file_type is null or file_type in ('pdf', 'image')),
  add column phone text check (phone is null or phone ~ '^\+?[0-9]{6,15}$'),
  add column whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{6,15}$');

-- The first language is the menu's default.
alter table public.menus
  add constraint menus_languages_check check (
    cardinality(languages) between 1 and 4 and languages <@ array['en', 'fr', 'ar', 'es']
  );

create unique index menus_qr_code_id_key on public.menus (qr_code_id) where qr_code_id is not null;

-- Menus are created by the app after plan checks, like codes and review kits.
-- The plan-gated columns (mode, languages, sections) and file paths are also
-- written by the app, so members can only edit the rest directly.
drop policy "menus: members all" on public.menus;
create policy "menus: members read" on public.menus
  for select to authenticated using (workspace_id in (select public.my_workspace_ids()));
create policy "menus: members update" on public.menus
  for update to authenticated using (workspace_id in (select public.my_workspace_ids()))
  with check (workspace_id in (select public.my_workspace_ids()));
create policy "menus: members delete" on public.menus
  for delete to authenticated using (workspace_id in (select public.my_workspace_ids()));
revoke update on public.menus from authenticated;
grant update (title, theme, opening_hours, phone, whatsapp) on public.menus to authenticated;

-- Public bucket for menu PDFs, images and item photos (10 MB per file). Only
-- the app writes to it, through signed upload URLs; the storage schema exists
-- on Supabase but not in the plain Postgres used by the RLS tests.
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'storage') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('menu-files', 'menu-files', true, 10485760, array['application/pdf', 'image/jpeg', 'image/png', 'image/webp'])
    on conflict (id) do nothing;
  end if;
end;
$$;
