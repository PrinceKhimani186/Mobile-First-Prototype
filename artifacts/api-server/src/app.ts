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

const PLAN_TAG_MAP: Record<string, string> = {
  essentials:  "Purchased Plan - Essentials",
  accelerator: "Purchased Plan - Ownership Accelerator",
  empire:      "Purchased Plan - Digital Asset Empire",
};

async function handleGHLPostPayment(
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  selectedPlan: string,
): Promise<void> {
  const apiKey    = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    logger.warn("Stripe webhook: GHL_API_KEY or GHL_LOCATION_ID not set — skipping GHL");
    return;
  }

  const planTag = PLAN_TAG_MAP[selectedPlan];
  if (!planTag) {
    logger.warn({ selectedPlan }, "Stripe webhook: unknown selectedPlan value — cannot map to GHL tag");
    return;
  }

  try {
    // 1 — Check if contact already exists by email
    const searchRes = await fetch(
      `${GHL_BASE}/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(email)}`,
      { headers: ghlHeaders(apiKey) },
    );

    if (!searchRes.ok) {
      const body = await searchRes.text();
      logger.error({ email, status: searchRes.status, body }, "Stripe webhook: GHL contact search failed");
      return;
    }

    const searchData = (await searchRes.json()) as { contact?: { id?: string } | null };
    let contactId = searchData?.contact?.id;

    if (contactId) {
      // 2a — Update existing contact
      const updateRes = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
        method: "PUT",
        headers: ghlHeaders(apiKey),
        body: JSON.stringify({ firstName, lastName, phone }),
      });

      if (!updateRes.ok) {
        const body = await updateRes.text();
        logger.error({ email, contactId, status: updateRes.status, body }, "Stripe webhook: GHL contact update failed");
      } else {
        logger.info({ email, contactId }, "Stripe webhook: GHL contact updated");
      }
    } else {
      // 2b — Create new contact
      const createRes = await fetch(`${GHL_BASE}/contacts/`, {
        method: "POST",
        headers: ghlHeaders(apiKey),
        body: JSON.stringify({ locationId, firstName, lastName, email, phone }),
      });

      if (!createRes.ok) {
        const body = await createRes.text();
        logger.error({ email, status: createRes.status, body }, "Stripe webhook: GHL contact creation failed");
        return;
      }

      const createData = (await createRes.json()) as { contact?: { id?: string } };
      contactId = createData?.contact?.id;
      logger.info({ email, contactId }, "Stripe webhook: GHL contact created");
    }

    if (!contactId) {
      logger.error({ email }, "Stripe webhook: no GHL contact ID available — tag not applied");
      return;
    }

    // 3 — Apply the correct plan tag
    const tagRes = await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
      method: "POST",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify({ tags: [planTag] }),
    });

    if (!tagRes.ok) {
      const body = await tagRes.text();
      logger.error({ email, contactId, planTag, status: tagRes.status, body }, "Stripe webhook: GHL tag application failed");
    } else {
      logger.info({ email, contactId, planTag }, "Stripe webhook: GHL tag applied successfully");
    }

  } catch (err) {
    logger.error({ err, email }, "Stripe webhook: GHL API error — unexpected exception");
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
      const email        = session.metadata?.email        ?? session.customer_email ?? "";
      const firstName    = session.metadata?.firstName    ?? "";
      const lastName     = session.metadata?.lastName     ?? "";
      const phone        = session.metadata?.phone        ?? "";
      const selectedPlan = session.metadata?.selectedPlan ?? "";
      const planName     = session.metadata?.planName     ?? "";

      logger.info(
        { event: "payment_successful", email, selectedPlan, planName, sessionId: session.id },
        "Stripe webhook: payment successful",
      );

      if (email && selectedPlan) {
        await handleGHLPostPayment(email, firstName, lastName, phone, selectedPlan);
      } else {
        logger.warn(
          { email, selectedPlan },
          "Stripe webhook: missing email or selectedPlan in session metadata — GHL skipped",
        );
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
