-- Admin access without service_role.
--
-- The admin console previously used the service_role key from the browser, which
-- shipped it in the client bundle. These policies let a flagged admin perform the
-- same operations with their own authenticated JWT, so no privileged key is needed
-- client-side.

alter table profiles add column if not exists is_admin boolean not null default false;

-- security definer: the lookup must not itself be filtered by RLS on profiles,
-- which would recurse when these policies call it.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select p.is_admin from profiles p where p.id = auth.uid()), false);
$$;

revoke execute on function public.is_admin() from anon, public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "submissions_admin_read" on submissions;
create policy "submissions_admin_read" on submissions
  for select to authenticated using (public.is_admin());

drop policy if exists "submissions_admin_update" on submissions;
create policy "submissions_admin_update" on submissions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "quests_admin_all" on quests;
create policy "quests_admin_all" on quests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "clues_admin_all" on clues;
create policy "clues_admin_all" on clues
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- approving a submission increments the solver's clues_solved, so admins need to
-- update profiles other than their own
drop policy if exists "profiles_admin_update" on profiles;
create policy "profiles_admin_update" on profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings_admin_all" on app_settings;
create policy "settings_admin_all" on app_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
