# Quest Submission Flow — Handover for Sonnet

## TL;DR root causes

1. **The URL validator silently kills the click.**
   `src/components/ui/NotificationDrawer.tsx:14` defines `const URL_RE = /^https?:\/\/.+/i;`. The user types `instagram.com`. `URL_RE.test("instagram.com")` is `false`, so the Submit Final button stays `disabled` (line 141) and the click never fires `submitLink()`. That's why the player sees "no loading animation," "no success message," and the admin never receives the link — `setBusy(true)` and the `.update()` call simply never execute. After refresh, `post_link` is still null in DB, so the link form re-appears. **All three symptoms collapse to this one bug.**

2. **Photo-only submissions reach the admin queue.**
   `src/components/ui/QuestSubmitFlow.tsx` INSERTs with `status='pending'` the moment the photo uploads. `AdminConsole.tsx` queries by `status` alone, so a draft photo (no link yet) is visible to the admin. The map flag and the StatusDot also flip to "pending" colors at this point, instead of staying neutral until the link is attached.

3. **Desired model (per the user):** A submission row exists after photo upload (storage requires it), but it is a **draft** until `post_link` is set. Drafts must not appear to the admin and must render with a **grey** indicator on the player side. Setting `post_link` promotes the row to "real" pending — admin sees it live, dot/flag turns **orange**.

---

## Required changes, in priority order

### 1. Permissive URL validation — `src/components/ui/NotificationDrawer.tsx`

Replace the regex on line 14 with a permissive matcher and add a normalizer that auto-prepends `https://` when missing:

```ts
const URL_RE = /\S+\.\S+/;

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
```

Inside `submitLink()` (lines 94–118):

- Update the validation message: `setError('Please enter a valid URL.');`
- Compute `const finalUrl = normalizeUrl(link);` once at the top of `try`.
- Use `finalUrl` in the DB update payload (`post_link: finalUrl`).
- Use `finalUrl` in the optimistic `upsertSubmission({ ...submission, post_link: finalUrl })`.

The button on line 141 keeps `disabled={!URL_RE.test(link) || busy}` — now `instagram.com` passes (`X.Y` matches), the click fires, the spinner shows, the DB update runs, and the success animation plays.

---

### 2. Hide drafts from the admin queue — `src/components/admin/AdminConsole.tsx`

Inside the `load()` function, after `.eq('status', status)`, add an `.or(...)` that admits clue submissions unconditionally and quest submissions only when they have a link:

```ts
.eq('status', status)
.or('submission_kind.eq.clue,post_link.not.is.null')
```

Apply the **same** `.or(...)` to the count query a few lines below:

```ts
const { count } = await adminClient
  .from('submissions')
  .select('id', { count: 'exact', head: true })
  .eq('status', s)
  .or('submission_kind.eq.clue,post_link.not.is.null');
```

Result: drafts (quest + pending + null link) disappear from the pending tab and from its badge; once the player attaches a link, the realtime UPDATE handler reloads the list and the row appears live.

---

### 3. Orange pin only when link is submitted — `src/components/map/QuestMarkersLayer.tsx`

In the `pendingQuestIds` selector (around lines 42–48), tighten the predicate so a row counts as "pending on the map" only after the link is attached:

```ts
const pendingQuestIds = useNotificationStore(
  useShallow((s) =>
    s.submissions
      .filter((sub) =>
        sub.submission_kind === 'quest' &&
        sub.status === 'pending' &&
        sub.post_link !== null &&  // ADDED
        sub.quest_id
      )
      .map((sub) => sub.quest_id as string),
  ),
);
```

No other change needed in this file — the FlagPin already maps `pending=true` to orange.

---

### 4. Grey StatusDot for draft — `src/components/ui/NotificationDrawer.tsx` + `src/index.css`

Change `StatusDot` (around lines 25–33) to take the full submission and derive a `'draft'` class when the row is a quest with `pending` status and no `post_link`:

```tsx
function StatusDot({ sub }: { sub: SubmissionWithMeta }) {
  const isDraft =
    sub.submission_kind === 'quest' &&
    sub.status === 'pending' &&
    !sub.post_link;
  const cls = isDraft ? 'draft' : sub.status;
  const label = isDraft ? 'Draft (add link)' : sub.status[0].toUpperCase() + sub.status.slice(1);
  return (
    <span
      className={`status-dot status-dot-${cls}`}
      title={label}
      aria-label={`Status: ${cls}`}
    />
  );
}
```

Update the call site in the `notif-card` (around line 202):

```tsx
<StatusDot sub={sub} />
```

Add the new dot color in `src/index.css` next to the existing rules (lines ~1497–1499):

```css
.status-dot-draft    { background: oklch(0.66 0.02 75); }
```

---

### 5. Distinguish draft vs pending in the quest scroll panel — `src/components/ui/QuestScrollPanel.tsx`

Currently `alreadySubmitted` collapses draft, pending, and approved into one branch and renders "Submission pending review." Replace it with a four-way state so a draft prompts the user to finish the link step:

```tsx
const latestSubmission = useNotificationStore((s) => {
  if (!quest) return null;
  const subs = s.submissions.filter((sub) => sub.quest_id === quest.id);
  if (!subs.length) return null;
  return subs.reduce((latest, sub) =>
    sub.submitted_at > latest.submitted_at ? sub : latest,
  );
});

const submissionState: 'none' | 'draft' | 'pending' | 'approved' | 'rejected' =
  latestSubmission?.status === 'rejected' ? 'rejected'
  : latestSubmission?.status === 'approved' ? 'approved'
  : latestSubmission?.status === 'pending' && !latestSubmission.post_link ? 'draft'
  : latestSubmission?.status === 'pending' ? 'pending'
  : getSubmittedQuests().includes(quest.id) ? 'pending' : 'none';
```

Replace the `alreadySubmitted` rendering branch (around lines 95–96). **The `'rejected'` and `'none'` cases must fall through to the existing sign-in / geofence / submit-flow chain** — that's how a previously-declined player gets the photo capture flow back:

```tsx
{quest.solved_by ? (
  <div className="solved-state">…</div>
) : submissionState === 'pending' || submissionState === 'approved' ? (
  <p className="muted-callout">Submission pending review.</p>
) : submissionState === 'draft' ? (
  <p className="muted-callout">Photo uploaded — open <strong>Quests</strong> in your profile drawer and paste the post link to send it to admin.</p>
) : !user ? (
  // existing sign-in branch — applies to 'rejected' and 'none' when not signed in
  …
) : !canSubmit ? (
  // existing geofence branch — applies to 'rejected' and 'none' when out of range
  …
) : (
  // existing submit-flow branch — 'rejected' and 'none' players land here and re-do photo + link
  …
)}
```

If anything else in this file references `alreadySubmitted`, swap it for `submissionState !== 'none' && submissionState !== 'rejected'`.

#### Why this also fixes the "declined player still sees pending review" bug

This is the same structural fix — the bug existed because `alreadySubmitted` collapsed every non-approved/non-solved state into a single "Submission pending review" message, including rows in `'rejected'` status. The new `submissionState` branches `'rejected'` separately, and because there's no `submissionState === 'rejected'` arm in the JSX, that case falls through to the submit flow and the player can re-take a photo.

Two existing mechanisms keep the local cache in sync (do not remove either — both are load-bearing):

- `src/pages/GamePage.tsx` — on auth boot, after loading submissions, filters rejected `quest_id`s out of the `submitted_quests` localStorage key.
- `src/components/ui/NotificationDrawer.tsx` realtime UPDATE handler — when an inbound update has `status === 'rejected'`, removes its `quest_id` from the same localStorage key.

Together with the new `submissionState`, the order of precedence is: **store > localStorage**. If the store has any submission for this quest, its status wins; localStorage is only consulted when the store has nothing for that quest yet (e.g. before submissions have finished loading on cold boot). That's correct — once the store loads, a rejected row will set `submissionState='rejected'` regardless of stale localStorage.

---

## Testing checklist (run after every fix is in)

URL field:
- [ ] Type `instagram.com` → Submit Final becomes enabled.
- [ ] Click → spinning Loader2 + "Sending…" → success message animates in (~1s) → card transitions to "View social post."
- [ ] Refresh — submission shows as pending review (link form is gone).

Map / status dot:
- [ ] After photo upload, before link: flag stays red, status dot is grey.
- [ ] After link submission: flag turns orange, status dot turns orange.
- [ ] Admin approves: flag turns white.

Admin queue (with two browser windows):
- [ ] Player uploads a photo. Admin pending tab does **not** show it. Badge count unchanged.
- [ ] Player adds the link. Admin tab shows the new card live (no refresh). Coords line reads `lat, lng · link↗` and the link is clickable.
- [ ] Admin declines. Player's notification card flips to rejected. Player can open the same quest and submit a fresh photo without a page refresh.

Quest scroll panel:
- [ ] Mid-draft (photo uploaded, no link), opening the quest shows "Photo uploaded — open Quests…" message, not "Submission pending review."
- [ ] After link is added, opening the quest shows "Submission pending review."
- [ ] **After admin declines, opening the quest shows the submit flow again** (Get Directions + Submit Quest), NOT "Submission pending review." This works without a page refresh because the realtime UPDATE handler clears the rejected row from localStorage and pushes the new status into the store, and `submissionState='rejected'` falls through to the submit branch.

---

## Other observations (flagging for later — non-blocking)

- **Image transforms.** `SignedThumb` calls `createSignedUrl(path, 3600, { transform: { width: 400, quality: 70, resize: 'cover' } })`. If this Supabase project isn't on a plan that supports image transforms, the call may return an error and `data.signedUrl` will be undefined — no thumbnail. If thumbs go missing, fall back to a plain `createSignedUrl(path, 3600)`.

- **Admin realtime is coarse.** Every INSERT/UPDATE on `submissions` triggers a full reload + recount. Fine for low volume, will flicker under load. Future optimization: patch individual rows in state.

- **Auto-download on capture.** `handlePhotoCapture` in `QuestSubmitFlow.tsx` auto-downloads the original photo to the device. Useful for re-posting on social, but it surprises the user. Consider gating behind an explicit "Save to device" button.

- **Duplicate-submission concerns.** After a rejection, a new photo upload INSERTs a second row. Code already picks the latest by `submitted_at`. Worth confirming there is no `UNIQUE(user_id, quest_id)` constraint on the DB — if there is, the resubmit INSERT will fail and we need an upsert.

- **`LinkForm`'s second branch is unreachable.** Lines 75–82 render "Submission pending review" when `submission.post_link` is truthy, but the parent only mounts `LinkForm` when `!sub.post_link` — that branch can never run. Safe to delete after the fixes above.
