import { Router, type IRouter, type Request, type Response } from "express";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const router: IRouter = Router();

function noCache(res: Response) {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.set("Pragma", "no-cache");
}

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  // Prefer the service role key (bypasses RLS for server-side ops).
  // Falls back to anon key if service role is not configured.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// ── POST /api/enrollment/init ─────────────────────────────────────────────────
// Called when Step 1 of enrollment is submitted.
// Upserts a customer_enrollment row.
router.post("/enrollment/init", async (req: Request, res: Response) => {
  noCache(res);

  const supabase = getSupabase();
  if (!supabase) {
    // Graceful degradation: return ok if Supabase is not configured yet.
    req.log.warn("Supabase not configured — enrollment/init skipped");
    res.json({ ok: true, skipped: true });
    return;
  }

  const { fullName, email, phone, companyName } = req.body as {
    fullName?: string;
    email?: string;
    phone?: string;
    companyName?: string;
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
          onboarding_status: "enrollment_completed",
          payment_status: "pending",
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
// Generic field updater — accepts { email, fields: Record<string, unknown> }.
// Used by all markX() service functions.
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

  // Allowlist the fields that can be updated via this endpoint.
  const ALLOWED = new Set([
    "selected_package",
    "payment_status",
    "password_created",
    "game_selected",
    "customization_completed",
    "dashboard_completed",
    "onboarding_status",
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
// Returns the customer_enrollment record for the given email.
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
