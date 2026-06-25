import { Router, type IRouter, type Request, type Response } from "express";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const router: IRouter = Router();

function noCache(res: Response) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.set("Pragma", "no-cache");
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
  };

  if (!email || !fullName) {
    res.status(400).json({ error: "email and fullName are required" });
    return;
  }

  try {
    const { error } = await supabase
      .from("customer_enrollment")
      .upsert(
        {
          full_name: fullName,
          email: email.trim().toLowerCase(),
          phone: phone ?? null,
          company_name: companyName ?? null,
          country: country ?? null,
          business_type: businessType ?? null,
          preferred_contact: preferredContact ?? null,
          document_name: documentName ?? null,
          document_url: documentUrl ?? null,
          onboarding_status: "enrollment_completed",
          payment_status: "pending",
          password_created: false,
          game_selected: false,
          customization_completed: false,
          dashboard_completed: false,
        },
        { onConflict: "email" }
      );

    if (error) {
      req.log.error({ err: error }, "enrollment/init: supabase upsert failed");
      res.status(502).json({ error: "Unable to save your information." });
      return;
    }

    req.log.info({ email }, "enrollment/init: record upserted");
    res.json({ ok: true });
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
    "onboarding_status",
    "country",
    "business_type",
    "preferred_contact",
    "document_name",
    "document_url",
  ]);

  const safeFields = Object.fromEntries(
    Object.entries(fields).filter(([k]) => ALLOWED.has(k))
  );

  if (Object.keys(safeFields).length === 0) {
    res.status(400).json({ error: "No allowed fields provided" });
    return;
  }

  try {
    const { error } = await supabase
      .from("customer_enrollment")
      .update(safeFields)
      .eq("email", email.trim().toLowerCase());

    if (error) {
      req.log.error({ err: error, email, safeFields }, "enrollment/update: supabase update failed");
      res.status(502).json({ error: "Unable to save your information." });
      return;
    }

    req.log.info({ email, safeFields }, "enrollment/update: fields updated");
    res.json({ ok: true });
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

  try {
    const { data, error } = await supabase
      .from("customer_enrollment")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      req.log.error({ err: error, email }, "enrollment/progress: supabase select failed");
      res.status(502).json({ error: "Unable to connect to the database." });
      return;
    }

    res.json({ record: data ?? null });
  } catch (err) {
    req.log.error({ err }, "enrollment/progress: unexpected error");
    res.status(500).json({ error: "Unable to connect to the database." });
  }
});

export default router;
