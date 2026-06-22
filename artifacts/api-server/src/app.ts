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

// Tag names must match exactly as stored in GHL (all lowercase)
const PLAN_TAG_MAP: Record<string, string> = {
  essentials:  "purchased plan - essentials",
  accelerator: "purchased plan - ownership accelerator",
  empire:      "purchased plan - digital asset",
};

type GhlTag = { id: string; name: string };

// Fetch all tags defined in the GHL location
async function fetchLocationTags(apiKey: string, locationId: string): Promise<GhlTag[]> {
  const res = await fetch(`${GHL_BASE}/locations/${locationId}/tags`, {
    headers: ghlHeaders(apiKey),
  });
  const body = await res.text();
  logger.info({ status: res.status, body }, "GHL: location tags fetched");
  if (!res.ok) return [];
  try {
    const data = JSON.parse(body) as { tags?: GhlTag[] };
    return data.tags ?? [];
  } catch {
    return [];
  }
}

// Create a tag in the GHL location; returns the new tag or null on failure
async function createLocationTag(apiKey: string, locationId: string, name: string): Promise<GhlTag | null> {
  const res = await fetch(`${GHL_BASE}/locations/${locationId}/tags`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({ name }),
  });
  const body = await res.text();
  logger.info({ status: res.status, body, name }, "GHL: tag creation response");
  if (!res.ok) return null;
  try {
    const data = JSON.parse(body) as { tag?: GhlTag };
    return data.tag ?? null;
  } catch {
    return null;
  }
}

async function handleGHLPostPayment(
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  selectedPlan: string,
): Promise<void> {
  const apiKey     = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  logger.info({ email, selectedPlan }, "GHL: handleGHLPostPayment started");

  if (!apiKey || !locationId) {
    logger.warn("GHL: GHL_API_KEY or GHL_LOCATION_ID not set — skipping");
    return;
  }

  const planTagName = PLAN_TAG_MAP[selectedPlan];
  if (!planTagName) {
    logger.warn({ selectedPlan, available: Object.keys(PLAN_TAG_MAP) },
      "GHL: unknown selectedPlan — cannot map to tag");
    return;
  }
  logger.info({ selectedPlan, planTagName }, "GHL: plan → tag name resolved");

  try {
    // ── Step 1: find or create GHL contact ────────────────────────────────────
    const searchRes = await fetch(
      `${GHL_BASE}/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(email)}`,
      { headers: ghlHeaders(apiKey) },
    );
    const searchBody = await searchRes.text();
    logger.info({ email, status: searchRes.status, body: searchBody }, "GHL: contact search response");

    let contactId: string | undefined;

    if (searchRes.ok) {
      const searchData = JSON.parse(searchBody) as { contact?: { id?: string } | null };
      contactId = searchData?.contact?.id;
    }

    if (contactId) {
      logger.info({ email, contactId }, "GHL: existing contact found — updating");
      const updateRes = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
        method: "PUT",
        headers: ghlHeaders(apiKey),
        body: JSON.stringify({ firstName, lastName, phone }),
      });
      const updateBody = await updateRes.text();
      logger.info({ email, contactId, status: updateRes.status, body: updateBody }, "GHL: contact update response");
    } else {
      logger.info({ email }, "GHL: contact not found — creating");
      const createRes = await fetch(`${GHL_BASE}/contacts/`, {
        method: "POST",
        headers: ghlHeaders(apiKey),
        body: JSON.stringify({ locationId, firstName, lastName, email, phone }),
      });
      const createBody = await createRes.text();
      logger.info({ email, status: createRes.status, body: createBody }, "GHL: contact create response");

      if (!createRes.ok) {
        logger.error({ email, status: createRes.status, body: createBody }, "GHL: contact creation failed — tag not applied");
        return;
      }
      const createData = JSON.parse(createBody) as { contact?: { id?: string } };
      contactId = createData?.contact?.id;
    }

    if (!contactId) {
      logger.error({ email }, "GHL: could not obtain contactId — tag not applied");
      return;
    }
    logger.info({ email, contactId }, "GHL: contact ID confirmed");

    // ── Step 2: fetch all location tags and find ours ─────────────────────────
    const allTags = await fetchLocationTags(apiKey, locationId);
    logger.info({ count: allTags.length, names: allTags.map(t => t.name) }, "GHL: all location tags");

    let targetTag = allTags.find(t => t.name.toLowerCase() === planTagName.toLowerCase());
    logger.info({ planTagName, found: !!targetTag, tagId: targetTag?.id }, "GHL: tag search result");

    // ── Step 3: create tag in location if it does not exist ───────────────────
    if (!targetTag) {
      logger.info({ planTagName }, "GHL: tag not found — creating in location");
      targetTag = (await createLocationTag(apiKey, locationId, planTagName)) ?? undefined;
      if (!targetTag) {
        logger.warn({ planTagName }, "GHL: tag creation returned null — will attempt apply by name anyway");
      } else {
        logger.info({ planTagName, tagId: targetTag.id }, "GHL: tag created in location");
      }
    }

    // ── Step 4: apply tag to contact ──────────────────────────────────────────
    logger.info({ contactId, planTagName }, "GHL: applying tag to contact");
    const tagRes = await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
      method: "POST",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify({ tags: [planTagName] }),
    });
    const tagBody = await tagRes.text();
    logger.info(
      { email, contactId, planTagName, status: tagRes.status, body: tagBody },
      tagRes.ok ? "GHL: tag applied successfully" : "GHL: tag application failed",
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
