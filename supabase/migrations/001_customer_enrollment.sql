-- ── customer_enrollment table ────────────────────────────────────────────────
-- HOW TO RUN:
-- 1. Open your Supabase project → SQL Editor
-- 2. Paste this ENTIRE file and click "Run"
-- 3. Then run the storage bucket section at the bottom (separate SQL block)

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

create policy "Users can view own enrollment"
  on public.customer_enrollment for select
  using (auth.email() = email);

create policy "Users can insert own enrollment"
  on public.customer_enrollment for insert
  with check (true);

create policy "Users can update own enrollment"
  on public.customer_enrollment for update
  using (true);

-- ── Storage bucket ────────────────────────────────────────────────────────────
-- Run this block AFTER the table is created (can be same run or separate):

insert into storage.buckets (id, name, public)
values ('customer-documents', 'customer-documents', false)
on conflict (id) do nothing;

-- Allow server-side uploads (anon key without user session context)
create policy "Allow document uploads"
  on storage.objects for insert
  with check (bucket_id = 'customer-documents');

-- Allow reads from the bucket
create policy "Allow document reads"
  on storage.objects for select
  using (bucket_id = 'customer-documents');
