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
// Env vars follow the pattern STRIPE_PRICE_{PLAN}_{TYPE}
// All five packages: starter, essentials, accelerator, growth, empire
function getCheckoutPrice(planName: string, paymentType?: string): string | undefined {
  const isMonthly = paymentType === "monthly";

  // Setup fee (one-time) prices for monthly plans
  const setup: Record<string, string | undefined> = {
    // By full display name
    "Starter Launch Package":    process.env.STRIPE_PRICE_STARTER_SETUP    || "price_1Tq7OdJJdy0crHI8IRjnyxfq",
    "App Launch Essentials":     process.env.STRIPE_PRICE_ESSENTIALS_SETUP  || "price_1TnzBLJJdy0crHI8FHNhiOtw",
    "App Ownership Accelerator": process.env.STRIPE_PRICE_ACCELERATOR_SETUP || "price_1TnzBMJJdy0crHI8LawdE6HC",
    "Growth Launch Package":     process.env.STRIPE_PRICE_GROWTH_SETUP      || "price_1Tq7OfJJdy0crHI8asymn3rv",
    "App Empire Package":        process.env.STRIPE_PRICE_EMPIRE_SETUP      || "price_1Tq7OgJJdy0crHI8Pnq5oyrv",
    // By plan ID
    "starter":     process.env.STRIPE_PRICE_STARTER_SETUP    || "price_1Tq7OdJJdy0crHI8IRjnyxfq",
    "essentials":  process.env.STRIPE_PRICE_ESSENTIALS_SETUP  || "price_1TnzBLJJdy0crHI8FHNhiOtw",
    "accelerator": process.env.STRIPE_PRICE_ACCELERATOR_SETUP || "price_1TnzBMJJdy0crHI8LawdE6HC",
    "growth":      process.env.STRIPE_PRICE_GROWTH_SETUP      || "price_1Tq7OfJJdy0crHI8asymn3rv",
    "empire":      process.env.STRIPE_PRICE_EMPIRE_SETUP      || "price_1Tq7OgJJdy0crHI8Pnq5oyrv",
    // Legacy names
    "Essentials":            process.env.STRIPE_PRICE_ESSENTIALS_SETUP  || "price_1TnzBLJJdy0crHI8FHNhiOtw",
    "Ownership Accelerator": process.env.STRIPE_PRICE_ACCELERATOR_SETUP || "price_1TnzBMJJdy0crHI8LawdE6HC",
    "Digital Asset Empire":  process.env.STRIPE_PRICE_EMPIRE_SETUP      || "price_1Tq7OgJJdy0crHI8Pnq5oyrv",
  };

  // Paid-in-full (one-time) prices
  const full: Record<string, string | undefined> = {
    "Starter Launch Package":    process.env.STRIPE_PRICE_STARTER    || "price_1Tq7OcJJdy0crHI8UPHFOPWn",
    "App Launch Essentials":     process.env.STRIPE_PRICE_ESSENTIALS  || "price_1TnzBEJJdy0crHI8d1FLz9Et",
    "App Ownership Accelerator": process.env.STRIPE_PRICE_ACCELERATOR || "price_1TnzBFJJdy0crHI8yCluGftj",
    "Growth Launch Package":     process.env.STRIPE_PRICE_GROWTH      || "price_1Tq7OfJJdy0crHI8nMT7K4KI",
    "App Empire Package":        process.env.STRIPE_PRICE_EMPIRE      || "price_1TnzBGJJdy0crHI8zTHTCEUV",
    "starter":     process.env.STRIPE_PRICE_STARTER    || "price_1Tq7OcJJdy0crHI8UPHFOPWn",
    "essentials":  process.env.STRIPE_PRICE_ESSENTIALS  || "price_1TnzBEJJdy0crHI8d1FLz9Et",
    "accelerator": process.env.STRIPE_PRICE_ACCELERATOR || "price_1TnzBFJJdy0crHI8yCluGftj",
    "growth":      process.env.STRIPE_PRICE_GROWTH      || "price_1Tq7OfJJdy0crHI8nMT7K4KI",
    "empire":      process.env.STRIPE_PRICE_EMPIRE      || "price_1TnzBGJJdy0crHI8zTHTCEUV",
    "Essentials":            process.env.STRIPE_PRICE_ESSENTIALS  || "price_1TnzBEJJdy0crHI8d1FLz9Et",
    "Ownership Accelerator": process.env.STRIPE_PRICE_ACCELERATOR || "price_1TnzBFJJdy0crHI8yCluGftj",
    "Digital Asset Empire":  process.env.STRIPE_PRICE_EMPIRE      || "price_1TnzBGJJdy0crHI8zTHTCEUV",
  };

  if (isMonthly) return setup[planName];
  // For subscription (paid-in-full): prefer full price, fall back to setup price for backward compat
  return full[planName] ?? setup[planName];
}

// Kept for backward-compat
function getSetupFeePrice(planName: string): string | undefined {
  return getCheckoutPrice(planName, "monthly");
}

function stripeConfigError(): string | null {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (!key) return "STRIPE_SECRET_KEY is not set";
  if (key.startsWith("pk_")) return "STRIPE_SECRET_KEY is a publishable key (pk_…). Use the secret key (sk_…) instead.";
  if (!key.startsWith("sk_")) return `STRIPE_SECRET_KEY has an unexpected format: ${key.slice(0, 6)}…`;
  return null;
}

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

  // 2 — Resolve the one-time Stripe price for this plan + payment type.
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
      await fetch(`${GHL_BASE}/contacts/`, {
        method: "POST",
        headers: ghlHeaders(ghlApiKey),
        body: JSON.stringify({
          locationId: ghlLocationId,
          firstName,
          lastName,
          email,
          phone: phoneVal,
          tags: ["enrollment-started"],
        }),
      });
      req.log.info({ email }, "Enrollment: GHL contact created/updated");
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
