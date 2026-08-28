-- CSV imports are previewed in the browser, but this function is the authoritative
-- write boundary. PostgreSQL runs a function call in one transaction: any exception
-- aborts every insert performed by this invocation.
create or replace function public.import_bulk_data(p_payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
    v_row jsonb;
    v_name text;
    v_issn text;
    v_compact_issn text;
    v_issn_sum integer;
    v_issn_check_digit text;
    v_qualis_text text;
    v_minimum_qualis public.qualis_level;
    v_qualis public.qualis_level;
    v_institution_name text;
    v_indexer_name text;
    v_source_url text;
    v_published_at date;
    v_application_deadline date;
    v_active boolean;
    v_institution_id bigint;
    v_journal_id bigint;
    v_edict_id bigint;
    v_indexer_id bigint;
    v_indexer_ids bigint[];
    v_line integer;
    v_institutions_created integer := 0;
    v_indexers_created integer := 0;
    v_journals_created integer := 0;
    v_journals_existing integer := 0;
    v_edicts_created integer := 0;
    v_edicts_existing integer := 0;
begin
    if not (select public.is_admin()) then
        raise exception 'Administrator access is required.' using errcode = '42501';
    end if;

    if jsonb_typeof(p_payload) <> 'object' then
        raise exception 'The import payload must be an object.' using errcode = '22023';
    end if;

    if coalesce(jsonb_typeof(p_payload -> 'institutions'), 'null') <> 'array'
       or coalesce(jsonb_typeof(p_payload -> 'indexers'), 'null') <> 'array'
       or coalesce(jsonb_typeof(p_payload -> 'journals'), 'null') <> 'array'
       or coalesce(jsonb_typeof(p_payload -> 'edicts'), 'null') <> 'array' then
        raise exception 'The import payload has an invalid structure.' using errcode = '22023';
    end if;

    -- Validate all records and all references before the first write. The same checks
    -- deliberately run here even though the UI already validated the CSV.
    if exists (
        select 1
        from jsonb_to_recordset(p_payload -> 'institutions') as item(name text)
        group by btrim(coalesce(name, ''))
        having count(*) > 1 or btrim(coalesce(name, '')) = ''
    ) then
        raise exception 'Institutions contain a blank or duplicate name.' using errcode = '22023';
    end if;

    if exists (
        select 1
        from jsonb_to_recordset(p_payload -> 'indexers') as item(name text)
        group by btrim(coalesce(name, ''))
        having count(*) > 1 or btrim(coalesce(name, '')) = ''
    ) then
        raise exception 'Indexers contain a blank or duplicate name.' using errcode = '22023';
    end if;

    if exists (
        select 1
        from jsonb_to_recordset(p_payload -> 'journals') as item(issn text)
        group by btrim(coalesce(issn, ''))
        having count(*) > 1 or btrim(coalesce(issn, '')) = ''
    ) then
        raise exception 'Journals contain a blank or duplicate ISSN.' using errcode = '22023';
    end if;

    for v_row in select value from jsonb_array_elements(p_payload -> 'journals') loop
        v_line := nullif(v_row ->> 'line_number', '')::integer;
        v_name := btrim(coalesce(v_row ->> 'name', ''));
        v_issn := btrim(coalesce(v_row ->> 'issn', ''));
        v_compact_issn := replace(upper(v_issn), '-', '');
        v_qualis_text := upper(btrim(coalesce(v_row ->> 'qualis', '')));

        -- Validate the ISSN check digit separately to keep the expression
        -- readable and avoid deeply nested parentheses.
        if v_compact_issn ~ '^[0-9]{7}[0-9X]$' then
            v_issn_sum :=
                (substr(v_compact_issn, 1, 1)::integer * 8) +
                (substr(v_compact_issn, 2, 1)::integer * 7) +
                (substr(v_compact_issn, 3, 1)::integer * 6) +
                (substr(v_compact_issn, 4, 1)::integer * 5) +
                (substr(v_compact_issn, 5, 1)::integer * 4) +
                (substr(v_compact_issn, 6, 1)::integer * 3) +
                (substr(v_compact_issn, 7, 1)::integer * 2);

            v_issn_check_digit :=
                case
                    when ((11 - (v_issn_sum % 11)) % 11) = 10 then 'X'
                    else ((11 - (v_issn_sum % 11)) % 11)::text
                end;
        else
            v_issn_check_digit := null;
        end if;

        if v_name = ''
           or v_issn = ''
           or v_qualis_text not in ('B4', 'B3', 'B2', 'B1', 'A4', 'A3', 'A2', 'A1')
           or v_compact_issn !~ '^[0-9]{7}[0-9X]$'
           or v_issn_check_digit <> substr(v_compact_issn, 8, 1) then
            raise exception 'Invalid journal at CSV line %.', coalesce(v_line, 0) using errcode = '22023';
        end if;

        if jsonb_typeof(coalesce(v_row -> 'indexer_names', 'null'::jsonb)) <> 'array' then
            raise exception 'Journal indexers are invalid at CSV line %.', coalesce(v_line, 0) using errcode = '22023';
        end if;

        for v_indexer_name in select btrim(value) from jsonb_array_elements_text(v_row -> 'indexer_names') loop
            if v_indexer_name = '' or (
                not exists (select 1 from public.indexers where name = v_indexer_name)
                and not exists (select 1 from jsonb_to_recordset(p_payload -> 'indexers') as incoming(name text) where btrim(incoming.name) = v_indexer_name)
            ) then
                raise exception 'Unknown indexer at CSV line %.', coalesce(v_line, 0) using errcode = '23503';
            end if;
        end loop;
    end loop;

    for v_row in select value from jsonb_array_elements(p_payload -> 'edicts') loop
        v_line := nullif(v_row ->> 'line_number', '')::integer;
        v_name := btrim(coalesce(v_row ->> 'name', ''));
        v_institution_name := btrim(coalesce(v_row ->> 'institution_name', ''));
        v_qualis_text := upper(btrim(coalesce(v_row ->> 'minimum_qualis', '')));

        if v_name = '' or v_institution_name = '' or (v_qualis_text <> '' and v_qualis_text not in ('B4', 'B3', 'B2', 'B1', 'A4', 'A3', 'A2', 'A1')) then
            raise exception 'Invalid edict at CSV line %.', coalesce(v_line, 0) using errcode = '22023';
        end if;

        if not exists (select 1 from public.institutions where name = v_institution_name)
           and not exists (select 1 from jsonb_to_recordset(p_payload -> 'institutions') as incoming(name text) where btrim(incoming.name) = v_institution_name) then
            raise exception 'Unknown institution at CSV line %.', coalesce(v_line, 0) using errcode = '23503';
        end if;

        if jsonb_typeof(coalesce(v_row -> 'indexer_names', 'null'::jsonb)) <> 'array' then
            raise exception 'Edict indexers are invalid at CSV line %.', coalesce(v_line, 0) using errcode = '22023';
        end if;

        if v_row ? 'active' and jsonb_typeof(v_row -> 'active') <> 'boolean' then
            raise exception 'Edict active value is invalid at CSV line %.', coalesce(v_line, 0) using errcode = '22023';
        end if;

        v_source_url := nullif(btrim(coalesce(v_row ->> 'source_url', '')), '');

        if v_source_url is not null and v_source_url !~* '^https?://' then
            raise exception 'Edict URL is invalid at CSV line %.', coalesce(v_line, 0) using errcode = '22023';
        end if;

        if (nullif(v_row ->> 'published_at', '') is not null and v_row ->> 'published_at' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
           or (nullif(v_row ->> 'application_deadline', '') is not null and v_row ->> 'application_deadline' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$') then
            raise exception 'Edict date is invalid at CSV line %.', coalesce(v_line, 0) using errcode = '22023';
        end if;

        begin
            v_published_at := nullif(v_row ->> 'published_at', '')::date;
            v_application_deadline := nullif(v_row ->> 'application_deadline', '')::date;
        exception when others then
            raise exception 'Edict date is invalid at CSV line %.', coalesce(v_line, 0) using errcode = '22023';
        end;

        if v_published_at is not null and v_application_deadline is not null and v_application_deadline < v_published_at then
            raise exception 'Edict deadline is before publication at CSV line %.', coalesce(v_line, 0) using errcode = '22023';
        end if;

        for v_indexer_name in select btrim(value) from jsonb_array_elements_text(v_row -> 'indexer_names') loop
            if v_indexer_name = '' or (
                not exists (select 1 from public.indexers where name = v_indexer_name)
                and not exists (select 1 from jsonb_to_recordset(p_payload -> 'indexers') as incoming(name text) where btrim(incoming.name) = v_indexer_name)
            ) then
                raise exception 'Unknown indexer at CSV line %.', coalesce(v_line, 0) using errcode = '23503';
            end if;
        end loop;
    end loop;

    insert into public.institutions (name)
    select btrim(name)
    from jsonb_to_recordset(p_payload -> 'institutions') as item(name text)
    on conflict (name) do nothing;
    get diagnostics v_institutions_created = row_count;

    insert into public.indexers (name)
    select btrim(name)
    from jsonb_to_recordset(p_payload -> 'indexers') as item(name text)
    on conflict (name) do nothing;
    get diagnostics v_indexers_created = row_count;

    for v_row in select value from jsonb_array_elements(p_payload -> 'journals') loop
        v_name := btrim(v_row ->> 'name');
        v_issn := btrim(v_row ->> 'issn');
        v_qualis := upper(btrim(v_row ->> 'qualis'))::public.qualis_level;
        v_journal_id := null;

        insert into public.journals (name, issn, qualis)
        values (v_name, v_issn, v_qualis)
        on conflict (issn) do nothing
        returning id into v_journal_id;

        if v_journal_id is null then
            v_journals_existing := v_journals_existing + 1;
        else
            v_journals_created := v_journals_created + 1;

            for v_indexer_name in select distinct btrim(value) from jsonb_array_elements_text(v_row -> 'indexer_names') loop
                select id into v_indexer_id from public.indexers where name = v_indexer_name;

                insert into public.journal_indexers (journal_id, indexer_id)
                values (v_journal_id, v_indexer_id)
                on conflict do nothing;
            end loop;
        end if;
    end loop;

    for v_row in select value from jsonb_array_elements(p_payload -> 'edicts') loop
        v_name := btrim(v_row ->> 'name');
        v_institution_name := btrim(v_row ->> 'institution_name');
        v_source_url := nullif(btrim(coalesce(v_row ->> 'source_url', '')), '');
        v_published_at := nullif(v_row ->> 'published_at', '')::date;
        v_application_deadline := nullif(v_row ->> 'application_deadline', '')::date;
        v_active := coalesce((v_row ->> 'active')::boolean, true);
        v_qualis_text := upper(btrim(coalesce(v_row ->> 'minimum_qualis', '')));
        v_minimum_qualis := nullif(v_qualis_text, '')::public.qualis_level;

        select id into v_institution_id
        from public.institutions
        where name = v_institution_name;

        v_indexer_ids := '{}';

        for v_indexer_name in select distinct btrim(value) from jsonb_array_elements_text(v_row -> 'indexer_names') loop
            select id into v_indexer_id
            from public.indexers
            where name = v_indexer_name;

            v_indexer_ids := array_append(v_indexer_ids, v_indexer_id);
        end loop;

        select array_agg(distinct id order by id)
        into v_indexer_ids
        from unnest(v_indexer_ids) as selected(id);

        v_indexer_ids := coalesce(v_indexer_ids, '{}'::bigint[]);

        -- edicts have no UNIQUE constraint. A full-content fingerprint is an explicit,
        -- conservative import identity; the advisory lock also closes concurrent imports.
        perform pg_advisory_xact_lock(
            hashtext(
                concat_ws(
                    '|',
                    v_institution_id,
                    v_name,
                    v_published_at,
                    v_application_deadline,
                    v_source_url,
                    v_active,
                    v_minimum_qualis,
                    array_to_string(v_indexer_ids, ',')
                )
            )
        );

        select e.id
        into v_edict_id
        from public.edicts e
        where e.institution_id = v_institution_id
          and e.name = v_name
          and e.published_at is not distinct from v_published_at
          and e.application_deadline is not distinct from v_application_deadline
          and e.source_url is not distinct from v_source_url
          and e.active = v_active
          and e.minimum_qualis is not distinct from v_minimum_qualis
          and cardinality(v_indexer_ids) = (
              select count(*)
              from public.edict_indexers ei
              where ei.edict_id = e.id
          )
          and not exists (
              select 1
              from public.edict_indexers ei
              where ei.edict_id = e.id
                and not (ei.indexer_id = any(v_indexer_ids))
          )
        limit 1;

        if v_edict_id is not null then
            v_edicts_existing := v_edicts_existing + 1;
        else
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
                v_institution_id,
                v_name,
                v_published_at,
                v_application_deadline,
                v_source_url,
                v_active,
                v_minimum_qualis
            )
            returning id into v_edict_id;

            insert into public.edict_indexers (edict_id, indexer_id)
            select v_edict_id, selected.id
            from unnest(v_indexer_ids) as selected(id)
            on conflict do nothing;

            v_edicts_created := v_edicts_created + 1;
        end if;
    end loop;

    return jsonb_build_object(
        'institutions_created', v_institutions_created,
        'indexers_created', v_indexers_created,
        'journals_created', v_journals_created,
        'journals_existing', v_journals_existing,
        'edicts_created', v_edicts_created,
        'edicts_existing', v_edicts_existing
    );
end;
$$;

revoke execute on function public.import_bulk_data(jsonb) from public;
revoke execute on function public.import_bulk_data(jsonb) from anon;
grant execute on function public.import_bulk_data(jsonb) to authenticated;

