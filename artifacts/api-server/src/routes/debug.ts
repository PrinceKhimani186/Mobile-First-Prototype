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

const PLAN_TAG_MAP: Record<string, string> = {
  essentials:  "Purchased Plan - Essentials",
  accelerator: "Purchased Plan - Ownership Accelerator",
  empire:      "Purchased Plan - Digital Asset",
};

/**
 * POST /api/debug/ghl-tag-test
 * Runs the full GHL tag flow and returns every raw response.
 * Body: { email, firstName, lastName, phone, selectedPlan }
 */
router.post("/debug/ghl-tag-test", async (req: Request, res: Response) => {
  const { email, firstName = "Test", lastName = "User", phone = "", selectedPlan } =
    req.body as { email: string; firstName?: string; lastName?: string; phone?: string; selectedPlan: string };

  const apiKey     = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  const log: unknown[] = [];

  const step = (label: string, data: unknown) => {
    log.push({ step: label, ...( typeof data === "object" && data !== null ? data : { value: data }) });
  };

  if (!apiKey || !locationId) {
    res.status(503).json({ error: "GHL_API_KEY or GHL_LOCATION_ID not set", log });
    return;
  }

  const planTagName = PLAN_TAG_MAP[selectedPlan];
  step("plan_tag_resolved", { selectedPlan, planTagName: planTagName ?? null });
  if (!planTagName) {
    res.status(400).json({ error: `Unknown selectedPlan: "${selectedPlan}". Valid: ${Object.keys(PLAN_TAG_MAP).join(", ")}`, log });
    return;
  }

  // ── 1. Find or create contact ─────────────────────────────────────────────
  const searchRes = await fetch(
    `${GHL_BASE}/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(email)}`,
    { headers: ghlHeaders(apiKey) },
  );
  const searchBody = await searchRes.text();
  step("contact_search", { url: `${GHL_BASE}/contacts/search/duplicate`, status: searchRes.status, body: tryParse(searchBody) });

  let contactId: string | undefined;
  let contactAction = "none";

  if (searchRes.ok) {
    const d = tryParse(searchBody) as { contact?: { id?: string } | null };
    contactId = d?.contact?.id;
  }

  if (contactId) {
    contactAction = "updated";
    const upRes = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
      method: "PUT",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify({ firstName, lastName, phone }),
    });
    const upBody = await upRes.text();
    step("contact_update", { contactId, status: upRes.status, body: tryParse(upBody) });
  } else {
    contactAction = "created";
    const crRes = await fetch(`${GHL_BASE}/contacts/`, {
      method: "POST",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify({ locationId, firstName, lastName, email, phone }),
    });
    const crBody = await crRes.text();
    const crData = tryParse(crBody) as { contact?: { id?: string } };
    contactId = crData?.contact?.id;
    step("contact_create", { status: crRes.status, contactId, body: crData });
    if (!crRes.ok) {
      res.status(502).json({ error: "Contact creation failed", log });
      return;
    }
  }

  step("contact_id_confirmed", { contactId, action: contactAction });

  if (!contactId) {
    res.status(502).json({ error: "Could not obtain contactId", log });
    return;
  }

  // ── 2. Fetch all location tags ────────────────────────────────────────────
  const tagsRes = await fetch(`${GHL_BASE}/locations/${locationId}/tags`, {
    headers: ghlHeaders(apiKey),
  });
  const tagsBody = await tagsRes.text();
  const tagsData = tryParse(tagsBody) as { tags?: Array<{ id: string; name: string }> };
  const allTags  = tagsData?.tags ?? [];
  step("location_tags_fetched", { status: tagsRes.status, count: allTags.length, names: allTags.map(t => t.name), body: tagsData });

  // ── 3. Find tag by name (case-insensitive) ────────────────────────────────
  let targetTag = allTags.find(t => t.name.toLowerCase() === planTagName.toLowerCase());
  step("tag_search", { planTagName, found: !!targetTag, tagId: targetTag?.id ?? null });

  // ── 4. Create tag if it does not exist ───────────────────────────────────
  if (!targetTag) {
    const crTagRes = await fetch(`${GHL_BASE}/locations/${locationId}/tags`, {
      method: "POST",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify({ name: planTagName }),
    });
    const crTagBody = await crTagRes.text();
    const crTagData = tryParse(crTagBody) as { tag?: { id: string; name: string } };
    targetTag = crTagData?.tag;
    step("tag_created", { status: crTagRes.status, tag: targetTag ?? null, body: crTagData });
  }

  // ── 5. Apply tag to contact ───────────────────────────────────────────────
  const applyRes = await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({ tags: [planTagName] }),
  });
  const applyBody = await applyRes.text();
  step("tag_apply", {
    url: `${GHL_BASE}/contacts/${contactId}/tags`,
    payload: { tags: [planTagName] },
    status: applyRes.status,
    ok: applyRes.ok,
    body: tryParse(applyBody),
  });

  res.json({
    success: applyRes.ok,
    contactId,
    contactAction,
    planTagName,
    tagApplyStatus: applyRes.status,
    log,
  });
});

function tryParse(text: string): unknown {
  try { return JSON.parse(text); } catch { return text; }
}

export default router;
