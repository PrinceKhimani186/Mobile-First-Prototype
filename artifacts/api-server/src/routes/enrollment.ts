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

// Read price IDs at request time so env changes after startup are picked up.
function getPriceId(planName: string): string | undefined {
  const map: Record<string, string | undefined> = {
    "Essentials":            process.env.STRIPE_PRICE_ESSENTIALS,
    "Ownership Accelerator": process.env.STRIPE_PRICE_ACCELERATOR,
    "Digital Asset Empire":  process.env.STRIPE_PRICE_EMPIRE,
  };
  return map[planName];
}

function stripeConfigError(): string | null {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  if (!key) return "STRIPE_SECRET_KEY is not set";
  if (key.startsWith("pk_")) return "STRIPE_SECRET_KEY is a publishable key (pk_…). Use the secret key (sk_…) instead.";
  if (!key.startsWith("sk_")) return `STRIPE_SECRET_KEY has an unexpected format: ${key.slice(0, 6)}…`;
  return null;
}

function priceIdError(planName: string): string | null {
  const id = getPriceId(planName) ?? "";
  if (!id) return `STRIPE_PRICE_${planName.toUpperCase().replace(/\s+/g, "_")} is not set`;
  if (id.startsWith("prod_")) return `Price ID for "${planName}" looks like a Product ID (prod_…). Set it to the Price ID (price_…) from the product's pricing tab.`;
  if (!id.startsWith("price_")) return `Price ID for "${planName}" has an unexpected format: ${id.slice(0, 8)}…`;
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
  } = req.body as {
    firstName: string; lastName: string; email: string; phone: string;
    selectedPlan: string; planName: string; planTag: string;
    successUrl: string; cancelUrl: string;
  };

  if (!firstName || !lastName || !email || !phone || !planName || !successUrl || !cancelUrl) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  // 2 — Validate price ID format
  const priceErr = priceIdError(planName);
  if (priceErr) {
    req.log.error({ planName, priceErr }, "Enrollment: price ID config error");
    res.status(400).json({ error: priceErr });
    return;
  }

  const priceId = getPriceId(planName)!;
  const stripeKey = process.env.STRIPE_SECRET_KEY!;
  const ghlApiKey = process.env.GHL_API_KEY;
  const ghlLocationId = process.env.GHL_LOCATION_ID;

  req.log.info({ email, planName, priceId: priceId.slice(0, 14) + "…" }, "Enrollment: starting checkout");

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
          phone,
          tags: ["enrollment-started"],
        }),
      });
      req.log.info({ email }, "Enrollment: GHL contact created/updated");
    } catch (ghlErr) {
      req.log.warn({ ghlErr }, "Enrollment: GHL contact upsert failed (non-fatal)");
    }
  }

  // 4 — Create Stripe checkout session
  try {
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      customer_email: email,
      metadata: { firstName, lastName, email, phone, selectedPlan, planName, planTag },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    req.log.info({ email, planName, sessionId: session.id }, "Enrollment: Stripe session created successfully");
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

    req.log.error({ err, planName, priceId, stripeCode, stripeType }, "Enrollment: Stripe session creation failed");

    res.status(502).json({
      error: message,
      ...(stripeCode ? { code: stripeCode } : {}),
      ...(stripeType ? { type: stripeType } : {}),
    });
  }
});

export default router;
