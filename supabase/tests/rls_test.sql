-- Run after the migrations on a database seeded with stub_supabase.sql.
\set ON_ERROR_STOP on
begin;

insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-0000-0000-00000000000a', 'alice@example.com', '{"locale":"fr"}'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@example.com', '{}');

-- Signup trigger created a profile, workspace and owner membership.
do $$
begin
  assert (select count(*) from public.profiles) = 2, 'profiles created';
  assert (select locale from public.profiles where email = 'alice@example.com') = 'fr', 'locale kept';
  assert (select count(*) from public.workspace_members where role = 'owner') = 2, 'owners created';
end $$;

-- Service role creates one code per user (as the app does).
insert into public.qr_codes (workspace_id, short_slug, destination_url)
select w.id, case when p.email like 'alice%' then 'AAAAAAA' else 'BBBBBBB' end, 'https://example.com'
from public.workspaces w join public.profiles p on p.id = w.owner_id;

insert into public.scans (qr_code_id, country, is_unique, source)
select id, 'MA', true, 'counter-stand' from public.qr_codes;

insert into public.review_kits (workspace_id, qr_code_id, business_name, review_url)
select workspace_id, id, 'Kit ' || short_slug, 'https://search.google.com/local/writereview?placeid=x' from public.qr_codes;

insert into public.menus (workspace_id, qr_code_id, title)
select workspace_id, id, 'Menu ' || short_slug from public.qr_codes;

-- Free-text sources, unknown menu languages and foreign file paths are rejected.
do $$
begin
  begin
    insert into public.scans (qr_code_id, source) values ((select id from public.qr_codes limit 1), 'Robert''); drop table');
    raise exception 'bad source should be rejected';
  exception when check_violation then null;
  end;
  begin
    update public.menus set languages = array['en', 'de'];
    raise exception 'unknown language should be rejected';
  exception when check_violation then null;
  end;
  begin
    update public.menus set file_path = '../../etc/passwd';
    raise exception 'bad file path should be rejected';
  exception when check_violation then null;
  end;
end $$;

-- Alice only sees her own rows.
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-00000000000a';
do $$
begin
  assert (select count(*) from public.qr_codes) = 1, 'alice sees one code';
  assert (select short_slug from public.qr_codes) = 'AAAAAAA', 'alice sees her code';
  assert (select count(*) from public.scans) = 1, 'alice sees her scans';
  assert (select count(*) from public.profiles) = 1, 'alice sees her profile';
  assert (select count(*) from public.scan_daily_counts(array(select id from public.qr_codes), now() - interval '1 day')) = 1, 'daily counts';
  assert (select count(*) from public.review_kits) = 1, 'alice sees her kit';
  assert (select count(*) from public.menus) = 1, 'alice sees her menu';
  assert (select source from public.scan_source_counts((select id from public.qr_codes), now() - interval '1 day')) = 'counter-stand', 'source counts';
end $$;

-- Alice can change her destination and menu details but not bob's.
update public.qr_codes set destination_url = 'https://alice.example' where short_slug = 'AAAAAAA';
update public.qr_codes set destination_url = 'https://evil.example' where short_slug = 'BBBBBBB';
update public.menus set title = 'Alice menu';

-- Alice cannot create codes directly, write scans, or change her plan.
do $$
begin
  begin
    insert into public.qr_codes (workspace_id, short_slug, destination_url)
    values ((select public.my_workspace_ids() limit 1), 'CCCCCCC', 'https://x.example');
    raise exception 'insert should be denied';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.scans (qr_code_id) values ((select id from public.qr_codes limit 1));
    raise exception 'scan insert should be denied';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.review_kits (workspace_id, business_name, review_url)
    values ((select public.my_workspace_ids() limit 1), 'x', 'https://x.example');
    raise exception 'kit insert should be denied';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.menus (workspace_id, title) values ((select public.my_workspace_ids() limit 1), 'x');
    raise exception 'menu insert should be denied';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.menus set mode = 'builder';
    raise exception 'plan-gated menu columns should be denied';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.ensure_scans_partition('2030-01-01');
    raise exception 'partition function should be denied';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.profiles set plan = 'business';
    raise exception 'plan update should be denied';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.profiles set subscription_id = 'sub_x', billing_synced_at = now();
    raise exception 'billing update should be denied';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;
do $$
begin
  assert (select destination_url from public.qr_codes where short_slug = 'AAAAAAA') = 'https://alice.example', 'own update applied';
  assert (select destination_url from public.qr_codes where short_slug = 'BBBBBBB') = 'https://example.com', 'other update blocked';
  assert (select count(*) from public.menus where title = 'Alice menu') = 1, 'own menu update only';
end $$;

rollback;
\echo 'RLS tests passed'
