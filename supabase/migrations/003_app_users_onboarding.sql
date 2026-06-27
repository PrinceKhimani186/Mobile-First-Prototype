-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003: Add onboarding progress flags to app_users
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

alter table app_users
  add column if not exists game_selection_completed   boolean not null default false,
  add column if not exists customization_form_completed boolean not null default false,
  add column if not exists selected_game              text;

-- ─────────────────────────────────────────────────────────────────────────────
-- Done.
-- game_selection_completed   — true once user picks their game template
-- customization_form_completed — true once user submits the customization form
-- selected_game              — name of the game template chosen (nullable)
-- ─────────────────────────────────────────────────────────────────────────────
