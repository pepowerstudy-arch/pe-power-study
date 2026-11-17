-- Diagnostic exam results: one row per attempt.
-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.

create table if not exists public.diagnostic_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  score integer not null,
  total integer not null,
  topic_scores jsonb not null,          -- [{ topic, correct, total, percent }, ...]
  answers jsonb not null,               -- chosen choice index per question (null = skipped)
  question_set_version text not null    -- which version of the question bank was used
);

create index if not exists diagnostic_results_user_created_idx
  on public.diagnostic_results (user_id, created_at desc);

alter table public.diagnostic_results enable row level security;

-- Users can read and add only their own results. No update/delete policy,
-- so past attempts can't be edited.
create policy "Users can read own diagnostic results"
  on public.diagnostic_results for select
  using (auth.uid() = user_id);

create policy "Users can insert own diagnostic results"
  on public.diagnostic_results for insert
  with check (auth.uid() = user_id);
