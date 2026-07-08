import { Router, type IRouter, type Request, type Response } from "express";
import { createClient, type SupabaseClient, type PostgrestError } from "@supabase/supabase-js";

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

  try {
    const buffer = Buffer.from(base64, "base64");
    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const storagePath = `${email.trim().toLowerCase()}/${safeName}`;

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

  const normalizedEmail = email.trim().toLowerCase();
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

  const email = req.query["email"] as string | undefined;
  if (!email) {
    res.status(400).json({ error: "email query param is required" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
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

    req.log.info(
      {
        email: normalizedEmail,
        found: !!data,
        fullName: data?.full_name ?? null,
        gameType: data?.game_type ?? null,
        appName: data?.app_name ?? null,
        selectedPackage: data?.selected_package ?? null,
      },
      data ? "enrollment/progress: dashboard data returned" : "enrollment/progress: no enrollment record found for this email"
    );

    res.json({ record: data ?? null });
  } catch (err) {
    req.log.error({ err }, "enrollment/progress: unexpected error");
    res.status(500).json({ error: "Unable to connect to the database." });
  }
});

export default router;
