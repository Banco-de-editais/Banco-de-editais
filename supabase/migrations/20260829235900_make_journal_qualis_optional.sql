-- Allow manually managed journals without a known Qualis classification.
-- Existing Qualis values and the enum validation remain unchanged.

alter table public.journals
    alter column qualis drop not null;

comment on column public.journals.qualis is
    'Optional Qualis classification. Null means that no classification was informed.';
