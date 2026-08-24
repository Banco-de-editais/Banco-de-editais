-- Explicit API privileges.
-- RLS still decides which authenticated users may write.

-- Anonymous users receive no direct table privileges.
revoke all on table public.institutions from anon;
revoke all on table public.journals from anon;
revoke all on table public.indexers from anon;
revoke all on table public.journal_indexers from anon;
revoke all on table public.edicts from anon;
revoke all on table public.edict_rules from anon;

-- Authenticated users may attempt CRUD through the Data API.
-- RLS limits INSERT/UPDATE/DELETE to users whose app_metadata.role = "admin".
grant select, insert, update, delete
on table public.institutions
to authenticated;

grant select, insert, update, delete
on table public.journals
to authenticated;

grant select, insert, update, delete
on table public.indexers
to authenticated;

grant select, insert, update, delete
on table public.journal_indexers
to authenticated;

grant select, insert, update, delete
on table public.edicts
to authenticated;

grant select, insert, update, delete
on table public.edict_rules
to authenticated;

-- Identity sequences used by INSERTs.
revoke all on sequence public.institutions_id_seq from anon;
revoke all on sequence public.journals_id_seq from anon;
revoke all on sequence public.indexers_id_seq from anon;
revoke all on sequence public.edicts_id_seq from anon;
revoke all on sequence public.edict_rules_id_seq from anon;

grant usage, select on sequence public.institutions_id_seq to authenticated;
grant usage, select on sequence public.journals_id_seq to authenticated;
grant usage, select on sequence public.indexers_id_seq to authenticated;
grant usage, select on sequence public.edicts_id_seq to authenticated;
grant usage, select on sequence public.edict_rules_id_seq to authenticated;
