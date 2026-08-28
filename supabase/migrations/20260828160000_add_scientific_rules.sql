-- Additive operational model for the audited CORE workbook and its scientific mapping.
-- Existing manually managed institutions, journals, indexers, and edicts remain untouched.

alter table public.institutions
    add column if not exists source_institution_id text,
    add column if not exists normalized_name text,
    add column if not exists abbreviation text,
    add column if not exists state_code text,
    add column if not exists confirmation_level text,
    add column if not exists source_notes text;

alter table public.institutions
    add constraint institutions_source_institution_id_unique
    unique (source_institution_id);

alter table public.institutions
    add constraint institutions_source_institution_id_not_blank_check
    check (source_institution_id is null or btrim(source_institution_id) <> '') not valid;

alter table public.indexers
    add column if not exists code text,
    add column if not exists description text,
    add column if not exists exact_match_allowed boolean not null default true;

alter table public.indexers
    add constraint indexers_code_unique
    unique (code);

alter table public.indexers
    add constraint indexers_code_not_blank_check
    check (code is null or btrim(code) <> '') not valid;

alter table public.edicts
    add column if not exists source_process_id text,
    add column if not exists entry_year integer,
    add column if not exists publication_year integer,
    add column if not exists geographic_scope text,
    add column if not exists state_reference text,
    add column if not exists region text,
    add column if not exists exam_board text,
    add column if not exists access_type text,
    add column if not exists specialties_text text,
    add column if not exists curriculum_analysis_status text,
    add column if not exists curriculum_weight_percent numeric,
    add column if not exists curriculum_max_score numeric,
    add column if not exists phase_nature text,
    add column if not exists validity_status text,
    add column if not exists document_status text,
    add column if not exists validation_status text,
    add column if not exists confirmation_level text,
    add column if not exists consulted_at date,
    add column if not exists coverage_status text,
    add column if not exists source_notes text;

alter table public.edicts
    add constraint edicts_source_process_id_unique
    unique (source_process_id);

alter table public.edicts
    add constraint edicts_source_process_id_not_blank_check
    check (source_process_id is null or btrim(source_process_id) <> '') not valid;

alter table public.edicts
    add constraint edicts_entry_year_check
    check (entry_year is null or entry_year between 2000 and 2200) not valid;

alter table public.edicts
    add constraint edicts_publication_year_check
    check (publication_year is null or publication_year between 2000 and 2200) not valid;

create table public.scientific_import_batches (
    id bigint generated always as identity primary key,
    batch_key text not null unique,
    core_version text not null,
    source_file_name text not null,
    source_sha256 text not null,
    mapping_release text not null,
    mapping_sha256 text not null,
    status text not null,
    counts jsonb not null default '{}'::jsonb,
    started_at timestamptz not null default now(),
    completed_at timestamptz,

    constraint scientific_import_batches_batch_key_not_blank_check
        check (btrim(batch_key) <> ''),
    constraint scientific_import_batches_status_check
        check (status in ('PREPARED', 'APPLIED', 'FAILED')),
    constraint scientific_import_batches_source_sha256_check
        check (source_sha256 ~ '^[0-9a-f]{64}$'),
    constraint scientific_import_batches_mapping_sha256_check
        check (mapping_sha256 ~ '^[0-9a-f]{64}$')
);

create table public.edict_institutions (
    id bigint generated always as identity primary key,
    edict_id bigint not null
        references public.edicts(id)
        on delete cascade,
    institution_id bigint not null
        references public.institutions(id)
        on delete restrict,
    source_link_id text not null unique,
    role text not null,
    link_status text not null,
    common_rule_or_exception text,
    consulted_at date,
    confirmation_level text,
    source_notes text,

    constraint edict_institutions_pair_unique
        unique (edict_id, institution_id),
    constraint edict_institutions_source_link_not_blank_check
        check (btrim(source_link_id) <> ''),
    constraint edict_institutions_role_not_blank_check
        check (btrim(role) <> '')
);

create table public.scientific_rules (
    id bigint generated always as identity primary key,
    import_batch_id bigint not null
        references public.scientific_import_batches(id)
        on delete restrict,
    edict_id bigint not null
        references public.edicts(id)
        on delete restrict,
    source_rule_id text not null,
    source_process_id text not null,
    release_code text not null,
    core_version text not null,
    family text not null,
    production_type text not null,
    accepted_production_types jsonb not null default '[]'::jsonb,
    initial_eligibility text not null,
    mapping_status text not null,
    published_for_engine boolean not null,
    mapping_confidence text not null,
    matrix_row integer,
    scope jsonb not null default '{}'::jsonb,
    condition_groups jsonb not null default '[]'::jsonb,
    score_formula jsonb,
    indexing_requirements jsonb not null default '[]'::jsonb,
    qualis_requirement jsonb,
    authorship_requirement jsonb,
    document_requirements jsonb not null default '[]'::jsonb,
    date_window jsonb,
    presentation_formats jsonb not null default '[]'::jsonb,
    event_scopes jsonb not null default '[]'::jsonb,
    publication_scopes jsonb not null default '[]'::jsonb,
    event_organizer jsonb,
    subject_area_requirement jsonb,
    evidence jsonb not null default '{}'::jsonb,
    unknown_data jsonb not null default '[]'::jsonb,
    warnings jsonb not null default '[]'::jsonb,
    review jsonb not null default '{}'::jsonb,
    source_metadata jsonb not null default '{}'::jsonb,
    mapping_hash text not null,
    created_at timestamptz not null default now(),

    constraint scientific_rules_release_source_unique
        unique (release_code, source_rule_id),
    constraint scientific_rules_source_rule_not_blank_check
        check (btrim(source_rule_id) <> ''),
    constraint scientific_rules_source_process_not_blank_check
        check (btrim(source_process_id) <> ''),
    constraint scientific_rules_family_check
        check (family in (
            'ARTIGO_PUBLICACAO',
            'APRESENTACAO_EVENTO',
            'RESUMO_ANAIS',
            'LIVRO_CAPITULO',
            'PRODUCAO_CIENTIFICA_AMPLA'
        )),
    constraint scientific_rules_mapping_hash_check
        check (mapping_hash ~ '^[0-9a-f]{64}$'),
    constraint scientific_rules_accepted_types_array_check
        check (jsonb_typeof(accepted_production_types) = 'array'),
    constraint scientific_rules_condition_groups_array_check
        check (jsonb_typeof(condition_groups) = 'array'),
    constraint scientific_rules_indexing_array_check
        check (jsonb_typeof(indexing_requirements) = 'array'),
    constraint scientific_rules_document_requirements_array_check
        check (jsonb_typeof(document_requirements) = 'array'),
    constraint scientific_rules_unknown_data_array_check
        check (jsonb_typeof(unknown_data) = 'array'),
    constraint scientific_rules_warnings_array_check
        check (jsonb_typeof(warnings) = 'array')
);

create index idx_edicts_coverage_status
    on public.edicts(coverage_status)
    where coverage_status is not null;

create index idx_edict_institutions_edict_id
    on public.edict_institutions(edict_id);

create index idx_edict_institutions_institution_id
    on public.edict_institutions(institution_id);

create index idx_scientific_rules_edict_id
    on public.scientific_rules(edict_id);

create index idx_scientific_rules_published_family
    on public.scientific_rules(published_for_engine, family);

create index idx_scientific_rules_source_process_id
    on public.scientific_rules(source_process_id);

alter table public.scientific_import_batches enable row level security;
alter table public.edict_institutions enable row level security;
alter table public.scientific_rules enable row level security;

create policy "Active users can read scientific import batches"
on public.scientific_import_batches
for select
to authenticated
using ((select public.is_active_account()));

create policy "Active users can read edict institutions"
on public.edict_institutions
for select
to authenticated
using ((select public.is_active_account()));

create policy "Active users can read scientific rules"
on public.scientific_rules
for select
to authenticated
using ((select public.is_active_account()));

revoke all on table public.scientific_import_batches from anon;
revoke all on table public.edict_institutions from anon;
revoke all on table public.scientific_rules from anon;

grant select on table public.scientific_import_batches to authenticated;
grant select on table public.edict_institutions to authenticated;
grant select on table public.scientific_rules to authenticated;

revoke all on sequence public.scientific_import_batches_id_seq from anon;
revoke all on sequence public.edict_institutions_id_seq from anon;
revoke all on sequence public.scientific_rules_id_seq from anon;
