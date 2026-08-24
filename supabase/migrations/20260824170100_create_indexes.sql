create index idx_edicts_institution_id
    on public.edicts(institution_id);

create index idx_edicts_active
    on public.edicts(active);

create index idx_edicts_application_deadline
    on public.edicts(application_deadline);

create index idx_edict_rules_edict_id
    on public.edict_rules(edict_id);

create index idx_journal_indexers_indexer_id
    on public.journal_indexers(indexer_id);
