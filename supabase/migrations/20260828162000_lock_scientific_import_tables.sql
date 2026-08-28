-- Imported scientific data is read-only through the client API.
-- Administrative maintenance remains available through trusted database roles.

revoke all on table public.scientific_import_batches from authenticated;
revoke all on table public.edict_institutions from authenticated;
revoke all on table public.scientific_rules from authenticated;

grant select on table public.scientific_import_batches to authenticated;
grant select on table public.edict_institutions to authenticated;
grant select on table public.scientific_rules to authenticated;

revoke all on sequence public.scientific_import_batches_id_seq from authenticated;
revoke all on sequence public.edict_institutions_id_seq from authenticated;
revoke all on sequence public.scientific_rules_id_seq from authenticated;
