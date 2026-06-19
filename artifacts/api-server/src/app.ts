import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import Stripe from "stripe";
import router from "./routes";
import { logger } from "./lib/logger";

const GHL_BASE = "https://services.leadconnectorhq.com";

function ghlHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
  };
}

async function applyGHLPurchaseTag(email: string, planTag: string): Promise<void> {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!apiKey || !locationId) return;

  try {
    // 1 — Find contact by email
    const searchRes = await fetch(
      `${GHL_BASE}/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(email)}`,
      { headers: ghlHeaders(apiKey) }
    );
    const searchData = (await searchRes.json()) as { contact?: { id?: string } | null };
    const contactId = searchData?.contact?.id;

    if (!contactId) {
      logger.warn({ email }, "Stripe webhook: GHL contact not found — skipping tag");
      return;
    }

    // 2 — Add the purchased plan tag (POST adds, does not replace)
    await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
      method: "POST",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify({ tags: [planTag] }),
    });

    logger.info({ email, contactId, planTag }, "Stripe webhook: GHL purchase tag applied");
  } catch (err) {
    logger.error({ err, email }, "Stripe webhook: GHL tag application failed");
  }
}

const app: Express = express();

// ── Stripe webhook — MUST be registered BEFORE express.json() ────────────────
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!sig || !webhookSecret || !stripeKey) {
      res.status(400).json({ error: "Stripe webhook not configured" });
      return;
    }

    let event: Stripe.Event;
    try {
      const stripe = new Stripe(stripeKey);
      const rawSig = Array.isArray(sig) ? sig[0] : sig;
      event = stripe.webhooks.constructEvent(req.body as Buffer, rawSig, webhookSecret);
    } catch (err) {
      logger.warn({ err }, "Stripe webhook signature verification failed");
      res.status(400).json({ error: "Invalid webhook signature" });
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.metadata?.email ?? session.customer_email ?? "";
      const planTag = session.metadata?.planTag ?? "";
      const planName = session.metadata?.planName ?? "";

      logger.info({ email, planName, planTag }, "Stripe webhook: checkout.session.completed");

      if (email && planTag) {
        await applyGHLPurchaseTag(email, planTag);
      }
    }

    res.status(200).json({ received: true });
  }
);

// ── Standard middleware (after webhook route) ─────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  }),
);

app.use("/api", router);

export default app;
