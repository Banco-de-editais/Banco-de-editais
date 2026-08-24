create table public.institutions (
    id bigint generated always as identity primary key,
    name text not null unique
);

create table public.journals (
    id bigint generated always as identity primary key,
    name text not null,
    issn text not null unique,
    qualis text not null
);

create table public.indexers (
    id bigint generated always as identity primary key,
    name text not null unique
);

create table public.journal_indexers (
    journal_id bigint not null
        references public.journals(id)
        on delete cascade,

    indexer_id bigint not null
        references public.indexers(id)
        on delete cascade,

    primary key (journal_id, indexer_id)
);

create table public.edicts (
    id bigint generated always as identity primary key,

    institution_id bigint not null
        references public.institutions(id)
        on delete restrict,

    name text not null,
    published_at date,
    application_deadline date,
    source_url text,
    active boolean not null default true,
    created_at timestamptz not null default now(),

    constraint edicts_application_dates_check
        check (
            published_at is null
            or application_deadline is null
            or application_deadline >= published_at
        )
);

create table public.edict_rules (
    id bigint generated always as identity primary key,

    edict_id bigint not null
        references public.edicts(id)
        on delete cascade,

    type text not null,
    config jsonb not null default '{}'::jsonb,
    description text,
    source_page integer

    constraint edict_rules_source_page_check
        check (
            source_page is null
            or source_page > 0
        ),

    constraint edict_rules_config_object_check
        check (
            jsonb_typeof(config) = 'object'
        )
);
