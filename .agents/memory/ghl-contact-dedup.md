---
name: GHL contact dedup pattern
description: How to create/update GoHighLevel (GHL) contacts without creating duplicates.
---

Don't rely on "try create, catch duplicate error" for GHL contact upserts by email. GHL's create-duplicate error response doesn't always include a usable contact id (`meta.contactId`), so the catch path can silently fail to find the existing contact — this is what caused duplicate contacts in production.

**Why:** The reliable signal is a dedicated search endpoint, not the create error path.

**How to apply:** Before creating a contact, call `GET /contacts/search/duplicate?locationId=...&email=...`. If it returns an existing contact id, `PUT` (update) that contact instead of creating. Only fall back to `POST` create when the search finds nothing. Even then, keep a race-condition fallback: if create still fails with a duplicate and returns `meta.contactId`, update using that id rather than surfacing an error.
