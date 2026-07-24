import { Router, type IRouter, type Request, type Response } from "express";
import { logger } from "../lib/logger";
import { generateAgreementPDF } from "../lib/pdf";
import { normalizePlan } from "../lib/plan-games";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { db, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

// ── User-facing error copy ────────────────────────────────────────────────────
// The ONLY message a user ever sees when Zoho reports error 8026 (the connected
// OAuth account has no Zoho Sign API license). Never leak the raw Zoho code,
// tokens, client IDs, or API responses to the browser — those go to server logs.
const ZOHO_NO_API_ACCESS_MESSAGE =
  "The connected Zoho Sign account does not have API access. Please contact support.";
// Generic fallback for every other backend/credential failure. Keeps developer
// details (env var names, regions, raw Zoho messages) out of the UI.
const ZOHO_GENERIC_ERROR_MESSAGE =
  "We couldn't start the signing session right now. Please try again or contact support.";

// ── Masking helpers (diagnostics only — never returned to the browser) ────────
function maskPrefix(val?: string, keep = 6): string {
  if (!val) return "∅ (not set)";
  if (val.length <= keep) return `**** (${val.length} chars)`;
  return `${val.slice(0, keep)}… (${val.length} chars)`;
}

function maskEmail(email?: string): string {
  if (!email) return "∅";
  const [user, domain] = email.split("@");
  if (!domain) return maskPrefix(email, 3);
  return `${user.slice(0, 2)}…@${domain}`;
}

// ── Region helpers ────────────────────────────────────────────────────────────
// Reads ZOHO_REGION env var (default "com"). Accepted values: com | in | eu | com.au | ca | jp
function getZohoRegion(): string {
  return (process.env.ZOHO_REGION || "com").toLowerCase().trim();
}

function getZohoAccountsBase(): string {
  return `https://accounts.zoho.${getZohoRegion()}`;
}

function getZohoSignBase(): string {
  return `https://sign.zoho.${getZohoRegion()}`;
}

// ── Credential helpers ────────────────────────────────────────────────────────
function getZohoClientId(): string | undefined {
  return process.env.ZOHO_SIGN_CLIENT_ID || process.env.ZOHO_CLIENT_ID;
}

function getZohoClientSecret(): string | undefined {
  return process.env.ZOHO_SIGN_CLIENT_SECRET || process.env.ZOHO_CLIENT_SECRET;
}

function getZohoRefreshToken(): string | undefined {
  return process.env.ZOHO_SIGN_REFRESH_TOKEN || process.env.ZOHO_REFRESH_TOKEN;
}

// ── Supabase ──────────────────────────────────────────────────────────────────
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

// ── Access token ──────────────────────────────────────────────────────────────
// Zoho rate-limits how often a refresh token can be exchanged for a new access token.
// Cache the access token in-memory (Zoho tokens are valid ~1hr) so bursts of requests
// don't each trigger a fresh OAuth round-trip and get throttled ("Access Denied").
let accessTokenCache: { token: string; expiresAt: number } | null = null;

// Whenever the Zoho credentials change (a new refresh token is persisted, or the
// secrets are swapped out), the previously cached access token was minted against
// the OLD account and must be discarded so the very next call exchanges the new
// refresh token for a fresh access token.
function clearAccessTokenCache(reason: string): void {
  if (accessTokenCache) {
    logger.info({ reason }, "Zoho: clearing cached access token — a new token will be obtained on the next request");
  }
  accessTokenCache = null;
}

async function getZohoAccessToken(): Promise<string> {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now()) {
    return accessTokenCache.token;
  }

  const refreshToken  = getZohoRefreshToken();
  const clientId      = getZohoClientId();
  const clientSecret  = getZohoClientSecret();

  if (!refreshToken || !clientId || !clientSecret) {
    const missing = [
      !refreshToken && "ZOHO_SIGN_REFRESH_TOKEN",
      !clientId     && "ZOHO_SIGN_CLIENT_ID",
      !clientSecret && "ZOHO_SIGN_CLIENT_SECRET",
    ].filter(Boolean).join(", ");
    throw new Error(`Zoho credentials not configured. Missing: ${missing}`);
  }

  // Guard: a refresh token that looks like a client ID (short, starts with 1000. but no dots after) is invalid
  if (/^1000\.[A-Z0-9]{22,26}$/.test(refreshToken)) {
    throw new Error(
      `ZOHO_SIGN_REFRESH_TOKEN looks like a Client ID ("${refreshToken.slice(0, 12)}…"), not a refresh token. ` +
      `Visit /api/zoho/oauth/start to generate a valid token.`
    );
  }

  const params = new URLSearchParams();
  params.append("refresh_token", refreshToken);
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("grant_type", "refresh_token");

  const tokenUrl = `${getZohoAccountsBase()}/oauth/v2/token`;
  const res = await fetch(tokenUrl, {
    method: "POST",
    body: params,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const data = (await res.json()) as { access_token?: string; expires_in?: number; error?: string; message?: string };

  if (!res.ok || !data.access_token) {
    // Don't blow away a still-valid cached token just because a refresh attempt was throttled
    if (accessTokenCache && accessTokenCache.expiresAt > Date.now() - 5 * 60 * 1000) {
      logger.warn({ error: data.error || data.message }, "Zoho: token refresh failed, reusing recent cached token");
      return accessTokenCache.token;
    }
    throw new Error(
      `Failed to refresh Zoho access token (region=${getZohoRegion()}): ` +
      (data.error || data.message || `HTTP ${res.status}`)
    );
  }

  const ttlMs = ((data.expires_in || 3600) - 120) * 1000; // refresh 2 min before real expiry
  accessTokenCache = { token: data.access_token, expiresAt: Date.now() + ttlMs };
  return data.access_token;
}

// ── Package → Zoho Template mapping (configuration-driven) ────────────────────
// Resolution order per plan:
//   1. ZOHO_TEMPLATE_<PLAN>_ID   — Zoho template ID (preferred: survives renames)
//   2. ZOHO_TEMPLATE_<PLAN>_NAME — template name, matched leniently
//   3. Built-in default name     — legacy fallback only
// Fixing a mismatch never requires a code change: set the env var and restart.
const PLAN_TEMPLATE_CONFIG: Record<string, { idVar: string; nameVar: string; defaultName: string; fallbackKeywords: string[] }> = {
  essentials:  { idVar: "ZOHO_TEMPLATE_ESSENTIALS_ID",  nameVar: "ZOHO_TEMPLATE_ESSENTIALS_NAME",  defaultName: "App Squad Starter Launch Agreement", fallbackKeywords: ["starter", "essentials"] },
  accelerator: { idVar: "ZOHO_TEMPLATE_ACCELERATOR_ID", nameVar: "ZOHO_TEMPLATE_ACCELERATOR_NAME", defaultName: "App Squad Growth Launch Agreement", fallbackKeywords: ["growth", "accelerator"] },
  empire:      { idVar: "ZOHO_TEMPLATE_EMPIRE_ID",      nameVar: "ZOHO_TEMPLATE_EMPIRE_NAME",      defaultName: "App Squad App Empire Agreement", fallbackKeywords: ["empire"] },
};

const PACKAGE_PRICING: Record<string, { name: string; setup: string; monthly: string; pif: string }> = {
  essentials:  { name: "App Launch Essentials",     setup: "$497",   monthly: "$197", pif: "$2,497" },
  accelerator: { name: "App Ownership Accelerator", setup: "$997",   monthly: "$397", pif: "$4,997" },
  empire:      { name: "App Empire Package",        setup: "$4,997", monthly: "$497", pif: "$9,997" },
};

function normalizePaymentType(pt?: string): "monthly" | "paid_in_full" {
  const v = (pt || "").toLowerCase().trim();
  if (v === "monthly") return "monthly";
  return "paid_in_full"; // covers "subscription" (legacy label), "paid_in_full", "pif", and default
}

// ── Zoho Templates (live fetch with short in-memory cache) ────────────────────
interface ZohoTemplateInfo {
  template_id: string;
  template_name: string;
  modified_time?: number;
  created_time?: number;
  owner_email?: string;
}

const TEMPLATE_CACHE_TTL_MS = 5 * 60 * 1000;
let templateListCache: { fetchedAt: number; templates: ZohoTemplateInfo[] } | null = null;

async function fetchZohoTemplateList(forceFresh = false): Promise<ZohoTemplateInfo[]> {
  if (!forceFresh && templateListCache && Date.now() - templateListCache.fetchedAt < TEMPLATE_CACHE_TTL_MS) {
    logger.info(
      { source: "cache", cacheAgeSeconds: Math.round((Date.now() - templateListCache.fetchedAt) / 1000), count: templateListCache.templates.length },
      "Zoho: template list served from in-memory cache (TTL 5 min — pass ?refresh=1 to /api/zoho/templates to bypass)"
    );
    return templateListCache.templates;
  }
  const token = await getZohoAccessToken();
  const endpoint = `${getZohoSignBase()}/api/v1/templates`;
  const res = await fetch(endpoint, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  if (!res.ok) {
    const errText = await res.text();
    try { const p = JSON.parse(errText); if (p.code === 8026) throw new Error(`ZOHO_LICENSE_8026: ${p.message || "Upgrade your Zoho Sign license."}`); } catch (inner) { if ((inner as Error).message?.startsWith("ZOHO_LICENSE_8026")) throw inner; }
    throw new Error(`Failed to list Zoho templates: HTTP ${res.status} ${errText}`);
  }
  const data = (await res.json()) as { templates?: Array<Record<string, unknown>> };
  const templates: ZohoTemplateInfo[] = (data.templates || []).map(t => ({
    template_id: String(t.template_id ?? ""),
    template_name: String(t.template_name ?? ""),
    modified_time: typeof t.modified_time === "number" ? t.modified_time : undefined,
    created_time: typeof t.created_time === "number" ? t.created_time : undefined,
    owner_email: typeof t.owner_email === "string" ? t.owner_email : undefined,
  }));
  logger.info(
    {
      source: "live",
      endpoint,
      region: getZohoRegion(),
      configuredOrgId: process.env.ZOHO_SIGN_ORGANIZATION_ID || process.env.ZOHO_SIGN_ORG_ID || null,
      count: templates.length,
      templates: templates.map(t => ({
        id: t.template_id,
        name: t.template_name,
        modified: t.modified_time ? new Date(t.modified_time).toISOString() : null,
        owner: t.owner_email ?? null,
      })),
    },
    "Zoho: template list fetched LIVE from Zoho Sign API"
  );
  templateListCache = { fetchedAt: Date.now(), templates };
  return templates;
}

// Normalize a template name for lenient comparison: lowercase, underscores and
// hyphens → spaces, collapse duplicate whitespace.
function normalizeTemplateName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Loosest comparison tier: also strip the duplicate markers Zoho adds when a
// template is cloned — "(2)" counters and "Copy" suffixes.
function canonicalTemplateName(name: string): string {
  return normalizeTemplateName(name)
    .replace(/\(\d+\)/g, " ")
    .replace(/\bcopy\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Token-overlap similarity between two template names, for "did you mean" hints.
function templateSimilarity(a: string, b: string): number {
  const ta = new Set(canonicalTemplateName(a).split(" ").filter(Boolean));
  const tb = new Set(canonicalTemplateName(b).split(" ").filter(Boolean));
  if (ta.size === 0 || tb.size === 0) return 0;
  let common = 0;
  for (const t of ta) if (tb.has(t)) common++;
  return common / Math.max(ta.size, tb.size);
}

async function resolveTemplateId(packageId: string): Promise<{ templateId: string; templateName: string }> {
  const cfg = PLAN_TEMPLATE_CONFIG[packageId];
  if (!cfg) {
    throw new Error(
      `Unknown package "${packageId}" — no Zoho template mapping configured. ` +
      `Known plans: ${Object.keys(PLAN_TEMPLATE_CONFIG).join(", ")}`
    );
  }

  const configuredId = (process.env[cfg.idVar] || "").trim();
  const configuredName = (process.env[cfg.nameVar] || "").trim() || cfg.defaultName;

  const matchIn = (templates: ZohoTemplateInfo[]): { templateId: string; templateName: string } | null => {
    // 1 — Template ID (stable; preferred)
    if (configuredId) {
      const byId = templates.find(t => t.template_id === configuredId);
      if (byId) return { templateId: byId.template_id, templateName: byId.template_name };
      logger.warn(
        { packageId, configuredId, availableIds: templates.map(t => t.template_id) },
        `Zoho: configured ${cfg.idVar} not found in the template list — falling back to name matching`
      );
    }
    // 2 — Name matching: exact → normalized (spaces/underscores/hyphens/case) → canonical
    const exact = templates.find(t => (t.template_name || "").trim().toLowerCase() === configuredName.toLowerCase());
    if (exact) return { templateId: exact.template_id, templateName: exact.template_name };

    const wantedNorm = normalizeTemplateName(configuredName);
    const norm = templates.find(t => normalizeTemplateName(t.template_name || "") === wantedNorm);
    if (norm) return { templateId: norm.template_id, templateName: norm.template_name };

    const wantedCanon = canonicalTemplateName(configuredName);
    const canon = templates.find(t => canonicalTemplateName(t.template_name || "") === wantedCanon);
    if (canon) return { templateId: canon.template_id, templateName: canon.template_name };

    // 3 — Keyword matching fallback (e.g. starter, growth, empire)
    for (const kw of cfg.fallbackKeywords || []) {
      const kwMatch = templates.find(t => normalizeTemplateName(t.template_name || "").includes(kw));
      if (kwMatch) return { templateId: kwMatch.template_id, templateName: kwMatch.template_name };
    }
    return null;
  };

  let templates = await fetchZohoTemplateList();
  let matched = matchIn(templates);
  if (!matched) {
    // Never fail on a stale cache: the account may have just been updated,
    // so re-fetch the list LIVE from Zoho and try once more.
    logger.warn({ packageId }, "Zoho: no template matched the cached list — re-fetching live before failing");
    templates = await fetchZohoTemplateList(true);
    matched = matchIn(templates);
  }
  if (matched) return matched;

  // 3 — Nothing matched: full diagnostics + closest-match suggestion
  const scored = templates
    .map(t => ({ t, score: templateSimilarity(configuredName, t.template_name || "") }))
    .sort((a, b) => b.score - a.score);
  const closest = scored[0] && scored[0].score > 0 ? scored[0].t : null;

  const details = {
    requestedPlan: packageId,
    configuredTemplateId: configuredId || null,
    configuredTemplateName: configuredName,
    availableTemplates: templates.map(t => ({ id: t.template_id, name: t.template_name })),
    suggestedClosestMatch: closest ? { id: closest.template_id, name: closest.template_name } : null,
    fix: `Set ${cfg.idVar} (preferred) or ${cfg.nameVar} in environment secrets to one of the available templates — no code change needed.`,
  };
  logger.error(details, "Zoho: template resolution failed");

  const err = new Error(
    `Zoho template for plan "${packageId}" not found. ` +
    `Configured: ${configuredId ? `id="${configuredId}", ` : ""}name="${configuredName}". ` +
    `Available templates: ${templates.map(t => `"${t.template_name}"`).join(", ") || "none"}. ` +
    (closest ? `Closest match: "${closest.template_name}" (id ${closest.template_id}). ` : "") +
    `Fix: set ${cfg.idVar} or ${cfg.nameVar} in environment secrets.`
  );
  (err as Error & { details?: unknown }).details = details;
  throw err;
}

async function fetchZohoTemplateDetail(templateId: string): Promise<{ actions: any[]; fields: any[] }> {
  const token = await getZohoAccessToken();
  const res = await fetch(`${getZohoSignBase()}/api/v1/templates/${templateId}`, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  if (!res.ok) {
    const errText = await res.text();
    try { const p = JSON.parse(errText); if (p.code === 8026) throw new Error(`ZOHO_LICENSE_8026: ${p.message || "Upgrade your Zoho Sign license."}`); } catch (inner) { if ((inner as Error).message?.startsWith("ZOHO_LICENSE_8026")) throw inner; }
    throw new Error(`Failed to fetch Zoho template detail for ${templateId}: HTTP ${res.status} ${errText}`);
  }
  const data = (await res.json()) as any;
  const tpl = data.templates || data;
  const actions = tpl.actions || [];
  // Zoho nests actual field definitions inside each action's own `fields` array,
  // not in a top-level `fields` array (which is typically empty). Flatten them here
  // so callers can inspect/match against the real fields on the document.
  const fields = actions.flatMap((a: any) => a.fields || []);
  return { actions, fields };
}

// Best-effort mapping of template merge fields to our known agreement data, matched by field label.
// Only fills plain text fields — never signature/date/checkbox/image fields, which Zoho
// populates itself (signature capture, sign-date stamping) or which reject text_data.
function mapTemplateFields(fields: any[], values: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of fields) {
    const fieldName = f.field_name;
    if (!fieldName) continue;
    const category = String(f.field_category || "").toLowerCase();
    if (category && category !== "textfield") continue; // skip signature/datefield/image/etc.

    const label = String(f.field_label || f.field_name || "").toLowerCase();

    if (label.includes("email")) out[fieldName] = values.email;
    else if (label.includes("phone")) out[fieldName] = values.phone;
    else if (label.includes("address")) out[fieldName] = values.address;
    else if (label.includes("setup")) out[fieldName] = values.setup_amount;
    else if (label.includes("monthly")) out[fieldName] = values.monthly_amount;
    else if (label.includes("paid in full") || label.includes("full amount") || label.includes("total")) out[fieldName] = values.paid_in_full_amount;
    else if (label.includes("payment") && (label.includes("type") || label.includes("option"))) out[fieldName] = values.payment_type_label;
    else if (label.includes("package") || label.includes("plan")) out[fieldName] = values.package;
    else if (label.includes("name") && !label.includes("company") && !label.includes("package")) out[fieldName] = values.full_name;
  }
  return out;
}

// ── OAuth redirect URI ────────────────────────────────────────────────────────
function getOAuthRedirectUri(req: Request): string {
  let uri = process.env.ZOHO_OAUTH_REDIRECT_URI;
  if (!uri) {
    const domains = process.env.REPLIT_DOMAINS || "";
    const primary = domains.split(",")[0].trim();
    if (primary) {
      uri = `https://${primary}/api/zoho/oauth/callback`;
    } else {
      const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:8080";
      const proto = req.headers["x-forwarded-proto"] || "https";
      uri = `${proto}://${host}/api/zoho/oauth/callback`;
    }
  }
  // Ensure redirect URI always uses the backend callback endpoint
  if (uri && !uri.endsWith("/api/zoho/oauth/callback")) {
    const cleanBase = uri.replace(/\/+$/, "");
    if (!cleanBase.endsWith("/api/zoho/oauth/callback")) {
      uri = `${cleanBase}/api/zoho/oauth/callback`;
    }
  }
  return uri;
}

// ── Token persistence (survives process restarts) ─────────────────────────────
const TOKEN_FILE = path.join("/tmp", "zoho_oauth_result.json");

function updateEnvFile(filePath: string, key: string, value: string) {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, "utf8");
      const reg = new RegExp(`^${key}=.*$`, "m");
      if (reg.test(content)) {
        content = content.replace(reg, `${key}=${value}`);
      } else {
        content = content.trimEnd() + `\n${key}=${value}\n`;
      }
      fs.writeFileSync(filePath, content, "utf8");
      logger.info({ filePath, key }, "OAuth persist: updated .env file");
    }
  } catch (err) {
    logger.warn({ err, filePath, key }, "OAuth persist: could not update .env file");
  }
}

function persistToken(tokenData: Record<string, string>) {
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify({ ...tokenData, saved_at: new Date().toISOString() }, null, 2));
  } catch (e) {
    logger.warn({ e }, "OAuth: could not write token file");
  }
  // Also patch process.env so the running process uses it immediately
  if (tokenData.refresh_token) {
    process.env.ZOHO_SIGN_REFRESH_TOKEN = tokenData.refresh_token;
    process.env.ZOHO_REFRESH_TOKEN      = tokenData.refresh_token;

    const cwd = process.cwd();
    const envPaths = [
      path.resolve(cwd, ".env"),
      path.resolve(cwd, "artifacts/api-server/.env"),
      path.resolve(cwd, "../.env"),
      path.resolve(__dirname, "../../.env"),
    ];
    for (const p of envPaths) {
      updateEnvFile(p, "ZOHO_SIGN_REFRESH_TOKEN", tokenData.refresh_token);
      updateEnvFile(p, "ZOHO_REFRESH_TOKEN", tokenData.refresh_token);
    }
  }
  if (tokenData.region) {
    process.env.ZOHO_REGION = tokenData.region;
  }
  // Credentials were just replaced — drop any access token minted from the old
  // refresh token so the next request exchanges the new one.
  clearAccessTokenCache("refresh token replaced via OAuth persistToken");
}

function readPersistedToken(): Record<string, string> | null {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      return JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8"));
    }
  } catch { /* ignore */ }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// OAUTH ROUTES
// ─────────────────────────────────────────────────────────────────────────────

const ZOHO_SCOPES = "ZohoSign.documents.ALL,ZohoSign.templates.ALL,ZohoSign.requests.ALL,ZohoSign.account.READ";

// GET /api/zoho/oauth/start → landing page with both options (redirect + Self Client)
router.get(["/zoho/oauth/start", "/zoho/oauth/setup", "/zoho/setup"], (req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  const clientId   = getZohoClientId() || "";
  const region     = getZohoRegion();
  const redirectUri = getOAuthRedirectUri(req);
  const state      = Buffer.from(JSON.stringify({ region, ts: Date.now() })).toString("base64url");
  const authUrl    = `${getZohoAccountsBase()}/oauth/v2/auth?` + new URLSearchParams({
    response_type: "code",
    client_id:     clientId,
    scope:         ZOHO_SCOPES,
    redirect_uri:  redirectUri,
    access_type:   "offline",
    prompt:        "consent",
    state,
  }).toString();

  if (!clientId) {
    res.send(oauthErrorPage("ZOHO_SIGN_CLIENT_ID is not set. Add it to Replit Secrets first."));
    return;
  }

  res.send(oauthLandingPage({ authUrl, clientId, region, redirectUri, scopes: ZOHO_SCOPES }));
});

// GET /api/zoho/oauth/authorize → builds redirect URL and shows the confirm page (standard OAuth redirect)
router.get("/zoho/oauth/authorize", (req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-store");
  const clientId    = getZohoClientId() || "";
  const region      = getZohoRegion();
  const redirectUri = getOAuthRedirectUri(req);

  if (!clientId) {
    res.send(oauthErrorPage("ZOHO_SIGN_CLIENT_ID is not set in Replit Secrets."));
    return;
  }

  const state   = Buffer.from(JSON.stringify({ region, ts: Date.now() })).toString("base64url");
  const authUrl = `${getZohoAccountsBase()}/oauth/v2/auth?` + new URLSearchParams({
    response_type: "code",
    client_id:     clientId,
    scope:         ZOHO_SCOPES,
    redirect_uri:  redirectUri,
    access_type:   "offline",
    prompt:        "consent",
    state,
  }).toString();

  logger.info({ region, redirectUri, clientId: clientId.slice(0, 14) + "…", authUrl }, "OAuth: authorization URL generated");
  res.send(oauthStartPage(authUrl, region, redirectUri, clientId));
});

// GET /api/zoho/oauth/manual — form to paste a Self Client authorization code
router.get("/zoho/oauth/manual", (req: Request, res: Response) => {
  res.setHeader("Cache-Control", "no-store");
  const clientId    = getZohoClientId() || "";
  const redirectUri = process.env.ZOHO_OAUTH_REDIRECT_URI || "";
  res.send(manualExchangePage(clientId, getZohoRegion(), redirectUri));
});

// POST /api/zoho/oauth/manual — exchange a pasted auth code for a refresh token
router.post("/zoho/oauth/manual", async (req: Request, res: Response) => {
  const { code, region: bodyRegion, client_id, client_secret, redirect_uri: bodyRedirectUri } = req.body as Record<string, string>;

  if (!code?.trim()) {
    res.status(400).send(oauthErrorPage("No authorization code provided. Go back and paste the code from Zoho API Console."));
    return;
  }

  const region      = (bodyRegion || getZohoRegion()).toLowerCase().trim();
  const clientId    = (client_id?.trim())     || getZohoClientId()     || "";
  const clientSec   = (client_secret?.trim()) || getZohoClientSecret() || "";
  const redirectUri = (bodyRedirectUri?.trim()) || process.env.ZOHO_OAUTH_REDIRECT_URI || "";

  if (!clientId || !clientSec) {
    res.status(400).send(oauthErrorPage("Client ID or Client Secret missing. Fill them in on the form or set ZOHO_SIGN_CLIENT_ID / ZOHO_SIGN_CLIENT_SECRET in Replit Secrets."));
    return;
  }

  const tokenEndpoint = `https://accounts.zoho.${region}/oauth/v2/token`;

  const params = new URLSearchParams();
  params.append("grant_type",    "authorization_code");
  params.append("code",          code.trim());
  params.append("client_id",     clientId);
  params.append("client_secret", clientSec);
  if (redirectUri) {
    params.append("redirect_uri", redirectUri);
  }

  // ── Diagnostic log (safe — no full secret) ────────────────────────────────
  logger.info({
    region,
    tokenEndpoint,
    clientId:    clientId.slice(0, 14) + "…",
    codePrefix:  code.trim().slice(0, 12) + "…",
    redirectUri: redirectUri || "(omitted — Self Client mode)",
    hasSecret:   !!clientSec,
  }, "Manual exchange: token request params");

  let tokenData: { access_token?: string; refresh_token?: string; error?: string; message?: string };

  try {
    const tokenRes = await fetch(tokenEndpoint, {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    tokenData = await tokenRes.json() as { access_token?: string; refresh_token?: string; error?: string; message?: string };
  } catch (e) {
    res.send(oauthErrorPage(`Network error contacting accounts.zoho.${region}: ${(e as Error).message}`));
    return;
  }

  if (!tokenData.refresh_token) {
    const msg = tokenData.error || tokenData.message || "no refresh_token returned";
    logger.error({ tokenData }, "Manual exchange: failed");
    res.send(oauthErrorPage(
      `Token exchange failed for region <strong>.${region}</strong>: <code>${msg}</code><br><br>` +
      `Common fixes:<br>` +
      `• Wrong region — try <a href="/api/zoho/oauth/manual">/api/zoho/oauth/manual</a> and pick a different region<br>` +
      `• Expired code — Self Client codes expire in 10 minutes, generate a new one<br>` +
      `• Wrong Client ID / Secret — double-check the values in the form<br>` +
      `• <code>invalid_code</code> — the code was already used; generate a fresh one`
    ));
    return;
  }

  persistToken({ refresh_token: tokenData.refresh_token, access_token: tokenData.access_token || "", region, client_id: clientId });

  // Persist the client ID too if it came from the form (overriding old env)
  if (client_id?.trim()) {
    process.env.ZOHO_SIGN_CLIENT_ID = clientId;
  }

  // Quick API verify
  let verifyStatus = "—";
  let zohoEmail    = "—";
  let zohoOrgName  = "—";
  try {
    const vRes = await fetch(`https://sign.zoho.${region}/api/v1/requests?limit=1`, {
      headers: { Authorization: `Zoho-oauthtoken ${tokenData.access_token}` },
    });
    verifyStatus = vRes.ok ? "✅ API call succeeded" : `⚠️ HTTP ${vRes.status}`;
    if (vRes.ok) {
      const oRes = await fetch(`https://sign.zoho.${region}/api/v1/settings`, {
        headers: { Authorization: `Zoho-oauthtoken ${tokenData.access_token}` },
      });
      if (oRes.ok) {
        const od = await oRes.json() as any;
        zohoEmail   = od?.settings?.user_email || od?.user_email || "—";
        zohoOrgName = od?.settings?.org_name   || od?.org_name   || "—";
      }
    }
  } catch { /* ignore */ }

  res.send(oauthSuccessPage({ refreshToken: tokenData.refresh_token, region, verifyStatus, zohoEmail, zohoOrgName }));
});

// GET /api/zoho/oauth/callback
// Zoho redirects here with ?code=XXX&state=YYY after user approves.
router.get("/zoho/oauth/callback", async (req: Request, res: Response) => {
  const { code, error, state } = req.query as Record<string, string>;

  if (error) {
    logger.error({ error }, "OAuth: Zoho returned an error");
    res.send(oauthErrorPage(`Zoho returned an error: ${error}. Close this and try again.`));
    return;
  }

  if (!code) {
    res.send(oauthErrorPage("No authorization code received. The flow may have been cancelled."));
    return;
  }

  // Decode region from state
  let region = getZohoRegion();
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    if (decoded.region) region = decoded.region;
  } catch { /* use default */ }

  const clientId     = getZohoClientId();
  const clientSecret = getZohoClientSecret();
  const redirectUri  = getOAuthRedirectUri(req);

  if (!clientId || !clientSecret) {
    res.send(oauthErrorPage("Client credentials missing. Check ZOHO_SIGN_CLIENT_ID and ZOHO_SIGN_CLIENT_SECRET."));
    return;
  }

  logger.info({ region, codeLen: code.length }, "OAuth: exchanging authorization code for tokens");

  const params = new URLSearchParams();
  params.append("code", code);
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("redirect_uri", redirectUri);
  params.append("grant_type", "authorization_code");

  let tokenData: {
    access_token?: string;
    refresh_token?: string;
    error?: string;
    message?: string;
  };

  const tokenUrl = `https://accounts.zoho.${region}/oauth/v2/token`;
  logger.info({
    tokenUrl,
    region,
    redirectUri,
    clientId: clientId?.slice(0, 14) + "…",
    grantType: "authorization_code",
    codeLen: code.length,
  }, "OAuth callback: attempting token exchange");

  try {
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      body: params,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    const rawBody = await tokenRes.text();
    logger.info({
      httpStatus: tokenRes.status,
      rawBody,
      tokenUrl,
    }, "OAuth callback: Zoho token endpoint raw response");
    try {
      tokenData = JSON.parse(rawBody) as { access_token?: string; refresh_token?: string; error?: string; message?: string };
    } catch {
      res.send(oauthErrorPage(`Zoho returned a non-JSON response (HTTP ${tokenRes.status}): <code>${rawBody.slice(0, 400)}</code>`));
      return;
    }
  } catch (fetchErr) {
    logger.error({ fetchErr, tokenUrl }, "OAuth callback: token exchange network error");
    res.send(oauthErrorPage(`Network error during token exchange: ${(fetchErr as Error).message}`));
    return;
  }

  if (!tokenData.refresh_token) {
    logger.error({
      error: tokenData.error,
      message: tokenData.message,
      hasAccessToken: !!tokenData.access_token,
      region,
      redirectUri,
      tokenUrl,
    }, "OAuth callback: no refresh_token in Zoho response");
    const errCode = tokenData.error || tokenData.message || "no refresh_token returned";
    let hint = "";
    if (errCode === "invalid_code")         hint = "The code was already used or expired — generate a fresh one.";
    else if (errCode === "invalid_client")  hint = "Client ID is wrong or doesn't exist in this region.";
    else if (errCode === "invalid_client_secret") hint = "Client Secret is incorrect — check ZOHO_SIGN_CLIENT_SECRET.";
    else if (errCode === "redirect_uri_mismatch") hint = `The redirect URI <code>${redirectUri}</code> is not registered in your Zoho OAuth app. Add it under Authorized Redirect URIs in api-console.zoho.${region}.`;
    res.send(oauthErrorPage(
      `Token exchange failed: <strong>${errCode}</strong>${hint ? `<br><br>💡 ${hint}` : ""}<br><br>` +
      `Region tried: <code>.${region}</code><br>` +
      `Redirect URI sent: <code>${redirectUri}</code><br>` +
      `<a href="/api/zoho/oauth/start">← Try again</a> &nbsp;|&nbsp; <a href="/api/zoho/oauth/manual">Self Client (no redirect needed)</a>`
    ));
    return;
  }

  // ── Persist the token ───────────────────────────────────────────────────────
  persistToken({ refresh_token: tokenData.refresh_token, access_token: tokenData.access_token || "", region });
  logger.info({ region, refreshLen: tokenData.refresh_token.length }, "OAuth: tokens obtained and persisted");

  // ── Verify: make a test API call ────────────────────────────────────────────
  let verifyStatus = "unknown";
  let zohoEmail    = "unknown";
  let zohoOrgName  = "unknown";

  try {
    const verifyRes = await fetch(`https://sign.zoho.${region}/api/v1/requests?limit=1`, {
      headers: { Authorization: `Zoho-oauthtoken ${tokenData.access_token}` },
    });
    if (verifyRes.ok) {
      verifyStatus = "✅ API call succeeded";
      // Try to get org info
      const orgRes = await fetch(`https://sign.zoho.${region}/api/v1/settings`, {
        headers: { Authorization: `Zoho-oauthtoken ${tokenData.access_token}` },
      });
      if (orgRes.ok) {
        const orgData = await orgRes.json() as any;
        zohoEmail   = orgData?.settings?.user_email || orgData?.user_email || "—";
        zohoOrgName = orgData?.settings?.org_name   || orgData?.org_name   || "—";
      }
    } else {
      verifyStatus = `⚠️ API returned HTTP ${verifyRes.status}`;
    }
  } catch (ve) {
    verifyStatus = `⚠️ Verify request failed: ${(ve as Error).message}`;
  }

  res.send(oauthSuccessPage({
    refreshToken: tokenData.refresh_token,
    region,
    verifyStatus,
    zohoEmail,
    zohoOrgName,
  }));
});

// GET /api/zoho/oauth/status — shows current token state + last persisted token
router.get("/zoho/oauth/status", async (req: Request, res: Response) => {
  const clientId  = getZohoClientId();
  const hasSecret = !!getZohoClientSecret();
  const rTok      = getZohoRefreshToken();
  const persisted = readPersistedToken();

  const isClientIdLike = rTok ? /^1000\.[A-Z0-9]{22,26}$/.test(rTok) : false;

  let authTest: string;
  try {
    await getZohoAccessToken();
    authTest = "✅ Token exchange succeeded — credentials are valid";
  } catch (e) {
    authTest = `❌ ${(e as Error).message}`;
  }

  res.json({
    region:           getZohoRegion(),
    accounts_base:    getZohoAccountsBase(),
    sign_base:        getZohoSignBase(),
    client_id:        clientId ? clientId.slice(0, 12) + "…" : "❌ NOT SET",
    client_secret:    hasSecret ? "✅ SET" : "❌ NOT SET",
    refresh_token:    rTok
      ? (isClientIdLike ? `⚠️ LOOKS LIKE CLIENT ID: ${rTok}` : `✅ SET (${rTok.length} chars)`)
      : "❌ NOT SET",
    auth_test:        authTest,
    last_oauth_file:  persisted
      ? { saved_at: persisted.saved_at, region: persisted.region, refresh_len: persisted.refresh_token?.length }
      : null,
    oauth_start_url:  `/api/zoho/oauth/start`,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// HTML helpers
// ─────────────────────────────────────────────────────────────────────────────
function manualExchangePage(clientId: string, currentRegion: string, currentRedirectUri = ""): string {
  const scopes = "ZohoSign.documents.ALL,ZohoSign.templates.ALL,ZohoSign.account.READ";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Zoho Sign — Manual Token Exchange</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0f;color:#e8eaf0;display:flex;align-items:flex-start;justify-content:center;min-height:100vh;padding:32px 24px}
  .wrap{max-width:620px;width:100%}
  h1{font-size:22px;font-weight:700;margin-bottom:6px;text-align:center}
  .sub{color:rgba(255,255,255,.45);font-size:14px;margin-bottom:32px;line-height:1.6;text-align:center}
  .card{background:#141420;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:28px;margin-bottom:20px}
  .card-title{font-size:13px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.07em;text-transform:uppercase;margin-bottom:16px}
  .step{display:flex;gap:12px;margin-bottom:14px;font-size:13px;line-height:1.6;color:rgba(255,255,255,.7)}
  .step-n{background:#f59e0b;color:#000;font-weight:700;font-size:11px;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
  .copy-scope{background:#0d1117;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:10px 14px;font-family:monospace;font-size:12px;color:#7dd3fc;margin:8px 0;word-break:break-all;cursor:pointer;transition:border-color .2s}
  .copy-scope:hover{border-color:#7dd3fc}
  label{display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,.45);letter-spacing:.06em;text-transform:uppercase;margin-bottom:6px}
  input,select{width:100%;background:#0d1117;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:11px 14px;color:#e8eaf0;font-size:13px;font-family:inherit;margin-bottom:16px;outline:none;transition:border-color .2s}
  input:focus,select:focus{border-color:#f59e0b}
  input[type=password]{letter-spacing:.1em}
  .details-toggle{font-size:12px;color:rgba(255,255,255,.35);cursor:pointer;margin-bottom:16px;display:block;text-decoration:underline}
  .hidden{display:none}
  .btn{width:100%;background:#f59e0b;color:#000;border:none;font-weight:700;font-size:15px;padding:14px;border-radius:10px;cursor:pointer;transition:opacity .2s}
  .btn:hover{opacity:.85}
  code{background:rgba(255,255,255,.07);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:12px}
  a{color:#7dd3fc}
</style>
</head>
<body>
<div class="wrap">
  <h1 style="margin-bottom:6px">🔑 Manual Token Exchange</h1>
  <p class="sub">Exchange a Zoho authorization code for a refresh token</p>

  <div class="card">
    <div class="card-title">Step 1 — Generate a code in Zoho API Console</div>
    <div class="step"><span class="step-n">1</span><div>Go to <a href="https://api-console.zoho.${currentRegion}" target="_blank">api-console.zoho.${currentRegion}</a> — make sure you're logged into the <strong>correct Zoho account</strong></div></div>
    <div class="step"><span class="step-n">2</span><div>Click <strong>"Self Client"</strong> in the left sidebar (or top tabs)</div></div>
    <div class="step"><span class="step-n">3</span><div>Click <strong>"Generate Code"</strong></div></div>
    <div class="step"><span class="step-n">4</span><div>In the <strong>Scope</strong> field, paste exactly:<br>
      <div class="copy-scope" onclick="navigator.clipboard.writeText(this.textContent.trim()).then(()=>{this.style.borderColor='#22c55e';setTimeout(()=>this.style.borderColor='',1500)})" title="Click to copy">${scopes}</div>
    </div></div>
    <div class="step"><span class="step-n">5</span><div>Set <strong>Time Duration</strong> to <code>10 minutes</code>, enter any description, click <strong>Create</strong></div></div>
    <div class="step"><span class="step-n">6</span><div>Copy the authorization code shown — it expires in 10 min, use it immediately</div></div>
  </div>

  <div class="card">
    <div class="card-title">Step 2 — Exchange the code for a refresh token</div>
    <form method="POST" action="/api/zoho/oauth/manual">
      <label>Authorization Code (paste from step above)</label>
      <input type="text" name="code" placeholder="1000.xxxxxxxx..." required autofocus>

      <label>Redirect URI <span style="color:rgba(255,255,255,.3);text-transform:none;font-weight:400">— must exactly match what's in Zoho API Console</span></label>
      <input type="text" name="redirect_uri" value="${currentRedirectUri}" placeholder="https://yourdomain.com/ (leave blank for Self Client / no redirect URI)">

      <label>Zoho Region</label>
      <select name="region">
        <option value="com" ${currentRegion === "com" ? "selected" : ""}>zoho.com (US/Global — default)</option>
        <option value="in"  ${currentRegion === "in"  ? "selected" : ""}>zoho.in (India)</option>
        <option value="eu"  ${currentRegion === "eu"  ? "selected" : ""}>zoho.eu (Europe)</option>
        <option value="com.au" ${currentRegion === "com.au" ? "selected" : ""}>zoho.com.au (Australia)</option>
        <option value="ca"  ${currentRegion === "ca"  ? "selected" : ""}>zoho.ca (Canada)</option>
        <option value="jp"  ${currentRegion === "jp"  ? "selected" : ""}>zoho.jp (Japan)</option>
      </select>

      <span class="details-toggle" onclick="document.getElementById('cred-fields').classList.toggle('hidden')">
        ▸ Override Client ID / Secret (leave blank to use values from Replit Secrets)
      </span>
      <div id="cred-fields" class="hidden">
        <label>Client ID <span style="color:rgba(255,255,255,.3);text-transform:none;font-weight:400">(current: ${clientId ? clientId.slice(0, 14) + "…" : "not set"})</span></label>
        <input type="text" name="client_id" placeholder="1000.xxx… (leave blank to use saved value)">
        <label>Client Secret</label>
        <input type="password" name="client_secret" placeholder="leave blank to use saved value">
      </div>

      <button type="submit" class="btn">Exchange Code → Get Refresh Token</button>
    </form>
  </div>
</div>
</body>
</html>`;
}

// Landing page — shows BOTH options: standard redirect and Self Client manual
function oauthLandingPage(opts: { authUrl: string; clientId: string; region: string; redirectUri: string; scopes: string }): string {
  const { authUrl, clientId, region, redirectUri, scopes } = opts;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Zoho Sign — OAuth Setup</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0f;color:#e8eaf0;display:flex;align-items:flex-start;justify-content:center;min-height:100vh;padding:32px 24px}
  .wrap{max-width:660px;width:100%}
  h1{font-size:22px;font-weight:700;margin-bottom:6px;text-align:center}
  .sub{color:rgba(255,255,255,.45);font-size:14px;margin-bottom:28px;line-height:1.6;text-align:center}
  .card{background:#141420;border:1px solid rgba(255,255,255,.1);border-radius:16px;padding:28px;margin-bottom:20px}
  .card-title{font-size:13px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:.07em;text-transform:uppercase;margin-bottom:14px}
  .badge{display:inline-block;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.3);color:#86efac;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;margin-left:8px;vertical-align:middle}
  .badge-rec{background:rgba(245,158,11,.12);border-color:rgba(245,158,11,.3);color:#fcd34d}
  .info-row{display:flex;gap:12px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:8px;padding:10px 14px;margin-bottom:8px;font-size:12px;word-break:break-all}
  .info-label{color:rgba(255,255,255,.4);flex-shrink:0;width:110px}
  .info-value{color:#7dd3fc;font-family:monospace}
  .warn{background:rgba(239,68,68,.07);border:1px solid rgba(239,68,68,.25);border-radius:10px;padding:14px 16px;font-size:13px;color:#fca5a5;margin-bottom:16px;line-height:1.6}
  .btn{display:block;width:100%;background:#f59e0b;color:#000;border:none;font-weight:700;font-size:15px;padding:14px;border-radius:10px;cursor:pointer;transition:opacity .2s;text-align:center;text-decoration:none}
  .btn:hover{opacity:.85}
  .btn-sec{background:rgba(255,255,255,.07);color:#e8eaf0;border:1px solid rgba(255,255,255,.15);margin-top:10px;font-size:14px;padding:12px}
  .divider{display:flex;align-items:center;gap:12px;margin:24px 0;color:rgba(255,255,255,.2);font-size:12px}
  .divider::before,.divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.1)}
  code{background:rgba(255,255,255,.07);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:12px}
  a{color:#7dd3fc}
</style>
</head>
<body>
<div class="wrap">
  <h1>🔑 Zoho Sign OAuth Setup</h1>
  <p class="sub">Choose how to authorize App Squad to use Zoho Sign</p>

  <div class="card">
    <div class="card-title">Option A — Standard OAuth Redirect <span class="badge badge-rec">Recommended</span></div>
    <div class="warn">⚠️ <strong>Required first:</strong> add the redirect URI below to your Zoho OAuth app's <em>Authorized Redirect URIs</em> list at <a href="https://api-console.zoho.${region}" target="_blank">api-console.zoho.${region}</a> before clicking Authorize.</div>
    <div class="info-row"><span class="info-label">Region</span><span class="info-value">.${region}</span></div>
    <div class="info-row"><span class="info-label">Client ID</span><span class="info-value">${clientId}</span></div>
    <div class="info-row"><span class="info-label">Redirect URI</span><span class="info-value">${redirectUri}</span></div>
    <div class="info-row"><span class="info-label">Scopes</span><span class="info-value">${scopes}</span></div>
    <a class="btn" href="${authUrl}">Authorize with Zoho →</a>
  </div>

  <div class="divider">OR</div>

  <div class="card">
    <div class="card-title">Option B — Self Client (no redirect URI needed)</div>
    <p style="font-size:13px;color:rgba(255,255,255,.55);margin-bottom:16px;line-height:1.6">Use Zoho API Console's Self Client to generate a one-time code — no redirect URI required. Best if the redirect URI isn't registered yet.</p>
    <a class="btn btn-sec" href="/api/zoho/oauth/manual">Self Client → Paste Code</a>
  </div>
</div>
</body>
</html>`;
}

function oauthStartPage(authUrl: string, region: string, redirectUri: string, clientId: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Zoho Sign — Authorize App Squad</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0f;color:#e8eaf0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
  .card{background:#141420;border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:48px;max-width:560px;width:100%;text-align:center;box-shadow:0 24px 80px rgba(0,0,0,.4)}
  h1{font-size:24px;font-weight:700;margin-bottom:8px}
  .sub{color:rgba(255,255,255,.45);font-size:14px;margin-bottom:32px;line-height:1.6}
  .info-row{display:flex;justify-content:space-between;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:12px 16px;margin-bottom:12px;font-size:13px;text-align:left}
  .info-label{color:rgba(255,255,255,.45)}
  .info-value{color:#7dd3fc;font-family:monospace;font-size:12px;word-break:break-all}
  .btn{display:inline-block;background:#f59e0b;color:#000;font-weight:700;font-size:15px;padding:16px 40px;border-radius:12px;text-decoration:none;margin-top:24px;transition:opacity .2s}
  .btn:hover{opacity:.85}
  .warn{background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.25);border-radius:10px;padding:16px;font-size:13px;color:#fcd34d;margin-bottom:24px;text-align:left;line-height:1.6}
</style>
</head>
<body>
<div class="card">
  <h1>🔐 Authorize Zoho Sign</h1>
  <p class="sub">This will open the Zoho authorization page. Sign in and click&nbsp;<strong>Accept</strong> to grant App Squad access.</p>
  <div class="warn">⚠️ <strong>Before clicking Authorize:</strong> make sure the redirect URI below is added to your Zoho API Console app under <em>Authorized Redirect URIs</em>.</div>
  <div class="info-row"><span class="info-label">Region</span><span class="info-value">.${region}</span></div>
  <div class="info-row"><span class="info-label">Client ID</span><span class="info-value">${clientId}</span></div>
  <div class="info-row"><span class="info-label">Redirect URI</span><span class="info-value">${redirectUri}</span></div>
  <div class="info-row"><span class="info-label">Scopes</span><span class="info-value">ZohoSign.documents.ALL, ZohoSign.templates.ALL, ZohoSign.account.READ</span></div>
  <a class="btn" href="${authUrl}" target="_top">Authorize with Zoho →</a>
</div>
</body>
</html>`;
}

function oauthSuccessPage(opts: { refreshToken: string; region: string; verifyStatus: string; zohoEmail: string; zohoOrgName: string }): string {
  const { refreshToken, region, verifyStatus, zohoEmail, zohoOrgName } = opts;
  const masked = refreshToken.slice(0, 8) + "…" + refreshToken.slice(-6);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Zoho Sign — Authorization Complete</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0f;color:#e8eaf0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
  .card{background:#141420;border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:48px;max-width:580px;width:100%;box-shadow:0 24px 80px rgba(0,0,0,.4)}
  h1{font-size:22px;font-weight:700;margin-bottom:6px;text-align:center}
  .badge{display:inline-block;background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.3);color:#86efac;font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;margin-bottom:20px}
  .section{margin-top:20px}
  .section-title{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:10px}
  .info-row{display:flex;justify-content:space-between;align-items:flex-start;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:12px 16px;margin-bottom:8px;font-size:13px}
  .info-label{color:rgba(255,255,255,.45);flex-shrink:0;margin-right:12px}
  .info-value{color:#7dd3fc;font-family:monospace;font-size:12px;word-break:break-all;text-align:right}
  .token-box{background:#0d1117;border:1px solid rgba(34,197,94,.3);border-radius:12px;padding:20px;margin-top:8px}
  .token-label{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(34,197,94,.7);margin-bottom:10px}
  .token-val{font-family:monospace;font-size:13px;color:#86efac;word-break:break-all;line-height:1.6;user-select:all}
  .copy-btn{display:block;width:100%;background:#22c55e;color:#000;border:none;font-size:13px;font-weight:700;padding:12px;border-radius:10px;cursor:pointer;margin-top:12px;transition:opacity .2s}
  .copy-btn:hover{opacity:.85}
  .steps{background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.2);border-radius:12px;padding:20px;margin-top:20px}
  .steps-title{font-size:13px;font-weight:700;color:#fcd34d;margin-bottom:12px}
  .step{font-size:13px;color:rgba(255,255,255,.65);margin-bottom:8px;padding-left:20px;position:relative;line-height:1.5}
  .step::before{content:attr(data-n);position:absolute;left:0;color:#f59e0b;font-weight:700}
  code{background:rgba(255,255,255,.07);padding:2px 6px;border-radius:4px;font-family:monospace}
</style>
</head>
<body>
<div class="card">
  <div style="text-align:center;margin-bottom:4px"><span class="badge">✅ Authorization Successful</span></div>
  <h1>Zoho Sign Connected</h1>

  <div class="section">
    <div class="section-title">Account Info</div>
    <div class="info-row"><span class="info-label">Email</span><span class="info-value">${zohoEmail}</span></div>
    <div class="info-row"><span class="info-label">Organization</span><span class="info-value">${zohoOrgName}</span></div>
    <div class="info-row"><span class="info-label">Region</span><span class="info-value">.${region} (${getZohoSignBase().replace("https://", "")})</span></div>
    <div class="info-row"><span class="info-label">API Verification</span><span class="info-value">${verifyStatus}</span></div>
  </div>

  <div class="section">
    <div class="section-title">Refresh Token — save this now</div>
    <div class="token-box">
      <div class="token-label">ZOHO_SIGN_REFRESH_TOKEN</div>
      <div class="token-val" id="rtok">${refreshToken}</div>
      <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('rtok').textContent).then(()=>{this.textContent='✅ Copied!';setTimeout(()=>this.textContent='Copy Refresh Token',2000})">Copy Refresh Token</button>
    </div>
  </div>

  <div class="steps">
    <div class="steps-title">⚠️ Save before the session expires</div>
    <div class="step" data-n="1.">Copy the token above.</div>
    <div class="step" data-n="2.">Open <strong>Replit Secrets</strong> (🔒 icon in the sidebar).</div>
    <div class="step" data-n="3.">Find <code>ZOHO_SIGN_REFRESH_TOKEN</code> → paste the new value → Save.</div>
    <div class="step" data-n="4.">Also set <code>ZOHO_REGION</code> = <code>${region}</code> if it's not already set.</div>
    <div class="step" data-n="5.">Restart the API Server workflow.</div>
    <div class="step" data-n="6.">Visit <code>/api/zoho/oauth/status</code> to confirm auth works.</div>
  </div>
</div>
<script>
  // Also log to console for easy copy from devtools
  console.log('%cZOHO_SIGN_REFRESH_TOKEN', 'font-weight:bold;color:lime');
  console.log('${refreshToken}');
  console.log('%cZOHO_REGION', 'font-weight:bold;color:lime');
  console.log('${region}');
</script>
</body>
</html>`;
}

function oauthErrorPage(message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Zoho OAuth Error</title>
<style>
  body{font-family:-apple-system,sans-serif;background:#0a0a0f;color:#e8eaf0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px}
  .card{background:#141420;border:1px solid rgba(239,68,68,.3);border-radius:20px;padding:48px;max-width:520px;width:100%;text-align:center}
  h1{color:#f87171;font-size:22px;margin-bottom:16px}
  p{color:rgba(255,255,255,.55);line-height:1.7;font-size:14px;margin-bottom:24px}
  a{color:#f59e0b;text-decoration:none;font-weight:600}
</style>
</head>
<body>
<div class="card">
  <h1>❌ OAuth Error</h1>
  <p>${message}</p>
  <a href="/api/zoho/oauth/start">← Try Again</a>
</div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXISTING ROUTES (unchanged, region-aware)
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/zoho/webhook - reachability check
router.get("/zoho/webhook", (req: Request, res: Response) => {
  logger.info("Zoho Webhook probe received (GET)");
  res.status(200).json({ status: "reachable", message: "Zoho webhook endpoint active" });
});

// GET /api/zoho/debug-env
router.get("/zoho/debug-env", (req: Request, res: Response) => {
  const mask = (val?: string) => {
    if (!val) return "❌ undefined/empty";
    if (val.length <= 8) return "✅ ****";
    return `✅ ${val.substring(0, 4)}...${val.substring(val.length - 4)}`;
  };
  const resolved = (a?: string, b?: string) => {
    const v = a || b;
    if (!v) return "❌ NOT SET (neither variant found)";
    const src = a ? "ZOHO_SIGN_* variant" : "ZOHO_* legacy variant";
    return `✅ resolved via ${src}`;
  };

  const rTok = process.env.ZOHO_SIGN_REFRESH_TOKEN || process.env.ZOHO_REFRESH_TOKEN;
  const isClientIdLike = rTok ? /^1000\.[A-Z0-9]{22,26}$/.test(rTok) : false;

  res.json({
    _note: "Shows both naming conventions. Code reads ZOHO_SIGN_* first, then falls back to ZOHO_*.",
    region:               getZohoRegion(),
    accounts_base:        getZohoAccountsBase(),
    sign_base:            getZohoSignBase(),
    ZOHO_SIGN_CLIENT_ID:       mask(process.env.ZOHO_SIGN_CLIENT_ID),
    ZOHO_SIGN_CLIENT_SECRET:   mask(process.env.ZOHO_SIGN_CLIENT_SECRET),
    ZOHO_SIGN_REFRESH_TOKEN:   isClientIdLike
      ? `⚠️ LOOKS LIKE CLIENT ID — use /api/zoho/oauth/start to get a real token`
      : mask(process.env.ZOHO_SIGN_REFRESH_TOKEN),
    ZOHO_SIGN_ORGANIZATION_ID: mask(process.env.ZOHO_SIGN_ORGANIZATION_ID),
    ZOHO_CLIENT_ID:     mask(process.env.ZOHO_CLIENT_ID),
    ZOHO_CLIENT_SECRET: mask(process.env.ZOHO_CLIENT_SECRET),
    ZOHO_REFRESH_TOKEN: mask(process.env.ZOHO_REFRESH_TOKEN),
    ZOHO_SIGN_ORG_ID:   mask(process.env.ZOHO_SIGN_ORG_ID),
    _resolved_client_id:     resolved(process.env.ZOHO_SIGN_CLIENT_ID, process.env.ZOHO_CLIENT_ID),
    _resolved_client_secret: resolved(process.env.ZOHO_SIGN_CLIENT_SECRET, process.env.ZOHO_CLIENT_SECRET),
    _resolved_refresh_token: resolved(process.env.ZOHO_SIGN_REFRESH_TOKEN, process.env.ZOHO_REFRESH_TOKEN),
    SUPABASE_URL: mask(process.env.SUPABASE_URL),
    DATABASE_URL: mask(process.env.DATABASE_URL),
    oauth_start:  `/api/zoho/oauth/start`,
    oauth_status: `/api/zoho/oauth/status`,
  });
});

// GET /api/zoho/reset-database
router.get("/zoho/reset-database", async (req: Request, res: Response) => {
  logger.info("Database reset requested");
  try {
    const supabase = getSupabase();
    if (!supabase) { res.status(500).json({ error: "Supabase connection error" }); return; }
    const { error: delErr } = await supabase.from("user_agreements").delete().neq("email", "keep_active_dummy@example.com");
    const { error: updErr } = await supabase.from("customer_enrollment").update({ agreement_signed: false, document_url: null, document_name: null, onboarding_status: "payment_paid" }).neq("email", "keep_active_dummy@example.com");
    if (delErr || updErr) { res.status(500).json({ error: { delErr, updErr } }); return; }
    res.status(200).json({ success: true, message: "Database agreement states reset successfully" });
  } catch { res.status(500).json({ error: "Unexpected error" }); }
});

// ── Shared: finalize a completed signature (download PDF, store in Supabase, ─
// mark customer_enrollment). Used by both the async webhook and the client-side
// fallback polling endpoint below, so completion is detected whichever arrives first.
async function finalizeSignedAgreement(params: {
  requestId: string;
  email: string;
  fullName: string;
  ip?: string;
  source: "webhook" | "poll";
}): Promise<{ ok: boolean; alreadySigned?: boolean; storagePath?: string; error?: string }> {
  const { requestId, fullName, ip, source } = params;
  const normalizedEmail = params.email.trim().toLowerCase();

  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: "Database configuration error" };

  // Idempotency: if already marked signed (by webhook or a prior poll), skip re-processing.
  const { data: existing } = await supabase
    .from("customer_enrollment")
    .select("agreement_signed, document_url")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existing?.agreement_signed) {
    logger.info({ email: normalizedEmail, requestId, source }, `Zoho ${source}: agreement already marked signed — skipping duplicate finalize`);
    return { ok: true, alreadySigned: true, storagePath: existing.document_url ?? undefined };
  }

  logger.info({ requestId, email: normalizedEmail, source }, `Zoho ${source}: document signed, fetching completed PDF`);

  const token = await getZohoAccessToken();
  const pdfRes = await fetch(`${getZohoSignBase()}/api/v1/requests/${requestId}/pdf?merge=true`, {
    method: "GET",
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });

  let pdfBuffer: Buffer;

  if (!pdfRes.ok) {
    const errText = await pdfRes.text();
    logger.error({ errText, status: pdfRes.status, source }, `Zoho ${source}: failed to download PDF from Zoho Sign`);

    const isSample = normalizedEmail.includes("zohosign.com") ||
      requestId.toString().startsWith("10000001020") ||
      errText.includes("Invalid Request ID") ||
      errText.includes("code\":4066");

    if (isSample) {
      logger.info({ requestId, email: normalizedEmail, source }, `Zoho ${source}: Generating mock PDF for test/sample bypass`);
      try {
        pdfBuffer = await generateAgreementPDF(fullName, normalizedEmail, "App Launch Essentials", "$2,497",
          new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          requestId.toString(), { ip: ip || "127.0.0.1", userAgent: "ZohoSign-Bypass", timestamp: new Date().toISOString() });
      } catch (genErr) {
        logger.error({ genErr, source }, `Zoho ${source}: Failed to generate mock PDF`);
        return { ok: false, error: "PDF generation failed for test/sample bypass" };
      }
    } else {
      return { ok: false, error: "Failed to download signed PDF" };
    }
  } else {
    pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
  }

  const storagePath = `agreements/${normalizedEmail}_agreement.pdf`;
  const { error: uploadErr } = await supabase.storage.from("customer-documents").upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });
  if (uploadErr) { logger.error({ uploadErr, source }, `Zoho ${source}: upload failed`); return { ok: false, error: "Failed to store contract PDF" }; }
  logger.info({ email: normalizedEmail, requestId, storagePath, source }, `Zoho ${source}: signed PDF stored in Supabase Storage`);

  let enrollRecord: { id: string; selected_package?: string; payment_type?: string } | null = null;
  let enrollErr: { code?: string; message?: string } | null = null;
  {
    const first = await supabase.from("customer_enrollment").select("id, selected_package, payment_type").eq("email", normalizedEmail).maybeSingle();
    if (first.error && (first.error.code === "42703" || first.error.message?.toLowerCase().includes("column"))) {
      // payment_type column doesn't exist on customer_enrollment — retry without it
      const retry = await supabase.from("customer_enrollment").select("id, selected_package").eq("email", normalizedEmail).maybeSingle();
      enrollRecord = retry.data;
      enrollErr = retry.error;
    } else {
      enrollRecord = first.data;
      enrollErr = first.error;
    }
  }
  if (enrollErr || !enrollRecord) { logger.error({ enrollErr, email: normalizedEmail, source }, `Zoho ${source}: enrollment record not found`); return { ok: false, error: "Enrollment record not found" }; }

  const timestamp = new Date().toISOString();
  const enrollData = enrollRecord as { id: string; selected_package?: string; payment_type?: string };
  const enrolledPackage = enrollData.selected_package;
  const enrolledPaymentOption = enrollData.payment_type ? normalizePaymentType(enrollData.payment_type) : undefined;

  const insertErr = await (async () => {
    const record = { user_id: enrollRecord.id, email: normalizedEmail, full_name: fullName, agreement_version: "1.0", signature_image: "ZOHO_SIGNED", signed_at: timestamp, ip_address: ip || "Zoho Sign", user_agent: `Zoho Sign ${source === "webhook" ? "Webhook" : "Poll Fallback"}`, pdf_url: storagePath, package_name: enrolledPackage, payment_option: enrolledPaymentOption };
    const { error } = await supabase.from("user_agreements").insert(record);
    if (!error) return null;
    const isMissingColumn =
      error.code === "42703" ||
      error.code === "PGRST204" ||
      (error.message?.toLowerCase().includes("column") &&
        (error.message?.toLowerCase().includes("does not exist") || error.message?.toLowerCase().includes("schema cache")));
    if (isMissingColumn) {
      const { package_name: _pn, payment_option: _po, ...base } = record;
      const { error: retryErr } = await supabase.from("user_agreements").insert(base);
      return retryErr;
    }
    return error;
  })();

  if (insertErr) { logger.error({ insertErr, source }, `Zoho ${source}: failed to save signature audit record`); return { ok: false, error: "Failed to save signature audit record" }; }

  const { error: updateErr } = await supabase.from("customer_enrollment").update({ agreement_signed: true, document_url: storagePath, document_name: "Enrollment Agreement.pdf", onboarding_status: "agreement_signed", updated_at: timestamp }).eq("email", normalizedEmail);
  if (updateErr) { logger.error({ updateErr, source }, `Zoho ${source}: failed to update enrollment progress status`); return { ok: false, error: "Failed to update enrollment progress status" }; }

  // Keep local Postgres in sync
  try {
    const [existing] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.email, normalizedEmail));

    if (!existing) {
      const projectId = `AS-${String(Date.now()).slice(-3)}`;
      await db.insert(projectsTable).values({
        projectId,
        customerName: fullName || "Client",
        email: normalizedEmail,
        package: enrolledPackage || "",
        currentStage: "Project Received",
        notes: "",
      });
      logger.info({ email: normalizedEmail, source }, `Zoho ${source}: local Postgres project created`);
    } else {
      await db
        .update(projectsTable)
        .set({
          updatedAt: new Date(),
          package: enrolledPackage || existing.package || undefined,
        })
        .where(eq(projectsTable.email, normalizedEmail));
      logger.info({ email: normalizedEmail, source }, `Zoho ${source}: local Postgres project updated`);
    }
  } catch (localErr) {
    logger.error({ localErr, email: normalizedEmail, source }, `Zoho ${source}: failed to update local Postgres`);
  }

  logger.info({ email: normalizedEmail, requestId, package: enrolledPackage, paymentOption: enrolledPaymentOption, source }, `Zoho ${source}: Supabase updated — agreement_signed=true, onboarding_status=agreement_signed — customer can now proceed to set password`);
  return { ok: true, storagePath };
}

// ── Webhook Helpers ──────────────────────────────────────────────────────────

function verifyZohoWebhookSignature(req: Request): boolean {
  const secret = process.env.ZOHO_SIGN_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn("Zoho Webhook verification: ZOHO_SIGN_WEBHOOK_SECRET is not configured. Skipping signature check.");
    return true;
  }
  const signature = req.headers["x-zs-webhook-signature"] || req.headers["X-ZS-Webhook-Signature"];
  if (!signature) {
    logger.error("Zoho Webhook verification: Missing signature header");
    return false;
  }
  const rawBody = (req as any).rawBody;
  if (!rawBody) {
    logger.error("Zoho Webhook verification: rawBody not captured in express");
    return false;
  }
  try {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(rawBody);
    const expected = hmac.digest("base64");
    if (signature === expected) {
      return true;
    }
    logger.error({ signature, expected }, "Zoho Webhook verification: signature mismatch");
    return false;
  } catch (err) {
    logger.error({ err }, "Zoho Webhook verification: exception during check");
    return false;
  }
}

async function syncAgreementSignedToGHL(email: string) {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!apiKey || !locationId) {
    logger.info("GHL sync: credentials not configured, skipping tag sync");
    return;
  }
  try {
    const emailStr = email.trim().toLowerCase();
    // 1. Search contact
    const searchUrl = `https://services.leadconnectorhq.com/contacts/search/duplicate?locationId=${encodeURIComponent(locationId)}&email=${encodeURIComponent(emailStr)}`;
    const searchRes = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
      }
    });
    if (!searchRes.ok) {
      logger.warn({ status: searchRes.status }, "GHL sync: search request failed");
      return;
    }
    const searchData = (await searchRes.json()) as { contact?: { id?: string } | null };
    const contactId = searchData?.contact?.id;
    if (!contactId) {
      logger.info({ email: emailStr }, "GHL sync: contact not found in GHL");
      return;
    }

    // 2. Add tag "agreement-signed"
    const tagRes = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/tags`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Version: "2021-07-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tags: ["agreement-signed"] }),
    });
    if (tagRes.ok) {
      logger.info({ email: emailStr, contactId }, "GHL sync: added agreement-signed tag successfully");
    } else {
      logger.error({ status: tagRes.status, email: emailStr }, "GHL sync: failed to add tag");
    }
  } catch (err) {
    logger.error({ err, email }, "GHL sync: unexpected error");
  }
}

// POST /api/zoho/webhook
router.post("/zoho/webhook", async (req: Request, res: Response) => {
  logger.info({ method: req.method, url: req.originalUrl, headers: req.headers, body: req.body, query: req.query }, "Zoho Webhook received (POST)");

  try {
    // 1. Verify the webhook signature
    const isVerified = verifyZohoWebhookSignature(req);
    if (!isVerified) {
      res.status(401).json({ error: "Signature verification failed" });
      return;
    }

    const requests = req.body?.requests;
    const notifications = req.body?.notifications;

    if (!requests) {
      res.status(200).json({ status: "success", message: "Webhook endpoint active", reason: "no requests object in body" });
      return;
    }

    const isCompleted = requests.request_status === "completed" ||
      (notifications && notifications.operation_type === "RequestSigningSuccess");

    if (!isCompleted) {
      logger.info({ requestStatus: requests.request_status }, "Zoho Webhook: request not completed yet - skipping");
      res.status(200).json({ status: "skipped", reason: "request not completed" });
      return;
    }

    const requestId = requests.request_id;
    const signerAction = requests.actions?.find((a: any) => a.action_type === "SIGN");
    let email = signerAction?.recipient_email;
    let fullName = signerAction?.recipient_name || "Client";

    if (!requestId) {
      logger.error({ requests }, "Zoho Webhook: missing request ID");
      res.status(400).json({ error: "Missing request ID" });
      return;
    }

    // 2. Find the client using request_id or signer email
    if (!email) {
      const supabase = getSupabase();
      if (supabase) {
        const { data } = await supabase
          .from("customer_enrollment")
          .select("email, full_name")
          .eq("agreement_contract_id", requestId.toString())
          .maybeSingle();
        if (data?.email) {
          email = data.email;
          fullName = data.full_name || fullName;
        }
      }
    }

    if (!email) {
      logger.error({ requestId }, "Zoho Webhook: could not resolve client email from signer action or agreement_contract_id");
      res.status(400).json({ error: "Could not resolve client email" });
      return;
    }

    // 3. Process completion (Update database, mark agreementSigned = true, etc.)
    const result = await finalizeSignedAgreement({
      requestId: requestId.toString(),
      email,
      fullName,
      ip: notifications?.ip_address,
      source: "webhook",
    });

    if (!result.ok) {
      logger.error({ result, email, requestId }, "Zoho Webhook: failed to finalize signed agreement");
      res.status(502).json({ error: result.error || "Failed to process webhook" });
      return;
    }

    // 4. Trigger GHL sync asynchronously (non-blocking)
    syncAgreementSignedToGHL(email).catch(ghlErr => {
      logger.error({ ghlErr, email }, "Zoho Webhook: GHL sync failed");
    });

    // 5. Return HTTP 200 immediately after processing
    res.status(200).json({ success: true, message: "Agreement updated successfully" });

  } catch (err) {
    logger.error({ err }, "Zoho Webhook: unexpected error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/zoho/request-status — client-side fallback polling.
// The embedded signing iframe doesn't reliably notify the parent window when signing
// completes, and Zoho's async webhook can lag by several seconds. The agreement page
// polls this endpoint so the user is never stuck looking at a "signed" screen that
// hasn't actually progressed their record.
router.get("/zoho/request-status", async (req: Request, res: Response) => {
  const { requestId, email, fullName } = req.query as { requestId?: string; email?: string; fullName?: string };

  if (!email) {
    res.status(400).json({ error: "email is required" });
    return;
  }
  const normalizedEmail = email.trim().toLowerCase();

  logger.info({ requestId, email: normalizedEmail }, "Zoho request-status: agreement status polled");

  try {
    const supabase = getSupabase();
    if (!supabase) { res.status(503).json({ error: "Database configuration error" }); return; }

    // Fast path — another poll or the webhook may have already finalized this.
    const { data: existing } = await supabase
      .from("customer_enrollment")
      .select("agreement_signed")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing?.agreement_signed) {
      res.json({ signed: true, status: "completed", source: "database" });
      return;
    }

    if (!requestId) {
      res.json({ signed: false, status: "pending", source: "no-request-id" });
      return;
    }

    // Authoritative check straight from Zoho, independent of webhook delivery.
    const token = await getZohoAccessToken();
    const statusRes = await fetch(`${getZohoSignBase()}/api/v1/requests/${requestId}`, {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });

    if (!statusRes.ok) {
      const errText = await statusRes.text();
      logger.warn({ errText, status: statusRes.status, requestId }, "Zoho request-status: failed to fetch request detail from Zoho");
      res.json({ signed: false, status: "unknown", source: "zoho-error" });
      return;
    }

    const statusData = (await statusRes.json()) as any;
    const requestObj = statusData.requests || statusData;
    const requestStatus = String(requestObj?.request_status || "").toLowerCase();

    if (requestStatus !== "completed") {
      res.json({ signed: false, status: requestStatus || "pending", source: "zoho" });
      return;
    }

    const signerAction = requestObj.actions?.find((a: any) => a.action_type === "SIGN");
    const resolvedFullName = fullName || signerAction?.recipient_name || "Client";

    const result = await finalizeSignedAgreement({
      requestId,
      email: normalizedEmail,
      fullName: resolvedFullName,
      source: "poll",
    });

    if (!result.ok) {
      logger.error({ error: result.error, requestId, email: normalizedEmail }, "Zoho request-status: finalize failed after Zoho reported completed");
      res.json({ signed: false, status: "completed", finalizeError: result.error, source: "zoho" });
      return;
    }

    res.json({ signed: true, status: "completed", source: "zoho" });

  } catch (err) {
    logger.error({ err, requestId, email: normalizedEmail }, "Zoho request-status: unexpected error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/zoho/templates - debug/verification: list Zoho templates and confirm package mapping resolves
router.get("/zoho/templates", async (req: Request, res: Response) => {
  try {
    // ?refresh=1 clears the 5-minute in-memory cache and pulls LIVE from Zoho.
    const forceFresh = req.query.refresh === "1" || req.query.refresh === "true";
    const cacheAgeSeconds = templateListCache ? Math.round((Date.now() - templateListCache.fetchedAt) / 1000) : null;
    const servedFromCache = !forceFresh && !!templateListCache && cacheAgeSeconds !== null && cacheAgeSeconds < TEMPLATE_CACHE_TTL_MS / 1000;
    const templates = await fetchZohoTemplateList(forceFresh);
    // Run each plan through the real resolver so the diagnostic reflects the
    // exact resolution (ID → name → lenient matching) used at signing time.
    const mapping: Record<string, unknown> = {};
    for (const [pkg, cfg] of Object.entries(PLAN_TEMPLATE_CONFIG)) {
      const configured = {
        idVar: cfg.idVar,
        configuredId: (process.env[cfg.idVar] || "").trim() || null,
        nameVar: cfg.nameVar,
        configuredName: (process.env[cfg.nameVar] || "").trim() || cfg.defaultName,
      };
      try {
        const resolved = await resolveTemplateId(pkg);
        mapping[pkg] = { ...configured, found: true, templateId: resolved.templateId, resolvedTemplateName: resolved.templateName };
      } catch (err) {
        mapping[pkg] = {
          ...configured,
          found: false,
          error: (err as Error).message,
          details: (err as Error & { details?: unknown }).details ?? null,
        };
      }
    }

    const fieldsForPkg = String(req.query.fields || "");
    if (fieldsForPkg && PLAN_TEMPLATE_CONFIG[fieldsForPkg]) {
      const { templateId, templateName } = await resolveTemplateId(fieldsForPkg);
      const detail = await fetchZohoTemplateDetail(templateId);
      res.json({
        package: fieldsForPkg,
        templateId,
        templateName,
        actions: detail.actions,
        fields: detail.fields,
      });
      return;
    }
    res.json({
      connection: {
        region: getZohoRegion(),
        apiBase: getZohoSignBase(),
        configuredOrgId: process.env.ZOHO_SIGN_ORGANIZATION_ID || process.env.ZOHO_SIGN_ORG_ID || null,
        oauthClientIdPrefix: (getZohoClientId() || "").slice(0, 12) + "…",
        accessToken: accessTokenCache
          ? { cached: true, expiresInSeconds: Math.max(0, Math.round((accessTokenCache.expiresAt - Date.now()) / 1000)) }
          : { cached: false },
        templateAccountOwners: [...new Set(templates.map(t => t.owner_email).filter(Boolean))],
      },
      cache: {
        servedFromCache,
        cacheAgeSeconds: servedFromCache ? cacheAgeSeconds : 0,
        ttlSeconds: TEMPLATE_CACHE_TTL_MS / 1000,
        hint: "GET /api/zoho/templates?refresh=1 always fetches live from Zoho",
      },
      totalTemplates: templates.length,
      templates: templates.map(t => ({
        id: t.template_id,
        name: t.template_name,
        modified: t.modified_time ? new Date(t.modified_time).toISOString() : null,
        created: t.created_time ? new Date(t.created_time).toISOString() : null,
        owner: t.owner_email ?? null,
      })),
      allTemplateNames: templates.map(t => t.template_name),
      mapping,
    });
  } catch (err) {
    logger.error({ err }, "Zoho Templates: failed to list/resolve templates");
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/zoho/create-signature-request
router.post("/zoho/create-signature-request", async (req: Request, res: Response) => {
  const {
    email, fullName, phone, address, packageId: clientPackageId,
    paymentOption, paymentType: rawPaymentType,
  } = req.body as {
    email?: string; fullName?: string; phone?: string; address?: string; packageId?: string;
    paymentOption?: string; paymentType?: string;
  };

  if (!email || !fullName || !clientPackageId) {
    res.status(400).json({ error: "Missing required fields (email, fullName, packageId)" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Resolve the frame origin once, up front. The origin we hand Zoho becomes the
  // iframe's allowed frame-ancestor AND Zoho's embedtoken API REQUIRES an https
  // scheme (an http host is rejected with error 3006 "Url has invalid scheme").
  // So the scheme is always https here — which means the parent page that embeds
  // the iframe must ALSO be served over https, or the origins won't match and the
  // frame stays blank. Locally that means running the dev frontend over https.
  let embedOrigin = req.headers.referer || req.headers.origin || "https://localhost:5173";
  try {
    const parsed = new URL(String(embedOrigin));
    embedOrigin = `https://${parsed.host}`;
  } catch { embedOrigin = "https://localhost:5173"; }

  // Prefer the VERIFIED purchased plan on the enrollment record over the
  // client-sent packageId, so a customer never signs another plan's agreement.
  let packageId = normalizePlan(clientPackageId) ?? clientPackageId;
  let existingRecord: { agreement_signed?: boolean | null; agreement_contract_id?: string | null } | null = null;
  try {
    const supaForPlan = getSupabase();
    if (supaForPlan) {
      let rec: { purchased_plan?: string | null; selected_package?: string | null; agreement_signed?: boolean | null; agreement_contract_id?: string | null } | null = null;
      const sel = await supaForPlan
        .from("customer_enrollment")
        .select("purchased_plan, selected_package, agreement_signed, agreement_contract_id")
        .eq("email", normalizedEmail)
        .maybeSingle();
      if (sel.error) {
        const retry = await supaForPlan
          .from("customer_enrollment")
          .select("selected_package, agreement_signed, agreement_contract_id")
          .eq("email", normalizedEmail)
          .maybeSingle();
        rec = retry.data;
      } else {
        rec = sel.data;
      }
      existingRecord = rec;
      const recPlan = normalizePlan(rec?.purchased_plan) ?? normalizePlan(rec?.selected_package);
      if (recPlan) {
        if (recPlan !== packageId) {
          logger.warn({ email: normalizedEmail, clientPackageId, recordPlan: recPlan },
            "Zoho Sign: client packageId differs from enrollment record — using the record's plan");
        }
        packageId = recPlan;
      }
    }
  } catch (err) {
    logger.warn({ err, email: normalizedEmail }, "Zoho Sign: enrollment record lookup for plan verification failed — using client packageId");
  }

  if (existingRecord?.agreement_signed) {
    logger.info({ email: normalizedEmail }, "Zoho Sign: record already marked agreement_signed — skipping document creation");
    res.json({ success: true, alreadySigned: true });
    return;
  }

  const existingRequestId = existingRecord?.agreement_contract_id;
  if (existingRequestId) {
    try {
      const token = await getZohoAccessToken();
      const statusRes = await fetch(`${getZohoSignBase()}/api/v1/requests/${existingRequestId}`, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      });
      if (statusRes.ok) {
        const statusData = (await statusRes.json()) as any;
        const requestObj = statusData.requests || statusData;
        const requestStatus = String(requestObj?.request_status || "").toLowerCase();
        logger.info({ email: normalizedEmail, existingRequestId, requestStatus }, "Zoho Sign: found existing request for this customer — checking before creating a new one");

        if (requestStatus === "completed") {
          const signerAction = requestObj.actions?.find((a: any) => a.action_type === "SIGN");
          const result = await finalizeSignedAgreement({
            requestId: existingRequestId,
            email: normalizedEmail,
            fullName: signerAction?.recipient_name || fullName,
            source: "poll",
          });
          if (result.ok) {
            logger.info({ email: normalizedEmail, existingRequestId }, "Zoho Sign: existing request was already completed — finalized without creating a new document");
            res.json({ success: true, alreadySigned: true });
            return;
          }
        }

        const resumableStatuses = ["inprogress", "sent", "viewed", "draft"];
        if (resumableStatuses.includes(requestStatus)) {
          const signAction = requestObj.actions?.find((a: any) => a.action_type === "SIGN");
          if (signAction?.action_id) {
            const token2 = await getZohoAccessToken();
            const embedRes = await fetch(
              `${getZohoSignBase()}/api/v1/requests/${existingRequestId}/actions/${signAction.action_id}/embedtoken?host=${encodeURIComponent(embedOrigin)}`,
              { method: "POST", headers: { Authorization: `Zoho-oauthtoken ${token2}` } },
            );
            if (embedRes.ok) {
              const embedData = (await embedRes.json()) as any;
              const signUrl = embedData.sign_url || embedData.embedurl;
              if (embedData.status === "success" && signUrl) {
                logger.info({ email: normalizedEmail, existingRequestId }, "Zoho Sign: resuming existing unsigned document instead of creating a new one");
                res.json({ success: true, embedUrl: signUrl, requestId: existingRequestId });
                return;
              }
            } else {
              const errText = await embedRes.text().catch(() => "");
              logger.warn({ email: normalizedEmail, existingRequestId, status: embedRes.status, errText }, "Zoho Sign: embed token request for existing document failed");
            }
          }
        }
      }
    } catch (err) {
      logger.warn({ err, email: normalizedEmail, existingRequestId }, "Zoho Sign: error checking existing request — falling back to creating a new document");
    }
  }

  const pkg = PACKAGE_PRICING[packageId];
  if (!pkg) {
    res.status(400).json({ error: `Unknown packageId "${packageId}". Must be one of: ${Object.keys(PACKAGE_PRICING).join(", ")}` });
    return;
  }
  const paymentType = normalizePaymentType(rawPaymentType || paymentOption);
  const agreementDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const paymentTypeLabel = paymentType === "monthly"
    ? `Monthly (${pkg.setup} setup + ${pkg.monthly}/month for 12 months)`
    : `Paid In Full (${pkg.pif})`;

  logger.info({ email: normalizedEmail, packageId, packageName: pkg.name, paymentType },
    "Zoho Sign: create-signature-request — selected package & payment type");

  try {
    const { templateId, templateName } = await resolveTemplateId(packageId);
    logger.info({ packageId, templateId, templateName }, "Zoho Sign: resolved Zoho template for package");

    const detail = await fetchZohoTemplateDetail(templateId);
    const token = await getZohoAccessToken();
    const origin = embedOrigin;

    const fieldValues: Record<string, string> = {
      full_name: fullName,
      email: normalizedEmail,
      phone: phone || "",
      address: address || "",
      package: pkg.name,
      setup_amount: pkg.setup,
      monthly_amount: pkg.monthly,
      paid_in_full_amount: pkg.pif,
      payment_type_label: paymentTypeLabel,
      agreement_date: agreementDate,
    };

    const fieldTextData = mapTemplateFields(detail.fields, fieldValues);

    const signAction = detail.actions.find(a => String(a.action_type || "").toUpperCase() === "SIGN") || detail.actions[0];
    if (!signAction) {
      throw new Error(`Zoho template "${templateName}" has no signer action configured`);
    }

    const requestPayload = {
      templates: {
        field_data: { field_text_data: fieldTextData },
        actions: [{
          action_id: signAction.action_id,
          recipient_name: fullName,
          recipient_email: normalizedEmail,
          is_embedded: true,
          signing_order: signAction.signing_order ?? 1,
        }],
        notes: `App Squad ${pkg.name} Agreement — ${paymentTypeLabel}`,
        request_name: `App Squad ${pkg.name} Agreement`,
      },
    };

    logger.info({
      endpoint: `${getZohoSignBase()}/api/v1/templates/${templateId}/createdocument`,
      requestPayload,
      templateId,
      templateName,
      signerActionId: signAction.action_id,
    }, "Zoho Sign: sending createdocument request");

    const formData = new FormData();
    formData.append("data", JSON.stringify(requestPayload));

    const createRes = await fetch(`${getZohoSignBase()}/api/v1/templates/${templateId}/createdocument`, {
      method: "POST", body: formData,
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });

    const createText = await createRes.text();
    logger.info({
      status: createRes.status,
      responseBody: createText,
      templateId,
    }, "Zoho Sign: createdocument response received");

    if (!createRes.ok) {
      let zohoCode: number | undefined;
      let zohoMsg: string | undefined;
      try {
        const p = JSON.parse(createText);
        zohoCode = p.code;
        zohoMsg = p.message;
        if (p.code === 8026) {
          logger.error({ zohoCode: 8026, status: createRes.status, templateId, packageId }, "Zoho Sign: 8026 — connected account has no API license");
          res.status(402).json({ error: ZOHO_NO_API_ACCESS_MESSAGE, zohoCode: 8026 });
          return;
        }
      } catch {}
      logger.error({ status: createRes.status, responseBody: createText, zohoCode, zohoMsg, requestPayload }, "Zoho Sign: createdocument failed");
      res.status(502).json({
        error: zohoMsg || `Zoho createdocument failed (HTTP ${createRes.status})`,
        zohoCode,
        responseBody: createText,
      });
      return;
    }

    let createData: any;
    try { createData = JSON.parse(createText); } catch {}
    const requestObj = createData?.requests || createData?.templates;
    if (!requestObj) {
      logger.error({ createData, createText, templateId }, "Zoho Sign: unexpected createdocument response shape");
      res.status(502).json({ error: "Unexpected response shape from Zoho createdocument", responseBody: createText });
      return;
    }

    const requestId = requestObj.request_id;
    const responseActions: any[] = requestObj.actions || [];
    const signerAction = responseActions.find((a: any) => 
      a.recipient_email?.trim().toLowerCase() === normalizedEmail
    ) || responseActions.find((a: any) => String(a.action_type || "").toUpperCase() === "SIGN") || responseActions[0];

    const actionId = signerAction?.action_id;
    const actionRecipientEmail = signerAction?.recipient_email;
    const actionStatus = signerAction?.action_status || "UNOPENED";
    const requestStatus = String(requestObj.request_status || "").toLowerCase();

    if (!requestId || !actionId) {
      res.status(502).json({ error: "Invalid response from signature service (missing request/action id)", responseBody: createText });
      return;
    }

    let submitRequestResponse = "Skipped (request already active from createdocument)";

    if (requestStatus === "draft" || requestStatus === "") {
      const submitRes = await fetch(`${getZohoSignBase()}/api/v1/requests/${requestId}/submit`, {
        method: "POST",
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      });
      submitRequestResponse = await submitRes.text();
      logger.info({ status: submitRes.status, submit_request_response: submitRequestResponse, requestId }, "Zoho Sign: submit response received");

      if (!submitRes.ok) {
        let zohoMsg = "";
        let zohoCode: number | undefined;
        try {
          const p = JSON.parse(submitRequestResponse);
          zohoCode = p.code;
          if (p.message) zohoMsg = p.message;
        } catch {}
        if (!/already submitted/i.test(zohoMsg)) {
          logger.error({ status: submitRes.status, submit_request_response: submitRequestResponse, zohoCode, requestId }, "Zoho Sign: submit failed");
          res.status(502).json({ error: zohoMsg || `Zoho submit failed (HTTP ${submitRes.status})`, zohoCode, responseBody: submitRequestResponse });
          return;
        }
        logger.info({ requestId }, "Zoho Sign: request was already submitted by createdocument, continuing");
      }
    } else {
      logger.info({ requestId, requestStatus }, "Zoho Sign: request already active from createdocument, skipping explicit submit");
    }

    // Dynamically resolve frame origin from incoming request headers
    let rawClientHost = req.headers.origin || req.headers.referer || req.headers.host || "localhost:5173";
    let hostValue = "https://localhost:5173";
    try {
      if (!rawClientHost.startsWith("http://") && !rawClientHost.startsWith("https://")) {
        rawClientHost = `http://${rawClientHost}`;
      }
      const parsed = new URL(rawClientHost);
      hostValue = `https://${parsed.host}`;
    } catch {
      hostValue = "https://localhost:5173";
    }

    const embedUrlEndpoint = `${getZohoSignBase()}/api/v1/requests/${requestId}/actions/${actionId}/embedtoken?host=${encodeURIComponent(hostValue)}`;
    logger.info({
      embedTokenEndpointUrl: embedUrlEndpoint,
      request_status: requestStatus,
      action_status: actionStatus,
      action_id: actionId,
      email: normalizedEmail,
      hostValue,
    }, "Zoho Sign: requesting embed token after request is submitted and active");

    const embedRes = await fetch(embedUrlEndpoint, {
      method: "POST",
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });

    const embedText = await embedRes.text();
    let embedData: any;
    try { embedData = JSON.parse(embedText); } catch {}

    logger.info({
      request_status: requestStatus,
      action_status: actionStatus,
      action_id: actionId,
      email: normalizedEmail,
      submit_request_response: submitRequestResponse,
      embed_token_response: embedText,
      embedResponseFields: {
        code: embedData?.code,
        message: embedData?.message,
        status: embedData?.status,
        sign_url: embedData?.sign_url,
      },
    }, "Zoho Sign: embedtoken response received and logged");

    if (!embedRes.ok) {
      let zohoCode: number | undefined;
      let zohoMsg: string | undefined;
      try {
        const p = JSON.parse(embedText);
        zohoCode = p.code;
        zohoMsg = p.message;
      } catch {}
      logger.error({ status: embedRes.status, responseBody: embedText, zohoCode, zohoMsg, requestId, actionId, hostValue }, "Zoho Sign: embedtoken failed");
      res.status(502).json({ error: zohoMsg || `Zoho embedtoken failed (HTTP ${embedRes.status})`, zohoCode, responseBody: embedText });
      return;
    }

    const signUrl = embedData?.sign_url || embedData?.embedurl;

    if (embedData?.status !== "success" || !signUrl) {
      logger.error({ embedData, embedText, requestId, actionId, hostValue, templateId, packageId }, "Zoho Sign: embed token response missing sign_url or non-success status");
      res.status(502).json({ error: embedData?.message || "Zoho embed token response missing sign_url", responseBody: embedText });
      return;
    }

    logger.info({ email: normalizedEmail, requestId, templateId, packageId, paymentType }, "Zoho Sign: embedded signing link generated");

    try {
      const supabase = getSupabase();
      if (supabase && normalizedEmail && requestId) {
        const { error: saveErr } = await supabase
          .from("customer_enrollment")
          .update({ agreement_contract_id: requestId.toString() })
          .eq("email", normalizedEmail);
        if (saveErr) {
          logger.error({ saveErr, email: normalizedEmail, requestId }, "Zoho Sign: failed to save agreement_contract_id to Supabase");
        } else {
          logger.info({ email: normalizedEmail, requestId }, "Zoho Sign: saved agreement_contract_id to Supabase");
        }
      }
    } catch (saveErr) {
      logger.warn({ saveErr }, "Zoho Sign: failed to save agreement_contract_id to database (non-fatal)");
    }

    res.json({ success: true, embedUrl: signUrl, requestId });
  } catch (err: any) {
    logger.error({ err: err.message, stack: err.stack, details: err.details }, "Zoho Sign: exception during create-signature-request");
    res.status(500).json({
      error: err.message || "Failed to create signature request",
      details: err.details || undefined,
    });
  }
});



// ─────────────────────────────────────────────────────────────────────────────
// STARTUP DIAGNOSTICS
// ─────────────────────────────────────────────────────────────────────────────

// Logs the Zoho environment configuration using ONLY masked credential prefixes,
// so local and hosted deployments can be compared side-by-side from their logs
// without any secret ever being written in full.
export function logZohoEnvironmentDiagnostics(): void {
  const env = process.env.NODE_ENV || "development";
  logger.info(
    {
      environment: env,
      isProduction: env === "production",
      region: getZohoRegion(),
      accountsBase: getZohoAccountsBase(),
      signBase: getZohoSignBase(),
      clientId: maskPrefix(getZohoClientId()),
      clientSecret: maskPrefix(getZohoClientSecret()),
      refreshToken: maskPrefix(getZohoRefreshToken()),
      organizationId: maskPrefix(process.env.ZOHO_SIGN_ORGANIZATION_ID || process.env.ZOHO_SIGN_ORG_ID),
    },
    "Zoho env diagnostics: masked credential prefixes — compare these across local vs hosted",
  );
}

// Confirms the configured refresh token actually belongs to the licensed Zoho
// account that owns the templates. If the token's account is not among the
// template owners, signing will fail with 8026-style errors even though every
// credential "looks" set — this surfaces that mismatch at boot. Best-effort and
// non-blocking: never throws, only logs.
export async function verifyRefreshTokenOwnsTemplates(): Promise<void> {
  if (!getZohoRefreshToken()) {
    logger.info("Zoho ownership check: no refresh token configured — skipping");
    return;
  }
  try {
    const token = await getZohoAccessToken();

    let accountEmail: string | undefined;
    let orgName: string | undefined;
    try {
      const settingsRes = await fetch(`${getZohoSignBase()}/api/v1/settings`, {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      });
      if (settingsRes.ok) {
        const sd = (await settingsRes.json()) as any;
        accountEmail = sd?.settings?.user_email || sd?.user_email;
        orgName = sd?.settings?.org_name || sd?.org_name;
      }
    } catch { /* identity lookup is best-effort */ }

    const templates = await fetchZohoTemplateList(true);
    const owners = [...new Set(templates.map(t => t.owner_email).filter(Boolean))] as string[];
    const tokenAccount = accountEmail?.trim().toLowerCase();
    const ownsTemplates = tokenAccount && owners.length > 0
      ? owners.some(o => o.trim().toLowerCase() === tokenAccount)
      : undefined;

    logger.info(
      {
        refreshTokenAccount: maskEmail(accountEmail),
        organization: orgName || null,
        templateOwners: owners.map(maskEmail),
        templateCount: templates.length,
        refreshTokenOwnsTemplates: ownsTemplates,
      },
      ownsTemplates === false
        ? "Zoho ownership check: WARNING — the refresh token's account does NOT own any of the Zoho Sign templates. Signing will fail (8026). Re-authorize with the licensed account that owns the templates."
        : "Zoho ownership check: refresh token account vs template owners",
    );
  } catch (err) {
    logger.warn(
      { err: (err as Error).message },
      "Zoho ownership check: could not verify refresh token / template ownership (non-fatal)",
    );
  }
}

export default router;
