create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  phone_number text not null,
  city text,
  state text,
  country text,
  clues_solved integer default 0,
  created_at timestamptz default now()
);

create table clues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  riddle text not null,
  hint text not null,
  answer_name text not null,
  answer_lat double precision not null,
  answer_lng double precision not null,
  region jsonb not null,
  region_center_lat double precision,
  region_center_lng double precision,
  reward_airtime_naira integer not null default 500,
  scope_city text not null,
  scope_state text not null,
  scope_country text not null default 'Nigeria',
  is_active boolean default true,
  solved_by uuid references profiles(id),
  solved_photo_url text,
  solved_at timestamptz,
  created_at timestamptz default now()
);

create table submissions (
  id uuid primary key default gen_random_uuid(),
  clue_id uuid not null references clues(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  photo_url text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  gps_lat double precision not null,
  gps_lng double precision not null,
  submitted_at timestamptz default now()
);

alter table profiles enable row level security;
alter table clues enable row level security;
alter table submissions enable row level security;

create policy "profiles_own" on profiles for all using (auth.uid() = id);
create policy "clues_public_read" on clues for select using (is_active = true);
create policy "submissions_insert" on submissions for insert with check (auth.uid() = user_id);
create policy "submissions_own_read" on submissions for select using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('submission-photos', 'submission-photos', false)
on conflict (id) do nothing;

create or replace function increment_clues_solved(profile_id uuid)
returns void
language sql
security definer
as $$
  update profiles
  set clues_solved = clues_solved + 1
  where id = profile_id;
$$;
