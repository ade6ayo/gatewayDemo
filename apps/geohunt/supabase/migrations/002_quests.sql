-- Iteration 2: Quests mode

-- Disable all iteration 1 clue rows so player UI stops loading them
update clues set is_active = false;

-- Clear iteration 1 demo submissions
truncate submissions cascade;

-- ── Quests ──────────────────────────────────────────────────────────────────
create table quests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  instructions text not null,
  lat double precision not null,
  lng double precision not null,
  reward_airtime_naira integer not null default 500,
  geofence_required boolean not null default true,
  geofence_radius_m integer not null default 50,
  scope_city text,
  scope_state text,
  scope_country text default 'Nigeria',
  is_active boolean not null default true,
  solved_by uuid references profiles(id),
  solved_photo_url text,
  solved_submission_link text,
  solved_at timestamptz,
  created_at timestamptz default now()
);

alter table quests enable row level security;
create policy "quests_public_read" on quests for select using (is_active = true);
create index quests_active_idx on quests (is_active) where is_active = true;
create index quests_solved_idx on quests (solved_by);

-- ── Submissions: extend for quests ──────────────────────────────────────────
alter table submissions add column quest_id uuid references quests(id) on delete cascade;
alter table submissions add column submission_kind text not null default 'clue'
  check (submission_kind in ('clue', 'quest'));
alter table submissions add column post_link text;
alter table submissions add column link_submitted_at timestamptz;
alter table submissions alter column clue_id drop not null;

-- ── Profiles: extend for network and bank ───────────────────────────────────
alter table profiles add column network text
  check (network in ('MTN', 'Glo', 'Airtel', '9mobile'));
alter table profiles add column bank_account_number text;
alter table profiles add column bank_account_name text;

-- ── Profiles RLS: make username/solved count publicly readable for winner overlay ──
drop policy if exists "profiles_own" on profiles;
create policy "profiles_public_read" on profiles for select using (true);
create policy "profiles_own_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_own_update" on profiles for update using (auth.uid() = id);

-- ── App settings ────────────────────────────────────────────────────────────
create table app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

insert into app_settings (key, value) values
  ('final_instructions',
   'Thanks for your submission! Once our moderators approve it, your reward will be disbursed to the phone number on your profile within 24 hours.'),
  ('post_template',
   'Just solved a #GeoHuntNG quest! Find yours at geohunt.app 🏆');

alter table app_settings enable row level security;
create policy "settings_public_read" on app_settings for select using (true);
