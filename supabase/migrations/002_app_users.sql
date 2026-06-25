-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002: app_users — stores login credentials for customers
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Users table (stores hashed passwords — raw passwords are NEVER stored)
create table if not exists app_users (
  id            uuid        primary key default gen_random_uuid(),
  email         text        unique not null,
  password_hash text        not null,
  full_name     text,
  role          text        not null default 'customer',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2. Auto-update updated_at on every row change
create or replace function update_app_users_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_users_updated_at on app_users;
create trigger app_users_updated_at
  before update on app_users
  for each row execute function update_app_users_updated_at();

-- 3. Row-Level Security (service role bypasses this automatically)
alter table app_users enable row level security;

-- Service role can read/write everything (used by the API server)
drop policy if exists "service_role_all_app_users" on app_users;
create policy "service_role_all_app_users" on app_users
  for all
  using    (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ─────────────────────────────────────────────────────────────────────────────
-- Done. The app_users table is ready.
-- Each time a customer sets their password, a row is upserted here.
-- The API server hashes passwords with scrypt before storing them.
-- ─────────────────────────────────────────────────────────────────────────────
