-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003: user_agreements — stores client signature images, pdf paths, and legal consent
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.user_agreements (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references public.customer_enrollment(id) on delete cascade,
  email             text not null,
  full_name         text not null,
  agreement_version text not null default '1.0',
  signature_image   text not null, -- Base64 representation of the canvas signature
  signed_at         timestamptz not null default now(),
  ip_address        text,
  user_agent        text,
  pdf_url           text,
  created_at        timestamptz not null default now()
);

-- Enable RLS
alter table public.user_agreements enable row level security;

-- Policies for RLS
drop policy if exists "Users can view own agreements" on public.user_agreements;
create policy "Users can view own agreements"
  on public.user_agreements for select
  using (auth.email() = email);

drop policy if exists "Users can insert own agreements" on public.user_agreements;
create policy "Users can insert own agreements"
  on public.user_agreements for insert
  with check (true);

drop policy if exists "Service role all access" on public.user_agreements;
create policy "Service role all access"
  on public.user_agreements for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
