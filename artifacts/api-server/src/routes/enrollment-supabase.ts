import { Router, type IRouter, type Request, type Response } from "express";
import { createClient, type SupabaseClient, type PostgrestError } from "@supabase/supabase-js";
import { db, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

const router: IRouter = Router();

function noCache(res: Response) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.set("Pragma", "no-cache");
}

// PostgREST reports a missing column as PGRST204 ("Could not find the 'X'
// column of 'table' in the schema cache"), NOT Postgres's own 42703 — so a
// "detect missing column, retry without it" fallback must check both. This
// lets writes to game_type / app_name / tagline / monetization / payment_type
// / source degrade gracefully (rather than fail outright) until migration
// 005_customer_enrollment_customization.sql is applied in Supabase.
function isMissingColumnError(error: PostgrestError): boolean {
  return (
    error.code === "PGRST204" ||
    error.code === "42703" ||
    /schema cache/i.test(error.message) ||
    /does not exist/i.test(error.message)
  );
}

function extractMissingColumn(error: PostgrestError): string | null {
  const match = error.message.match(/'([a-zA-Z_]+)'\s+column/i);
  return match?.[1] ?? null;
}

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    return createClient(url.trim(), key.trim(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (err) {
    // Log once so it's visible in workflow logs, then degrade gracefully
    console.error("[Supabase] createClient failed — check SUPABASE_URL format:", (err as Error).message);
    return null;
  }
}

async function syncToLocalPostgres(email: string, fields: Record<string, any>) {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if project exists in local Postgres
    const [existing] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.email, normalizedEmail));

    const customerName = fields.full_name || fields.fullName || existing?.customerName || "";
    const phone = fields.phone || existing?.phone || "";
    const source = fields.source || existing?.source || "Direct";
    const appName = fields.app_name || fields.appName || existing?.appName || "";
    const gameTemplate = fields.game_type || fields.gameType || fields.gameTemplate || existing?.gameTemplate || "";
    const selectedPackage = fields.selected_package || fields.selectedPackage || fields.package || existing?.package || "";

    if (!existing) {
      // Create new local project
      const projectId = `AS-${String(Date.now()).slice(-3)}`;
      await db.insert(projectsTable).values({
        projectId,
        customerName,
        email: normalizedEmail,
        phone,
        source,
        appName,
        gameTemplate,
        package: selectedPackage,
        currentStage: "Project Received",
        notes: "",
      });
    } else {
      // Update existing local project
      await db
        .update(projectsTable)
        .set({
          customerName,
          phone,
          source,
          appName: appName || undefined,
          gameTemplate: gameTemplate || undefined,
          package: selectedPackage || undefined,
          updatedAt: new Date(),
        })
        .where(eq(projectsTable.email, normalizedEmail));
    }
  } catch (err) {
    console.error("Failed to sync project to local Postgres:", err);
  }
}

interface GHLCustomField {
  id: string;
  value: any;
}

async function syncWithGHL(
  email: string,
  supabaseRecord: any,
  supabaseClient: SupabaseClient,
  log: any
): Promise<any> {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!apiKey || !locationId) {
    log.info("syncWithGHL: GHL credentials not configured — skipping direct sync");
    return supabaseRecord;
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    
    // 1. Search for contact by email
    const searchUrl = `https://services.leadconnectorhq.com/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(normalizedEmail)}`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
      }
    });

    if (!searchRes.ok) {
      log.warn({ status: searchRes.status }, "syncWithGHL: GHL search request failed");
      return supabaseRecord;
    }

    const searchData = (await searchRes.json()) as { contact?: { id?: string } | null };
    const contactId = searchData?.contact?.id;
    if (!contactId) {
      log.info({ email: normalizedEmail }, "syncWithGHL: No contact found in GHL");
      return supabaseRecord;
    }

    // 2. Fetch full contact details
    const detailUrl = `https://services.leadconnectorhq.com/contacts/${contactId}`;
    const detailRes = await fetch(detailUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
      }
    });

    if (!detailRes.ok) {
      log.warn({ status: detailRes.status }, "syncWithGHL: GHL details request failed");
      return supabaseRecord;
    }

    const detailData = (await detailRes.json()) as {
      contact?: {
        phone?: string;
        customFields?: GHLCustomField[];
      };
    };
    const contact = detailData?.contact;
    if (!contact) return supabaseRecord;

    const ghlPhone = contact.phone ? contact.phone.trim() : null;
    const ghlAppName = getGHLFieldValue(contact.customFields, "FZBa9ADCLKQWPhmEIk6j");
    const ghlTagline = getGHLFieldValue(contact.customFields, "rhBCPC8RdX09mtNGl8r6");
    const ghlMonetization = getGHLFieldValue(contact.customFields, "HHedLCiTwIT3U9r0Azs6");
    const ghlGameType = getGHLFieldValue(contact.customFields, "R6LEvxoM1oh7RuIi7059");

    // 3. Compare and compute updates for Supabase
    const updates: Record<string, any> = {};
    if (ghlPhone && !supabaseRecord.phone) updates.phone = ghlPhone;
    if (ghlAppName && !supabaseRecord.app_name) updates.app_name = ghlAppName;
    if (ghlTagline && !supabaseRecord.tagline) updates.tagline = ghlTagline;
    if (ghlMonetization && !supabaseRecord.monetization) updates.monetization = ghlMonetization;
    if (ghlGameType && !supabaseRecord.game_type) updates.game_type = ghlGameType;

    if (Object.keys(updates).length > 0) {
      log.info({ email: normalizedEmail, updates }, "syncWithGHL: Syncing GHL custom fields to Supabase");
      
      const { data: updatedRecord, error } = await supabaseClient
        .from("customer_enrollment")
        .update(updates)
        .eq("email", normalizedEmail)
        .select()
        .maybeSingle();

      if (error) {
        log.error({ err: error }, "syncWithGHL: Failed to update Supabase record");
      } else if (updatedRecord) {
        // Keep local Postgres in sync
        await syncToLocalPostgres(normalizedEmail, updates);
        return updatedRecord;
      }
    }
  } catch (err) {
    log.error({ err }, "syncWithGHL: Unexpected error during synchronization");
  }

  return supabaseRecord;
}

function getGHLFieldValue(customFields: GHLCustomField[] | undefined, fieldId: string): string | null {
  if (!customFields || !Array.isArray(customFields)) return null;
  const found = customFields.find(f => f.id === fieldId);
  return found?.value ? String(found.value).trim() : null;
}

async function verifyCustomerAccess(req: Request | any, email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const sessionEmail = (req.session as any)?.customerEmail;
  
  req.log.info({
    email: normalizedEmail,
    sessionEmail,
    query: req.query,
    body: req.body,
  }, "verifyCustomerAccess: entry");

  if (sessionEmail) {
    const matched = sessionEmail === normalizedEmail;
    req.log.info({ email: normalizedEmail, sessionEmail, matched }, "verifyCustomerAccess: sessionEmail check completed");
    return matched;
  }

  // Check if request is returning from Stripe success with valid session_id
  const sessionId = req.query.session_id || req.body.session_id;
  req.log.info({ email: normalizedEmail, sessionId }, "verifyCustomerAccess: checking sessionId parameter");
  if (sessionId && typeof sessionId === "string" && sessionId.startsWith("cs_")) {
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (stripeKey) {
        const stripe = new Stripe(stripeKey);
        const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
        const stripeEmail = stripeSession.customer_details?.email || stripeSession.metadata?.email || stripeSession.customer_email;
        req.log.info({
          email: normalizedEmail,
          stripeEmail,
          paymentStatus: stripeSession.payment_status,
        }, "verifyCustomerAccess: Stripe checkout session retrieved");
        if (stripeSession.payment_status === "paid" && stripeEmail?.trim().toLowerCase() === normalizedEmail) {
          req.log.info({ email: normalizedEmail, sessionId }, "verifyCustomerAccess: Stripe checkout session verified, establishing backend session");
          (req.session as any).customerEmail = normalizedEmail;
          return true;
        }
      }
    } catch (err) {
      req.log.error({ err, sessionId }, "verifyCustomerAccess: failed to verify Stripe checkout session");
    }
  }

  const supabase = getSupabase();
  req.log.info({ email: normalizedEmail, hasSupabase: !!supabase }, "verifyCustomerAccess: checking Supabase client");
  if (!supabase) return true;
  try {
    const { data, error } = await supabase
      .from("app_users")
      .select("password_hash")
      .eq("email", normalizedEmail)
      .maybeSingle();
    req.log.info({ email: normalizedEmail, data, error }, "verifyCustomerAccess: app_users query finished");
    if (data?.password_hash) {
      req.log.info({ email: normalizedEmail }, "verifyCustomerAccess: access denied because user has a password and is not authenticated");
      return false;
    }
    req.log.info({ email: normalizedEmail }, "verifyCustomerAccess: access granted (no password created yet)");
    return true;
  } catch (err) {
    req.log.error({ err, email: normalizedEmail }, "verifyCustomerAccess: Supabase query exception");
    return false;
  }
}

// ── POST /api/enrollment/upload-document ──────────────────────────────────────
// Accepts base64-encoded file content and uploads it to Supabase Storage.
router.post("/enrollment/upload-document", async (req: Request, res: Response) => {
  noCache(res);

  const supabase = getSupabase();
  if (!supabase) {
    req.log.warn("Supabase not configured — upload-document skipped");
    res.json({ ok: true, skipped: true, documentName: null, documentUrl: null });
    return;
  }

  const { email, fileName, mimeType, base64 } = req.body as {
    email?: string;
    fileName?: string;
    mimeType?: string;
    base64?: string;
  };

  if (!email || !fileName || !base64) {
    res.status(400).json({ error: "email, fileName, and base64 are required" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const hasAccess = await verifyCustomerAccess(req, normalizedEmail);
  if (!hasAccess) {
    res.status(403).json({ error: "Access denied. Unauthorized session." });
    return;
  }

  try {
    const buffer = Buffer.from(base64, "base64");
    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const storagePath = `${normalizedEmail}/${safeName}`;

    const { error } = await supabase.storage
      .from("customer-documents")
      .upload(storagePath, buffer, {
        contentType: mimeType ?? "application/octet-stream",
        upsert: true,
      });

    if (error) {
      req.log.error({ err: error, email }, "upload-document: storage upload failed");
      res.status(502).json({ error: "Unable to upload document." });
      return;
    }

    req.log.info({ email, storagePath }, "upload-document: file uploaded");
    res.json({ ok: true, documentName: fileName, documentUrl: storagePath });
  } catch (err) {
    req.log.error({ err }, "upload-document: unexpected error");
    res.status(500).json({ error: "Unable to upload document." });
  }
});

// ── POST /api/enrollment/init ─────────────────────────────────────────────────
router.post("/enrollment/init", async (req: Request, res: Response) => {
  noCache(res);

  const supabase = getSupabase();
  if (!supabase) {
    req.log.warn("Supabase not configured — enrollment/init skipped");
    res.json({ ok: true, skipped: true });
    return;
  }

  const {
    fullName,
    email,
    phone,
    companyName,
    country,
    businessType,
    preferredContact,
    documentName,
    documentUrl,
    selectedPackage,
    paymentType,
    source,
  } = req.body as {
    fullName?: string;
    email?: string;
    phone?: string;
    companyName?: string;
    country?: string;
    businessType?: string;
    preferredContact?: string;
    documentName?: string;
    documentUrl?: string;
    selectedPackage?: string;
    paymentType?: string;
    source?: string;
  };

  if (!email || !fullName) {
    res.status(400).json({ error: "email and fullName are required" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  req.log.info({ email: normalizedEmail, selectedPackage, paymentType, source }, "enrollment/init: request received");

  const payload: Record<string, unknown> = {
    full_name: fullName,
    email: normalizedEmail,
    phone: phone ?? null,
    company_name: companyName ?? null,
    country: country ?? null,
    business_type: businessType ?? null,
    preferred_contact: preferredContact ?? null,
    document_name: documentName ?? null,
    document_url: documentUrl ?? null,
    selected_package: selectedPackage ?? null,
    ...(paymentType ? { payment_type: paymentType } : {}),
    ...(source ? { source } : {}),
    onboarding_status: "enrollment_completed",
    payment_status: "pending",
    password_created: false,
    game_selected: false,
    customization_completed: false,
    dashboard_completed: false,
  };

  try {
    // Retry without any column PostgREST reports as missing — lets the record
    // still save even if migration 005 hasn't been applied yet in Supabase.
    for (let attempt = 0; attempt < 10; attempt++) {
      const { error } = await supabase
        .from("customer_enrollment")
        .upsert(payload, { onConflict: "email" });

      if (!error) {
        req.log.info({ email: normalizedEmail }, "enrollment/init: record upserted");
        await syncToLocalPostgres(normalizedEmail, payload);
        res.json({ ok: true });
        return;
      }

      if (isMissingColumnError(error)) {
        const missingCol = extractMissingColumn(error);
        if (missingCol && missingCol in payload) {
          req.log.warn({ email: normalizedEmail, missingCol }, "enrollment/init: column missing in Supabase schema — retrying without it (run migration 005)");
          delete payload[missingCol];
          continue;
        }
      }

      req.log.error({ err: error, email: normalizedEmail }, "enrollment/init: supabase upsert failed");
      res.status(502).json({ error: "Unable to save your information." });
      return;
    }

    req.log.error({ email: normalizedEmail }, "enrollment/init: too many missing-column retries");
    res.status(502).json({ error: "Unable to save your information." });
  } catch (err) {
    req.log.error({ err }, "enrollment/init: unexpected error");
    res.status(500).json({ error: "Unable to save your information." });
  }
});

// ── POST /api/enrollment/update ───────────────────────────────────────────────
router.post("/enrollment/update", async (req: Request, res: Response) => {
  noCache(res);

  const supabase = getSupabase();
  if (!supabase) {
    req.log.warn("Supabase not configured — enrollment/update skipped");
    res.json({ ok: true, skipped: true });
    return;
  }

  const { email, fields } = req.body as {
    email?: string;
    fields?: Record<string, unknown>;
  };

  if (!email || !fields || Object.keys(fields).length === 0) {
    res.status(400).json({ error: "email and fields are required" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const hasAccess = await verifyCustomerAccess(req, normalizedEmail);
  if (!hasAccess) {
    res.status(403).json({ error: "Access denied. Unauthorized session." });
    return;
  }

  const ALLOWED = new Set([
    "selected_package",
    "payment_status",
    "password_created",
    "game_selected",
    "customization_completed",
    "dashboard_completed",
    "agreement_signed",
    "agreement_signing_url",
    "agreement_contract_id",
    "onboarding_status",
    "country",
    "business_type",
    "preferred_contact",
    "document_name",
    "document_url",
    "game_type",
    "app_name",
    "tagline",
    "monetization",
    "payment_type",
    "source",
  ]);

  const safeFields = Object.fromEntries(
    Object.entries(fields).filter(([k]) => ALLOWED.has(k))
  );

  if (Object.keys(safeFields).length === 0) {
    res.status(400).json({ error: "No allowed fields provided" });
    return;
  }

  req.log.info({ email: normalizedEmail, safeFields }, "enrollment/update: request received");

  const updateFields: Record<string, unknown> = { ...safeFields };

  try {
    // Retry without any column PostgREST reports as missing — lets the update
    // still save the remaining fields even if migration 005 hasn't been
    // applied yet in Supabase.
    for (let attempt = 0; attempt < 10; attempt++) {
      if (Object.keys(updateFields).length === 0) {
        req.log.warn({ email: normalizedEmail }, "enrollment/update: no fields left after stripping missing columns");
        res.status(502).json({ error: "Unable to save your information." });
        return;
      }

      const { error } = await supabase
        .from("customer_enrollment")
        .update(updateFields)
        .eq("email", normalizedEmail);

      if (!error) {
        req.log.info({ email: normalizedEmail, safeFields: updateFields }, "enrollment/update: fields updated");
        await syncToLocalPostgres(normalizedEmail, updateFields);
        res.json({ ok: true });
        return;
      }

      if (isMissingColumnError(error)) {
        const missingCol = extractMissingColumn(error);
        if (missingCol && missingCol in updateFields) {
          req.log.warn({ email: normalizedEmail, missingCol }, "enrollment/update: column missing in Supabase schema — retrying without it (run migration 005)");
          delete updateFields[missingCol];
          continue;
        }
      }

      req.log.error({ err: error, email: normalizedEmail, safeFields: updateFields }, "enrollment/update: supabase update failed");
      res.status(502).json({ error: "Unable to save your information." });
      return;
    }

    req.log.error({ email: normalizedEmail }, "enrollment/update: too many missing-column retries");
    res.status(502).json({ error: "Unable to save your information." });
  } catch (err) {
    req.log.error({ err }, "enrollment/update: unexpected error");
    res.status(500).json({ error: "Unable to save your information." });
  }
});

// ── GET /api/enrollment/progress ──────────────────────────────────────────────
router.get("/enrollment/progress", async (req: Request, res: Response) => {
  noCache(res);

  const supabase = getSupabase();
  if (!supabase) {
    req.log.warn("Supabase not configured — enrollment/progress skipped");
    res.json({ record: null, skipped: true });
    return;
  }

  const { email } = req.query as { email?: string };
  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const hasAccess = await verifyCustomerAccess(req, normalizedEmail);
  if (!hasAccess) {
    res.status(403).json({ error: "Access denied. Unauthorized session." });
    return;
  }

  req.log.info({ email: normalizedEmail }, "enrollment/progress: looking up record for logged-in email");

  try {
    const { data, error } = await supabase
      .from("customer_enrollment")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      req.log.error({ err: error, email: normalizedEmail }, "enrollment/progress: supabase select failed");
      res.status(502).json({ error: "Unable to connect to the database." });
      return;
    }

    let record = data ?? null;
    if (record) {
      record = await syncWithGHL(normalizedEmail, record, supabase, req.log);
    }

    req.log.info(
      {
        email: normalizedEmail,
        found: !!record,
        fullName: record?.full_name ?? null,
        gameType: record?.game_type ?? null,
        appName: record?.app_name ?? null,
        selectedPackage: record?.selected_package ?? null,
      },
      record ? "enrollment/progress: dashboard data returned" : "enrollment/progress: no enrollment record found for this email"
    );

    res.json({ record });
  } catch (err) {
    req.log.error({ err }, "enrollment/progress: unexpected error");
    res.status(500).json({ error: "Unable to connect to the database." });
  }
});

export default router;
