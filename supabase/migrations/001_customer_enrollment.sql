-- ── customer_enrollment table ────────────────────────────────────────────────
-- Run this in the Supabase SQL Editor to create the customer enrollment schema.
--
-- Steps:
-- 1. Open your Supabase project → SQL Editor
-- 2. Paste this entire file and click Run
-- 3. Then create a Storage bucket named "customer-documents" (public: false)
--    via Supabase Dashboard → Storage → New Bucket

create extension if not exists "pgcrypto";

create table if not exists public.customer_enrollment (
  id                      uuid primary key default gen_random_uuid(),
  full_name               text not null,
  email                   text not null unique,
  phone                   text,
  company_name            text,
  country                 text,
  business_type           text,
  preferred_contact       text,
  selected_package        text,
  document_name           text,
  document_url            text,
  onboarding_status       text not null default 'enrollment_completed',
  payment_status          text not null default 'pending',
  password_created        boolean not null default false,
  game_selected           boolean not null default false,
  customization_completed boolean not null default false,
  dashboard_completed     boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

-- Keep updated_at current automatically
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customer_enrollment_updated_at on public.customer_enrollment;
create trigger customer_enrollment_updated_at
  before update on public.customer_enrollment
  for each row execute function public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table public.customer_enrollment enable row level security;

-- Service-role key (used by api-server) bypasses RLS automatically.
-- These policies cover anon/authenticated users if you ever use the client SDK directly.

-- Allow reading own row only (by email match or user_id)
create policy "Users can view own enrollment"
  on public.customer_enrollment for select
  using (auth.email() = email);

-- Allow inserting own row
create policy "Users can insert own enrollment"
  on public.customer_enrollment for insert
  with check (auth.email() = email);

-- Allow updating own row
create policy "Users can update own enrollment"
  on public.customer_enrollment for update
  using (auth.email() = email);

-- ── Storage bucket (reminder) ─────────────────────────────────────────────────
-- Create "customer-documents" bucket manually in Supabase Dashboard → Storage.
-- Set it to private (not public) and configure signed URLs for downloads.
