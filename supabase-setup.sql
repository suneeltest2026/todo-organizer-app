-- To-Do Organizer: database setup
-- Run this once in Supabase: SQL Editor -> New query -> paste this whole file -> Run

create table if not exists public.activities (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace text not null,
  name text not null,
  status text not null,
  notes text,
  period text not null,
  date date not null,
  time text,
  priority text,
  subtasks jsonb,
  recurrence text,
  period_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activities_user_workspace_idx
  on public.activities (user_id, workspace);

alter table public.activities enable row level security;

drop policy if exists "activities_select_own" on public.activities;
create policy "activities_select_own" on public.activities
  for select using (auth.uid() = user_id);

drop policy if exists "activities_insert_own" on public.activities;
create policy "activities_insert_own" on public.activities
  for insert with check (auth.uid() = user_id);

drop policy if exists "activities_update_own" on public.activities;
create policy "activities_update_own" on public.activities
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "activities_delete_own" on public.activities;
create policy "activities_delete_own" on public.activities
  for delete using (auth.uid() = user_id);

create table if not exists public.workspace_settings (
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace text not null,
  statuses jsonb not null,
  default_view_mode text not null,
  enabled_periods jsonb not null,
  reminder jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, workspace)
);

alter table public.workspace_settings enable row level security;

drop policy if exists "settings_select_own" on public.workspace_settings;
create policy "settings_select_own" on public.workspace_settings
  for select using (auth.uid() = user_id);

drop policy if exists "settings_insert_own" on public.workspace_settings;
create policy "settings_insert_own" on public.workspace_settings
  for insert with check (auth.uid() = user_id);

drop policy if exists "settings_update_own" on public.workspace_settings;
create policy "settings_update_own" on public.workspace_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "settings_delete_own" on public.workspace_settings;
create policy "settings_delete_own" on public.workspace_settings
  for delete using (auth.uid() = user_id);
