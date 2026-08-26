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

create table public.institutions (
    id bigint generated always as identity primary key,
    name text not null unique,

    constraint institutions_name_not_blank_check
        check (btrim(name) <> '')
);

create table public.journals (
    id bigint generated always as identity primary key,
    name text not null,
    issn text not null unique,
    qualis public.qualis_level not null,

    constraint journals_name_not_blank_check
        check (btrim(name) <> ''),

    constraint journals_issn_not_blank_check
        check (btrim(issn) <> '')
);

create table public.indexers (
    id bigint generated always as identity primary key,
    name text not null unique,

    constraint indexers_name_not_blank_check
        check (btrim(name) <> '')
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
    minimum_qualis public.qualis_level,
    created_at timestamptz not null default now(),

    constraint edicts_name_not_blank_check
        check (btrim(name) <> ''),

    constraint edicts_application_dates_check
        check (
            published_at is null
            or application_deadline is null
            or application_deadline >= published_at
        ),

    constraint edicts_source_url_http_check
        check (
            source_url is null
            or source_url ~* '^https?://'
        )
);

create table public.edict_indexers (
    edict_id bigint not null
        references public.edicts(id)
        on delete cascade,

    indexer_id bigint not null
        references public.indexers(id)
        on delete cascade,

    primary key (edict_id, indexer_id)
);
