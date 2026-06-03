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

// Add tags without replacing existing ones using the dedicated GHL tags endpoint.
async function addTagsToContact(
  contactId: string,
  tags: string[],
  apiKey: string,
): Promise<void> {
  if (!tags?.length) return;
  await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({ tags }),
  });
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

  // POST (create) includes locationId and tags in the body.
  const createPayload = {
    locationId,
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    email: email ?? "",
    phone: phone ?? "",
    ...(tags?.length ? { tags } : {}),
    ...(customFieldsArray.length ? { customFields: customFieldsArray } : {}),
  };

  // PUT (update) must NOT include locationId.
  // Tags are intentionally excluded — we add them separately via the tags endpoint
  // so existing tags are preserved (not replaced).
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

    // Step 2: if GHL says duplicate, grab the existing contactId and PUT + add tags
    if (!createRes.ok) {
      const existingId = createData?.meta?.contactId;

      if (existingId) {
        req.log.info({ contactId: existingId }, "GHL: contact exists — updating");

        // Update fields (no tags in body — would replace existing ones)
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

        // Append new tags without touching existing ones
        await addTagsToContact(existingId, tags ?? [], apiKey);

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
