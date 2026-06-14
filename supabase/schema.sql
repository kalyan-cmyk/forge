-- ================================================================
-- FORGE — Supabase Database Schema
-- Run this in your Supabase project: SQL Editor → New query → Run
-- ================================================================

-- ── PROFILES ────────────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific data

create table if not exists public.profiles (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null unique,
  full_name     text not null,
  role          text not null default 'user' check (role in ('user', 'curator')),
  city          text,
  values_assessment     jsonb,
  assessment_completed_at timestamptz,
  created_at    timestamptz default now() not null
);

-- RLS: users can read/update their own profile; curators can read all
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Curators can read all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'curator'
    )
  );


-- ── MATCHES ─────────────────────────────────────────────────────

create table if not exists public.matches (
  id            uuid default gen_random_uuid() primary key,
  user1_id      uuid references auth.users(id) on delete cascade not null,
  user2_id      uuid references auth.users(id) on delete cascade not null,
  status        text not null default 'matched' check (
    status in (
      'pending', 'matched', 'adventure_designed',
      'adventure_active', 'adventure_completed', 'report_ready'
    )
  ),
  curator_id    uuid references auth.users(id),
  curator_notes text,
  created_at    timestamptz default now() not null
);

alter table public.matches enable row level security;

create policy "Users can read own matches"
  on public.matches for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Curators can read and write all matches"
  on public.matches for all
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'curator'
    )
  );

create policy "Curators can update matches"
  on public.matches for update
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'curator'
    )
  );


-- ── ADVENTURES ──────────────────────────────────────────────────

create table if not exists public.adventures (
  id                    uuid default gen_random_uuid() primary key,
  match_id              uuid references public.matches(id) on delete cascade not null,
  title                 text not null,
  description           text not null,
  challenge_types       text[] not null default '{}',
  briefing              text not null,
  logistics             text not null default '',
  pre_adventure_prompt  text not null default '',
  created_by            uuid references auth.users(id),
  created_at            timestamptz default now() not null
);

alter table public.adventures enable row level security;

-- Users can read adventures for their matches
create policy "Users can read own adventures"
  on public.adventures for select
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id
        and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

create policy "Curators can manage adventures"
  on public.adventures for all
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'curator'
    )
  );


-- ── DEBRIEFS ────────────────────────────────────────────────────

create table if not exists public.debriefs (
  id            uuid default gen_random_uuid() primary key,
  adventure_id  uuid references public.adventures(id) on delete cascade not null,
  user_id       uuid references auth.users(id) on delete cascade not null,
  responses     jsonb not null,
  submitted_at  timestamptz default now() not null,
  unique(adventure_id, user_id)
);

alter table public.debriefs enable row level security;

create policy "Users can insert own debrief"
  on public.debriefs for insert
  with check (auth.uid() = user_id);

create policy "Users can read own debrief"
  on public.debriefs for select
  using (auth.uid() = user_id);

create policy "Curators can read all debriefs"
  on public.debriefs for select
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'curator'
    )
  );


-- ── REPORTS ─────────────────────────────────────────────────────

create table if not exists public.reports (
  id            uuid default gen_random_uuid() primary key,
  adventure_id  uuid references public.adventures(id) on delete cascade not null,
  match_id      uuid references public.matches(id) on delete cascade not null,
  content       text not null,
  created_by    uuid references auth.users(id),
  created_at    timestamptz default now() not null
);

alter table public.reports enable row level security;

-- Users in the match can read the report
create policy "Users can read own reports"
  on public.reports for select
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id
        and (m.user1_id = auth.uid() or m.user2_id = auth.uid())
    )
  );

create policy "Curators can manage reports"
  on public.reports for all
  using (
    exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role = 'curator'
    )
  );


-- ── AUTO-CREATE PROFILE ON SIGNUP ───────────────────────────────
-- This trigger creates a profile row automatically when a user signs up

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, full_name, city, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'city', null),
    'user'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
