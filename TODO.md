# Monorepo consolidation — outstanding work

## 1. Finish the service_role remediation

The code fix is committed (`6efe0f0`), but the leaked key is still valid until rotated.
Order matters — doing these out of order locks you out of the admin console.

- [ ] Apply `apps/geohunt/supabase/migrations/004_admin_rls.sql` to Supabase
- [ ] Create a dedicated admin user (Auth → Users → Add user, real email, auto-confirm)
- [ ] Insert its `profiles` row with `is_admin = true` — dashboard-created users have no
      profile row, and `is_admin()` reads from `profiles`
- [ ] Confirm `select id, username, is_admin from profiles where is_admin;` returns a row
- [ ] **Rotate the Supabase `service_role` key** (Settings → API). The old key has been
      public in the geohunt bundle since deploy; rotation is what actually invalidates it.
- [ ] Verify the admin console still loads and approve/reject works

## 2. Clean up Railway env vars

- [ ] Delete `VITE_ADMIN_SUPABASE_KEY` from the geohunt service — nothing reads it now,
      and leaving it invites it being wired back in
- [ ] Delete `VITE_ADMIN_PASSWORD` — admin auth is a real Supabase Auth account now
- [ ] Export the remaining values to a password manager before any service teardown.
      Deleting a Railway service destroys its variables.

## 3. Wire up airtime disbursement

`apps/geohunt/src/services/RewardService.ts` — `disburseAirtime()` is a stub. It logs,
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
- [ ] Stop the old Railway geohunt service
- [ ] Disable GitHub Pages, delete the `gh-pages` branch
- [ ] Make the repo private
- [ ] Delete the old `gatewayBE` Railway service

## Loose ends

- [ ] `src/assets/6ts.png` and `src/assets/xxv.png` show as unstaged deletions, unrelated
      to this work. Intentional?
- [ ] The Flutterwave key `FLWSECK-f50115f9...` was public in git history for ~7 months
      before the history rewrite. Rotated — but if the repo was ever forked, the old
      history persists in those forks.
