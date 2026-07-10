import { Router, type IRouter, type Request, type Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { logger } from "../lib/logger";
import { generateAgreementPDF } from "../lib/pdf";

const router: IRouter = Router();

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    return createClient(url.trim(), key.trim(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch {
    return null;
  }
}

// ── GET /api/enrollment/agreement-status ──────────────────────────────────────
// Checks if the user has signed the latest version of the agreement.
router.get("/enrollment/agreement-status", async (req: Request, res: Response) => {
  const email = req.query.email as string;

  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }

  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: "Database configuration error" });
    return;
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    
    // Check user_agreements table for latest version (1.0)
    const { data: agreements, error: selectErr } = await supabase
      .from("user_agreements")
      .select("pdf_url, signed_at")
      .eq("email", normalizedEmail)
      .eq("agreement_version", "1.0")
      .order("signed_at", { ascending: false })
      .limit(1);

    if (selectErr) {
      logger.error({ selectErr, email }, "Agreement Status: Failed to query agreements");
      res.status(502).json({ error: "Database read failed" });
      return;
    }

    const agreement = agreements?.[0] ?? null;

    if (agreement) {
      // Resolve storage path — handle both legacy full URLs and new path-only values
      let storagePath = agreement.pdf_url as string | null;
      if (storagePath && storagePath.startsWith("http")) {
        const marker = "/customer-documents/";
        const idx = storagePath.indexOf(marker);
        storagePath = idx !== -1 ? storagePath.substring(idx + marker.length) : null;
      }

      let signedUrl: string | undefined;
      if (storagePath) {
        const { data: signedData, error: signErr } = await supabase.storage
          .from("customer-documents")
          .createSignedUrl(storagePath, 60 * 60);
        if (signErr) logger.warn({ signErr, storagePath }, "Agreement Status: Failed to generate signed URL");
        signedUrl = signedData?.signedUrl;
      }

      res.json({ signed: true, pdfUrl: signedUrl, signedAt: agreement.signed_at });
    } else {
      res.json({ signed: false });
    }
  } catch (err) {
    logger.error({ err, email }, "Agreement Status: Unexpected error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Helper: insert user_agreements with graceful fallback for missing columns ──
// SQL to add columns (run once in Supabase Dashboard → SQL Editor):
//   ALTER TABLE user_agreements ADD COLUMN IF NOT EXISTS package_name TEXT;
//   ALTER TABLE user_agreements ADD COLUMN IF NOT EXISTS payment_option TEXT;
async function insertAgreementRecord(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  record: {
    user_id: string; email: string; full_name: string; agreement_version: string;
    signature_image: string; signed_at: string; ip_address: string; user_agent: string;
    pdf_url: string; package_name?: string; payment_option?: string;
  }
): Promise<{ error: { message: string; code?: string } | null }> {
  const { error } = await supabase.from("user_agreements").insert(record);
  if (!error) return { error: null };

  // If package_name/payment_option columns don't exist yet, retry without them.
  // Postgres raises 42703 for a missing column; PostgREST (Supabase's REST layer)
  // raises PGRST204 with a "schema cache" message when the column isn't in its
  // cached schema — both must be handled or the retry silently never fires.
  const isMissingColumn =
    error.code === "42703" ||
    error.code === "PGRST204" ||
    (error.message?.toLowerCase().includes("column") &&
      (error.message?.toLowerCase().includes("does not exist") || error.message?.toLowerCase().includes("schema cache")));

  if (isMissingColumn) {
    logger.warn(
      { code: error.code, msg: error.message },
      "user_agreements: package_name/payment_option columns missing — retrying without them. " +
      "Run: ALTER TABLE user_agreements ADD COLUMN IF NOT EXISTS package_name TEXT; " +
      "ALTER TABLE user_agreements ADD COLUMN IF NOT EXISTS payment_option TEXT;"
    );
    const { package_name: _pn, payment_option: _po, ...base } = record;
    const { error: retryErr } = await supabase.from("user_agreements").insert(base);
    return { error: retryErr };
  }

  return { error };
}

// ── POST /api/enrollment/custom-sign ─────────────────────────────────────────
// Receives custom canvas signature / typed name, creates PDF, uploads to Supabase, 
// and stores legal audit record in database.
router.post("/enrollment/custom-sign", async (req: Request, res: Response) => {
  const { email, fullName, packageName, price, signatureImage, paymentOption, packageId } = req.body as {
    email?: string;
    fullName?: string;
    packageName?: string;
    price?: string;
    signatureImage?: string;
    paymentOption?: string;
    packageId?: string;
  };

  if (!email || !fullName || !packageName || !price || !signatureImage) {
    res.status(400).json({ error: "Missing required signing fields" });
    return;
  }

  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: "Database configuration error" });
    return;
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    
    // 1 — Fetch client enrollment record to resolve user_id
    const { data: enrollRecord, error: enrollErr } = await supabase
      .from("customer_enrollment")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (enrollErr || !enrollRecord) {
      logger.error({ enrollErr, email }, "Custom Sign: Enrollment record not found");
      res.status(404).json({ error: "Enrollment record not found" });
      return;
    }

    // Resolve client IP and User Agent
    const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0].trim();
    const userAgent = req.headers["user-agent"] || "Unknown User Agent";
    const timestamp = new Date().toISOString();

    // 2 — Generate signed contract PDF Buffer
    const pdfBuffer = await generateAgreementPDF(
      fullName,
      normalizedEmail,
      packageName,
      price,
      new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      signatureImage,
      { ip, userAgent, timestamp },
      { packageId, paymentOption }
    );

    // 3 — Upload PDF to Supabase Storage bucket 'customer-documents'
    const storagePath = `agreements/${normalizedEmail}_agreement.pdf`;
    const { error: uploadErr } = await supabase.storage
      .from("customer-documents")
      .upload(storagePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadErr) {
      logger.error({ uploadErr, email }, "Custom Sign: PDF upload to storage failed");
      res.status(502).json({ error: "Failed to store contract PDF" });
      return;
    }

    // 4 — Save audit record to user_agreements table (store storage path, not public URL)
    const { error: insertErr } = await insertAgreementRecord(supabase, {
      user_id: enrollRecord.id,
      email: normalizedEmail,
      full_name: fullName,
      agreement_version: "1.0",
      signature_image: signatureImage,
      signed_at: timestamp,
      ip_address: ip,
      user_agent: userAgent,
      pdf_url: storagePath,
      package_name: packageName,
      payment_option: paymentOption,
    });

    if (insertErr) {
      logger.error({ insertErr, email }, "Custom Sign: Failed to insert user_agreement record");
      res.status(502).json({ error: "Failed to save signature audit record" });
      return;
    }

    // 5 — Update customer_enrollment row (store storage path, not public URL)
    const { error: updateErr } = await supabase
      .from("customer_enrollment")
      .update({
        agreement_signed: true,
        document_url: storagePath,
        document_name: "Enrollment Agreement.pdf",
        onboarding_status: "agreement_signed",
        updated_at: new Date().toISOString(),
      })
      .eq("email", normalizedEmail);

    if (updateErr) {
      logger.error({ updateErr, email }, "Custom Sign: Failed to update customer_enrollment signed status");
      res.status(502).json({ error: "Failed to update enrollment progress status" });
      return;
    }

    // 6 — Generate a signed URL for the immediate response (1-hour expiry)
    const { data: signedData, error: signErr } = await supabase.storage
      .from("customer-documents")
      .createSignedUrl(storagePath, 60 * 60);
    if (signErr) logger.warn({ signErr }, "Custom Sign: Failed to generate signed URL for response");
    const signedUrl = signedData?.signedUrl;

    logger.info({ email, storagePath }, "Custom Sign: Agreement generated and signed successfully");
    res.json({ success: true, pdfUrl: signedUrl });
  } catch (err) {
    logger.error({ err, email }, "Custom Sign: Unexpected error during signing process");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/enrollment/dev-sign ─────────────────────────────────────────────
// Developer Mode bypass — simulates a full Zoho Sign completion without consuming
// API quota. Performs every backend action the Zoho webhook performs.
router.post("/enrollment/dev-sign", async (req: Request, res: Response) => {
  const { email, fullName, packageName, price, paymentOption, packageId } = req.body as {
    email?: string;
    fullName?: string;
    packageName?: string;
    price?: string;
    paymentOption?: string;
    packageId?: string;
  };

  if (!email || !fullName) {
    res.status(400).json({ error: "email and fullName are required" });
    return;
  }

  const supabase = getSupabase();
  if (!supabase) {
    res.status(503).json({ error: "Database configuration error" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const resolvedPackage = packageName || "App Squad Enrollment Agreement";
  const resolvedPrice = price || "0";
  const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0].trim();
  const timestamp = new Date().toISOString();

  logger.info({ email: normalizedEmail }, "[DEV SIGN] Starting developer mode agreement bypass");

  try {
    // Step 1 — Resolve enrollment record
    const { data: enrollRecord, error: enrollErr } = await supabase
      .from("customer_enrollment")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (enrollErr || !enrollRecord) {
      logger.error({ enrollErr, email: normalizedEmail }, "[DEV SIGN] Step 1 FAILED: enrollment record not found");
      res.status(404).json({ error: "Enrollment record not found" });
      return;
    }
    logger.info({ userId: enrollRecord.id }, "[DEV SIGN] Step 1 OK: enrollment record resolved");

    // Step 2 — Generate mock PDF
    logger.info("[DEV SIGN] Step 2: Generating mock agreement PDF");
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateAgreementPDF(
        fullName.trim(),
        normalizedEmail,
        resolvedPackage,
        resolvedPrice,
        new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        "DEV_MODE",
        { ip, userAgent: "Developer Mode Bypass", timestamp },
        { packageId, paymentOption }
      );
    } catch (pdfErr) {
      logger.error({ pdfErr }, "[DEV SIGN] Step 2 FAILED: PDF generation error");
      res.status(500).json({ error: "Failed to generate mock PDF" });
      return;
    }
    logger.info({ bytes: pdfBuffer.length }, "[DEV SIGN] Step 2 OK: mock PDF generated");

    // Step 3 — Upload PDF to Supabase Storage
    const storagePath = `agreements/${normalizedEmail}_agreement.pdf`;
    logger.info({ storagePath }, "[DEV SIGN] Step 3: Uploading PDF to customer-documents bucket");

    const { error: uploadErr } = await supabase.storage
      .from("customer-documents")
      .upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });

    if (uploadErr) {
      logger.error({ uploadErr }, "[DEV SIGN] Step 3 FAILED: storage upload error");
      res.status(502).json({ error: "Failed to store mock PDF" });
      return;
    }
    logger.info("[DEV SIGN] Step 3 OK: PDF uploaded to storage");

    // Step 4 — Insert user_agreements audit record
    logger.info("[DEV SIGN] Step 4: Inserting user_agreements audit record");
    const { error: insertErr } = await insertAgreementRecord(supabase, {
      user_id: enrollRecord.id,
      email: normalizedEmail,
      full_name: fullName.trim(),
      agreement_version: "1.0",
      signature_image: "DEV_MODE",
      signed_at: timestamp,
      ip_address: ip,
      user_agent: "Developer Mode",
      pdf_url: storagePath,
      package_name: packageName ?? resolvedPackage,
      payment_option: paymentOption,
    });

    if (insertErr) {
      logger.error({ insertErr }, "[DEV SIGN] Step 4 FAILED: user_agreements insert error");
      res.status(502).json({ error: "Failed to save signature audit record" });
      return;
    }
    logger.info("[DEV SIGN] Step 4 OK: user_agreements record created");

    // Step 5 — Update customer_enrollment
    logger.info("[DEV SIGN] Step 5: Updating customer_enrollment");
    const { error: updateErr } = await supabase
      .from("customer_enrollment")
      .update({
        agreement_signed: true,
        document_url: storagePath,
        document_name: "Enrollment Agreement.pdf",
        onboarding_status: "agreement_signed",
        updated_at: timestamp,
      })
      .eq("email", normalizedEmail);

    if (updateErr) {
      logger.error({ updateErr }, "[DEV SIGN] Step 5 FAILED: customer_enrollment update error");
      res.status(502).json({ error: "Failed to update enrollment record" });
      return;
    }
    logger.info("[DEV SIGN] Step 5 OK: customer_enrollment updated (agreement_signed = true, onboarding_status = agreement_signed)");

    // Step 6 — Generate signed URL for immediate response
    const { data: signedData, error: signErr } = await supabase.storage
      .from("customer-documents")
      .createSignedUrl(storagePath, 60 * 60);
    if (signErr) logger.warn({ signErr }, "[DEV SIGN] Step 6 WARN: could not generate signed URL");
    const signedUrl = signedData?.signedUrl;
    logger.info("[DEV SIGN] Step 6 OK: signed URL generated (1 hour expiry)");

    logger.info({ email: normalizedEmail }, "[DEV SIGN] ✓ COMPLETE — all Zoho webhook actions simulated successfully");
    res.json({ success: true, pdfUrl: signedUrl });

  } catch (err) {
    logger.error({ err }, "[DEV SIGN] Unexpected error during developer mode bypass");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
