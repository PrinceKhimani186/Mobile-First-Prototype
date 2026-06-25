import { Router, type IRouter } from "express";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const router: IRouter = Router();

const GHL_BASE = "https://services.leadconnectorhq.com";

function ghlHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    Version: "2021-07-28",
    "Content-Type": "application/json",
  };
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    return createClient(url.trim(), key.trim(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch {
    return null;
  }
}

// Password hashing using Node built-in crypto — no extra packages needed
const SALT_LEN = 16;
const KEY_LEN  = 64;

function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_LEN).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LEN, (err, key) => {
      if (err) reject(err);
      else resolve(`${salt}:${key.toString("hex")}`);
    });
  });
}

function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return Promise.resolve(false);
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, KEY_LEN, (err, key) => {
      if (err) reject(err);
      else {
        try {
          resolve(crypto.timingSafeEqual(Buffer.from(hash, "hex"), key));
        } catch {
          resolve(false);
        }
      }
    });
  });
}

async function checkGHLContact(email: string, apiKey: string, locationId: string): Promise<boolean> {
  try {
    const url = `${GHL_BASE}/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(email)}`;
    const res = await fetch(url, { headers: ghlHeaders(apiKey) });
    if (res.status === 404 || res.status === 200) {
      const data = (await res.json()) as { contact?: { id?: string } | null };
      return !!data?.contact?.id;
    }
    return false;
  } catch {
    return false;
  }
}

// ── POST /api/auth/save-password ──────────────────────────────────────────────
// Called from the set-password page. Hashes the password and upserts the
// customer's credentials into app_users in Supabase.
router.post("/auth/save-password", async (req, res) => {
  const { email, password, fullName } = req.body as {
    email?: string;
    password?: string;
    fullName?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const supabase = getSupabase();
  if (!supabase) {
    req.log.warn("Supabase not configured — save-password skipped");
    res.json({ ok: true, skipped: true });
    return;
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const password_hash = await hashPassword(password);

    const { error } = await supabase.from("app_users").upsert(
      {
        email: normalizedEmail,
        password_hash,
        full_name: fullName?.trim() ?? null,
        role: "customer",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );

    if (error) {
      req.log.error({ err: error }, "Supabase save-password error");
      res.status(500).json({ error: "Failed to save credentials" });
      return;
    }

    req.log.info({ email: normalizedEmail }, "Auth: password saved to Supabase");
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Auth: save-password unexpected error");
    res.status(500).json({ error: "Internal error" });
  }
});

// ── POST /api/auth/verify-login ───────────────────────────────────────────────
// Called from the login page. Looks up the email in app_users and verifies
// the password hash. Returns { ok: true, role } on success.
router.post("/auth/verify-login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const supabase = getSupabase();
  if (!supabase) {
    req.log.warn("Supabase not configured — verify-login skipped");
    res.json({ ok: false, skipped: true });
    return;
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();

    const { data, error } = await supabase
      .from("app_users")
      .select("password_hash, role, full_name")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      req.log.error({ err: error }, "Supabase verify-login query error");
      res.status(500).json({ ok: false, error: "Database error" });
      return;
    }

    if (!data) {
      req.log.info({ email: normalizedEmail }, "Auth: user not found in Supabase");
      res.json({ ok: false, reason: "not_found" });
      return;
    }

    const valid = await verifyPassword(password, data.password_hash);
    if (!valid) {
      req.log.info({ email: normalizedEmail }, "Auth: wrong password");
      res.json({ ok: false, reason: "wrong_password" });
      return;
    }

    req.log.info({ email: normalizedEmail }, "Auth: Supabase login verified");
    res.json({ ok: true, role: data.role as string, fullName: data.full_name as string | null });
  } catch (err) {
    req.log.error({ err }, "Auth: verify-login unexpected error");
    res.status(500).json({ ok: false, error: "Internal error" });
  }
});

// ── POST /api/auth/check-ghl ──────────────────────────────────────────────────
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
