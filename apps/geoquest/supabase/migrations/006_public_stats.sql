-- Public, PII-free surface for the gateway homepage.
--
-- The homepage needs live counts, not rows. Exposing the underlying tables to the
-- browser would mean handing out read access to profiles, which holds phone_number.
-- These two objects give the anon key exactly what the homepage renders and nothing
-- else, so no table grant is required.

create or replace function public.homepage_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'players',              (select count(*) from profiles),
    'quests_total',         (select count(*) from quests where is_active),
    'quests_solved',        (select count(*) from quests where solved_by is not null),
    'clues_total',          (select count(*) from clues where is_active),
    'clues_solved',         (select count(*) from clues where solved_by is not null),
    'submissions_approved', (select count(*) from submissions where status = 'approved'),
    'submissions_pending',  (select count(*) from submissions where status = 'pending')
  );
$$;

revoke execute on function public.homepage_stats() from public;
grant execute on function public.homepage_stats() to anon, authenticated;

-- Leaderboard without phone_number. security_invoker stays off so the view reads
-- past RLS on profiles; the column list is the access control.
create or replace view public.public_leaderboard as
  select username, clues_solved
  from profiles
  order by clues_solved desc, username
  limit 100;

revoke all on public.public_leaderboard from public;
grant select on public.public_leaderboard to anon, authenticated;
