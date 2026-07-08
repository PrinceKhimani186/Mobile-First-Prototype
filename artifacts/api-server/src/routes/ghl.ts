import { Router, type IRouter } from "express";
import { db, projectsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

const GHL_BASE = "https://services.leadconnectorhq.com";

function ghlHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
  };
}

function toCustomFieldsArray(
  customFields: unknown,
): { key?: string; id?: string; field_value: string }[] {
  if (!customFields) return [];
  if (Array.isArray(customFields)) return customFields;
  return Object.entries(customFields as Record<string, string>).map(
    ([key, field_value]) => ({ key, field_value }),
  );
}

// Search-first dedup lookup — the reliable way to find an existing GHL contact
// by email. Reused pattern from auth.ts's checkGHLContact, but returns the
// contact id (not just a boolean) so the caller can update instead of create.
async function findGHLContactByEmail(
  email: string,
  locationId: string,
  apiKey: string,
): Promise<string | null> {
  try {
    const url = `${GHL_BASE}/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url, { headers: ghlHeaders(apiKey) });
    if (res.status !== 404 && res.status !== 200) return null;
    const data = (await res.json()) as { contact?: { id?: string } | null };
    return data?.contact?.id ?? null;
  } catch {
    return null;
  }
}

async function getContactTags(contactId: string, apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
      headers: ghlHeaders(apiKey),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { contact?: { tags?: string[] } };
    return data?.contact?.tags ?? [];
  } catch {
    return [];
  }
}

async function deleteTagsFromContact(contactId: string, tags: string[], apiKey: string): Promise<void> {
  if (!tags.length) return;
  await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
    method: "DELETE",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({ tags }),
  });
}

async function addTagsToContact(contactId: string, tags: string[], apiKey: string): Promise<void> {
  if (!tags.length) return;
  await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
    method: "POST",
    headers: ghlHeaders(apiKey),
    body: JSON.stringify({ tags }),
  });
}

async function replaceContactTags(contactId: string, newTags: string[], apiKey: string): Promise<void> {
  const existing = await getContactTags(contactId, apiKey);
  if (existing.length) await deleteTagsFromContact(contactId, existing, apiKey);
  if (newTags.length) await addTagsToContact(contactId, newTags, apiKey);
}

async function generateProjectId(): Promise<string> {
  const result = await db.select({ count: sql<number>`cast(count(*) as int)` }).from(projectsTable);
  const total = result[0]?.count ?? 0;
  return `AS-${String(total + 1).padStart(3, "0")}`;
}

// Upsert a project record whenever a GHL contact is created or updated.
async function upsertProject(opts: {
  email: string;
  customerName: string;
  phone: string;
  source: string;
  tags: string[];
  appName?: string;
  gameTemplate?: string;
  package?: string;
}) {
  if (!opts.email) return;

  const source = opts.tags.some(t => t.toLowerCase().includes("cold"))
    ? "Cold Calling"
    : opts.source || "Direct";

  try {
    const projectId = await generateProjectId();
    await db
      .insert(projectsTable)
      .values({
        projectId,
        customerName: opts.customerName,
        email: opts.email.toLowerCase(),
        phone: opts.phone,
        source,
        gameTemplate: opts.gameTemplate ?? "",
        appName: opts.appName ?? "",
        package: opts.package ?? "",
        currentStage: "Project Received",
        notes: "",
      })
      .onConflictDoUpdate({
        target: projectsTable.email,
        set: {
          customerName: opts.customerName || sql`projects.customer_name`,
          phone: opts.phone || sql`projects.phone`,
          source,
          ...(opts.appName ? { appName: opts.appName } : {}),
          ...(opts.gameTemplate ? { gameTemplate: opts.gameTemplate } : {}),
          ...(opts.package ? { package: opts.package } : {}),
          updatedAt: new Date(),
        },
      });
  } catch {
    // Non-fatal: GHL sync still succeeds even if DB upsert fails.
  }
}

router.post("/ghl/contact", async (req, res) => {
  const { firstName, lastName, email, phone, tags, customFields, source, appName, gameTemplate } =
    req.body as Record<string, unknown>;

  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    req.log.info("GHL credentials not configured — GHL proxy contact upsert skipped");
    res.json({ ok: true, skipped: true });
    return;
  }

  const customFieldsArray = toCustomFieldsArray(customFields);
  const newTags: string[] = Array.isArray(tags) ? tags : [];
  const emailStr = String(email ?? "").trim().toLowerCase();
  const customerName = [firstName, lastName].filter(Boolean).join(" ");

  if (!emailStr) {
    res.status(400).json({ error: "email is required" });
    return;
  }

  const createPayload = {
    locationId,
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    email: emailStr,
    phone: phone ?? "",
    ...(newTags.length ? { tags: newTags } : {}),
    ...(customFieldsArray.length ? { customFields: customFieldsArray } : {}),
  };

  const updatePayload = {
    firstName: firstName ?? "",
    lastName: lastName ?? "",
    email: emailStr,
    phone: phone ?? "",
    ...(customFieldsArray.length ? { customFields: customFieldsArray } : {}),
  };

  try {
    // Search first — this is the reliable dedup path. Relying on the create
    // call to fail with a "duplicate" error was fragile (GHL doesn't always
    // return meta.contactId on failure), which is what allowed duplicate
    // contacts to be created for the same email.
    const existingId = await findGHLContactByEmail(emailStr, locationId, apiKey);
    req.log.info({ email: emailStr, found: !!existingId, contactId: existingId }, "GHL: search result for contact by email");

    if (existingId) {
      req.log.info({ email: emailStr, contactId: existingId }, "GHL: existing contact found — updating instead of creating");

      const updateRes = await fetch(`${GHL_BASE}/contacts/${existingId}`, {
        method: "PUT",
        headers: ghlHeaders(apiKey),
        body: JSON.stringify(updatePayload),
      });

      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        req.log.warn({ status: updateRes.status, updateData, email: emailStr, contactId: existingId }, "GHL update error");
        res.status(updateRes.status).json({ error: "GHL update error", details: updateData });
        return;
      }

      if (newTags.length > 0) {
        await replaceContactTags(existingId, newTags, apiKey);
        req.log.info({ contactId: existingId, tags: newTags }, "GHL: tags replaced");
      } else {
        req.log.info({ contactId: existingId }, "GHL: no tags provided — existing tags preserved");
      }

      // Upsert project in DB
      await upsertProject({
        email: emailStr,
        customerName,
        phone: String(phone ?? ""),
        source: String(source ?? ""),
        tags: newTags,
        appName: appName ? String(appName) : undefined,
        gameTemplate: gameTemplate ? String(gameTemplate) : undefined,
      });

      req.log.info({ email: emailStr, contactId: existingId, action: "updated" }, "GHL: contact upsert complete");
      res.json({ ok: true, action: "updated", contactId: existingId, contact: updateData });
      return;
    }

    req.log.info({ email: emailStr }, "GHL: no existing contact — creating new one");

    const createRes = await fetch(`${GHL_BASE}/contacts/`, {
      method: "POST",
      headers: ghlHeaders(apiKey),
      body: JSON.stringify(createPayload),
    });

    const createData = (await createRes.json()) as {
      contact?: { id?: string };
      meta?: { contactId?: string };
      message?: string;
      statusCode?: number;
    };

    if (!createRes.ok) {
      // GHL can still race us and report a duplicate here (e.g. a concurrent
      // request created the contact between our search and this create call).
      // Fall back to the id it reports rather than surfacing an error.
      const raceId = createData?.meta?.contactId;
      if (raceId) {
        req.log.warn({ email: emailStr, contactId: raceId }, "GHL: create raced with an existing contact — updating instead");

        const updateRes = await fetch(`${GHL_BASE}/contacts/${raceId}`, {
          method: "PUT",
          headers: ghlHeaders(apiKey),
          body: JSON.stringify(updatePayload),
        });
        const updateData = await updateRes.json();

        if (newTags.length > 0) {
          await replaceContactTags(raceId, newTags, apiKey);
        }

        await upsertProject({
          email: emailStr,
          customerName,
          phone: String(phone ?? ""),
          source: String(source ?? ""),
          tags: newTags,
          appName: appName ? String(appName) : undefined,
          gameTemplate: gameTemplate ? String(gameTemplate) : undefined,
        });

        req.log.info({ email: emailStr, contactId: raceId, action: "updated" }, "GHL: contact upsert complete");
        res.json({ ok: true, action: "updated", contactId: raceId, contact: updateData });
        return;
      }

      req.log.warn({ status: createRes.status, createData, email: emailStr }, "GHL create error");
      res.status(createRes.status).json({ error: "GHL API error", details: createData });
      return;
    }

    const newContactId = createData?.contact?.id ?? createData?.meta?.contactId;
    req.log.info({ email: emailStr, contactId: newContactId }, "GHL: new contact created");

    // Upsert project in DB
    await upsertProject({
      email: emailStr,
      customerName,
      phone: String(phone ?? ""),
      source: String(source ?? ""),
      tags: newTags,
      appName: appName ? String(appName) : undefined,
      gameTemplate: gameTemplate ? String(gameTemplate) : undefined,
    });

    req.log.info({ email: emailStr, contactId: newContactId, action: "created" }, "GHL: contact upsert complete");
    res.json({ ok: true, action: "created", contactId: newContactId, contact: createData });
  } catch (err) {
    req.log.error({ err, email: emailStr }, "GHL proxy fetch failed");
    res.status(502).json({ error: "Failed to reach GHL API" });
  }
});

export default router;
