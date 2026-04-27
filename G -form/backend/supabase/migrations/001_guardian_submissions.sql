-- ============================================================
-- Run this entire script in your Supabase SQL Editor
-- ============================================================

-- 1. Create the submissions table
create table if not exists public.guardian_submissions (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),

  -- Guardian info
  guardian_name       text not null,
  guardian_phone      text not null,
  guardian_email      text,

  -- Missing child info
  child_name          text not null,
  child_age           int  not null,
  child_gender        text,
  last_seen_date      date not null,
  last_seen_location  text not null,
  description         text,

  -- Uploaded files (stored in Supabase Storage)
  photo_url           text,
  photo_path          text,
  video_url           text,
  video_path          text,

  -- Case status
  status              text not null default 'pending'
    check (status in ('pending', 'active', 'resolved', 'closed'))
);

-- 2. Enable Row Level Security
alter table public.guardian_submissions enable row level security;

-- 3. Allow anyone (anon key) to INSERT submissions
create policy "Allow public insert"
  on public.guardian_submissions
  for insert
  to anon
  with check (true);

-- 4. Allow anyone to SELECT (read) submissions
create policy "Allow public select"
  on public.guardian_submissions
  for select
  to anon
  using (true);

-- ============================================================
-- Storage bucket policies
-- Run these AFTER creating the bucket in the Supabase dashboard:
--   Storage → New bucket → name: missing-person-files → Public: ON
-- ============================================================

-- Allow anon users to upload files to the bucket
create policy "Allow public uploads"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'missing-person-files');

-- Allow anon users to read/list files
create policy "Allow public reads"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'missing-person-files');
