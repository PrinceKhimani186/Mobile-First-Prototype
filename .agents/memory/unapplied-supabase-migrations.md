---
name: Unapplied Supabase migrations
description: This project's Supabase DB has no automated migration runner; expect some columns referenced by app code to not exist live yet.
---

This project keeps Supabase schema changes as raw SQL files under `supabase/migrations/*.sql`, but there is no automated way to apply them — the agent only holds REST-level Supabase keys (URL, anon key, service role key), not a direct Postgres connection string/password needed to run DDL. Migrations must be run manually by a human in the Supabase SQL Editor.

**Why:** This has repeatedly caused "column missing" (`PGRST204`) errors in production-like testing right after adding new fields, for multiple tables (`app_users`, `user_agreements`, `customer_enrollment`) across different sessions — the code was correct, the live schema was just behind.

**How to apply:** When adding a new Supabase column, (1) write the migration SQL file, (2) tell the user explicitly to run it in the Supabase SQL Editor, and (3) make the write path retry without any column PostgREST reports as missing (see `supabase-postgrest-errors.md`) so the feature degrades gracefully instead of hard-failing until the migration is applied.
