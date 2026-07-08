-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 005: Add game/customization/payment fields to customer_enrollment
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Without these columns, the customer dashboard has nowhere to read app_name /
-- tagline / monetization / game_type / payment_type from once a client is on a
-- different device/browser than the one that filled out onboarding — those
-- values previously only existed in localStorage and in GoHighLevel custom
-- fields, never in a queryable per-email database row.
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.customer_enrollment
  add column if not exists game_type    text,
  add column if not exists app_name     text,
  add column if not exists tagline      text,
  add column if not exists monetization text,
  add column if not exists payment_type text,
  add column if not exists source       text;

-- ─────────────────────────────────────────────────────────────────────────────
-- Done.
-- game_type    — name of the game template chosen during onboarding
-- app_name     — client's chosen app name from the customization form
-- tagline      — client's chosen tagline from the customization form
-- monetization — client's chosen monetization model from the customization form
-- payment_type — "subscription" or "monthly", chosen at checkout
-- source       — lead source (e.g. "Direct", "Cold Calling") captured at funnel entry
-- ─────────────────────────────────────────────────────────────────────────────
