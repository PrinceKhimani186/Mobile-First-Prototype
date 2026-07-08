---
name: Supabase/PostgREST missing-column errors
description: How to detect a "column doesn't exist yet" error from Supabase's PostgREST layer, since it does not use Postgres's own error code.
---

When a table is missing a column that application code tries to insert/select, the error surfaced through Supabase's JS client depends on which layer raised it:

- Direct Postgres error: `code: "42703"`, message mentions "does not exist".
- PostgREST (Supabase's REST API in front of Postgres): `code: "PGRST204"`, message like `Could not find the 'X' column of 'table' in the schema cache` — this happens when the column truly doesn't exist yet, or PostgREST's schema cache is simply stale.

**Why:** A retry-without-that-column fallback that only checks for `42703` / "does not exist" will silently miss `PGRST204` responses and the insert will keep failing even though the fallback code path exists and looks correct.

**How to apply:** Any "detect missing column, retry without it" helper must check for both `error.code === "42703"` and `error.code === "PGRST204"`, and match message text for both "does not exist" and "schema cache".
