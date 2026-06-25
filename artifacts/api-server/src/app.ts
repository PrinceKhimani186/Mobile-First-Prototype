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

// ── GET /api/stripe/webhook — reachability probe ──────────────────────────────
// Lets you verify the URL is publicly accessible before registering in Stripe.
app.get("/api/stripe/webhook", (_req, res) => {
  res.json({
    status: "reachable",
    endpoint: "POST /api/stripe/webhook",
    webhookSecretSet: !!process.env.STRIPE_WEBHOOK_SECRET,
    webhookSecretPrefix: (process.env.STRIPE_WEBHOOK_SECRET ?? "").slice(0, 10) + "…",
    stripeKeyPrefix: (process.env.STRIPE_SECRET_KEY ?? "").slice(0, 12) + "…",
  });
});

// ── POST /api/stripe/webhook — MUST be registered BEFORE express.json() ───────
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    logger.info("WEBHOOK RECEIVED — POST /api/stripe/webhook hit");

    const sig           = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripeKey     = process.env.STRIPE_SECRET_KEY;

    logger.info({
      hasSig:           !!sig,
      hasWebhookSecret: !!webhookSecret,
      webhookSecretPrefix: (webhookSecret ?? "").slice(0, 10) + "…",
      hasStripeKey:     !!stripeKey,
      stripeKeyPrefix:  (stripeKey ?? "").slice(0, 12) + "…",
      bodyLength:       (req.body as Buffer).length,
    }, "WEBHOOK CONFIG CHECK");

    if (!sig || !webhookSecret || !stripeKey) {
      logger.error({ hasSig: !!sig, hasWebhookSecret: !!webhookSecret, hasStripeKey: !!stripeKey },
        "WEBHOOK ABORTED — missing sig, secret, or key");
      res.status(400).json({ error: "Stripe webhook not configured" });
      return;
    }

    let event: Stripe.Event;
    try {
      const stripe  = new Stripe(stripeKey);
      const rawSig  = Array.isArray(sig) ? sig[0] : sig;
      event = stripe.webhooks.constructEvent(req.body as Buffer, rawSig, webhookSecret);
      logger.info({ eventType: event.type, eventId: event.id }, "WEBHOOK SIGNATURE VERIFIED");
    } catch (err) {
      logger.error({ err }, "WEBHOOK SIGNATURE FAILED — check STRIPE_WEBHOOK_SECRET matches the endpoint in Stripe Dashboard");
      res.status(400).json({ error: "Webhook signature verification failed" });
      return;
    }

    logger.info({ eventType: event.type }, `WEBHOOK EVENT TYPE: ${event.type}`);

    if (event.type !== "checkout.session.completed") {
      logger.info({ eventType: event.type }, "checkout.session.completed event not received — ignoring this event type");
      res.status(200).json({ received: true, processed: false, reason: "event type not handled" });
      return;
    }

    // ── checkout.session.completed ────────────────────────────────────────────
    const session       = event.data.object as Stripe.Checkout.Session;
    const paymentStatus = session.payment_status;
    const sessionId     = session.id;

    // Use customer_details.email as primary (most reliable), fall back to metadata
    const email        = session.customer_details?.email
                      ?? session.metadata?.email
                      ?? session.customer_email
                      ?? "";
    const firstName    = session.metadata?.firstName    ?? "";
    const lastName     = session.metadata?.lastName     ?? "";
    const phone        = session.metadata?.phone        ?? "";
    const selectedPlan = session.metadata?.selectedPlan ?? "";
    const priceId      = (session as unknown as Record<string, unknown>)["line_items"]
                        ? "see line_items"
                        : session.metadata?.planName ?? "unknown";

    logger.info(`PAYMENT STATUS: ${paymentStatus}`);
    logger.info(`SESSION ID: ${sessionId}`);
    logger.info(`EMAIL: ${email}`);
    logger.info(`SELECTED PLAN: ${selectedPlan}`);
    logger.info(`PRICE / PLAN NAME: ${priceId}`);
    logger.info({
      sessionId, paymentStatus, email, selectedPlan,
      metadataKeys: Object.keys(session.metadata ?? {}),
      rawMetadata: session.metadata,
    }, "WEBHOOK FULL SESSION METADATA");

    if (paymentStatus !== "paid") {
      logger.warn({ paymentStatus, sessionId }, `WEBHOOK SKIPPED — payment_status is "${paymentStatus}", expected "paid"`);
      res.status(200).json({ received: true, processed: false, reason: `payment_status=${paymentStatus}` });
      return;
    }

    if (!email) {
      logger.error({ sessionId, metadata: session.metadata }, "WEBHOOK ERROR — no email found in session");
      res.status(200).json({ received: true, processed: false, reason: "no email" });
      return;
    }

    if (!selectedPlan) {
      logger.error({ sessionId, metadata: session.metadata }, "WEBHOOK ERROR — metadata.selectedPlan is empty; was it passed when creating the checkout session?");
      res.status(200).json({ received: true, processed: false, reason: "no selectedPlan in metadata" });
      return;
    }

    await handleGHLPostPayment(email, firstName, lastName, phone, selectedPlan);

    res.status(200).json({ received: true, processed: true });
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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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
