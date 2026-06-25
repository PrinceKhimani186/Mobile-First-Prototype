import { Router, type IRouter, type Request, type Response } from "express";

const router: IRouter = Router();

const GHL_BASE = "https://services.leadconnectorhq.com";

function ghlHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
  };
}

function noCache(res: Response) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.set("Pragma", "no-cache");
}

async function findContactByEmail(email: string, locationId: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${GHL_BASE}/contacts/?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(email)}`,
      { headers: ghlHeaders(apiKey) }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { contacts?: { id: string }[] };
    return data?.contacts?.[0]?.id ?? null;
  } catch {
    return null;
  }
}

async function createContact(
  email: string,
  locationId: string,
  apiKey: string,
): Promise<string | null> {
  try {
    const res = await fetch(`${GHL_BASE}/contacts/`, {
      method: "POST",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify({ locationId, email }),
    });
    const data = (await res.json()) as {
      contact?: { id: string };
      meta?: { contactId?: string };
    };
    return data?.contact?.id ?? data?.meta?.contactId ?? null;
  } catch {
    return null;
  }
}

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

async function addTag(contactId: string, tag: string, apiKey: string): Promise<void> {
  await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({ tags: [tag] }),
  });
}

// ── POST /api/publishing-requirements ────────────────────────────────────────
router.post("/publishing-requirements", async (req: Request, res: Response) => {
  const apiKey     = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  noCache(res);

  if (!apiKey || !locationId) {
    res.status(503).json({ error: "GHL credentials not configured" });
    return;
  }

  const {
    email,
    clientName,
    phone,
    appName,
    publishApple,
    appleAccountCreated,
    appleEmail,
    publishGoogle,
    googleAccountCreated,
    googleEmail,
    publishContactName,
    publishContactEmail,
    publishNotes,
    submittedAt,
  } = req.body as Record<string, string | undefined>;

  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }

  const TAG = "Publishing Requirements - Submitted";

  console.log("Publishing Requirements submitted");
  console.log("Searching GHL contact");

  try {
    // 1 — Find or create the contact
    let contactId = await findContactByEmail(email, locationId, apiKey);

    if (contactId) {
      console.log("Contact found");
    } else {
      // Create minimal contact so data is not lost
      contactId = await createContact(email, locationId, apiKey);
      if (!contactId) throw new Error("Could not find or create GHL contact");
      console.log("Contact created");
    }

    // 2 — Add tag (prevent duplicates)
    console.log("Adding Publishing Requirements tag");
    const existingTags = await getContactTags(contactId, apiKey);
    if (!existingTags.includes(TAG)) {
      await addTag(contactId, TAG, apiKey);
    }

    // 3 — Format and save publishing requirements data to a custom field
    console.log("Saving Publishing Requirements data");

    const formattedData = [
      `App Name: ${appName ?? "—"}`,
      `Client Name: ${clientName ?? "—"}`,
      `Publish to Apple App Store: ${publishApple ?? "—"}`,
      ...(publishApple === "Yes" ? [
        `Apple Developer Account Created: ${appleAccountCreated ?? "—"}`,
        `Apple Developer Email: ${appleEmail ?? "—"}`,
      ] : []),
      `Publish to Google Play Store: ${publishGoogle ?? "—"}`,
      ...(publishGoogle === "Yes" ? [
        `Google Play Developer Account Created: ${googleAccountCreated ?? "—"}`,
        `Google Play Developer Email: ${googleEmail ?? "—"}`,
      ] : []),
      `Contact Name: ${publishContactName ?? "—"}`,
      `Contact Email: ${publishContactEmail ?? "—"}`,
      ...(publishNotes ? [`Notes: ${publishNotes}`] : []),
      `Submitted At: ${submittedAt ?? new Date().toISOString()}`,
    ].join("\n");

    // Update contact with custom field and phone (non-fatal if field key doesn't exist in GHL)
    await fetch(`${GHL_BASE}/contacts/${contactId}`, {
      method: "PUT",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify({
        email,
        ...(phone ? { phone } : {}),
        customFields: [
          { key: "publishing_requirements", field_value: formattedData },
        ],
      }),
    });

    console.log("GHL update successful");

    res.json({ ok: true, contactId, tagAdded: !existingTags.includes(TAG) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, "publishing-requirements failed");
    res.status(502).json({ error: message });
  }
});

export default router;
