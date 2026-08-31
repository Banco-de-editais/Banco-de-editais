-- Read-only verification of the frozen curricular-planning v1 release.
-- Run this entire file as ONE db query --file request. Do not use a runner
-- that splits statements and continues after errors: the final SELECT is a
-- success marker only because a raised assertion stops the whole request.
-- No real identity, profile, auth.users row, credential, or user data is read.
-- SET LOCAL claims are synthetic and are discarded by ROLLBACK.

begin transaction read only;
set local row_security = on;

do $verify_permissions$
declare
  table_name text;
  table_oid regclass;
  sequence_name text;
begin
  foreach table_name in array array['public.curriculum_releases', 'public.curriculum_rules']
  loop
    table_oid := to_regclass(table_name);
    if table_oid is null then
      raise exception 'CURRICULUM_VERIFY: expected table is missing: %', table_name;
    end if;

    if not exists (
      select 1 from pg_catalog.pg_class
      where oid = table_oid and relrowsecurity
    ) then
      raise exception 'CURRICULUM_VERIFY: RLS is not enabled on %', table_name;
    end if;

    if not has_table_privilege('authenticated', table_oid, 'SELECT') then
      raise exception 'CURRICULUM_VERIFY: authenticated lacks SELECT on %', table_name;
    end if;

    -- Check effective grants, including privileges inherited through PUBLIC.
    if has_table_privilege('authenticated', table_oid, 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
      or has_any_column_privilege('authenticated', table_oid, 'INSERT,UPDATE,REFERENCES') then
      raise exception 'CURRICULUM_VERIFY: authenticated has a non-SELECT privilege on %', table_name;
    end if;

    if has_table_privilege('anon', table_oid, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
      or has_any_column_privilege('anon', table_oid, 'SELECT,INSERT,UPDATE,REFERENCES') then
      raise exception 'CURRICULUM_VERIFY: anon has a table or column privilege on %', table_name;
    end if;
  end loop;

  sequence_name := pg_get_serial_sequence('public.curriculum_rules', 'id');
  if sequence_name is null then
    raise exception 'CURRICULUM_VERIFY: curriculum rule identity sequence is missing';
  end if;
  if has_sequence_privilege('authenticated', sequence_name, 'USAGE,SELECT,UPDATE')
    or has_sequence_privilege('anon', sequence_name, 'USAGE,SELECT,UPDATE') then
    raise exception 'CURRICULUM_VERIFY: client roles have privileges on the identity sequence';
  end if;
end;
$verify_permissions$;

set local role authenticated;
set local request.jwt.claims = '{"role":"authenticated","app_metadata":{"account_status":"active","role":"user"}}';

do $verify_active$
declare
  expected_code constant text := 'CURRICULUM-PLANNING-2026-08-30-v1';
  expected_hash constant text := '1cb180bee1b01772f61cf263140f245611dc684407842392c5e7293823cfc1f5';
  visible_rules bigint;
  visible_current_releases bigint;
  confirmed_rules bigint;
  review_rules bigint;
  distinct_processes bigint;
  distinct_edicts bigint;
begin
  if current_user <> 'authenticated' or public.is_active_account() is distinct from true then
    raise exception 'CURRICULUM_VERIFY: synthetic active account is not in effect';
  end if;

  select count(*) into visible_current_releases
  from public.curriculum_releases where is_current;
  if visible_current_releases <> 1 then
    raise exception 'CURRICULUM_VERIFY: active account sees % current releases; expected 1', visible_current_releases;
  end if;

  if not exists (
    select 1 from public.curriculum_releases
    where code = expected_code
      and is_current
      and source_sha256 = expected_hash
      and checked_at = date '2026-08-30'
      and rule_count = 41
      and edict_count = 7
  ) then
    raise exception 'CURRICULUM_VERIFY: release metadata or source SHA-256 differs from frozen v1';
  end if;

  select count(*) into visible_rules from public.curriculum_rules;
  if visible_rules <> 41 then
    raise exception 'CURRICULUM_VERIFY: active account sees % rules; expected 41', visible_rules;
  end if;

  select
    count(*) filter (where status = 'POINTS_CONFIRMED'),
    count(*) filter (where status = 'REVIEW_REQUIRED'),
    count(distinct source_process_id),
    count(distinct edict_id)
  into confirmed_rules, review_rules, distinct_processes, distinct_edicts
  from public.curriculum_rules
  where release_code = expected_code;

  if confirmed_rules <> 31 or review_rules <> 10
    or distinct_processes <> 7 or distinct_edicts <> 7 then
    raise exception 'CURRICULUM_VERIFY: current release counts differ from 31 confirmed + 10 review across 7 processes/edicts';
  end if;

  if exists (
    select 1
    from public.curriculum_rules r
    left join public.edicts e on e.id = r.edict_id
    where r.release_code = expected_code
      and (
        e.id is null
        or e.source_process_id is distinct from r.source_process_id
        or e.entry_year is null
        or e.entry_year < 2025
      )
  ) then
    raise exception 'CURRICULUM_VERIFY: rule/edict link is inconsistent or entry year is missing/before 2025';
  end if;

  if exists (
    select 1 from public.curriculum_rules
    where release_code <> expected_code
      or checked_at <> date '2026-08-30'
      or record_hash !~ '^[0-9a-f]{64}$'
  ) then
    raise exception 'CURRICULUM_VERIFY: unexpected release/date or malformed record hash';
  end if;
end;
$verify_active$;

set local request.jwt.claims = '{"role":"authenticated","app_metadata":{"account_status":"pending","role":"user"}}';

do $verify_pending$
begin
  if current_user <> 'authenticated' or public.is_active_account() is distinct from false then
    raise exception 'CURRICULUM_VERIFY: synthetic pending account is not in effect';
  end if;
  if exists (select 1 from public.curriculum_releases)
    or exists (select 1 from public.curriculum_rules) then
    raise exception 'CURRICULUM_VERIFY: pending account can read curricular data';
  end if;
end;
$verify_pending$;

set local request.jwt.claims = '{"role":"authenticated","app_metadata":{"account_status":"blocked","role":"user"}}';

do $verify_blocked$
begin
  if current_user <> 'authenticated' or public.is_active_account() is distinct from false then
    raise exception 'CURRICULUM_VERIFY: synthetic blocked account is not in effect';
  end if;
  if exists (select 1 from public.curriculum_releases)
    or exists (select 1 from public.curriculum_rules) then
    raise exception 'CURRICULUM_VERIFY: blocked account can read curricular data';
  end if;
end;
$verify_blocked$;

rollback;

-- Returned only when every assertion above completed successfully in this request.
select
  true as verified,
  'CURRICULUM-PLANNING-2026-08-30-v1'::text as release_code,
  41 as active_rules,
  1 as active_current_releases,
  31 as points_confirmed,
  10 as review_required,
  7 as linked_edicts,
  0 as pending_visible_rows,
  0 as blocked_visible_rows,
  true as rls_enabled,
  true as authenticated_select_only,
  true as anon_and_sequence_access_denied,
  true as transaction_rolled_back;
