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

// Exact tag names as stored in GHL (all lowercase)
const PLAN_TAG_MAP: Record<string, string> = {
  essentials:  "purchased plan - essentials",
  accelerator: "purchased plan - ownership accelerator",
  empire:      "purchased plan - digital asset",
};

const ALL_PLAN_TAGS = Object.values(PLAN_TAG_MAP);

/**
 * POST /api/debug/ghl-tag-test
 * Runs the full GHL tag flow (remove old plan tags, apply correct one) and
 * returns every raw response for diagnostics.
 * Body: { email, firstName, lastName, phone, selectedPlan }
 */
router.post("/debug/ghl-tag-test", async (req: Request, res: Response) => {
  const { email, firstName = "Test", lastName = "User", phone = "", selectedPlan } =
    req.body as { email: string; firstName?: string; lastName?: string; phone?: string; selectedPlan: string };

  const apiKey     = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  const log: unknown[] = [];

  const step = (label: string, data: unknown) => {
    log.push({ step: label, ...(typeof data === "object" && data !== null ? data : { value: data }) });
  };

  if (!apiKey || !locationId) {
    res.status(503).json({ error: "GHL_API_KEY or GHL_LOCATION_ID not set", log });
    return;
  }

  // Exact equality — selectedPlan must be one of: essentials | accelerator | empire
  step("selected_plan_received", { selectedPlan, validKeys: Object.keys(PLAN_TAG_MAP) });
  const planTagName = PLAN_TAG_MAP[selectedPlan];
  if (!planTagName) {
    res.status(400).json({
      error: `selectedPlan "${selectedPlan}" did not match any key. Valid: ${Object.keys(PLAN_TAG_MAP).join(", ")}`,
      log,
    });
    return;
  }
  step("plan_tag_resolved", { selectedPlan, planTagName });

  // ── 1. Find or create contact, capture existing tags ──────────────────────
  const searchRes = await fetch(
    `${GHL_BASE}/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(email)}`,
    { headers: ghlHeaders(apiKey) },
  );
  const searchBody = await searchRes.text();
  const searchData = tryParse(searchBody) as { contact?: { id?: string; tags?: string[] } | null };
  step("contact_search", { status: searchRes.status, body: searchData });

  let contactId: string | undefined;
  let existingTags: string[] = [];
  let contactAction = "none";

  if (searchRes.ok && searchData?.contact?.id) {
    contactId    = searchData.contact.id;
    existingTags = searchData.contact.tags ?? [];
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
    const crData = tryParse(crBody) as { contact?: { id?: string; tags?: string[] } };
    contactId    = crData?.contact?.id;
    existingTags = crData?.contact?.tags ?? [];
    step("contact_create", { status: crRes.status, contactId, body: crData });
    if (!crRes.ok) {
      res.status(502).json({ error: "Contact creation failed", log });
      return;
    }
  }

  step("existing_tags", { contactId, existingTags });

  if (!contactId) {
    res.status(502).json({ error: "Could not obtain contactId", log });
    return;
  }

  // ── 2. Remove old purchased-plan tags ─────────────────────────────────────
  const tagsToRemove = existingTags.filter(t => ALL_PLAN_TAGS.includes(t.toLowerCase()));
  step("tags_to_remove", { tagsToRemove, allPlanTags: ALL_PLAN_TAGS });

  if (tagsToRemove.length > 0) {
    const delRes = await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
      method: "DELETE",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify({ tags: tagsToRemove }),
    });
    const delBody = await delRes.text();
    step("tags_removed", { status: delRes.status, ok: delRes.ok, body: tryParse(delBody), tagsToRemove });
  } else {
    step("tags_removed", { message: "no old purchased-plan tags found on contact" });
  }

  // ── 3. Apply only the correct plan tag ────────────────────────────────────
  const applyRes = await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({ tags: [planTagName] }),
  });
  const applyBody = await applyRes.text();
  step("tag_applied", {
    planTagName,
    status: applyRes.status,
    ok: applyRes.ok,
    body: tryParse(applyBody),
  });

  res.json({
    success: applyRes.ok,
    contactId,
    contactAction,
    selectedPlan,
    planTagName,
    existingTagsBefore: existingTags,
    tagsRemoved: tagsToRemove,
    tagApplyStatus: applyRes.status,
    log,
  });
});

function tryParse(text: string): unknown {
  try { return JSON.parse(text); } catch { return text; }
}

export default router;
