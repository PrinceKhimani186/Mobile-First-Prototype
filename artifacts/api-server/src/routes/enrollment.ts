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

// ── One-time Setup Fee price IDs (used for ALL checkout sessions) ─────────────
// These must point to one-time (not recurring) prices in your Stripe dashboard.
// Checks both naming conventions:
//   STRIPE_PRICE_ESSENTIALS_SETUP  (legacy / Antigravity)
//   STRIPE_PRICE_ESSENTIALS        (Replit secrets panel naming)
// If neither env var is set the hardcoded fallback is used (works only for the
// Stripe account where those prices were originally created).
function getSetupFeePrice(planName: string): string | undefined {
  const essentialsPrice =
    process.env.STRIPE_PRICE_ESSENTIALS_SETUP ||
    process.env.STRIPE_PRICE_ESSENTIALS ||
    "price_1TnzBLJJdy0crHI8FHNhiOtw";
  const acceleratorPrice =
    process.env.STRIPE_PRICE_ACCELERATOR_SETUP ||
    process.env.STRIPE_PRICE_ACCELERATOR ||
    "price_1TnzBMJJdy0crHI8LawdE6HC";
  const empirePrice =
    process.env.STRIPE_PRICE_EMPIRE_SETUP ||
    process.env.STRIPE_PRICE_EMPIRE ||
    "price_1TnzBNJJdy0crHI8H5W2kR9L";

  // Maps every name variant the frontend might send to its price ID.
  // Frontend sends full names ("App Launch Essentials"), legacy code used short
  // names ("Essentials") — both are handled here.
  const map: Record<string, string | undefined> = {
    // Full names (current frontend)
    "App Launch Essentials":    essentialsPrice,
    "App Ownership Accelerator": acceleratorPrice,
    "Digital Asset Empire":     empirePrice,
    // Short names (legacy / future-proofing)
    "Essentials":            essentialsPrice,
    "Ownership Accelerator": acceleratorPrice,
    // Lowercase IDs (plan.id values)
    "essentials":   essentialsPrice,
    "accelerator":  acceleratorPrice,
    "empire":       empirePrice,
  };
  return map[planName];
}

// Kept for backward-compat (used by priceIdError only).
function getPriceId(planName: string): string | undefined {
  return getSetupFeePrice(planName);
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

  // 2 — Always resolve to the one-time Setup Fee price for this plan.
  //     We ignore whatever price ID the frontend sent (it may point to a recurring price)
  //     and always use the Setup Fee price from env/hardcoded fallback.
  const setupFeePrice = getSetupFeePrice(planName);
  if (!setupFeePrice) {
    req.log.error({ planName }, "Enrollment: setup fee price ID not configured");
    res.status(400).json({ error: `Setup fee price for "${planName}" is not configured on the server.` });
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

    req.log.error({ err, planName, resolvedPriceId, stripeCode, stripeType }, "Enrollment: Stripe session creation failed");

    res.status(502).json({
      error: message,
      ...(stripeCode ? { code: stripeCode } : {}),
      ...(stripeType ? { type: stripeType } : {}),
    });
  }
});

export default router;
