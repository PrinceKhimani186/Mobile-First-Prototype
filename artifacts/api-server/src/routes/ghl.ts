import { Router, type IRouter } from "express";

const router: IRouter = Router();

const GHL_BASE = "https://services.leadconnectorhq.com";

function ghlHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
  };
}

// GHL requires customFields as an array: [{ key, field_value }] or [{ id, field_value }]
// crm.ts may send a plain object — convert here; arrays are passed through unchanged.
function toCustomFieldsArray(
  customFields: unknown,
): { key?: string; id?: string; field_value: string }[] {
  if (!customFields) return [];
  if (Array.isArray(customFields)) return customFields;
  return Object.entries(customFields as Record<string, string>).map(
    ([key, field_value]) => ({ key, field_value }),
  );
}

// Fetch current tags on a contact so we can delete them before setting new ones.
async function getContactTags(contactId: string, apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
      headers: ghlHeaders(apiKey),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { contact?: { tags?: string[] } };
    return data?.contact?.tags ?? [];
  } catch {
    return [];
  }
}

// Delete specific tags from a contact.
async function deleteTagsFromContact(
  contactId: string,
  tags: string[],
  apiKey: string,
): Promise<void> {
  if (!tags.length) return;
  await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
    method: "DELETE",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({ tags }),
  });
}

// Add tags to a contact.
async function addTagsToContact(
  contactId: string,
  tags: string[],
  apiKey: string,
): Promise<void> {
  if (!tags.length) return;
  await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({ tags }),
  });
}

// Replace all tags on a contact: wipe existing ones then set the new set.
async function replaceContactTags(
  contactId: string,
  newTags: string[],
  apiKey: string,
): Promise<void> {
  const existing = await getContactTags(contactId, apiKey);
  if (existing.length) await deleteTagsFromContact(contactId, existing, apiKey);
  if (newTags.length) await addTagsToContact(contactId, newTags, apiKey);
}

router.post("/ghl/contact", async (req, res) => {
  const { firstName, lastName, email, phone, tags, customFields } = req.body;

  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    req.log.error("GHL credentials not configured");
    res.status(500).json({ error: "GHL credentials not configured" });
    return;
  }

  const customFieldsArray = toCustomFieldsArray(customFields);
  const newTags: string[] = tags ?? [];

  // POST (create) includes locationId and tags in the body.
  const createPayload = {
    locationId,
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    email: email ?? "",
    phone: phone ?? "",
    ...(newTags.length ? { tags: newTags } : {}),
    ...(customFieldsArray.length ? { customFields: customFieldsArray } : {}),
  };

  // PUT (update) — no tags here; we handle them separately via the tags endpoints.
  const updatePayload = {
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    email: email ?? "",
    phone: phone ?? "",
    ...(customFieldsArray.length ? { customFields: customFieldsArray } : {}),
  };

  try {
    // Step 1: attempt to create the contact
    const createRes = await fetch(`${GHL_BASE}/contacts/`, {
      method: "POST",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify(createPayload),
    });

    const createData = (await createRes.json()) as {
      contact?: unknown;
      meta?: { contactId?: string };
      message?: string;
      statusCode?: number;
    };

    // Step 2: duplicate — update existing contact
    if (!createRes.ok) {
      const existingId = createData?.meta?.contactId;

      if (existingId) {
        req.log.info({ contactId: existingId }, "GHL: contact exists — updating");

        // Update fields
        const updateRes = await fetch(`${GHL_BASE}/contacts/${existingId}`, {
          method: "PUT",
          headers: ghlHeaders(apiKey),
          body: JSON.stringify(updatePayload),
        });

        const updateData = await updateRes.json();

        if (!updateRes.ok) {
          req.log.warn({ status: updateRes.status, updateData }, "GHL update error");
          res.status(updateRes.status).json({ error: "GHL update error", details: updateData });
          return;
        }

        // Replace tags: delete all existing, then add the new set
        await replaceContactTags(existingId, newTags, apiKey);
        req.log.info({ contactId: existingId, tags: newTags }, "GHL: tags replaced");

        res.json({ ok: true, action: "updated", contactId: existingId, contact: updateData });
        return;
      }

      // Some other error — pass it through
      req.log.warn({ status: createRes.status, createData }, "GHL create error");
      res.status(createRes.status).json({ error: "GHL API error", details: createData });
      return;
    }

    // Step 3: fresh contact created successfully
    req.log.info("GHL: new contact created");
    res.json({ ok: true, action: "created", contact: createData });
  } catch (err) {
    req.log.error({ err }, "GHL proxy fetch failed");
    res.status(502).json({ error: "Failed to reach GHL API" });
  }
});

export default router;
