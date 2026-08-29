-- Preserve historical records while removing entry years through 2024 from
-- the active product scope. The application also applies the 2025 cutoff when
-- loading consultation data, so clearing the "active" filter cannot reveal
-- these archived processes.

update public.edicts
set
    active = false,
    source_notes = case
      when coalesce(source_notes, '') like '%Arquivado pelo recorte temporal do produto: somente 2025 em diante.%'
        then source_notes
      else concat_ws(' | ', nullif(source_notes, ''), 'Arquivado pelo recorte temporal do produto: somente 2025 em diante.')
    end
where entry_year < 2025;

do $$
begin
    if exists (
      select 1
      from public.edicts
      where entry_year < 2025
        and active
    ) then
      raise exception 'Há editais anteriores a 2025 ainda ativos.';
    end if;
end;
$$;
