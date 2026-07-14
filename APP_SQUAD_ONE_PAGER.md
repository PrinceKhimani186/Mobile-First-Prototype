# App Squad Inc. — Project One-Pager

**Live URL:** https://ownyourgameapp.com | https://appsquadinc.com

---

## What This App Does

A mobile game app launch funnel for clients. A client visits the site, picks a plan, pays, signs an agreement, and lands on a dashboard showing their project status. Staff manage all client projects through a separate admin panel.

---

## Payments — Stripe

**What it is:** Stripe handles all client payments at checkout.

**How it works:**
1. Client picks a plan and clicks "Enroll Now"
2. They fill in their name and email on the enrollment page
3. They are sent to a Stripe-hosted checkout page to pay
4. After successful payment, Stripe redirects them to the agreement signing page

**Plans and pricing:**

| Plan | Paid in Full | Monthly Option |
|------|-------------|----------------|
| App Launch Essentials | $2,497 | $497 today + $197/mo × 12 |
| App Ownership Accelerator | $4,997 | $997 today + $397/mo × 12 |
| App Empire Package | $9,997 | $4,997 today + $497/mo × 12 |

**Where price IDs live:** Replit Secrets → `VITE_STRIPE_PRICE_*` (production values). There are 6 secrets — one per plan per payment type (full and monthly setup fee).

---

## Databases — Two Separate Systems

### 1. Client Database (Supabase)
**Used for:** Everything the client touches — enrollment data, login, agreements.

**Tables:**
- `customer_enrollment` — stores each client's plan, payment type, app name, tagline, game type, and project status
- `app_users` — client login accounts
- `user_agreements` — tracks whether a client has signed their agreement

**Access:** Via Supabase dashboard at supabase.com using the project linked to `SUPABASE_URL`.

### 2. Staff/Admin Database (PostgreSQL via Drizzle ORM)
**Used for:** Admin panel data — staff accounts, client projects, and assignments.

**Tables:**
- `admin_users` — staff login accounts and roles
- `projects` — client project records managed by staff
- `project_assignments` — which staff member is assigned to which project

**Access:** Managed via `DATABASE_URL` (Postgres connection string in Replit Secrets).

---

## Agreement Signing — Zoho Sign

**What it is:** After payment, clients are sent a contract to sign digitally via Zoho Sign.

**How it works:**
1. After Stripe payment succeeds, client is redirected to the agreement page
2. The app sends a signing request to Zoho Sign using a pre-built template
3. Client signs directly inside the app (embedded signing)
4. Zoho Sign sends a webhook back confirming the signature
5. Client is then redirected to their dashboard

**Dev note:** Zoho Sign has a daily developer document quota. When the quota is hit, a "Bypass (Dev Mode)" button appears that simulates the signing flow without consuming quota.

**Secrets needed:** `ZOHO_SIGN_CLIENT_ID`, `ZOHO_SIGN_CLIENT_SECRET`, `ZOHO_SIGN_REFRESH_TOKEN`

---

## GoHighLevel (GHL) Integration

**What it is:** Every time a client submits the enrollment form, their contact is automatically created or updated inside GoHighLevel (CRM).

**How it works:**
- When a client clicks "Proceed to Payment," before they reach Stripe, the app sends their details to GHL
- The app **searches GHL first by email** to avoid duplicate contacts — if the contact already exists, it updates them; if not, it creates a new one
- A tag `enrollment-submitted` is added to the contact in GHL so staff can filter and follow up

**Data sent to GHL from the enrollment form:**

| Field | What It Is |
|-------|-----------|
| First Name | Client's first name |
| Last Name | Client's last name |
| Email | Client's email address |
| Phone | Client's phone number (if provided) |
| Tag | `enrollment-submitted` (always applied) |

**Secrets needed:** `GHL_API_KEY`, `GHL_LOCATION_ID`

The GHL route also accepts additional data (custom fields, tags, app name, game template) from the admin panel when staff manually update a contact.

---

## Admin Panel

**What it is:** A staff-only dashboard where the team manages client projects, assigns staff, and tracks progress.

**How to access:**
- URL: `https://ownyourgameapp.com/admin` (or `/admin` on any domain)
- Login with an admin username and password
- Default admin credentials are set via the `ADMIN_PASSWORD` secret in Replit

**What staff can do:**
- View all client projects and their statuses
- Assign team members to specific projects
- Update project progress visible to the client on their dashboard
- Manage admin user accounts and roles (RBAC — different permission levels for different staff roles)

---

## How Everything Connects — Flow Summary

```
Client visits site
       ↓
Picks a plan → fills enrollment form
       ↓
App creates/updates GHL contact (CRM notified)
       ↓
Client pays via Stripe checkout
       ↓
Stripe confirms payment → client redirected to agreement page
       ↓
Client signs agreement via Zoho Sign
       ↓
Client lands on Dashboard (data pulled from Supabase)
       ↓
Staff see new project in Admin Panel → manage via PostgreSQL DB
```

---

## Quick Reference — Environment Secrets

| Secret | What It's For |
|--------|--------------|
| `STRIPE_SECRET_KEY` | Stripe payments (live key starts with `sk_live_`) |
| `VITE_STRIPE_PRICE_*` | 6 Stripe price IDs (one per plan/payment type) |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Client database |
| `DATABASE_URL` | Staff/admin PostgreSQL database |
| `ZOHO_SIGN_CLIENT_ID` / `ZOHO_SIGN_CLIENT_SECRET` / `ZOHO_SIGN_REFRESH_TOKEN` | Agreement signing |
| `GHL_API_KEY` / `GHL_LOCATION_ID` | GoHighLevel CRM integration |
| `ADMIN_PASSWORD` | Admin panel login |
| `SESSION_SECRET` | Secure server sessions |
