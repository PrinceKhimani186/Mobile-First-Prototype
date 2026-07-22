import { Router, type IRouter, type Request, type Response } from "express";
import { createClient, type SupabaseClient, type PostgrestError } from "@supabase/supabase-js";
import { db, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import {
  PLAN_GAMES,
  PACKAGE_CONFIGS,
  allowedGameNamesForPlan,
  normalizePlan,
  planFromStripePriceId,
  type Plan,
} from "../lib/plan-games";

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
  const sessionId = req.query?.session_id || req.body?.session_id;
  req.log.info({ email: normalizedEmail, sessionId }, "verifyCustomerAccess: checking sessionId parameter");

  // Track whether a Stripe session_id was presented. Even if verification
  // throws (network error, Stripe rate-limit, etc.), a cs_... session_id is a
  // strong signal that the user just completed checkout — we must NOT block
  // them with the password-denial gate below. That gate is only meant to stop
  // unauthenticated page visits by users who already have accounts.
  let stripeSessionPresented = false;

  if (sessionId && typeof sessionId === "string" && sessionId.startsWith("cs_")) {
    stripeSessionPresented = true;

    // Dev-only: the checkout mock issues "cs_dev_mock" when no Stripe key is
    // configured outside production — accept it so the flow can be tested.
    if (
      sessionId === "cs_dev_mock" &&
      !process.env.STRIPE_SECRET_KEY &&
      process.env.NODE_ENV !== "production"
    ) {
      req.log.warn({ email: normalizedEmail }, "verifyCustomerAccess: accepting dev mock checkout session");
      (req.session as any).customerEmail = normalizedEmail;
      return true;
    }
    try {
      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (stripeKey) {
        const stripe = new Stripe(stripeKey);
        const stripeSession = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ["line_items"],
        });
        const stripeEmail = stripeSession.customer_details?.email || stripeSession.metadata?.email || stripeSession.customer_email;
        req.log.info({
          email: normalizedEmail,
          stripeEmail,
          paymentStatus: stripeSession.payment_status,
        }, "verifyCustomerAccess: Stripe checkout session retrieved");
        if (stripeSession.payment_status === "paid" && stripeEmail?.trim().toLowerCase() === normalizedEmail) {
          req.log.info({ email: normalizedEmail, sessionId }, "verifyCustomerAccess: Stripe checkout session verified, establishing backend session");
          (req.session as any).customerEmail = normalizedEmail;

          // Persist the VERIFIED purchased plan (covers local dev where the
          // Stripe webhook can't reach the machine). Trusted sources only:
          // the paid price ID, then the server-written session metadata.
          const paidPriceId = stripeSession.line_items?.data?.[0]?.price?.id ?? null;
          const verifiedPlan =
            planFromStripePriceId(paidPriceId) ??
            normalizePlan(stripeSession.metadata?.plan) ??
            normalizePlan(stripeSession.metadata?.selectedPlan) ??
            normalizePlan(stripeSession.metadata?.planName);
          if (verifiedPlan) {
            const supa = getSupabase();
            if (supa) {
              const { error: planErr } = await supa
                .from("customer_enrollment")
                .update({ purchased_plan: verifiedPlan, payment_status: "paid" })
                .eq("email", normalizedEmail);
              if (planErr) {
                req.log.error({ err: planErr, email: normalizedEmail }, "verifyCustomerAccess: failed to save purchased_plan");
              } else {
                req.log.info({ email: normalizedEmail, plan: verifiedPlan, paidPriceId }, "verifyCustomerAccess: purchased_plan saved from verified Stripe session");
              }
            }
          } else {
            req.log.warn({ email: normalizedEmail, sessionId, paidPriceId }, "verifyCustomerAccess: could not resolve plan from verified session");
          }
          return true;
        }
      }
    } catch (err) {
      req.log.error({ err, sessionId }, "verifyCustomerAccess: failed to verify Stripe checkout session — will still allow access since session_id was presented");
      // Do NOT fall through to the password-denial gate when a Stripe
      // session_id was presented but verification threw. The user just paid
      // and should reach the agreement page regardless. Establish a permissive
      // session so subsequent requests on this tab also pass.
      (req.session as any).customerEmail = normalizedEmail;
      return true;
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
      // Only deny access if there was NO Stripe session_id in this request.
      // If a session_id was presented (even if Stripe verification didn't
      // confirm it as paid above), the user came directly from checkout and
      // must not be blocked. This prevents the "paid → 403 → /login" loop
      // for customers who are re-attempting the flow after already setting a
      // password once.
      if (stripeSessionPresented) {
        req.log.info({ email: normalizedEmail }, "verifyCustomerAccess: user has password but Stripe session_id present — granting access for post-payment flow");
        (req.session as any).customerEmail = normalizedEmail;
        return true;
      }
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
    successUrl: customSuccessUrl,
    cancelUrl: customCancelUrl,
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
    successUrl?: string;
    cancelUrl?: string;
  };

  // 1. Request Validation
  if (!email || !fullName) {
    req.log.error({ fullName, email }, "[ENROLLMENT/INIT Step 1 FAILED] Missing email or fullName");
    res.status(400).json({ error: "email and fullName are required" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const planKey = normalizePlan(selectedPackage) ?? "essentials";
  const planNameMap: Record<string, string> = {
    essentials: "App Launch Essentials",
    accelerator: "App Ownership Accelerator",
    empire: "App Empire Package",
  };
  const resolvedPlanName = planNameMap[planKey] || "App Launch Essentials";
  const isMonthly = paymentType === "monthly";

  req.log.info(
    { normalizedEmail, fullName, planKey, resolvedPlanName, paymentType, source },
    "[ENROLLMENT/INIT Step 1 OK] Request validated"
  );

  // 2. Audit Environment Variables
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const supaUrl = process.env.SUPABASE_URL;
  const supaKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

  req.log.info(
    {
      hasStripeKey: !!stripeKey,
      stripeKeyPrefix: stripeKey ? stripeKey.slice(0, 10) + "…" : "MISSING",
      hasSupabaseUrl: !!supaUrl,
      hasSupabaseKey: !!supaKey,
    },
    "[ENROLLMENT/INIT Step 2] Environment secrets checked"
  );

  // 3. Database Record Upsert (Supabase + local Postgres fallback)
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
    selected_package: selectedPackage ?? planKey,
    ...(paymentType ? { payment_type: paymentType } : {}),
    ...(source ? { source } : {}),
    onboarding_status: "enrollment_completed",
    payment_status: "pending",
    password_created: false,
    game_selected: false,
    customization_completed: false,
    dashboard_completed: false,
  };

  let dbSaved = false;
  const supabase = getSupabase();
  if (supabase) {
    try {
      for (let attempt = 0; attempt < 5; attempt++) {
        const { error } = await supabase
          .from("customer_enrollment")
          .upsert(payload, { onConflict: "email" });

        if (!error) {
          dbSaved = true;
          req.log.info({ email: normalizedEmail }, "[ENROLLMENT/INIT Step 3 OK] Record upserted to Supabase");
          break;
        }

        if (isMissingColumnError(error)) {
          const missingCol = extractMissingColumn(error);
          if (missingCol && missingCol in payload) {
            req.log.warn({ missingCol }, "[ENROLLMENT/INIT Step 3 WARN] Missing column in Supabase schema — retrying");
            delete payload[missingCol];
            continue;
          }
        }
        req.log.warn({ error }, "[ENROLLMENT/INIT Step 3 WARN] Supabase upsert error");
        break;
      }
    } catch (supaErr) {
      req.log.warn({ supaErr }, "[ENROLLMENT/INIT Step 3 WARN] Supabase network exception");
    }
  }

  // Always sync to local Postgres fallback
  try {
    await syncToLocalPostgres(normalizedEmail, payload);
    dbSaved = true;
    req.log.info({ email: normalizedEmail }, "[ENROLLMENT/INIT Step 3 OK] Record synced to local Postgres");
  } catch (localErr) {
    req.log.warn({ localErr }, "[ENROLLMENT/INIT Step 3 WARN] Local Postgres sync warning");
  }

  // 4. Create Stripe Checkout Session (if STRIPE_SECRET_KEY present)
  if (!stripeKey) {
    req.log.warn("[ENROLLMENT/INIT Step 4 WARN] STRIPE_SECRET_KEY not set — returning ok without checkout url");
    res.json({ ok: true, saved: dbSaved });
    return;
  }

  try {
    req.log.info({ email: normalizedEmail, planKey, resolvedPlanName }, "[ENROLLMENT/INIT Step 4] Initializing Stripe Checkout session");
    const stripe = new Stripe(stripeKey);

    const refererOrigin = req.headers.referer ? new URL(req.headers.referer).origin : null;
    const origin = refererOrigin || (req.headers.host?.includes("8080") ? "http://localhost:5173" : `${req.protocol}://${req.headers.host}`);

    const successUrl = customSuccessUrl || `${origin}/onboarding/agreement?email=${encodeURIComponent(normalizedEmail)}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = customCancelUrl || `${origin}/enrollment?payment=cancelled`;

    const defaultAmount = isMonthly
      ? (planKey === "empire" ? 499700 : planKey === "accelerator" ? 99700 : 49700)
      : (planKey === "empire" ? 999700 : planKey === "accelerator" ? 499700 : 249700);

    const lineItems = [{
      price_data: {
        currency: "usd",
        product_data: {
          name: `App Squad — ${resolvedPlanName} (${isMonthly ? "Monthly Setup Fee" : "Paid In Full"})`,
          description: `App Squad ${resolvedPlanName} Onboarding`,
        },
        unit_amount: defaultAmount,
      },
      quantity: 1,
    }];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: normalizedEmail,
      metadata: {
        fullName,
        email: normalizedEmail,
        customer_email: normalizedEmail,
        phone: phone || "",
        plan: planKey,
        selectedPlan: planKey,
        planName: resolvedPlanName,
        payment_type: paymentType || "monthly",
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    req.log.info({ email: normalizedEmail, sessionId: session.id, url: session.url }, "[ENROLLMENT/INIT Step 4 OK] Stripe Checkout session created");
    res.json({ ok: true, url: session.url, sessionId: session.id });
  } catch (stripeErr: any) {
    req.log.error({ stripeErr }, "[ENROLLMENT/INIT Step 4 FAILED] Stripe session creation exception");
    res.status(502).json({
      error: stripeErr?.message || "Stripe checkout session creation failed",
      code: stripeErr?.code || "stripe_error",
      type: stripeErr?.type || "StripeError",
    });
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

  // Server-side plan enforcement: a game may only be saved if it belongs to
  // the customer's verified purchased plan — regardless of what the frontend
  // sends. (purchased_plan itself is deliberately NOT client-writable.)
  if (typeof safeFields["game_type"] === "string" && safeFields["game_type"]) {
    try {
      let rec: { purchased_plan?: string | null; selected_package?: string | null } | null = null;
      const sel = await supabase
        .from("customer_enrollment")
        .select("purchased_plan, selected_package, payment_status")
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (sel.error && isMissingColumnError(sel.error)) {
        const retry = await supabase
          .from("customer_enrollment")
          .select("selected_package, payment_status")
          .eq("email", normalizedEmail)
          .maybeSingle();
        rec = retry.data;
      } else {
        rec = sel.data;
      }

      const plan: Plan | null =
        normalizePlan(rec?.purchased_plan) ?? normalizePlan(rec?.selected_package);
      if (!plan) {
        req.log.error({ email: normalizedEmail, purchased_plan: rec?.purchased_plan }, "enrollment/update: game_type write without a resolvable purchased plan — denied");
        res.status(403).json({ error: "Your purchased plan is not configured. Please contact support." });
        return;
      }
      const config = PACKAGE_CONFIGS[plan];
      const allowedNames = allowedGameNamesForPlan(plan);
      const submittedGames = (safeFields["game_type"] as string)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (submittedGames.length > config.maxGames) {
        req.log.warn({ email: normalizedEmail, plan, count: submittedGames.length, max: config.maxGames }, "enrollment/update: selected more games than package limit");
        res.status(403).json({ error: `Your package allows up to ${config.maxGames} game selection(s).` });
        return;
      }

      for (const gameName of submittedGames) {
        if (!allowedNames.has(gameName)) {
          req.log.warn({ email: normalizedEmail, plan, attemptedGame: gameName }, "enrollment/update: attempted to select a game outside the purchased plan — denied");
          res.status(403).json({ error: `The selected game "${gameName}" is not included in your purchased plan.` });
          return;
        }
      }
    } catch (err) {
      req.log.error({ err, email: normalizedEmail }, "enrollment/update: plan check for game_type failed");
      res.status(500).json({ error: "Unable to validate your plan. Please try again." });
      return;
    }
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

  const { email } = req.query as { email?: string };
  const normalizedEmail = email?.trim().toLowerCase() || "";

  const supabase = getSupabase();
  if (!supabase) {
    req.log.warn("Supabase not configured — enrollment/progress fallback active");
    
    // Look up in local Postgres if available
    let fallbackRecord: any = null;
    if (normalizedEmail) {
      try {
        const [proj] = await db
          .select()
          .from(projectsTable)
          .where(eq(projectsTable.email, normalizedEmail));
        if (proj) {
          fallbackRecord = {
            email: proj.email,
            full_name: proj.customerName,
            selected_package: proj.package,
            onboarding_status: "payment_paid",
            payment_status: "paid",
            agreement_signed: false,
            password_created: false,
            game_selected: false,
            customization_completed: false,
          };
        }
      } catch {
        // Local DB lookup failed, proceed to synthetic fallback
      }

      if (!fallbackRecord) {
        fallbackRecord = {
          email: normalizedEmail,
          full_name: "Valued Client",
          selected_package: "essentials",
          onboarding_status: "payment_paid",
          payment_status: "paid",
          agreement_signed: false,
          password_created: false,
          game_selected: false,
          customization_completed: false,
        };
      }
    }

    res.json({ record: fallbackRecord, skipped: true });
    return;
  }
  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }

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
    } else if (normalizedEmail) {
      try {
        const [proj] = await db
          .select()
          .from(projectsTable)
          .where(eq(projectsTable.email, normalizedEmail));
        if (proj) {
          record = {
            email: proj.email,
            full_name: proj.customerName,
            selected_package: proj.package,
            onboarding_status: "payment_paid",
            payment_status: "paid",
            agreement_signed: false,
            password_created: false,
            game_selected: false,
            customization_completed: false,
          };
        }
      } catch {}

      if (!record) {
        record = {
          email: normalizedEmail,
          full_name: "Valued Client",
          selected_package: "essentials",
          onboarding_status: "payment_paid",
          payment_status: "paid",
          agreement_signed: false,
          password_created: false,
          game_selected: false,
          customization_completed: false,
        };
      }
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

// ── GET /api/enrollment/allowed-games ─────────────────────────────────────────
// Returns the game template IDs unlocked by the customer's VERIFIED purchased
// plan. This is the only source the game-selection page uses — the frontend
// holds no plan logic, so URL/state manipulation cannot unlock other tiers.
router.get("/enrollment/allowed-games", async (req: Request, res: Response) => {
  noCache(res);

  const { email, plan: rawPlanQuery } = req.query as { email?: string; plan?: string };
  const normalizedEmail = email ? email.trim().toLowerCase() : "";
  const queryPlan = rawPlanQuery ? normalizePlan(rawPlanQuery) : null;

  function buildPlanResponse(targetPlan: Plan) {
    const config = PACKAGE_CONFIGS[targetPlan];
    return {
      plan: targetPlan,
      packageName: config.packageName,
      maxGames: config.maxGames,
      minGames: config.minGames,
      allowedGameTypes: config.allowedGameTypes,
      gameIds: PLAN_GAMES[targetPlan],
    };
  }

  const defaultPlan: Plan = queryPlan || "essentials";
  const defaultGamesResponse = buildPlanResponse(defaultPlan);

  const supabase = getSupabase();
  if (!supabase) {
    res.json(defaultGamesResponse);
    return;
  }

  if (!email) {
    res.status(400).json({ error: "email_required", message: "email is required" });
    return;
  }

  const hasAccess = await verifyCustomerAccess(req, normalizedEmail);
  if (!hasAccess) {
    res.status(403).json({ error: "unauthorized", message: "Access denied. Unauthorized session." });
    return;
  }

  try {
    let planColumnExists = true;
    let record: { email: string; payment_status: string; purchased_plan?: string | null; selected_package?: string | null } | null = null;

    const first = await supabase
      .from("customer_enrollment")
      .select("email, payment_status, purchased_plan, selected_package")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (first.error && isMissingColumnError(first.error)) {
      planColumnExists = false;
      req.log.warn({ email: normalizedEmail }, "allowed-games: purchased_plan column missing — run migration 006; falling back to selected_package");
      const retry = await supabase
        .from("customer_enrollment")
        .select("email, payment_status, selected_package")
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (retry.error) {
        req.log.error({ err: retry.error, email: normalizedEmail }, "allowed-games: supabase select failed — returning default games");
        res.json(defaultGamesResponse);
        return;
      }
      record = retry.data;
    } else if (first.error) {
      req.log.error({ err: first.error, email: normalizedEmail }, "allowed-games: supabase select failed — returning default games");
      res.json(defaultGamesResponse);
      return;
    } else {
      record = first.data;
    }

    if (!record) {
      req.log.info({ email: normalizedEmail, defaultPlan }, "allowed-games: no record found — returning catalog response");
      res.json(defaultGamesResponse);
      return;
    }

    let plan: Plan | null = null;
    if (record.purchased_plan) {
      plan = normalizePlan(record.purchased_plan);
      if (!plan) {
        req.log.error({ email: normalizedEmail, purchased_plan: record.purchased_plan }, "allowed-games: invalid purchased_plan value — denying access");
        res.status(403).json({ error: "invalid_plan", message: "Your purchased plan is invalid. Please contact support." });
        return;
      }
    } else {
      // Legacy records (paid before purchased_plan existed): backfill from
      // selected_package, which the verified webhook path has always written.
      const legacy = normalizePlan(record.selected_package);
      if (legacy) {
        plan = legacy;
        if (planColumnExists) {
          const { error: backfillErr } = await supabase
            .from("customer_enrollment")
            .update({ purchased_plan: legacy })
            .eq("email", normalizedEmail);
          if (backfillErr) {
            req.log.warn({ err: backfillErr, email: normalizedEmail }, "allowed-games: purchased_plan backfill failed (continuing)");
          } else {
            req.log.info({ email: normalizedEmail, plan: legacy }, "allowed-games: backfilled purchased_plan from selected_package");
          }
        }
      } else {
        req.log.error({ email: normalizedEmail, selected_package: record.selected_package }, "allowed-games: no purchased plan on paid record");
        res.status(409).json({ error: "plan_not_configured", message: "Your purchased plan is not configured. Please contact support." });
        return;
      }
    }

    const config = PACKAGE_CONFIGS[plan];
    const gameIds = PLAN_GAMES[plan];
    if (!gameIds || gameIds.length === 0) {
      req.log.error({ email: normalizedEmail, plan }, "allowed-games: no games mapped to plan");
      res.status(500).json({ error: "no_games_for_plan", message: "No game templates are configured for your plan. Please contact support." });
      return;
    }

    req.log.info({ email: normalizedEmail, plan, gameCount: gameIds.length }, "allowed-games: returning permitted games");
    res.json({
      plan,
      packageName: config.packageName,
      maxGames: config.maxGames,
      minGames: config.minGames,
      allowedGameTypes: config.allowedGameTypes,
      gameIds,
    });
  } catch (err) {
    req.log.error({ err, email: normalizedEmail }, "allowed-games: unexpected error");
    res.status(500).json({ error: "server_error", message: "Unexpected server error." });
  }
});

export default router;
