create index idx_edicts_institution_id
    on public.edicts(institution_id);

create index idx_edicts_active
    on public.edicts(active);

create index idx_edicts_application_deadline
    on public.edicts(application_deadline);

create index idx_edicts_minimum_qualis
    on public.edicts(minimum_qualis)
    where minimum_qualis is not null;

create index idx_journal_indexers_indexer_id
    on public.journal_indexers(indexer_id);

create index idx_edict_indexers_indexer_id
    on public.edict_indexers(indexer_id);
