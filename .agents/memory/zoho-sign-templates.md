---
name: Zoho Sign template-based signing quirks
description: Gotchas when generating signature requests from Zoho Sign templates via API (createdocument flow), field structure, and rate limits.
---

- **Field definitions live under `templates.actions[].fields`, not the top-level `templates.fields`** in the `GET /api/v1/templates/{id}` response. The top-level array is typically empty even when the template has fields. Flatten `actions[].fields` to get the real list.
- **A template needs at least one field (e.g. a Signature field) added in the Zoho Sign UI before `createdocument` will work.** Templates created without opening the field editor have zero fields and the API rejects with `"Add atleast one field for a signer."` This can't be fixed via the API alone (field placement needs real PDF x/y coordinates) — has to be done by a human in the Zoho Sign template editor.
- **Only set `field_text_data` for fields with `field_category === "textfield"`.** Signature/date/image/checkbox fields are populated by Zoho itself (signature capture, sign-date stamping) and will error or misbehave if you try to text-fill them.
- **`createdocument` can auto-submit the request** (Zoho account/template dependent) — check `request_status` on the response before calling `/requests/{id}/submit` explicitly, or treat `"This document is already submitted."` from the submit call as a non-fatal, already-done condition rather than an error.
- **Cache the OAuth access token in memory** (Zoho tokens last ~1hr). Refreshing on every single API call gets throttled by Zoho ("Access Denied" from the token endpoint) under any burst of requests (e.g. rapid sequential test calls).
- **Zoho Sign enforces an account-level daily document-send quota** (hit after ~5-6 sends in one session on this account's plan). Once hit, every send fails with `"Maximum limit for sending documents per day reached."` regardless of code correctness — this resets the next day or requires a plan upgrade. Budget test sends carefully; a single successful end-to-end send per code path is usually enough to confirm correctness before intentionally stopping.
