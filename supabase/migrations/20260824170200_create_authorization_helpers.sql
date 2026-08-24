create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
    select coalesce(
        auth.jwt() -> 'app_metadata' ->> 'role',
        ''
    ) = 'admin';
$$;

revoke execute on function public.is_admin() from public;
revoke execute on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;
