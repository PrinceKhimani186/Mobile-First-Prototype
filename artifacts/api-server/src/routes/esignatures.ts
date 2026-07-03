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
    const { data: agreement, error: selectErr } = await supabase
      .from("user_agreements")
      .select("pdf_url, signed_at")
      .eq("email", normalizedEmail)
      .eq("agreement_version", "1.0")
      .maybeSingle();

    if (selectErr) {
      logger.error({ selectErr, email }, "Agreement Status: Failed to query agreements");
      res.status(502).json({ error: "Database read failed" });
      return;
    }

    if (agreement) {
      res.json({ signed: true, pdfUrl: agreement.pdf_url, signedAt: agreement.signed_at });
    } else {
      res.json({ signed: false });
    }
  } catch (err) {
    logger.error({ err, email }, "Agreement Status: Unexpected error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/enrollment/custom-sign ─────────────────────────────────────────
// Receives custom canvas signature / typed name, creates PDF, uploads to Supabase, 
// and stores legal audit record in database.
router.post("/enrollment/custom-sign", async (req: Request, res: Response) => {
  const { email, fullName, packageName, price, signatureImage } = req.body as {
    email?: string;
    fullName?: string;
    packageName?: string;
    price?: string;
    signatureImage?: string;
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
      { ip, userAgent, timestamp }
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

    // Retrieve PDF public URL
    const { data: { publicUrl } } = supabase.storage
      .from("customer-documents")
      .getPublicUrl(storagePath);

    // 4 — Save audit record to user_agreements table
    const { error: insertErr } = await supabase
      .from("user_agreements")
      .insert({
        user_id: enrollRecord.id,
        email: normalizedEmail,
        full_name: fullName,
        agreement_version: "1.0",
        signature_image: signatureImage,
        signed_at: timestamp,
        ip_address: ip,
        user_agent: userAgent,
        pdf_url: publicUrl,
      });

    if (insertErr) {
      logger.error({ insertErr, email }, "Custom Sign: Failed to insert user_agreement record");
      res.status(502).json({ error: "Failed to save signature audit record" });
      return;
    }

    // 5 — Update customer_enrollment row
    const { error: updateErr } = await supabase
      .from("customer_enrollment")
      .update({
        agreement_signed: true,
        document_url: publicUrl,
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

    logger.info({ email, publicUrl }, "Custom Sign: Agreement generated and signed successfully");
    res.json({ success: true, pdfUrl: publicUrl });
  } catch (err) {
    logger.error({ err, email }, "Custom Sign: Unexpected error during signing process");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
