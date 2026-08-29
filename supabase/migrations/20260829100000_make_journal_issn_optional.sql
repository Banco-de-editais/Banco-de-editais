-- Allow manually managed journals without a known ISSN while preserving
-- uniqueness and non-blank validation whenever an ISSN is provided.

alter table public.journals
    alter column issn drop not null;

alter table public.journals
    drop constraint if exists journals_issn_not_blank_check;

alter table public.journals
    add constraint journals_issn_not_blank_check
    check (issn is null or btrim(issn) <> '') not valid;

alter table public.journals
    validate constraint journals_issn_not_blank_check;

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
        values (btrim(p_name), nullif(btrim(p_issn), ''), p_qualis)
        returning id into saved_id;
    else
        update public.journals
        set
            name = btrim(p_name),
            issn = nullif(btrim(p_issn), ''),
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
