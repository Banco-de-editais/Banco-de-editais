alter table public.institutions enable row level security;
alter table public.journals enable row level security;
alter table public.indexers enable row level security;
alter table public.journal_indexers enable row level security;
alter table public.edicts enable row level security;
alter table public.edict_rules enable row level security;


-- =========================================================
-- institutions
-- =========================================================

create policy "Authenticated users can read institutions"
on public.institutions
for select
to authenticated
using (true);

create policy "Admins can insert institutions"
on public.institutions
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins can update institutions"
on public.institutions
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete institutions"
on public.institutions
for delete
to authenticated
using ((select public.is_admin()));


-- =========================================================
-- journals
-- =========================================================

create policy "Authenticated users can read journals"
on public.journals
for select
to authenticated
using (true);

create policy "Admins can insert journals"
on public.journals
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins can update journals"
on public.journals
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete journals"
on public.journals
for delete
to authenticated
using ((select public.is_admin()));


-- =========================================================
-- indexers
-- =========================================================

create policy "Authenticated users can read indexers"
on public.indexers
for select
to authenticated
using (true);

create policy "Admins can insert indexers"
on public.indexers
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins can update indexers"
on public.indexers
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete indexers"
on public.indexers
for delete
to authenticated
using ((select public.is_admin()));


-- =========================================================
-- journal_indexers
-- =========================================================

create policy "Authenticated users can read journal indexers"
on public.journal_indexers
for select
to authenticated
using (true);

create policy "Admins can insert journal indexers"
on public.journal_indexers
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins can update journal indexers"
on public.journal_indexers
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete journal indexers"
on public.journal_indexers
for delete
to authenticated
using ((select public.is_admin()));


-- =========================================================
-- edicts
-- =========================================================

create policy "Authenticated users can read edicts"
on public.edicts
for select
to authenticated
using (true);

create policy "Admins can insert edicts"
on public.edicts
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins can update edicts"
on public.edicts
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete edicts"
on public.edicts
for delete
to authenticated
using ((select public.is_admin()));


-- =========================================================
-- edict_rules
-- =========================================================

create policy "Authenticated users can read edict rules"
on public.edict_rules
for select
to authenticated
using (true);

create policy "Admins can insert edict rules"
on public.edict_rules
for insert
to authenticated
with check ((select public.is_admin()));

create policy "Admins can update edict rules"
on public.edict_rules
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "Admins can delete edict rules"
on public.edict_rules
for delete
to authenticated
using ((select public.is_admin()));
