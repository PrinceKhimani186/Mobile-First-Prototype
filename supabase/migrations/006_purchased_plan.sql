-- ── purchased_plan column ─────────────────────────────────────────────────────
-- The plan the customer actually paid for, written ONLY by the server after
-- verifying the Stripe checkout session (webhook or server-side session
-- retrieval). Never written from unverified frontend data.
--
-- HOW TO RUN:
-- 1. Open your Supabase project → SQL Editor
-- 2. Paste this ENTIRE file and click "Run"

alter table public.customer_enrollment
  add column if not exists purchased_plan text;

alter table public.customer_enrollment
  drop constraint if exists customer_enrollment_purchased_plan_check;

alter table public.customer_enrollment
  add constraint customer_enrollment_purchased_plan_check
  check (
    purchased_plan is null
    or purchased_plan in ('essentials', 'accelerator', 'empire')
  );
