create table if not exists public.study_logs (
  id text primary key,
  user_id uuid not null,
  log_type text not null check (log_type in ('daily_word_quiz', 'reading_session')),
  kst_date date not null,
  status text not null check (status in ('in_progress', 'completed')),
  content_id text,
  content_type text,
  payload jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists study_logs_user_id_idx
  on public.study_logs (user_id);

create index if not exists study_logs_user_date_idx
  on public.study_logs (user_id, kst_date desc);

create index if not exists study_logs_type_idx
  on public.study_logs (user_id, log_type, kst_date desc);
