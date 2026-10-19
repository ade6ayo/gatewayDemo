# GeoHunt — Iteration 2 Handover (Quests Mode)

**Audience:** Claude Sonnet, executing the implementation.
**Author context:** This doc is the result of a planning conversation with the project owner (`ade6ayo`). Treat every "you" below as Sonnet, every "the user/owner" as the human running the project.

Reference the existing iteration 1 prompt (`/home/adebayo/Downloads/geohunt-claude-code-prompt.md`) and setup guide (`/home/adebayo/Downloads/geohunt-setup-guide.md`) for any pre-existing patterns. **Do not regress those features** — only add/modify what this doc specifies.

---

## 1. Current State (Already Built — Do Not Rebuild)

- Persistent MapLibre map layer with clue polygons + GPS dot
- Framer Motion UI overlay, drawers, clue pill, parchment scroll, submit flow
- Supabase auth (username/phone/password via `@example.com` fake email)
- Safe clue queries, Storage uploads, Realtime clue updates
- `/admin` password gate + submission approval console
- Turf geofencing, IP geolocation, OpenCage scope resolution
- Supabase migration `001_initial.sql` + seed data
- PWA manifest/icons, Railway config, `.env.example`, README
- Flutterwave-ready airtime stub (`RewardService.ts`)

File map of existing source (already on disk):
```
src/components/admin/    AdminConsole.tsx, SubmissionCard.tsx
src/components/map/      ClueRegionsLayer.tsx, MapView.tsx, UserLocationLayer.tsx
src/components/ui/       AdminGuard.tsx, AvatarDrawer.tsx, ClueScrollIcon.tsx,
                         ClueScrollPanel.tsx, ClueStatusPill.tsx, HamburgerDrawer.tsx,
                         SubmitFlow.tsx
src/services/            clues.ts, GeofenceService.ts, location.ts, RegionGenerator.ts,
                         RewardService.ts
src/store/               useAuthStore.ts, useClueStore.ts, useGPSStore.ts
supabase/migrations/     001_initial.sql
```

---

## 2. Iteration 2 Goal

Add a new game mode called **Quests** alongside the existing Clue Regions. In iteration 2, **Quests are the only mode the player UI surfaces** — clue regions remain in the codebase but are dormant (no UI entry point, no seed data loaded). A future iteration will revive clue regions.

The existing iteration 1 clue/region code stays intact under the hood. Do not delete it. Just stop wiring it into the player UI for now.

---

## 3. Scope — In and Out

### In scope (this iteration)

- New `quests` table + `submissions` schema additions + `app_settings` table
- Wipe existing `clues` and `submissions` data (rows only, keep tables/schemas)
- Auto-pan to user GPS on first fix
- Replace left "Scope" drawer with **Quests Available** drawer
- Replace "Load Clues Nearby" pill with quest-count pill + refresh button
- Red animated waving-flag markers for quests; white when solved
- Tap solved flag → winner overlay
- New quest scroll content (instructions instead of riddle/hint)
- Two-stage submission flow: photo upload → social link textbox → final submit
- New right-side **Notification Drawer** (separate from avatar drawer) opened via an `(i)` button that appears next to the avatar only when the user has a pending submission
- Network field + optional bank account fields on signup
- Admin tab bar: `Submissions | Quests`
- Admin Quest CRUD with map+table layout
- `app_settings` table for editable global "final instructions" + post template

### Out of scope (defer to later)

- Clue Regions admin UI (separate iteration)
- Mode-switcher in player UI (clue mode dormant)
- Browser push notifications via service worker (in-app only)
- Player leaderboard
- Real Flutterwave/Monnify integration (stay on stub)
- Network detection from phone-number prefix (user picks manually)
- GPS spoof detection (truth check is photo + post link + admin moderation)
- Password recovery
- Multi-photo submissions per quest

---

## 4. Database Changes

Create migration `supabase/migrations/002_quests.sql`. Run order: this file applies on top of `001_initial.sql`.

### 4.1 Wipe iteration 1 data

```sql
-- Iteration 2: clear iteration 1 demo data; keep table definitions intact
truncate submissions cascade;
update clues set is_active = false; -- soft-disable iteration 1 clue rows so the player UI stops loading them; keep rows for reference
```

### 4.2 New `quests` table

```sql
create table quests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  instructions text not null,           -- shown in scroll panel
  lat double precision not null,        -- exact pin, SAFE to send to client
  lng double precision not null,
  reward_airtime_naira integer not null default 500,
  geofence_required boolean not null default true, -- admin-toggleable per quest
  geofence_radius_m integer not null default 50,   -- always 50 in MVP, future-proof
  scope_city text,                       -- organizational only, not used for filtering
  scope_state text,
  scope_country text default 'Nigeria',
  is_active boolean not null default true,
  solved_by uuid references profiles(id),
  solved_photo_url text,
  solved_submission_link text,           -- the social media post URL the winner submitted
  solved_at timestamptz,
  created_at timestamptz default now()
);

alter table quests enable row level security;
create policy "quests_public_read" on quests for select using (is_active = true);

create index quests_active_idx on quests (is_active) where is_active = true;
create index quests_solved_idx on quests (solved_by);
```

> **Safety:** Unlike clues, the exact lat/lng IS sent to the client for quests. No column-level redaction needed. The full row (minus admin-only fields) is fine.

Client-side select string:
```ts
export const SAFE_QUEST_SELECT =
  'id, title, instructions, lat, lng, reward_airtime_naira, geofence_required, ' +
  'geofence_radius_m, solved_by, solved_photo_url, solved_at';
```

### 4.3 Extend `submissions` for quests + the share-link flow

```sql
alter table submissions add column quest_id uuid references quests(id) on delete cascade;
alter table submissions add column submission_kind text not null default 'clue'
  check (submission_kind in ('clue', 'quest'));
alter table submissions add column post_link text;        -- social media URL pasted by player
alter table submissions add column link_submitted_at timestamptz;

-- existing clue_id stays nullable-from-iter-1's perspective, but in iter 2:
alter table submissions alter column clue_id drop not null;

-- Constraint: exactly one of clue_id / quest_id is set
alter table submissions add constraint submissions_kind_link
  check (
    (submission_kind = 'clue' and clue_id is not null and quest_id is null) or
    (submission_kind = 'quest' and quest_id is not null and clue_id is not null is false)
  );
```

> Re-use the existing `submission-photos` Storage bucket. Path pattern for quests: `quest/{quest_id}/{user_id}/{timestamp}.jpg` (note the `quest/` prefix to keep the bucket organized).

### 4.4 Extend `profiles` for network + bank account

```sql
alter table profiles add column network text
  check (network in ('MTN', 'Glo', 'Airtel', '9mobile'));
alter table profiles add column bank_account_number text;
alter table profiles add column bank_account_name text;
```

Existing rows: leave `network` null. Backfill is not required because the app can prompt missing values on next login if needed (skip that polish for now). New signups must set `network`.

### 4.5 `app_settings` (editable global config)

```sql
create table app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

insert into app_settings (key, value) values
  ('final_instructions',
   'Thanks for your submission! Once approved by our moderators, your reward will be disbursed to the phone number on your profile.'),
  ('post_template',
   'Just solved a #GeoHuntNG quest! Find your own at geohunt.app');

alter table app_settings enable row level security;
create policy "settings_public_read" on app_settings for select using (true);
-- Writes happen via service-role key from admin console only.
```

### 4.6 Seed data (`supabase/seed_quests.sql`)

Insert 3 example active quests around Lagos / Ibadan / Abuja. Use real coordinates the user can validate visually:

```sql
insert into quests (title, instructions, lat, lng, reward_airtime_naira, geofence_required, scope_city, scope_state) values
  ('Cocoa House Selfie', 'Take a clear photo of yourself standing in front of the entrance to Cocoa House, Ibadan. The full building must be visible in the background.', 7.3775, 3.9470, 500, true, 'Ibadan', 'Oyo'),
  ('Lekki-Ikoyi Bridge Walk', 'Snap a photo on the pedestrian walkway of the Lekki-Ikoyi Link Bridge with the suspension cables clearly visible behind you.', 6.4281, 3.4219, 750, true, 'Lagos', 'Lagos'),
  ('Abuja Mosque Plaza', 'Capture a photo at the main plaza of the Abuja National Mosque with the dome visible.', 9.0563, 7.4907, 1000, false, 'Abuja', 'FCT');
```

---

## 5. Player UI — New Behavior

### 5.1 Auto-pan on first GPS fix

In `MapView.tsx` (or wherever the map ref lives), add a `useEffect` keyed on `gpsStore.lat && gpsStore.lng`. Use a ref flag `hasAutoPannedRef = useRef(false)` so it only fires **once per session**.

```ts
useEffect(() => {
  if (hasAutoPannedRef.current) return;
  if (lat == null || lng == null) return;
  map.flyTo({ center: [lng, lat], zoom: 15, duration: 1400, essential: true });
  hasAutoPannedRef.current = true;
}, [lat, lng]);
```

No user input required. Subsequent GPS updates do **not** re-pan; the user can scroll the map freely.

### 5.2 Quests Available drawer (replaces Scope drawer)

Rename `HamburgerDrawer.tsx` content (keep filename) — title becomes **"Quests Available"**. Strip the City/State/Country radio entirely. Strip the search box.

Layout (top to bottom):
- Header: "Quests Available" + small subtitle "Sorted by distance"
- Empty state: if no quests within 35 km, show centered text **"No quests in your area yet"** with a small flag icon above
- Otherwise, list of `QuestRow` items, each:
  - Quest title (primary)
  - Distance badge (e.g. `850 m`, `2.4 km`) — haversine distance, formatted: `<1000 m` shows meters integer, `≥1000 m` shows km to 1 decimal
  - Subtle 1px divider between rows (`border-bottom` of muted color, last row no border)
  - Tap row → close drawer + `map.flyTo({ center: [quest.lng, quest.lat], zoom: 16 })` + open the quest's scroll panel

Sort: ascending by distance. Filter: `is_active = true && solved_by IS null && distance <= 35 km`.

Update happens via Supabase Realtime subscription (already wired pattern in iter 1) — when a quest changes, recompute the list. Also recompute on every GPS store change (cheap, in-memory). **No 10-min poll.**

### 5.3 Quest count pill + refresh button

Edit `ClueStatusPill.tsx` (or rename to `QuestStatusPill.tsx` for clarity — update imports). The pill now:

- **Default state:** `"{N} quests nearby"` where N = count within 35 km, unsolved, active
- **No quests:** `"No quests nearby"` (subtle pulse off)
- **Tap pill (anywhere except refresh icon):** opens the Quests Available drawer
- **Refresh icon** sits flush against the **right inner edge** of the pill (small 28px circle, lucide `RefreshCw` icon). Tap behavior:
  - Tap once: re-request GPS (`navigator.geolocation.getCurrentPosition` to force a fresh fix), refetch quest list from Supabase, then `map.flyTo` to user position at zoom 15
  - Two taps within 1.5s (double-tap): pan-out to fit user position + nearest unsolved quest pin in viewport with 60px padding. Pill text **morphs** to `"{distance} to nearest"` for 4 seconds, then snaps back to `"{N} quests nearby"`
- Single-tap is debounced — start a 250ms timer; if a second tap arrives before it fires, treat as double-tap; otherwise execute single-tap action when timer fires
- Use `framer-motion`'s `layout` prop on the pill text span so the morph animates smoothly

### 5.4 Quest markers — animated red flags

Create `src/components/map/QuestMarkersLayer.tsx`. Render quest pins as MapLibre **symbol layer** with a custom SVG icon.

Pre-render two SVG icons and register them via `map.addImage`:
- `quest-flag-red` — red waving flag (use a simple SVG; the "wave" is achieved with a CSS/JS animation OR just use a small frame loop swapping between 2-3 frames). Pragmatic approach: register **3 image variants** `quest-flag-red-0`, `quest-flag-red-1`, `quest-flag-red-2` and rotate the layer's icon-image expression on a 200ms `setInterval` for a 6 fps wave. Stop the interval if the layer is removed.
- `quest-flag-white` — white flag for solved quests, static (no animation).

Layer definition:
```ts
map.addLayer({
  id: 'quest-markers',
  type: 'symbol',
  source: 'quests',
  layout: {
    'icon-image': ['case', ['get', 'solved'], 'quest-flag-white', ['concat', 'quest-flag-red-', ['to-string', ['get', 'frame']]]],
    'icon-size': 0.9,
    'icon-anchor': 'bottom',
    'icon-allow-overlap': true,
  },
});
```

Source data is rebuilt from `useQuestStore` — each feature's properties: `{ id, title, solved: boolean, frame: 0|1|2, reward, solved_by, solved_photo_url, solved_at, solved_username, solved_count }`.

Tap behavior on the layer:
- **Unsolved (red flag):** open the quest's scroll panel (set selectedQuest, render `QuestScrollPanel`)
- **Solved (white flag):** open `SolvedQuestOverlay` with winner photo (the submission photo), winner username, total quests solved by them, reward earned, formatted relative date

Don't keep clue regions and quests both rendered. Hide `ClueRegionsLayer` for now (don't fetch clues, don't add the layer). Leave the file untouched — just don't import it from `GamePage`.

### 5.5 Quest scroll panel

Create `QuestScrollPanel.tsx` (or branch inside the existing `ClueScrollPanel.tsx` based on `selectedQuest` vs `selectedClue`). Reuse the parchment paper aesthetic from iter 1. Content top-to-bottom:

1. Quest title (large serif)
2. Decorative divider
3. **Instructions** (replaces riddle/hint — no italic, just clear instructions)
4. Reward badge: `🏆 ₦{reward_airtime_naira} airtime`
5. Submit area:
   - If user not authenticated → "Sign in to submit"
   - If `geofence_required = true` AND user is NOT within 50m of `(quest.lat, quest.lng)` → muted text **"📍 Travel to within 50m to submit"** (button disabled)
   - If user has already submitted this quest (check `submitted_quests` localStorage key, array of quest IDs) → "Submission pending review" disabled state
   - Else → enabled **"📷 Submit Answer"** button
6. If `solved_by` is not null → show "✓ Solved" badge + winner photo thumbnail (tappable → opens SolvedQuestOverlay)

Distance check uses inline haversine (no library). Reuse the helper from iter 1 if it exists in `services/location.ts`; otherwise add one.

### 5.6 Two-stage submission flow

This is the most behaviourally different part. Modify `SubmitFlow.tsx` (or fork to `QuestSubmitFlow.tsx`):

**Stage 1 — Photo capture & upload**

1. User taps "📷 Submit Answer" → camera opens via the same `<input type="file" capture="environment" />` pattern from iter 1
2. Show preview thumbnail with confirm/retake
3. On confirm:
   - Upload to `submission-photos/quest/{quest_id}/{user_id}/{Date.now()}.jpg`
   - Insert row into `submissions`: `{ submission_kind: 'quest', quest_id, user_id, photo_url, gps_lat, gps_lng, status: 'pending' }`
   - Persist quest_id to `localStorage` key `submitted_quests` (array)
   - Close the scroll panel
   - Open the **Notification Drawer** (right side, see 5.7) with this submission's "stage 2" view active

**Stage 2 — Social link**

The notification drawer shows for the just-created submission:
- Quest title and photo thumbnail
- Final instructions text (loaded from `app_settings.final_instructions`)
- A read-only textbox containing `app_settings.post_template` text + a **"Copy"** button (writes to clipboard via `navigator.clipboard.writeText`)
- Instruction text: "Post the text above on Facebook, X, Instagram or TikTok with your photo, then paste the link to that post below."
- An editable textbox for the post URL
- A **"Submit Final"** button — disabled until the URL textbox contains a non-empty string that passes a basic URL regex (`^https?://...`)
- On Submit Final:
  - `update submissions set post_link = ?, link_submitted_at = now() where id = ?`
  - Both stages now bundled in one row, ready for admin queue
  - Replace the textbox area with green text **"Submission pending"** + a small clock icon
  - Keep the (i) button visible and badged until admin acts

The post link is **mandatory** — the submission cannot reach the admin queue without it. Admin queries should filter `where post_link is not null` for pending quest submissions.

### 5.7 Notification Drawer + (i) info button

New component `NotificationDrawer.tsx`. Slides in from the right (mirror of the avatar drawer animation), but separate. New trigger button `InfoButton.tsx` placed **immediately to the left of the avatar button** in the top-right.

Visibility rules:
- **Hidden** (button does not exist in DOM) when the user has no submissions or is not authenticated
- **Red dot variant** when at least one submission is in stage 2 (photo uploaded, link not yet submitted) OR pending review
- **Green dot variant** when at least one submission has been approved and the user has not yet "seen" it (track `last_seen_notifications_at` in localStorage)

Drawer content:
- Per-submission card (newest first):
  - Quest title + photo thumbnail
  - Status: `Awaiting your link`, `Pending review`, `Approved ✓` (green), `Rejected ✗` (red)
  - If `Awaiting your link`: stage 2 textbox flow described in 5.6
  - If `Approved`: show reward earned, "Funds disbursed to {phone_number}", date
  - If `Rejected`: show date, brief "Try again on another quest" message

Realtime subscription to `submissions` filtered by `user_id = current` so status changes show up live without polling. On open, mark notifications as seen (write `Date.now()` to `last_seen_notifications_at`).

### 5.8 Solved quest winner overlay

`SolvedQuestOverlay.tsx` — full-screen modal-ish, dismissed by tap outside or X button. Content:

- Large winner submission photo (`solved_photo_url`)
- Username
- "Solved {relative date}" (e.g., "3 days ago" — use a tiny inline relative-time formatter; do not pull a library)
- "{N} quests solved" (from `profiles.clues_solved` of the winner — admin approval increments this)
- "Reward earned: ₦{reward_airtime_naira}"

To get the winner's `username` and `clues_solved`, denormalize at quest-load time: do a join query from the client (`quests` joined to `profiles` via `solved_by`). Add this to the `SAFE_QUEST_SELECT` flow with a Supabase nested select:

```ts
.select(`${SAFE_QUEST_SELECT}, solver:profiles!quests_solved_by_fkey(username, clues_solved)`)
```

(If RLS blocks reading other users' `username` and `clues_solved`, add a permissive policy — usernames are public-by-design in this app, so this is fine.)

Add policy:
```sql
create policy "profiles_username_public_read" on profiles for select using (true);
```
This replaces the existing `profiles_own` policy on SELECT — recreate it as INSERT/UPDATE only:
```sql
drop policy if exists "profiles_own" on profiles;
create policy "profiles_own_write" on profiles for insert with check (auth.uid() = id);
create policy "profiles_own_update" on profiles for update using (auth.uid() = id);
```

---

## 6. Auth — Signup form changes

Edit `AvatarDrawer.tsx` Sign Up tab. Current fields: username, phone number, password. Add:

1. **Network** — required dropdown right after phone number. Options: `MTN`, `Glo`, `Airtel`, `9mobile`. Default placeholder "Select your network".
2. **Bank account number** — optional, numeric, no validation beyond digits-only
3. **Bank account name** — optional, free text

Insert into `profiles` on signup:
```ts
.insert({ id: user.id, username, phone_number, network, bank_account_number, bank_account_name })
```

Validation: network is required for new accounts. The other two are optional and fall through as `null`.

Profile view (already-signed-in state in AvatarDrawer): show username, phone + network, bank account number (masked except last 4: `****1234`), bank account name, quests solved count. Add a small "Edit" link that flips the panel into editable form for network/bank fields only (username and phone remain locked).

---

## 7. Admin Console Changes

Edit `AdminConsole.tsx`. Add a tab bar at the top: **Submissions | Quests**. Default to Submissions on load.

### 7.1 Submissions tab (existing, with quest extensions)

Existing approval/decline UI stays. Additions:
- Each `SubmissionCard` shows whether it's a **Quest** or **Clue** submission (small label badge top-right of the card)
- For quest submissions: show the `post_link` as a clickable URL ("View social post ↗") opening in a new tab
- Approve flow for quests:
  1. `update submissions set status = 'approved'`
  2. `update quests set solved_by = user_id, solved_photo_url = signed_url, solved_submission_link = post_link, solved_at = now()`
  3. Increment `profiles.clues_solved`
  4. Call `RewardService.disburseAirtime(phone_number, reward_airtime_naira)`
  5. Animate exit from the Pending list
- Decline flow for quests: same as iter 1, just sets status = 'rejected'; quest stays open for others

The admin client should fetch submissions joined with quest data when `submission_kind = 'quest'`:
```ts
.select(`*, quest:quests(id, title, lat, lng, reward_airtime_naira), submitter:profiles(username, phone_number, network)`)
```

### 7.2 Quests tab — CRUD

Layout: **left = quest table, right = MapLibre map** (split 40/60). On mobile, stack vertically (table on top, map below) with map fixed at 50vh.

**Table columns:** Title, Lat/Lng (small), Status (`Active` / `Solved`), Reward, Geofence (✓/✗), Created, Actions (Edit / Delete).
- Click a row → map flies to the quest pin and opens the edit panel (overlays the table on mobile)
- Toolbar above the table: search input + **"+ New Quest"** button

**Map behavior:**
- Search bar at the top of the map for `lat,lng` paste-in (e.g. `7.3775, 3.9470`) — on enter, fly to those coords with a temporary draggable preview pin
- Click anywhere on the map → drops a draggable pin at that location (replaces any preview pin)
- Selected quest pin is highlighted (different color: yellow border on the red flag)

**Edit/Create panel** (slides in from the right side of the admin viewport):
- Title (required)
- Instructions (required, multi-line textarea)
- Lat / Lng (required, editable text inputs — kept in sync with the pin position)
- Reward airtime naira (required, numeric, default 500)
- Geofence required (toggle, default true)
- Active (toggle, default true)
- Save / Cancel buttons
- For existing quests: a **Delete** button (with confirm modal)

Save flow: insert or update via service-role admin Supabase client (already wired in iter 1). On save, re-fetch quest list and update the table.

Delete flow: hard delete the row. Cascade drops any related submissions.

Realtime: subscribe to `quests` channel so the table updates live if multiple admins edit (low priority — wire it if cheap).

### 7.3 App settings UI (small)

Add a simple "Settings" icon button in the admin top bar (gear icon). Clicking opens a small modal with:
- Final instructions textarea (bound to `app_settings.final_instructions`)
- Post template textarea (bound to `app_settings.post_template`)
- Save button

Service-role client writes to `app_settings`. Keep this minimal — just two textareas and a save button.

---

## 8. New Zustand Stores

Create `useQuestStore.ts`:
```ts
interface QuestState {
  quests: Quest[];
  selectedQuest: Quest | null;
  loading: boolean;
  setQuests: (q: Quest[]) => void;
  selectQuest: (id: string | null) => void;
  upsertQuest: (q: Quest) => void;
  deleteQuest: (id: string) => void;
}
```

Create `useNotificationStore.ts`:
```ts
interface NotificationState {
  submissions: SubmissionWithQuest[]; // current user's submissions, newest first
  drawerOpen: boolean;
  lastSeenAt: number; // millis epoch
  setSubmissions: (s: SubmissionWithQuest[]) => void;
  upsertSubmission: (s: SubmissionWithQuest) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  markSeen: () => void;
}
```

Use `useShallow` selectors throughout, per the iter 1 performance rules.

---

## 9. Implementation Order (suggested)

Do these in order — each step should leave the app in a runnable state.

1. **Migration** — write `002_quests.sql`, run locally, confirm tables exist
2. **Seed quests** — run `seed_quests.sql`, confirm 3 rows visible in Supabase Studio
3. **`useQuestStore`** + service `quests.ts` (mirror `clues.ts` pattern) for fetch + realtime
4. **QuestMarkersLayer** rendering the 3 seed quests as red flags (animation can be static initially, swap to 3-frame animation last)
5. **Auto-pan on first GPS fix** in `MapView`
6. **Hide ClueRegionsLayer** from `GamePage` (do not delete; just don't mount). Stop loading clue data.
7. **Quest count pill + refresh button** (replaces "Load Clues Nearby")
8. **Quests Available drawer** (replaces Scope drawer)
9. **Quest scroll panel** (separate from clue scroll panel; reuse parchment styles)
10. **Submit flow stage 1** (photo upload → submission row, kind=quest)
11. **`useNotificationStore`** + (i) info button + Notification Drawer + Stage 2 link textbox
12. **Approve/decline flow updates** for quest submissions in admin
13. **Solved overlay** + flag icon swap to white when solved
14. **Admin: tab bar + Quests CRUD page** (table + map + edit panel)
15. **Admin: settings modal** for editable global text
16. **Signup form** — network dropdown + bank fields
17. **Animated red flag** (3-frame swap) — polish pass last
18. **Manual end-to-end test** on Railway (HTTPS) using a real phone GPS

---

## 10. Files Reference

### New files to create
- `supabase/migrations/002_quests.sql`
- `supabase/seed_quests.sql`
- `src/components/map/QuestMarkersLayer.tsx`
- `src/components/ui/QuestScrollPanel.tsx` (or fold into ClueScrollPanel with conditional)
- `src/components/ui/QuestSubmitFlow.tsx` (or fold into SubmitFlow)
- `src/components/ui/NotificationDrawer.tsx`
- `src/components/ui/InfoButton.tsx`
- `src/components/ui/SolvedQuestOverlay.tsx`
- `src/components/admin/QuestsTab.tsx`
- `src/components/admin/QuestEditPanel.tsx`
- `src/components/admin/AdminMap.tsx` (separate small MapLibre instance for admin)
- `src/components/admin/SettingsModal.tsx`
- `src/store/useQuestStore.ts`
- `src/store/useNotificationStore.ts`
- `src/services/quests.ts`
- `src/services/settings.ts`
- `public/icons/flag-red-0.svg`, `flag-red-1.svg`, `flag-red-2.svg`, `flag-white.svg` (4 SVG assets, simple shapes inline)

### Existing files to modify
- `src/pages/GamePage.tsx` — add notification drawer + (i) button mounting; stop mounting `ClueRegionsLayer`
- `src/pages/AdminPage.tsx` — pass tab state to `AdminConsole`
- `src/components/map/MapView.tsx` — auto-pan on first GPS fix
- `src/components/ui/ClueStatusPill.tsx` — quest pill text + integrated refresh button
- `src/components/ui/HamburgerDrawer.tsx` — replace with Quests Available list
- `src/components/ui/AvatarDrawer.tsx` — add network + bank fields to signup
- `src/components/admin/AdminConsole.tsx` — add tab bar + settings button + quest submission rendering
- `src/lib/supabase.ts` — add `SAFE_QUEST_SELECT`
- `src/services/clues.ts` — leave alone, just stop calling its loader from GamePage
- `README.md` — append a "Iteration 2 — Quests" section explaining the new features and migration step
- `.env.example` — no new keys needed (no Flutterwave/Monnify yet)

### Existing files to LEAVE UNTOUCHED (dormant code, future iteration)
- `src/components/map/ClueRegionsLayer.tsx`
- `src/services/RegionGenerator.ts`
- `src/services/GeofenceService.ts` (still used — quest 50m radius check is haversine, but reuse `isUserInsideRegion` if you adapt for a quest, or just use haversine inline)

---

## 11. Acceptance Criteria

The user will validate against this list. Each must hold true on a real Android phone using the live Railway URL.

- [ ] Map auto-flies to user GPS as soon as location permission is granted, no extra tap
- [ ] Old "Load Clues Nearby" button is gone; replaced by "{N} quests nearby" pill with a refresh button on its right edge
- [ ] Single-tap refresh: re-fetches quests + flies to user at zoom 15
- [ ] Double-tap refresh: pans out to fit user + nearest quest, pill shows "{distance} to nearest"
- [ ] Hamburger button opens "Quests Available" drawer, listing nearby quests sorted ascending by distance with subtle dividers
- [ ] Tapping a quest in the drawer flies to its red flag and opens the scroll panel
- [ ] Empty state: "No quests in your area yet"
- [ ] Quest red flags are animated (subtle wave) on the map; turn white on solve
- [ ] Tapping a white (solved) flag opens an overlay with winner photo, username, total quests solved, reward, relative date
- [ ] Quest scroll shows instructions (no riddle/hint), reward, submit button
- [ ] Geofence-required quest disables submit when user is >50m away, with helpful text
- [ ] Geofence-off quest allows submit from anywhere
- [ ] Submit Stage 1: photo upload creates a pending submission row
- [ ] Right after stage 1, the (i) button appears next to the avatar with a red dot
- [ ] Notification drawer shows the just-created submission with copy-template + paste-link textboxes
- [ ] Cannot complete the submission without a valid URL — Submit Final button disabled
- [ ] After Submit Final: textbox area becomes green "Submission pending"
- [ ] Admin tab bar shows `Submissions | Quests`
- [ ] Quest submissions in admin show post link as clickable, photo thumbnail, approve/decline
- [ ] Approve disburses airtime via stub, marks quest solved, increments user's solved count, the (i) dot turns green for that user
- [ ] Admin Quests tab: split table+map, click row → fly to pin + open edit panel
- [ ] Admin can paste `lat,lng` in the search bar and the map flies there with a draggable pin
- [ ] Admin can drop a pin by clicking the map and create a quest from it
- [ ] Admin can edit lat/lng numerically (text inputs sync with pin)
- [ ] Admin can toggle geofence_required + active per quest
- [ ] Admin can delete quests (with confirm)
- [ ] Admin settings modal lets you edit "final instructions" and "post template" text
- [ ] Signup form has network dropdown (MTN, Glo, Airtel, 9mobile) + optional bank account fields
- [ ] Existing iteration 1 features still work (auth, /admin password gate, Realtime, etc.)
- [ ] Map never unmounts during any UI interaction (open drawers, modals, navigation)

---

## 12. Notes on Style & Conventions (Carry Over From Iter 1)

- Map never unmounts. Mount drawers/modals on top via Framer Motion `position: fixed`.
- Use `useShallow` selectors for Zustand objects/arrays.
- All Supabase queries on quests must use the explicit `SAFE_QUEST_SELECT` (even though there are no secret columns now — keeps the pattern consistent for the future).
- Throttle GPS updates: 800ms + 5m dead zone (already wired).
- Lazy-load: `NotificationDrawer`, `QuestScrollPanel`, `SolvedQuestOverlay`, the entire admin Quests tab.
- No emojis in code/comments unless explicitly already there. UI text emojis (🏆 📍 📷) are fine — match iter 1.
- Comments: only when WHY is non-obvious. No narration of WHAT.

---

## 13. Open Questions Reserved for Implementation

If you hit any of these during implementation, **stop and ask the owner** rather than guess:

- A real phone test reveals the 3-frame flag animation is jank — fall back to static red flag and ship?
- Storage bucket policy needs adjusting for the `quest/` prefix? (likely fine since the bucket is uniformly private)
- Any of the existing iter 1 RLS policies conflict with the new quest read pattern via the join to profiles?
- The `submitted_quests` localStorage approach gets confusing after admin rejection — should rejected submissions clear the lockout? (My current spec leaves them locked; the user may want them re-tryable.)

End of handover.
