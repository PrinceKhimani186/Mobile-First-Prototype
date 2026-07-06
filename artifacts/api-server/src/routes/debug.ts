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
  starter:     "purchased plan - starter",
  essentials:  "purchased plan - essentials",
  accelerator: "purchased plan - ownership accelerator",
  growth:      "purchased plan - growth",
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

// ── GET /api/debug/env-status ─────────────────────────────────────────────────
// Returns a full runtime environment report: which required vars are set,
// which are missing, and which naming variant each uses. Safe — values are
// masked; only presence and naming source are revealed.
router.get("/debug/env-status", (req: Request, res: Response) => {
  const mask = (val?: string): string => {
    if (!val) return "";
    if (val.length <= 8) return "****";
    return `${val.substring(0, 6)}…${val.substring(val.length - 4)}`;
  };

  type VarStatus = {
    set: boolean;
    resolvedFrom: string | null;
    masked: string;
    issue?: string;
  };

  function check(
    candidates: [envName: string, value: string | undefined][],
    validationFn?: (v: string) => string | null
  ): VarStatus {
    for (const [name, value] of candidates) {
      if (value) {
        const issue = validationFn ? validationFn(value) : null;
        return { set: true, resolvedFrom: name, masked: mask(value), ...(issue ? { issue } : {}) };
      }
    }
    const triedNames = candidates.map(([n]) => n).join(" | ");
    return { set: false, resolvedFrom: null, masked: "", issue: `Not set. Tried: ${triedNames}` };
  }

  const stripeKeyVal = process.env.STRIPE_SECRET_KEY;
  const stripeKeyStatus = check(
    [["STRIPE_SECRET_KEY", stripeKeyVal]],
    (v) => {
      if (v.startsWith("pk_")) return "This is a publishable key (pk_…). Use the secret key (sk_…).";
      if (!v.startsWith("sk_")) return `Unexpected format: starts with "${v.slice(0, 6)}"`;
      return null;
    }
  );

  const vars: Record<string, VarStatus> = {
    // ── Stripe ──────────────────────────────────────────────────────────────
    STRIPE_SECRET_KEY: stripeKeyStatus,
    STRIPE_WEBHOOK_SECRET: check([["STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET]]),
    "STRIPE_PRICE_ESSENTIALS (→ STRIPE_PRICE_ESSENTIALS_SETUP or STRIPE_PRICE_ESSENTIALS)": check([
      ["STRIPE_PRICE_ESSENTIALS_SETUP", process.env.STRIPE_PRICE_ESSENTIALS_SETUP],
      ["STRIPE_PRICE_ESSENTIALS",       process.env.STRIPE_PRICE_ESSENTIALS],
    ], (v) => !v.startsWith("price_") ? `Looks wrong — expected price_… got: ${v.slice(0, 10)}` : null),
    "STRIPE_PRICE_ACCELERATOR (→ STRIPE_PRICE_ACCELERATOR_SETUP or STRIPE_PRICE_ACCELERATOR)": check([
      ["STRIPE_PRICE_ACCELERATOR_SETUP", process.env.STRIPE_PRICE_ACCELERATOR_SETUP],
      ["STRIPE_PRICE_ACCELERATOR",       process.env.STRIPE_PRICE_ACCELERATOR],
    ], (v) => !v.startsWith("price_") ? `Looks wrong — expected price_… got: ${v.slice(0, 10)}` : null),
    "STRIPE_PRICE_EMPIRE (→ STRIPE_PRICE_EMPIRE_SETUP or STRIPE_PRICE_EMPIRE)": check([
      ["STRIPE_PRICE_EMPIRE_SETUP", process.env.STRIPE_PRICE_EMPIRE_SETUP],
      ["STRIPE_PRICE_EMPIRE",       process.env.STRIPE_PRICE_EMPIRE],
    ], (v) => !v.startsWith("price_") ? `Looks wrong — expected price_… got: ${v.slice(0, 10)}` : null),
    // ── Supabase ─────────────────────────────────────────────────────────────
    SUPABASE_URL:              check([["SUPABASE_URL",              process.env.SUPABASE_URL]]),
    SUPABASE_ANON_KEY:         check([["SUPABASE_ANON_KEY",         process.env.SUPABASE_ANON_KEY]]),
    SUPABASE_SERVICE_ROLE_KEY: check([["SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY]]),
    // ── Zoho Sign (both naming conventions) ──────────────────────────────────
    "ZOHO_CLIENT_ID (→ ZOHO_SIGN_CLIENT_ID or ZOHO_CLIENT_ID)": check([
      ["ZOHO_SIGN_CLIENT_ID", process.env.ZOHO_SIGN_CLIENT_ID],
      ["ZOHO_CLIENT_ID",      process.env.ZOHO_CLIENT_ID],
    ]),
    "ZOHO_CLIENT_SECRET (→ ZOHO_SIGN_CLIENT_SECRET or ZOHO_CLIENT_SECRET)": check([
      ["ZOHO_SIGN_CLIENT_SECRET", process.env.ZOHO_SIGN_CLIENT_SECRET],
      ["ZOHO_CLIENT_SECRET",      process.env.ZOHO_CLIENT_SECRET],
    ]),
    "ZOHO_REFRESH_TOKEN (→ ZOHO_SIGN_REFRESH_TOKEN or ZOHO_REFRESH_TOKEN)": check([
      ["ZOHO_SIGN_REFRESH_TOKEN", process.env.ZOHO_SIGN_REFRESH_TOKEN],
      ["ZOHO_REFRESH_TOKEN",      process.env.ZOHO_REFRESH_TOKEN],
    ]),
    "ZOHO_ORG_ID (→ ZOHO_SIGN_ORGANIZATION_ID or ZOHO_SIGN_ORG_ID)": check([
      ["ZOHO_SIGN_ORGANIZATION_ID", process.env.ZOHO_SIGN_ORGANIZATION_ID],
      ["ZOHO_SIGN_ORG_ID",          process.env.ZOHO_SIGN_ORG_ID],
    ]),
    // ── Other ─────────────────────────────────────────────────────────────────
    GHL_API_KEY:      check([["GHL_API_KEY",      process.env.GHL_API_KEY]]),
    GHL_LOCATION_ID:  check([["GHL_LOCATION_ID",  process.env.GHL_LOCATION_ID]]),
    SESSION_SECRET:   check([["SESSION_SECRET",   process.env.SESSION_SECRET]]),
    ADMIN_PASSWORD:   check([["ADMIN_PASSWORD",   process.env.ADMIN_PASSWORD]]),
  };

  const missing  = Object.entries(vars).filter(([, v]) => !v.set).map(([k, v]) => ({ var: k, issue: v.issue }));
  const warnings = Object.entries(vars).filter(([, v]) => v.set && v.issue).map(([k, v]) => ({ var: k, issue: v.issue, resolvedFrom: v.resolvedFrom }));
  const ok       = Object.entries(vars).filter(([, v]) => v.set && !v.issue).map(([k, v]) => ({ var: k, resolvedFrom: v.resolvedFrom, masked: v.masked }));

  res.json({
    summary: {
      total: Object.keys(vars).length,
      missing: missing.length,
      warnings: warnings.length,
      ok: ok.length,
      stripeMode: stripeKeyVal?.startsWith("sk_live_") ? "LIVE" : stripeKeyVal?.startsWith("sk_test_") ? "TEST" : "UNKNOWN",
    },
    missing,
    warnings,
    ok,
  });
});

function tryParse(text: string): unknown {
  try { return JSON.parse(text); } catch { return text; }
}

export default router;
