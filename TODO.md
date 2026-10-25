# Monorepo consolidation — outstanding work

Phase 1 (Sprint 1) of the Yayi Gateway 2027 roadmap: Infrastructure Consolidation
& Core Backend Merge.

## 0. Homepage stats are not real data

`apps/web` has no `@supabase/supabase-js` dependency — it cannot read the database at
all. Every figure on the homepage is a hardcoded literal in `App.jsx` (the `PROJECTS`
array around line 131: `reports: 412`, `pct: 100`, and so on). The app's only network
call is `POST /api/send-airtime` at line 1647.

Making the stats live needs: the Supabase client added to `apps/web`, pointed at the
same instance GeoQuest uses, and the hardcoded arrays replaced with queries. That
depends on roadmap Task 1.2 (schema harmonization) settling what the tables look like.

## 1. Finish the service_role remediation

The code fix is committed (`6efe0f0`), but the leaked key is still valid until rotated.
Order matters — doing these out of order locks you out of the admin console.

- [ ] Apply `apps/geoquest/supabase/migrations/004_admin_rls.sql` to Supabase
- [ ] Flag the admin account:
      `update profiles set is_admin = true where id = '09d0133a-b568-44fc-beca-9871074137bc';`
- [ ] Confirm `select id, username, is_admin from profiles where is_admin;` returns a row
- [ ] Move admin onto a real email address. `AdminGuard` already passes the email
      through untransformed, so no code change is needed — but do NOT just edit the
      existing account's email: `AvatarDrawer` logs players in via
      `fakeEmailForUsername(username)`, so changing it breaks that account's player
      login. Create a separate admin user instead, give it a `profiles` row with
      `is_admin = true`, and demote `09d0133a-b568-44fc-beca-9871074137bc`.

## 1b. Open question: real emails for players

GeoQuest signup takes a username and fabricates `<sanitized>@example.com` for Supabase
Auth. `example.com` is IANA-reserved and can never receive mail, so no player can ever
reset a password. Switching to real emails would invalidate all 9 existing accounts,
require SMTP configuration, and add confirmation friction to a casual game. Product
decision, not cleanup — deliberately deferred.
- [ ] **Rotate the Supabase `service_role` key** (Settings → API). The old key has been
      public in the geoquest bundle since deploy; rotation is what actually invalidates it.
- [ ] Verify the admin console still loads and approve/reject works

## 2. Clean up Railway env vars

- [ ] Delete `VITE_ADMIN_SUPABASE_KEY` from the geoquest service — nothing reads it now,
      and leaving it invites it being wired back in
- [ ] Delete `VITE_ADMIN_PASSWORD` — admin auth is a real Supabase Auth account now
- [ ] Export the remaining values to a password manager before any service teardown.
      Deleting a Railway service destroys its variables.

## 2b. Leftover references to the old deployment

- [ ] `apps/web/src/App.jsx:60` still falls back to
      `https://geohunt-production.up.railway.app`. It was left pointing at the real live
      host on purpose — renaming the string during the GeoQuest rename would have aimed
      it at a domain that does not exist. Replace it with the new Railway URL once that
      service is up. **The old GeoQuest service cannot be deleted until
      `VITE_GEOQUEST_URL` is set on the web service**, or the fallback is all that is
      holding the link together.
- [ ] Same for `VITE_PAYMENTS_API_URL`, which falls back to
      `https://gatewaybe-production.up.railway.app`.
- [ ] Decide whether `geoquest.app` is a domain you actually own. The social post
      template points users at it (`settings.ts`, migration 002, and migration 005 which
      rewrites the live row). It was `geohunt.app` before and may never have been real —
      worth confirming before players start sharing posts that link to it.
- [ ] `apps/geoquest/docs/iteration-2-handover.md` still says GeoHunt. Left as a
      historical record; its references point at files in ~/Downloads that still carry
      the old name. Rename only if those files are renamed too.

## 2c. Migrations to apply

- [ ] `005_rename_to_geoquest.sql` — rewrites the live `post_template` row. Migration 002
      already ran, so editing that file alone would only affect a fresh database.
- [ ] `006_public_stats.sql` — adds `homepage_stats()` and `public_leaderboard`, the
      PII-free surface the web app reads. Nothing on the homepage shows live data until
      this is applied and the Supabase vars are set on the web service.

## 2d. Downscale verification photos before upload

`normaliseToJpeg()` in `apps/geoquest/src/components/ui/SubmitFlow.tsx` (and the same
function duplicated in `QuestSubmitFlow.tsx`) converts camera output to JPEG at quality
0.85 but keeps full resolution:

```js
canvas.width  = img.naturalWidth;   // 4032px on a modern phone
canvas.height = img.naturalHeight;
```

That lands roughly 2–4MB in Supabase Storage per submission, against ~1GB on the free
tier — about 250–500 photos total. 50 testers doing a handful of quests each would
approach that during a 3-month pilot; 1000 users would exceed it roughly 12x.

- [ ] Cap the long edge at ~1600px, scaling the short edge proportionally. A moderator
      only needs to recognise a face and a location, so this costs nothing in practice
      and cuts each photo to roughly 300–500KB.
- [ ] Factor the function out — it is currently duplicated verbatim in both flows, so a
      fix applied to one silently misses the other.
- [ ] Worth doing before real submissions accumulate; photos already stored at full size
      would need a separate backfill.

## 2e. "Light Up Ogun" — GeoQuest infrastructure map

Agreed to start immediately after the monorepo migration lands, not before.

The homepage card formerly labelled "Track boreholes & solar lights" is now
**"Light Up Ogun (GeoQuest)"** (`apps/web/src/App.jsx`, the sparkline card). Its
arrow currently still calls `go('projects')`, the existing in-app project list.
The target is a different screen: the filtered infrastructure map from the mockup
(`~/Downloads/IMG-20261024-WA0031.jpg`) — a map of Ogun with pins per asset,
senatorial-district counts (West / Central / East), a "nearest borehole" readout,
a district filter row, and a per-asset card with *Get Directions* and
*Verify & Check-In*.

Open questions to settle before building:
- [ ] Does this live in `apps/web` or in GeoQuest? The mockup's *Verify & Check-In*
      is GeoQuest's existing submission flow, which argues for GeoQuest — but the
      chrome in the mockup is Yayi Connect's. Deciding this decides whether the
      card navigates in-app or opens `GEOQUEST_URL` at a deep link.
- [ ] GeoQuest's current UI is a scavenger-hunt/clue layout. A district-filtered
      asset map is a different information architecture, so this is a redesign of
      GeoQuest's main screen, not a new tab on it.
- [ ] Where does asset data come from? `PROJECTS` in `App.jsx` is hardcoded and has
      no coordinates. A real map needs a table with lat/lng, type, status, ward and
      district — related to roadmap Task 1.2 (schema harmonization).
- [ ] Pick a map renderer. Leaflet + OpenStreetMap tiles is free; Mapbox and Google
      Maps both bill per load and would break the $0-until-revenue constraint.

## 3. Wire up airtime disbursement

`apps/geoquest/src/services/RewardService.ts` — `disburseAirtime()` is a stub. It logs,
sleeps 600ms, and returns a fake `STUB-<timestamp>` reference. No Flutterwave call happens.
`SubmissionCard.approve()` calls it after marking a submission approved, so today approving
a submission pays nobody.

`apps/payments-api/server.js` is the real Flutterwave integration and expects
`{ playerName, phone, nin, amountNGN }`.

- [ ] Decide the trust boundary. The browser must not be the thing asserting "pay this
      person ₦X" — a user with devtools can call that endpoint directly with any amount.
      The server should re-verify the submission is genuinely approved, check the reward
      amount against the clue/quest record, and confirm it hasn't already been paid.
- [ ] Add payout idempotency. Flutterwave disbursements don't reverse. A retry, double
      click, or refresh mid-request must not pay twice.
- [ ] Record payouts in a table — who, how much, which submission, Flutterwave reference.
- [ ] Replace the stub with a real call once the above is settled
- [ ] Tidy: payments-api destructures `playerName` and `nin` but never uses them. Only
      `phone` (11 digits) and `amountNGN` (50–1000) are validated or sent. Either drop
      the dead params or start recording them.

## 4. Reconciliation (not started)

- [ ] Root workspace config (`package.json` workspaces or pnpm)
- [ ] Move gateway FE from repo root into `apps/web/`
- [ ] Delete root `server/` — it is a stale duplicate of `apps/payments-api/server.js`
      (the payments-api copy is newer: it handles `playerName` and `nin`)
- [ ] Fix `vite.config.js` — `base: '/gatewayDemo/'` is a GitHub Pages leftover. It makes
      every asset 404 on any non-Pages host, which is why the new Railway gateway service
      serves a blank page.
- [ ] Add a `start` script that serves `dist/`; Railway has nothing to run otherwise
- [ ] Drop the `homepage` field and `gh-pages` dependency once Pages is retired
- [ ] Extract shared types/logic into `packages/shared`
- [ ] One `railway.json` per service, with root directories set

## 5. Cutover (only after everything above verifies)

- [ ] Deploy all services from this repo to Railway, in parallel with the live ones
- [ ] Verify end to end: hunt completion → approval → actual Flutterwave payout
- [ ] Stop the old Railway geoquest service
- [ ] Disable GitHub Pages, delete the `gh-pages` branch
- [ ] Make the repo private
- [ ] Delete the old `gatewayBE` Railway service

## Loose ends

- [ ] `src/assets/6ts.png` and `src/assets/xxv.png` show as unstaged deletions, unrelated
      to this work. Intentional?
- [ ] The old Flutterwave secret key was public in git history for ~7 months
      before the history rewrite. Rotated — but if the repo was ever forked, the old
      history persists in those forks.
