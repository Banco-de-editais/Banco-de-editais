-- Separate, additive source catalogue. This is NOT a CV compatibility engine.
-- No existing journal, edict or scientific rule is modified.

create table public.curriculum_releases (
    code text primary key check (btrim(code) <> ''),
    description text not null check (btrim(description) <> ''),
    checked_at date not null,
    source_sha256 text not null check (source_sha256 ~ '^[0-9a-f]{64}$'),
    rule_count integer not null check (rule_count > 0),
    edict_count integer not null check (edict_count > 0),
    is_current boolean not null default false,
    created_at timestamptz not null default now()
);

create unique index curriculum_releases_one_current
    on public.curriculum_releases (is_current) where is_current;

create table public.curriculum_rules (
    id bigint generated always as identity primary key,
    release_code text not null references public.curriculum_releases(code) on delete restrict,
    edict_id bigint not null references public.edicts(id) on delete restrict,
    source_process_id text not null check (btrim(source_process_id) <> ''),
    source_rule_id text not null check (btrim(source_rule_id) <> ''),
    activity_codes text[] not null,
    title text not null check (btrim(title) <> ''),
    access_type text not null check (access_type in ('DIRECT', 'PREREQUISITE', 'BOTH')),
    specialties_text text,
    source_item text not null check (btrim(source_item) <> ''),
    status text not null check (status in ('POINTS_CONFIRMED', 'REVIEW_REQUIRED', 'NO_POINTS')),
    scoring jsonb not null check (jsonb_typeof(scoring) = 'object'),
    shared_caps jsonb not null default '[]'::jsonb check (jsonb_typeof(shared_caps) = 'array'),
    requirements jsonb not null default '[]'::jsonb check (jsonb_typeof(requirements) = 'array'),
    caveats jsonb not null default '[]'::jsonb check (jsonb_typeof(caveats) = 'array'),
    evidence jsonb not null check (jsonb_typeof(evidence) = 'array' and jsonb_array_length(evidence) > 0),
    checked_at date not null,
    record_hash text not null check (record_hash ~ '^[0-9a-f]{64}$'),
    created_at timestamptz not null default now(),
    unique (release_code, source_rule_id),
    constraint curriculum_activity_codes_check check (
      cardinality(activity_codes) > 0 and array_position(activity_codes, null) is null
      and activity_codes <@ array['TEACHING_ASSISTANT','RESEARCH','EXTENSION_PROJECT',
        'EVENT_SPEAKER','EVENT_ORGANIZER','BOOK_ORGANIZER']::text[]
    ),
    constraint curriculum_scoring_type_check check (
      scoring ? 'type' and scoring->>'type' in ('PER_UNIT','FIXED','TIERS','MAX_ONLY','MANUAL')
    )
);

create index curriculum_rules_release_edict on public.curriculum_rules(release_code, edict_id);
create index curriculum_rules_edict on public.curriculum_rules(edict_id);
create index curriculum_rules_activity_codes on public.curriculum_rules using gin(activity_codes);

alter table public.curriculum_releases enable row level security;
alter table public.curriculum_rules enable row level security;

create policy "Active accounts can read curriculum releases"
on public.curriculum_releases for select to authenticated
using ((select public.is_active_account()));

create policy "Active accounts can read curriculum rules"
on public.curriculum_rules for select to authenticated
using ((select public.is_active_account()));

revoke all on public.curriculum_releases, public.curriculum_rules from anon, authenticated;
revoke all on sequence public.curriculum_rules_id_seq from anon, authenticated;
grant select on public.curriculum_releases, public.curriculum_rules to authenticated;

comment on table public.curriculum_rules is
  'Versioned source rules for curricular planning. Listed points are conditional on the official requirements; never a guarantee of personal eligibility.';
comment on column public.curriculum_rules.shared_caps is
  'Official shared item/section caps. Multiple activity filters must not duplicate the rule or sum these caps.';
comment on column public.curriculum_rules.status is
  'Certainty about the source rule, not compatibility of an individual CV. Missing coverage is never NO_POINTS.';
