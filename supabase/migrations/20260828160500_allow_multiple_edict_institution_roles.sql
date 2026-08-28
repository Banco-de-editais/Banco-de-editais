-- A single institution can appear in the same process with distinct audited roles.
-- Preserve both source links; uniqueness remains enforced per role and by source_link_id.

alter table public.edict_institutions
    drop constraint if exists edict_institutions_pair_unique;

alter table public.edict_institutions
    add constraint edict_institutions_edict_institution_role_unique
    unique (edict_id, institution_id, role);
