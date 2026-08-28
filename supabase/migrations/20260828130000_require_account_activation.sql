-- An invitation receives a temporary Supabase session in order to set a
-- password. This migration distinguishes that limited session from an account
-- allowed to access the application and its data.

update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object(
    'account_status',
    case when coalesce(encrypted_password, '') <> '' then 'active' else 'pending' end
)
where coalesce(raw_app_meta_data ->> 'account_status', '') not in ('active', 'pending');

create or replace function public.is_active_account()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
    select coalesce(
        auth.jwt() -> 'app_metadata' ->> 'account_status',
        ''
    ) = 'active';
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
    select (select public.is_active_account())
        and coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

revoke execute on function public.is_active_account() from public;
revoke execute on function public.is_active_account() from anon;
grant execute on function public.is_active_account() to authenticated;

drop policy if exists "Authenticated users can read institutions" on public.institutions;
create policy "Active users can read institutions"
on public.institutions for select to authenticated
using ((select public.is_active_account()));

drop policy if exists "Authenticated users can read journals" on public.journals;
create policy "Active users can read journals"
on public.journals for select to authenticated
using ((select public.is_active_account()));

drop policy if exists "Authenticated users can read indexers" on public.indexers;
create policy "Active users can read indexers"
on public.indexers for select to authenticated
using ((select public.is_active_account()));

drop policy if exists "Authenticated users can read journal indexers" on public.journal_indexers;
create policy "Active users can read journal indexers"
on public.journal_indexers for select to authenticated
using ((select public.is_active_account()));

drop policy if exists "Authenticated users can read edicts" on public.edicts;
create policy "Active users can read edicts"
on public.edicts for select to authenticated
using ((select public.is_active_account()));

drop policy if exists "Authenticated users can read edict indexers" on public.edict_indexers;
create policy "Active users can read edict indexers"
on public.edict_indexers for select to authenticated
using ((select public.is_active_account()));
