import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/ghl/contact", async (req, res) => {
  const { firstName, lastName, email, phone, tags, customFields } = req.body;

  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    req.log.error("GHL credentials not configured");
    res.status(500).json({ error: "GHL credentials not configured" });
    return;
  }

  // GHL requires customFields as an array: [{ key, field_value }]
  // Our crm.ts sends it as a plain object for convenience — convert here.
  const customFieldsArray = customFields && !Array.isArray(customFields)
    ? Object.entries(customFields as Record<string, string>).map(([key, field_value]) => ({ key, field_value }))
    : (customFields ?? []);

  try {
    const ghlRes = await fetch("https://services.leadconnectorhq.com/contacts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locationId,
        firstName: firstName ?? "",
        lastName: lastName ?? "",
        email: email ?? "",
        phone: phone ?? "",
        ...(tags?.length ? { tags } : {}),
        ...(customFieldsArray.length ? { customFields: customFieldsArray } : {}),
      }),
    });

    const data = await ghlRes.json();

    if (!ghlRes.ok) {
      req.log.warn({ status: ghlRes.status, data }, "GHL API error");
      res.status(ghlRes.status).json({ error: "GHL API error", details: data });
      return;
    }

    res.json({ ok: true, contact: data });
  } catch (err) {
    req.log.error({ err }, "GHL proxy fetch failed");
    res.status(502).json({ error: "Failed to reach GHL API" });
  }
});

export default router;
