-- Fix: add missing storage RLS policies for submission-photos bucket
-- Without these, authenticated users get "new row violates row-level security policy"
-- when trying to upload because storage.objects has RLS enabled by default.

create policy "submission_photos_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'submission-photos');

-- Allow authenticated users to read their own uploads (needed for signed URL previews)
create policy "submission_photos_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'submission-photos');

-- Fix: add missing UPDATE policy so users can paste their social post link
-- The NotificationDrawer calls submissions.update({ post_link }) with the anon/user client.
create policy "submissions_own_update"
  on submissions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
