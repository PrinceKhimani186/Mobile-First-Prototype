import { Router, type IRouter, type Request, type Response } from "express";
import Stripe from "stripe";

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

  // Setup fee (one-time) prices for monthly plans
  // essentials: $497 setup | accelerator: $997 setup | empire: $4,997 setup
  const setup: Record<string, string | undefined> = {
    "App Launch Essentials":     process.env.STRIPE_PRICE_ESSENTIALS_SETUP  || "price_1TnzBLJJdy0crHI8FHNhiOtw",
    "App Ownership Accelerator": process.env.STRIPE_PRICE_ACCELERATOR_SETUP || "price_1TnzBMJJdy0crHI8LawdE6HC",
    "App Empire Package":        process.env.STRIPE_PRICE_EMPIRE_SETUP      || "price_1Tq7OgJJdy0crHI8Pnq5oyrv",
    "essentials":  process.env.STRIPE_PRICE_ESSENTIALS_SETUP  || "price_1TnzBLJJdy0crHI8FHNhiOtw",
    "accelerator": process.env.STRIPE_PRICE_ACCELERATOR_SETUP || "price_1TnzBMJJdy0crHI8LawdE6HC",
    "empire":      process.env.STRIPE_PRICE_EMPIRE_SETUP      || "price_1Tq7OgJJdy0crHI8Pnq5oyrv",
  };

  // Paid-in-full (one-time) prices
  // essentials: $2,497 | accelerator: $4,997 | empire: $9,997
  const full: Record<string, string | undefined> = {
    "App Launch Essentials":     process.env.STRIPE_PRICE_ESSENTIALS  || "price_1TnzBEJJdy0crHI8d1FLz9Et",
    "App Ownership Accelerator": process.env.STRIPE_PRICE_ACCELERATOR || "price_1TnzBFJJdy0crHI8yCluGftj",
    "App Empire Package":        process.env.STRIPE_PRICE_EMPIRE      || "price_1TnzBGJJdy0crHI8zTHTCEUV",
    "essentials":  process.env.STRIPE_PRICE_ESSENTIALS  || "price_1TnzBEJJdy0crHI8d1FLz9Et",
    "accelerator": process.env.STRIPE_PRICE_ACCELERATOR || "price_1TnzBFJJdy0crHI8yCluGftj",
    "empire":      process.env.STRIPE_PRICE_EMPIRE      || "price_1TnzBGJJdy0crHI8zTHTCEUV",
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
  if (key.startsWith("pk_")) return "STRIPE_SECRET_KEY is a publishable key (pk_…). Use the secret key (sk_…) instead.";
  if (!key.startsWith("sk_")) return `STRIPE_SECRET_KEY has an unexpected format: ${key.slice(0, 6)}…`;
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

  // 2 — Warn early if the Stripe key is live but we're using hardcoded test price IDs.
  //     This is the most common production misconfiguration: sk_live_... key + test price IDs.
  const keyMode = stripeKeyMode();
  const usingFallbackIds = !process.env.STRIPE_PRICE_ESSENTIALS;
  if (keyMode === "live" && usingFallbackIds) {
    req.log.error({ planName, keyMode }, "Enrollment: LIVE Stripe key but no STRIPE_PRICE_* env vars set — hardcoded test price IDs will be rejected by Stripe");
    res.status(503).json({
      error:
        "Stripe is configured in LIVE mode but the price IDs are hardcoded test fallbacks. " +
        "Go to your Stripe Dashboard (live mode) → Products and copy the Price IDs for each plan. " +
        "Then set these environment secrets: STRIPE_PRICE_ESSENTIALS, STRIPE_PRICE_ACCELERATOR, " +
        "STRIPE_PRICE_EMPIRE, STRIPE_PRICE_ESSENTIALS_SETUP, STRIPE_PRICE_ACCELERATOR_SETUP, " +
        "STRIPE_PRICE_EMPIRE_SETUP. Redeploy after setting them.",
    });
    return;
  }

  // 3 — Resolve the one-time Stripe price for this plan + payment type.
  //     We ignore whatever price ID the frontend sent and always look up by plan+type.
  const setupFeePrice = getCheckoutPrice(planName, payment_type);
  if (!setupFeePrice) {
    req.log.error({ planName, payment_type }, "Enrollment: checkout price ID not configured");
    const envHint = payment_type === "monthly"
      ? `STRIPE_PRICE_${planName.toUpperCase().replace(/\s+/g, "_")}_SETUP`
      : `STRIPE_PRICE_${planName.toUpperCase().replace(/\s+/g, "_")}`;
    res.status(400).json({ error: `Stripe price for "${planName}" (${payment_type || "subscription"}) is not configured. Set ${envHint} in environment secrets.` });
    return;
  }

  // 3 — Verify the setup fee price is actually one-time (not recurring) by querying Stripe.
  const stripe = new Stripe(stripeKey);
  let verifiedPriceId = setupFeePrice;
  let priceType = "unknown";

  try {
    const priceObj = await stripe.prices.retrieve(setupFeePrice);
    priceType = priceObj.type; // "one_time" or "recurring"

    req.log.info({
      selectedPlan: planName,
      resolvedPriceId: setupFeePrice,
      priceType,
      checkoutMode: "payment",
      frontendSentPriceId: stripe_price_id ?? "(none)",
      planTag,
      payment_type: payment_type ?? "(not sent)",
    }, "Enrollment: pre-checkout price verification");

    if (priceType === "recurring") {
      // The setup fee price in env/fallback is itself recurring — this is a misconfiguration.
      // Log a clear error and refuse to proceed with mode=payment.
      req.log.error({
        planName,
        priceId: setupFeePrice,
        priceType,
      }, "Enrollment: SETUP FEE PRICE IS RECURRING — checkout aborted");

      res.status(400).json({
        error: `Configuration error: the price ID "${setupFeePrice}" for "${planName} Setup Fee" is a recurring price. ` +
               `mode="payment" requires a one-time price. ` +
               `Go to Stripe Dashboard → Products → find the one-time Setup Fee for ${planName} → copy its Price ID and set it in STRIPE_PRICE_${planName.toUpperCase().replace(/\s+/g, "_")}_SETUP.`,
        priceId: setupFeePrice,
        priceType,
      });
      return;
    }
  } catch (priceErr: unknown) {
    const msg = priceErr instanceof Error ? priceErr.message : String(priceErr);
    req.log.error({ err: priceErr, setupFeePrice, planName }, "Enrollment: failed to retrieve price from Stripe for verification");
    res.status(502).json({ error: `Could not verify price ID "${setupFeePrice}" with Stripe: ${msg}` });
    return;
  }

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

      // Add safe logs only: email, GHL contact ID, tag being applied, success/error response
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

  // 4 — Create Stripe checkout session (always one-time payment for setup fee)
  try {
    req.log.info({
      email,
      planName,
      priceId: verifiedPriceId,
      priceType,
      mode: "payment",
    }, "Enrollment: creating Stripe checkout session");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: verifiedPriceId, quantity: 1 }],
      mode: "payment",
      customer_email: email,
      metadata: {
        firstName,
        lastName,
        email,
        phone: phoneVal,
        selectedPlan,
        planName,
        planTag,
        payment_type: payment_type || "one_time",
        price_id_used: verifiedPriceId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    req.log.info({ email, planName, sessionId: session.id, mode: "payment", priceId: verifiedPriceId }, "Enrollment: Stripe session created successfully");
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

    req.log.error({ err, planName, priceId: verifiedPriceId, stripeCode, stripeType }, "Enrollment: Stripe session creation failed");

    res.status(502).json({
      error: message,
      ...(stripeCode ? { code: stripeCode } : {}),
      ...(stripeType ? { type: stripeType } : {}),
    });
  }
});

export default router;
