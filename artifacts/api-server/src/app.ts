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

// Exact tag names as stored in GHL (all lowercase)
const PLAN_TAG_MAP: Record<string, string> = {
  essentials:  "purchased plan - essentials",
  accelerator: "purchased plan - ownership accelerator",
  empire:      "purchased plan - digital asset",
};

// All purchased-plan tags — used to strip old ones before applying the new one
const ALL_PLAN_TAGS = Object.values(PLAN_TAG_MAP);

async function handleGHLPostPayment(
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  selectedPlan: string,
): Promise<void> {
  const apiKey     = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  logger.info({ email, selectedPlan: `"${selectedPlan}"` }, "GHL: webhook received — selectedPlan value");

  if (!apiKey || !locationId) {
    logger.warn("GHL: GHL_API_KEY or GHL_LOCATION_ID not set — skipping");
    return;
  }

  // Exact equality check — selectedPlan must be one of: essentials | accelerator | empire
  const planTagName = PLAN_TAG_MAP[selectedPlan];
  if (!planTagName) {
    logger.warn({ selectedPlan, valid: Object.keys(PLAN_TAG_MAP) },
      "GHL: selectedPlan did not match any known key — tag not applied");
    return;
  }
  logger.info({ selectedPlan, planTagName }, "GHL: selected plan → tag resolved");

  try {
    // ── Step 1: find or create GHL contact, capture existing tags ─────────────
    const searchRes = await fetch(
      `${GHL_BASE}/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(email)}`,
      { headers: ghlHeaders(apiKey) },
    );
    const searchBody = await searchRes.text();

    let contactId: string | undefined;
    let existingTags: string[] = [];

    if (searchRes.ok) {
      const d = JSON.parse(searchBody) as { contact?: { id?: string; tags?: string[] } | null };
      contactId   = d?.contact?.id;
      existingTags = d?.contact?.tags ?? [];
    }

    logger.info({ email, contactId, existingTags }, "GHL: existing contact tags");

    if (contactId) {
      const updateRes = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
        method: "PUT",
        headers: ghlHeaders(apiKey),
        body: JSON.stringify({ firstName, lastName, phone }),
      });
      const updateBody = await updateRes.text();
      logger.info({ email, contactId, status: updateRes.status, body: updateBody }, "GHL: contact updated");
    } else {
      logger.info({ email }, "GHL: contact not found — creating");
      const createRes = await fetch(`${GHL_BASE}/contacts/`, {
        method: "POST",
        headers: ghlHeaders(apiKey),
        body: JSON.stringify({ locationId, firstName, lastName, email, phone }),
      });
      const createBody = await createRes.text();
      if (!createRes.ok) {
        logger.error({ email, status: createRes.status, body: createBody }, "GHL: contact creation failed");
        return;
      }
      const createData = JSON.parse(createBody) as { contact?: { id?: string; tags?: string[] } };
      contactId    = createData?.contact?.id;
      existingTags = createData?.contact?.tags ?? [];
      logger.info({ email, contactId }, "GHL: contact created");
    }

    if (!contactId) {
      logger.error({ email }, "GHL: no contactId available — tag not applied");
      return;
    }

    // ── Step 2: remove any old purchased-plan tags ─────────────────────────────
    const tagsToRemove = existingTags.filter(t => ALL_PLAN_TAGS.includes(t.toLowerCase()));
    logger.info({ contactId, existingTags, tagsToRemove }, "GHL: removing old purchased-plan tags");

    if (tagsToRemove.length > 0) {
      const delRes = await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
        method: "DELETE",
        headers: ghlHeaders(apiKey),
        body: JSON.stringify({ tags: tagsToRemove }),
      });
      const delBody = await delRes.text();
      logger.info(
        { contactId, tagsToRemove, status: delRes.status, body: delBody },
        delRes.ok ? "GHL: old plan tags removed" : "GHL: tag removal failed",
      );
    } else {
      logger.info({ contactId }, "GHL: no old purchased-plan tags to remove");
    }

    // ── Step 3: apply only the correct plan tag ────────────────────────────────
    logger.info({ contactId, planTagName }, "GHL: applying selected plan tag");
    const applyRes = await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
      method: "POST",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify({ tags: [planTagName] }),
    });
    const applyBody = await applyRes.text();
    logger.info(
      { email, contactId, planTagName, status: applyRes.status, body: applyBody },
      applyRes.ok ? "GHL: tag applied successfully" : "GHL: tag application failed",
    );

  } catch (err) {
    logger.error({ err, email }, "GHL: unexpected exception in handleGHLPostPayment");
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
