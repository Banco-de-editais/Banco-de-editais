-- Keeps previously initialized projects compatible with the new fixed rule model.
-- On a fresh database, the structural statements below are intentionally idempotent.

do $$
begin
    if not exists (
        select 1
        from pg_type
        join pg_namespace on pg_namespace.oid = pg_type.typnamespace
        where pg_namespace.nspname = 'public'
          and pg_type.typname = 'qualis_level'
    ) then
        create type public.qualis_level as enum (
            'B4',
            'B3',
            'B2',
            'B1',
            'A4',
            'A3',
            'A2',
            'A1'
        );
    end if;
end;
$$;

do $$
begin
    if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'journals'
          and column_name = 'qualis'
          and data_type = 'text'
    ) then
        if exists (
            select 1
            from public.journals
            where upper(btrim(qualis::text)) not in ('B4', 'B3', 'B2', 'B1', 'A4', 'A3', 'A2', 'A1')
        ) then
            raise exception 'Existing journals contain unsupported Qualis values.';
        end if;

        alter table public.journals
            alter column qualis type public.qualis_level
            using upper(btrim(qualis::text))::public.qualis_level;
    end if;
end;
$$;

alter table public.edicts
    add column if not exists minimum_qualis public.qualis_level;

create table if not exists public.edict_indexers (
    edict_id bigint not null
        references public.edicts(id)
        on delete cascade,

    indexer_id bigint not null
        references public.indexers(id)
        on delete cascade,

    primary key (edict_id, indexer_id)
);

do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'institutions_name_not_blank_check'
          and conrelid = 'public.institutions'::regclass
    ) then
        alter table public.institutions
            add constraint institutions_name_not_blank_check
            check (btrim(name) <> '') not valid;
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'journals_name_not_blank_check'
          and conrelid = 'public.journals'::regclass
    ) then
        alter table public.journals
            add constraint journals_name_not_blank_check
            check (btrim(name) <> '') not valid;
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'journals_issn_not_blank_check'
          and conrelid = 'public.journals'::regclass
    ) then
        alter table public.journals
            add constraint journals_issn_not_blank_check
            check (btrim(issn) <> '') not valid;
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'indexers_name_not_blank_check'
          and conrelid = 'public.indexers'::regclass
    ) then
        alter table public.indexers
            add constraint indexers_name_not_blank_check
            check (btrim(name) <> '') not valid;
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'edicts_name_not_blank_check'
          and conrelid = 'public.edicts'::regclass
    ) then
        alter table public.edicts
            add constraint edicts_name_not_blank_check
            check (btrim(name) <> '') not valid;
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'edicts_source_url_http_check'
          and conrelid = 'public.edicts'::regclass
    ) then
        alter table public.edicts
            add constraint edicts_source_url_http_check
            check (source_url is null or source_url ~* '^https?://') not valid;
    end if;
end;
$$;

create index if not exists idx_edicts_minimum_qualis
    on public.edicts(minimum_qualis)
    where minimum_qualis is not null;

create index if not exists idx_edict_indexers_indexer_id
    on public.edict_indexers(indexer_id);

alter table public.edict_indexers enable row level security;

drop policy if exists "Authenticated users can read edict indexers" on public.edict_indexers;
create policy "Authenticated users can read edict indexers"
on public.edict_indexers
for select
to authenticated
using (true);

drop policy if exists "Admins can insert edict indexers" on public.edict_indexers;
create policy "Admins can insert edict indexers"
on public.edict_indexers
for insert
to authenticated
with check ((select public.is_admin()));

drop policy if exists "Admins can update edict indexers" on public.edict_indexers;
create policy "Admins can update edict indexers"
on public.edict_indexers
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins can delete edict indexers" on public.edict_indexers;
create policy "Admins can delete edict indexers"
on public.edict_indexers
for delete
to authenticated
using ((select public.is_admin()));

revoke all on table public.edict_indexers from anon;
grant select, insert, update, delete on table public.edict_indexers to authenticated;

revoke usage on type public.qualis_level from anon;
grant usage on type public.qualis_level to authenticated;

-- The generic rules are no longer active. Existing rows are retained outside the API
-- so an already initialized project does not lose data during the transition.
do $$
begin
    if to_regclass('public.edict_rules') is not null
       and to_regclass('public.legacy_edict_rules') is null then
        alter table public.edict_rules rename to legacy_edict_rules;
    end if;
end;
$$;

do $$
begin
    if to_regclass('public.edict_rules') is not null then
        revoke all on table public.edict_rules from anon;
        revoke all on table public.edict_rules from authenticated;
    end if;

    if to_regclass('public.legacy_edict_rules') is not null then
        revoke all on table public.legacy_edict_rules from anon;
        revoke all on table public.legacy_edict_rules from authenticated;
    end if;

    if to_regclass('public.edict_rules_id_seq') is not null then
        revoke all on sequence public.edict_rules_id_seq from anon;
        revoke all on sequence public.edict_rules_id_seq from authenticated;
    end if;
end;
$$;

create or replace function public.save_journal(
    p_id bigint,
    p_name text,
    p_issn text,
    p_qualis public.qualis_level,
    p_indexer_ids bigint[]
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
    saved_id bigint;
begin
    if not (select public.is_admin()) then
        raise exception 'Administrator access is required.'
            using errcode = '42501';
    end if;

    if p_id is null then
        insert into public.journals (name, issn, qualis)
        values (btrim(p_name), btrim(p_issn), p_qualis)
        returning id into saved_id;
    else
        update public.journals
        set
            name = btrim(p_name),
            issn = btrim(p_issn),
            qualis = p_qualis
        where id = p_id
        returning id into saved_id;

        if saved_id is null then
            raise exception 'Journal not found.'
                using errcode = 'P0002';
        end if;
    end if;

    delete from public.journal_indexers
    where journal_id = saved_id;

    insert into public.journal_indexers (journal_id, indexer_id)
    select saved_id, selected.indexer_id
    from (
        select distinct indexer_id
        from unnest(coalesce(p_indexer_ids, '{}'::bigint[])) as selected_value(indexer_id)
        where indexer_id is not null
    ) as selected;

    return saved_id;
end;
$$;

revoke execute on function public.save_journal(bigint, text, text, public.qualis_level, bigint[]) from public;
revoke execute on function public.save_journal(bigint, text, text, public.qualis_level, bigint[]) from anon;
grant execute on function public.save_journal(bigint, text, text, public.qualis_level, bigint[]) to authenticated;

create or replace function public.save_edict(
    p_id bigint,
    p_institution_id bigint,
    p_name text,
    p_published_at date,
    p_application_deadline date,
    p_source_url text,
    p_active boolean,
    p_minimum_qualis public.qualis_level,
    p_indexer_ids bigint[]
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
    saved_id bigint;
begin
    if not (select public.is_admin()) then
        raise exception 'Administrator access is required.'
            using errcode = '42501';
    end if;

    if p_id is null then
        insert into public.edicts (
            institution_id,
            name,
            published_at,
            application_deadline,
            source_url,
            active,
            minimum_qualis
        )
        values (
            p_institution_id,
            btrim(p_name),
            p_published_at,
            p_application_deadline,
            nullif(btrim(p_source_url), ''),
            coalesce(p_active, true),
            p_minimum_qualis
        )
        returning id into saved_id;
    else
        update public.edicts
        set
            institution_id = p_institution_id,
            name = btrim(p_name),
            published_at = p_published_at,
            application_deadline = p_application_deadline,
            source_url = nullif(btrim(p_source_url), ''),
            active = coalesce(p_active, true),
            minimum_qualis = p_minimum_qualis
        where id = p_id
        returning id into saved_id;

        if saved_id is null then
            raise exception 'Edict not found.'
                using errcode = 'P0002';
        end if;
    end if;

    delete from public.edict_indexers
    where edict_id = saved_id;

    insert into public.edict_indexers (edict_id, indexer_id)
    select saved_id, selected.indexer_id
    from (
        select distinct indexer_id
        from unnest(coalesce(p_indexer_ids, '{}'::bigint[])) as selected_value(indexer_id)
        where indexer_id is not null
    ) as selected;

    return saved_id;
end;
$$;

revoke execute on function public.save_edict(bigint, bigint, text, date, date, text, boolean, public.qualis_level, bigint[]) from public;
revoke execute on function public.save_edict(bigint, bigint, text, date, date, text, boolean, public.qualis_level, bigint[]) from anon;
grant execute on function public.save_edict(bigint, bigint, text, date, date, text, boolean, public.qualis_level, bigint[]) to authenticated;
