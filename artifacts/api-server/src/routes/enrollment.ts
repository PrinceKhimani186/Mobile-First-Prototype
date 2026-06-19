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

// Map plan names → env var price IDs
const PLAN_PRICE_IDS: Record<string, string | undefined> = {
  "Essentials":             process.env.STRIPE_PRICE_ESSENTIALS,
  "Ownership Accelerator":  process.env.STRIPE_PRICE_ACCELERATOR,
  "Digital Asset Empire":   process.env.STRIPE_PRICE_EMPIRE,
};

// ── POST /api/enrollment/checkout ────────────────────────────────────────────
router.post("/enrollment/checkout", async (req: Request, res: Response) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const ghlApiKey = process.env.GHL_API_KEY;
  const ghlLocationId = process.env.GHL_LOCATION_ID;

  if (!stripeKey) {
    res.status(503).json({ error: "Stripe not configured" });
    return;
  }

  const {
    firstName, lastName, email, phone,
    planName, planTag,
    successUrl, cancelUrl,
  } = req.body as {
    firstName: string; lastName: string; email: string; phone: string;
    planName: string; planTag: string;
    successUrl: string; cancelUrl: string;
  };

  if (!firstName || !lastName || !email || !phone || !planName || !successUrl || !cancelUrl) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const priceId = PLAN_PRICE_IDS[planName];
  if (!priceId) {
    res.status(400).json({ error: `Stripe price ID not configured for plan: ${planName}` });
    return;
  }

  // 1 — Create / update GHL contact before checkout
  if (ghlApiKey && ghlLocationId) {
    try {
      const nameParts = [firstName, lastName].filter(Boolean);
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
      req.log.info({ email, plan: planName }, "Enrollment: GHL contact created/updated");
    } catch {
      req.log.warn({ email }, "Enrollment: GHL contact upsert failed (non-fatal)");
    }
  }

  // 2 — Create Stripe checkout session
  try {
    const stripe = new Stripe(stripeKey);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      customer_email: email,
      metadata: { firstName, lastName, email, phone, planName, planTag },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    req.log.info({ email, plan: planName, sessionId: session.id }, "Enrollment: Stripe session created");
    res.json({ url: session.url });
  } catch (err) {
    req.log.error({ err }, "Enrollment: Stripe session creation failed");
    res.status(502).json({ error: "Failed to create checkout session" });
  }
});

export default router;
