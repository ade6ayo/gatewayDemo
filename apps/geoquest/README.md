# GeoQuest

GeoQuest is a mobile-first PWA for location-based scavenger hunts in Nigeria. Players load nearby clue regions on a MapLibre map, travel into a region, read a parchment-style riddle, take a verification selfie at the answer location, and earn airtime after an admin approves the submission.

## Stack

- Vite, React 18, TypeScript
- MapLibre GL through `react-map-gl` v8
- MapTiler vector tile styles
- Supabase Auth, Postgres, Storage, and Realtime
- Zustand with `useShallow`
- Turf geofencing
- Framer Motion overlays
- Tailwind CSS
- Railway static deployment

## Environment

Copy `.env.example` to `.env.local` and fill in:

- `VITE_MAPTILER_KEY`: Map style key from `maptiler.com/cloud`
- `VITE_SUPABASE_URL`: Supabase project URL from `app.supabase.com`
- `VITE_SUPABASE_ANON_KEY`: Supabase anon public key
- `VITE_OPENCAGE_KEY`: Reverse geocoding key from `opencagedata.com`
- `VITE_ADMIN_PASSWORD`: Lightweight `/admin` password
- `VITE_ADMIN_SUPABASE_KEY`: Supabase service role key, used only by `AdminConsole.tsx`

Do not hardcode these values in source.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app routes `/` to the game and `/admin` to the admin console.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial.sql` in SQL Editor.
3. Run `supabase/seed.sql` for test clues.
4. In Auth settings, disable email confirmation. This is required because player auth uses generated internal emails like `username@geoquest.app`.
5. Confirm the private Storage bucket `submission-photos` exists.
6. Keep the service role key private. It is required for the iteration 1 admin console to read answer fields and approve submissions.

Client clue queries explicitly select only safe columns and never request `answer_name`, `answer_lat`, or `answer_lng`.

## Railway Deployment

1. Create a Railway project at `railway.app`.
2. Add the environment variables from `.env.example`.
3. Deploy the repo. `railway.json` runs `npm run build` and serves `dist` on port `3000`.

## Admin Console

Visit `/admin`, enter `VITE_ADMIN_PASSWORD`, then review pending submissions. Approval updates the submission, marks the clue solved, stores a one-year signed photo URL, increments the player profile count, and calls the Flutterwave-ready airtime stub in `RewardService.ts`.

## Iteration 1 Notes

Out of scope for this build: NIN verification, bank payouts, admin clue creation UI, password recovery, multi-photo submissions, push notifications, leaderboard, social sharing, and difficulty tiers.
