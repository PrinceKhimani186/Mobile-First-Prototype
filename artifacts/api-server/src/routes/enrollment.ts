import { Router, type IRouter, type Request, type Response } from "express";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { normalizePlan } from "../lib/plan-games";

const router: IRouter = Router();

const GHL_BASE = "https://services.leadconnectorhq.com";

function ghlHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
  };
}

// ── Checkout price resolver ───────────────────────────────────────────────────
// Returns the one-time Stripe price ID appropriate for the plan + payment type.
//   payment_type === "monthly"       → setup/down-payment price (one-time)
//   payment_type === "subscription"  → paid-in-full price (one-time)
// Three packages: essentials, accelerator, empire
function getCheckoutPrice(planName: string, paymentType?: string): string | undefined {
  const isMonthly = paymentType === "monthly";

  const e  = process.env;
  // Setup fee (one-time) prices for monthly plans
  // essentials: $497 setup | accelerator: $997 setup | empire: $4,997 setup
  const setup: Record<string, string | undefined> = {
    "App Launch Essentials":     e.VITE_STRIPE_PRICE_ESSENTIALS_SETUP  || e.STRIPE_PRICE_ESSENTIALS_SETUP,
    "App Ownership Accelerator": e.VITE_STRIPE_PRICE_ACCELERATOR_SETUP || e.STRIPE_PRICE_ACCELERATOR_SETUP,
    "App Empire Package":        e.VITE_STRIPE_PRICE_EMPIRE_SETUP      || e.STRIPE_PRICE_EMPIRE_SETUP,
    "essentials":  e.VITE_STRIPE_PRICE_ESSENTIALS_SETUP  || e.STRIPE_PRICE_ESSENTIALS_SETUP,
    "accelerator": e.VITE_STRIPE_PRICE_ACCELERATOR_SETUP || e.STRIPE_PRICE_ACCELERATOR_SETUP,
    "empire":      e.VITE_STRIPE_PRICE_EMPIRE_SETUP      || e.STRIPE_PRICE_EMPIRE_SETUP,
  };

  // Paid-in-full (one-time) prices
  // essentials: $2,497 | accelerator: $4,997 | empire: $9,997
  const full: Record<string, string | undefined> = {
    "App Launch Essentials":     e.VITE_STRIPE_PRICE_ESSENTIALS  || e.STRIPE_PRICE_ESSENTIALS,
    "App Ownership Accelerator": e.VITE_STRIPE_PRICE_ACCELERATOR || e.STRIPE_PRICE_ACCELERATOR,
    "App Empire Package":        e.VITE_STRIPE_PRICE_EMPIRE      || e.STRIPE_PRICE_EMPIRE,
    "essentials":  e.VITE_STRIPE_PRICE_ESSENTIALS  || e.STRIPE_PRICE_ESSENTIALS,
    "accelerator": e.VITE_STRIPE_PRICE_ACCELERATOR || e.STRIPE_PRICE_ACCELERATOR,
    "empire":      e.VITE_STRIPE_PRICE_EMPIRE      || e.STRIPE_PRICE_EMPIRE,
  };

  if (isMonthly) return setup[planName];
  return full[planName] ?? setup[planName];
}

// Kept for backward-compat
function getSetupFeePrice(planName: string): string | undefined {
  return getCheckoutPrice(planName, "monthly");
}

function stripeKeyMode(): "test" | "live" | "unknown" {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (key.startsWith("sk_test_") || key.startsWith("rk_test_")) return "test";
  if (key.startsWith("sk_live_") || key.startsWith("rk_live_")) return "live";
  return "unknown";
}

function stripeConfigError(): string | null {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (!key) return "STRIPE_SECRET_KEY is not set";
  if (key.startsWith("pk_")) return "STRIPE_SECRET_KEY is a publishable key (pk_…). Use the secret key (sk_… or rk_…) instead.";
  if (!key.startsWith("sk_") && !key.startsWith("rk_") && !key.startsWith("mk_")) return `STRIPE_SECRET_KEY has an unexpected format: ${key.slice(0, 6)}…`;
  return null;
}

// ── GET /api/stripe-mode ──────────────────────────────────────────────────────
// Diagnostic: returns which Stripe mode is active and which price IDs are in use.
// Visit /api/stripe-mode in your browser to quickly diagnose test/live mismatches.
router.get("/stripe-mode", (_req, res) => {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const mode = stripeKeyMode();
  const configured = !!key;

  const priceIds = {
    essentials_full:        process.env.STRIPE_PRICE_ESSENTIALS        ?? "(hardcoded fallback: price_1TnzBEJJdy0crHI8d1FLz9Et)",
    accelerator_full:       process.env.STRIPE_PRICE_ACCELERATOR       ?? "(hardcoded fallback: price_1TnzBFJJdy0crHI8yCluGftj)",
    empire_full:            process.env.STRIPE_PRICE_EMPIRE            ?? "(hardcoded fallback: price_1TnzBGJJdy0crHI8zTHTCEUV)",
    essentials_setup:       process.env.STRIPE_PRICE_ESSENTIALS_SETUP  ?? "(hardcoded fallback: price_1TnzBLJJdy0crHI8FHNhiOtw)",
    accelerator_setup:      process.env.STRIPE_PRICE_ACCELERATOR_SETUP ?? "(hardcoded fallback: price_1TnzBMJJdy0crHI8LawdE6HC)",
    empire_setup:           process.env.STRIPE_PRICE_EMPIRE_SETUP      ?? "(hardcoded fallback: price_1Tq7OgJJdy0crHI8Pnq5oyrv)",
  };

  const usingFallbackIds = !process.env.STRIPE_PRICE_ESSENTIALS;

  res.json({
    stripeKeyConfigured: configured,
    stripeMode: mode,
    usingHardcodedFallbackPriceIds: usingFallbackIds,
    warning: mode === "live" && usingFallbackIds
      ? "MISMATCH: STRIPE_SECRET_KEY is a LIVE key but price IDs are hardcoded TEST fallbacks. " +
        "Set STRIPE_PRICE_ESSENTIALS, STRIPE_PRICE_ACCELERATOR, STRIPE_PRICE_EMPIRE, " +
        "STRIPE_PRICE_ESSENTIALS_SETUP, STRIPE_PRICE_ACCELERATOR_SETUP, STRIPE_PRICE_EMPIRE_SETUP " +
        "to your LIVE Stripe price IDs in environment secrets."
      : mode === "test" && usingFallbackIds
      ? "Using hardcoded TEST price IDs. Fine for development. Set STRIPE_PRICE_* env vars for explicit control."
      : null,
    priceIds,
  });
});

function priceIdError(planName: string): string | null {
  const id = getSetupFeePrice(planName) ?? "";
  if (!id) return `Setup fee price for "${planName}" is not set. Set STRIPE_PRICE_${planName.toUpperCase().replace(/\s+/g, "_")}_SETUP`;
  if (id.startsWith("prod_")) return `Setup fee price for "${planName}" looks like a Product ID (prod_…). Use the Price ID (price_…) from the product's pricing tab.`;
  if (!id.startsWith("price_")) return `Setup fee price for "${planName}" has an unexpected format: ${id.slice(0, 8)}…`;
  return null;
}

// ── POST /api/enrollment/checkout ────────────────────────────────────────────
router.post("/enrollment/checkout", async (req: Request, res: Response) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    req.log.error("Enrollment: STRIPE_SECRET_KEY is not configured in environment secrets.");
    res.status(503).json({
      error: "Stripe configuration required. Please set STRIPE_SECRET_KEY in your environment variables.",
    });
    return;
  }

  // 1 — Validate Stripe key format
  const keyErr = stripeConfigError();
  if (keyErr) {
    req.log.error({ keyErr }, "Enrollment: Stripe key config error");
    res.status(503).json({ error: keyErr });
    return;
  }

  const {
    firstName, lastName, email, phone,
    selectedPlan, planName, planTag,
    successUrl, cancelUrl,
    payment_type, stripe_price_id, setup_price_id
  } = req.body as {
    firstName: string; lastName: string; email: string; phone?: string;
    selectedPlan: string; planName: string; planTag: string;
    successUrl: string; cancelUrl: string;
    payment_type?: "subscription" | "monthly";
    stripe_price_id?: string;
    setup_price_id?: string;
  };

  if (!firstName || !lastName || !email || !planName || !successUrl || !cancelUrl) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const phoneVal = phone ?? "";

  const stripeKey = process.env.STRIPE_SECRET_KEY!;
  const ghlApiKey = process.env.GHL_API_KEY;
  const ghlLocationId = process.env.GHL_LOCATION_ID;

  const keyMode = stripeKeyMode();
  req.log.info({ keyMode }, "Enrollment: initializing Stripe checkout session");

  // 3 — Resolve line items for Stripe checkout
  const planKey = normalizePlan(selectedPlan) ?? normalizePlan(planName) ?? "essentials";
  const setupFeePrice = getCheckoutPrice(planName, payment_type);
  const isValidPriceId = setupFeePrice && setupFeePrice.startsWith("price_") && !setupFeePrice.includes("hardcoded");

  const isMonthly = payment_type === "monthly";
  const defaultAmount = isMonthly
    ? (planKey === "empire" ? 499700 : planKey === "accelerator" ? 99700 : 49700)
    : (planKey === "empire" ? 999700 : planKey === "accelerator" ? 499700 : 249700);

  const line_items = isValidPriceId
    ? [{ price: setupFeePrice, quantity: 1 }]
    : [{
        price_data: {
          currency: "usd",
          product_data: {
            name: `App Squad — ${planName} (${isMonthly ? "Monthly Setup Fee" : "Paid In Full"})`,
            description: planTag || `App Squad ${planName} Onboarding`,
          },
          unit_amount: defaultAmount,
        },
        quantity: 1,
      }];

  const stripe = new Stripe(stripeKey);

  req.log.info({
    plan: planKey,
    selectedPlan: planName,
    resolvedPriceId: setupFeePrice || "dynamic_price_data",
    line_items,
  }, "Enrollment: checkout price resolved");

  // 3 — Create / update GHL contact (non-fatal)
  if (ghlApiKey && ghlLocationId) {
    try {
      const emailStr = email.trim().toLowerCase();
      // Search first to avoid duplicate contacts
      const searchUrl = `${GHL_BASE}/contacts/search/duplicate?locationId=${encodeURIComponent(ghlLocationId)}&email=${encodeURIComponent(emailStr)}`;
      const searchRes = await fetch(searchUrl, { headers: ghlHeaders(ghlApiKey) });
      let contactId: string | null = null;
      if (searchRes.ok) {
        const searchData = await searchRes.json() as { contact?: { id?: string } | null };
        contactId = searchData?.contact?.id ?? null;
      }

      let resGhl;
      const tagToApply = "enrollment-submitted";
      if (contactId) {
        // Update contact and add tag
        req.log.info({ email: emailStr, contactId }, "Enrollment: GHL contact found — updating and adding tag");
        resGhl = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
          method: "PUT",
          headers: ghlHeaders(ghlApiKey),
          body: JSON.stringify({
            firstName,
            lastName,
            email: emailStr,
            phone: phoneVal,
          }),
        });

        // Add tag specifically
        await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
          method: "POST",
          headers: ghlHeaders(ghlApiKey),
          body: JSON.stringify({ tags: [tagToApply] }),
        });
      } else {
        // Create contact
        req.log.info({ email: emailStr }, "Enrollment: GHL contact not found — creating new one with tag");
        resGhl = await fetch(`${GHL_BASE}/contacts/`, {
          method: "POST",
          headers: ghlHeaders(ghlApiKey),
          body: JSON.stringify({
            locationId: ghlLocationId,
            firstName,
            lastName,
            email: emailStr,
            phone: phoneVal,
            tags: [tagToApply],
          }),
        });
        if (resGhl.ok) {
          const createData = await resGhl.json() as { contact?: { id?: string } };
          contactId = createData?.contact?.id ?? null;
        }
      }

      req.log.info({
        email: emailStr,
        contactId: contactId ?? "unknown",
        tagApplied: tagToApply,
        success: resGhl.ok,
        status: resGhl.status
      }, "Enrollment: GHL contact tag processing complete");

    } catch (ghlErr) {
      req.log.warn({ ghlErr }, "Enrollment: GHL contact upsert failed (non-fatal)");
    }
  }

  // 4 — Create Stripe checkout session
  try {
    req.log.info({
      email,
      planName,
      line_items,
      mode: "payment",
    }, "Enrollment: creating Stripe checkout session");

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        customer_email: email,
        metadata: {
          firstName,
          lastName,
          email,
          customer_email: email,
          phone: phoneVal,
          plan: planKey,
          selectedPlan,
          planName,
          planTag,
          payment_type: payment_type || "one_time",
          price_id_used: setupFeePrice || "dynamic_price_data",
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
    } catch (createErr: any) {
      if (createErr?.code === "resource_missing" && isValidPriceId) {
        req.log.warn({ createErr }, "Enrollment: pre-configured Stripe Price ID not found in account — falling back to dynamic price_data");
        const dynamicLineItems = [{
          price_data: {
            currency: "usd",
            product_data: {
              name: `App Squad — ${planName} (${isMonthly ? "Monthly Setup Fee" : "Paid In Full"})`,
              description: planTag || `App Squad ${planName} Onboarding`,
            },
            unit_amount: defaultAmount,
          },
          quantity: 1,
        }];
        session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: dynamicLineItems,
          mode: "payment",
          customer_email: email,
          metadata: {
            firstName,
            lastName,
            email,
            customer_email: email,
            phone: phoneVal,
            plan: planKey,
            selectedPlan,
            planName,
            planTag,
            payment_type: payment_type || "one_time",
            price_id_used: "dynamic_price_data_fallback",
          },
          success_url: successUrl,
          cancel_url: cancelUrl,
        });
      } else {
        throw createErr;
      }
    }

    req.log.info({ email, planName, sessionId: session.id, mode: "payment", priceId: setupFeePrice }, "Enrollment: Stripe session created successfully");
    res.json({ url: session.url });

  } catch (err: unknown) {
    // Surface the exact Stripe error so the caller knows the real cause.
    let message = "Stripe checkout session creation failed";
    let stripeCode: string | undefined;
    let stripeType: string | undefined;

    if (err && typeof err === "object") {
      const e = err as Record<string, unknown>;
      if (typeof e["message"] === "string") message = e["message"] as string;
      if (typeof e["code"] === "string") stripeCode = e["code"] as string;
      if (typeof e["type"] === "string") stripeType = e["type"] as string;
    }

    req.log.error({ err, planName, priceId: setupFeePrice, stripeCode, stripeType }, "Enrollment: Stripe session creation failed");

    res.status(502).json({
      error: message,
      ...(stripeCode ? { code: stripeCode } : {}),
      ...(stripeType ? { type: stripeType } : {}),
    });
  }
});

export default router;
