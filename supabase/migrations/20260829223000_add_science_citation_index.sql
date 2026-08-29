-- The official PSU-MG annexes name Science Citation Index explicitly.
-- Keep it distinct from Web of Science and from the ambiguous legacy term ISI.

insert into public.indexers (code, name, description, exact_match_allowed)
values (
    'SCIENCE_CITATION_INDEX',
    'Science Citation Index',
    'Base/índice citado nominalmente em editais; não equivale automaticamente a Web of Science ou ISI legado.',
    true
)
on conflict (code) do nothing;

do $$
declare
    indexer_count integer;
begin
    select count(*) into indexer_count
      from public.indexers
     where code = 'SCIENCE_CITATION_INDEX'
       and exact_match_allowed = true;

    if indexer_count <> 1 then
        raise exception 'Science Citation Index was not registered as an exact, distinct indexer.';
    end if;
end
$$;
