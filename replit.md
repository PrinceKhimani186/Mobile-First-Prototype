# App Squad Inc.

Mobile game app launch funnel with a client-facing enrollment/onboarding flow and an RBAC admin panel for staff to manage client projects.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server
- `pnpm --filter @workspace/app-squad run dev` — run the App Squad web frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` (Postgres), `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`, `GHL_API_KEY` / `GHL_LOCATION_ID`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Two separate databases (see "Where things live")
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- **Two separate databases, do not confuse them:**
  - `DATABASE_URL` (Postgres + Drizzle ORM) — staff/admin side: `projects`, `admin_users`, `project_assignments`. Schema lives under the `db` lib; push with `pnpm --filter @workspace/db run push`.
  - `SUPABASE_URL` (Supabase project, accessed via `@supabase/supabase-js` REST client, not Drizzle) — client/enrollment side: `customer_enrollment`, `app_users`, `user_agreements`. Only touched from `artifacts/api-server/src/routes/enrollment-supabase.ts` and `auth.ts`. Schema changes live as raw SQL files in `supabase/migrations/*.sql` and must be run manually in the Supabase SQL Editor (no automated migration tooling exists for this DB, and the agent only holds REST-level keys, not a Postgres connection string).
- Client enrollment flow: `enrollment.tsx` → `game-selection.tsx` → `customize.tsx` → `agreement.tsx` → `dashboard.tsx`, all persisting to `customer_enrollment` via `services/enrollment.ts`.
- `dashboard.tsx` sources its data from `GET /api/enrollment/progress?email=<logged-in email>` (the `customer_enrollment` row for that email) — never from local/component state alone — to avoid showing stale or another client's data.
- GHL (GoHighLevel) contact sync: `artifacts/api-server/src/routes/ghl.ts`, `POST /ghl/contact`. Always searches for an existing contact by email first (`/contacts/search/duplicate`) before creating, to avoid duplicate contacts.

## Architecture decisions

- Dashboard data is always re-fetched by logged-in email from `customer_enrollment` on load rather than trusting client-side/router state, since the latter caused stale/wrong-client data to appear after login.
- GHL contact creation is search-first (find by email, then create-or-update), not create-then-catch-duplicate — the latter was unreliable because GHL doesn't always return a usable contact id on a duplicate-create error, which is what caused duplicate contacts.
- Supabase writes for optional/newer `customer_enrollment` columns (`game_type`, `app_name`, `tagline`, `monetization`, `payment_type`, `source`) retry without any column PostgREST reports missing, so the app degrades gracefully instead of failing outright when a migration hasn't been applied yet in Supabase.

## Product

- Client-facing funnel: enrollment form → game type selection → app customization (name/tagline/monetization) → agreement signing (Zoho Sign) → dashboard showing the client's own submitted data and project status.
- Staff-facing RBAC admin panel: manage client projects, approvals, and assignments.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Zoho Sign has a daily developer document quota. When hit, `agreement.tsx` shows a "Bypass Zoho Sign & Proceed (Dev Mode)" button (`POST /api/enrollment/dev-sign`) that simulates the full webhook flow without consuming quota.
- Supabase/PostgREST returns `PGRST204` (not Postgres's `42703`) for a missing-column error. Any "retry insert without optional columns" fallback must check both codes — see `.agents/memory/supabase-postgrest-errors.md`.
- `supabase/migrations/005_customer_enrollment_customization.sql` (adds `game_type`, `app_name`, `tagline`, `monetization`, `payment_type`, `source` to `customer_enrollment`) has not been applied to the live Supabase DB yet — run it manually in the Supabase SQL Editor. Until then, those fields are silently dropped on write (logged as warnings) rather than causing failures.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
