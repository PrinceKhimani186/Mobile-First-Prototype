import { Router, type IRouter } from "express";

const router: IRouter = Router();

const GHL_BASE = "https://services.leadconnectorhq.com";

function ghlHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
  };
}

async function checkGHLContact(email: string, apiKey: string, locationId: string): Promise<boolean> {
  try {
    const url = `${GHL_BASE}/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url, { headers: ghlHeaders(apiKey) });

    if (res.status === 404 || res.status === 200) {
      const data = (await res.json()) as { contact?: { id?: string } | null };
      const found = !!data?.contact?.id;
      return found;
    }

    if (!res.ok) {
      return false;
    }

    return false;
  } catch {
    return false;
  }
}

router.post("/auth/check-ghl", async (req, res) => {
  const { email } = req.body as { email?: string };

  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "email is required" });
    return;
  }

  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    req.log.error("GHL credentials not configured — blocking login");
    res.status(503).json({ error: "GHL not configured", exists: false });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  req.log.info({ email: normalizedEmail }, "Auth: GHL contact check — login attempt");

  const exists = await checkGHLContact(normalizedEmail, apiKey, locationId);

  if (exists) {
    req.log.info({ email: normalizedEmail }, "Auth: GHL contact found — login permitted");
  } else {
    req.log.warn({ email: normalizedEmail }, "Auth: GHL contact NOT found — login blocked");
  }

  res.json({ exists });
});

export default router;
