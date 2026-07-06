import { Router, type IRouter, type Request, type Response } from "express";
import { logger } from "../lib/logger";
import { generateAgreementPDF } from "../lib/pdf";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const router: IRouter = Router();

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
async function getZohoAccessToken(): Promise<string> {
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

  const data = (await res.json()) as { access_token?: string; error?: string; message?: string };

  if (!res.ok || !data.access_token) {
    throw new Error(
      `Failed to refresh Zoho access token (region=${getZohoRegion()}): ` +
      (data.error || data.message || `HTTP ${res.status}`)
    );
  }

  return data.access_token;
}

// ── OAuth redirect URI ────────────────────────────────────────────────────────
function getOAuthRedirectUri(req: Request): string {
  // Allow explicit override via env var
  if (process.env.ZOHO_OAUTH_REDIRECT_URI) return process.env.ZOHO_OAUTH_REDIRECT_URI;
  const domains = process.env.REPLIT_DOMAINS || "";
  const primary = domains.split(",")[0].trim();
  if (primary) return `https://${primary}/api/zoho/oauth/callback`;
  // Fallback: derive from request
  const host = req.headers.host || "localhost";
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}/api/zoho/oauth/callback`;
}

// ── Token persistence (survives process restarts) ─────────────────────────────
const TOKEN_FILE = path.join("/tmp", "zoho_oauth_result.json");

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
  }
  if (tokenData.region) {
    process.env.ZOHO_REGION = tokenData.region;
  }
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

const ZOHO_SCOPES = "ZohoSign.documents.ALL,ZohoSign.templates.ALL,ZohoSign.account.READ";

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
  const clientId = getZohoClientId() || "";
  res.send(manualExchangePage(clientId, getZohoRegion()));
});

// POST /api/zoho/oauth/manual — exchange a pasted auth code for a refresh token
router.post("/zoho/oauth/manual", async (req: Request, res: Response) => {
  const { code, region: bodyRegion, client_id, client_secret } = req.body as Record<string, string>;

  if (!code?.trim()) {
    res.status(400).send(oauthErrorPage("No authorization code provided. Go back and paste the code from Zoho API Console."));
    return;
  }

  const region     = (bodyRegion || getZohoRegion()).toLowerCase().trim();
  const clientId   = (client_id?.trim())     || getZohoClientId()     || "";
  const clientSec  = (client_secret?.trim()) || getZohoClientSecret() || "";

  if (!clientId || !clientSec) {
    res.status(400).send(oauthErrorPage("Client ID or Client Secret missing. Fill them in on the form or set ZOHO_SIGN_CLIENT_ID / ZOHO_SIGN_CLIENT_SECRET in Replit Secrets."));
    return;
  }

  const params = new URLSearchParams();
  params.append("grant_type",    "authorization_code");
  params.append("code",          code.trim());
  params.append("client_id",     clientId);
  params.append("client_secret", clientSec);
  // Self Client doesn't require redirect_uri — omitting it

  logger.info({ region, clientIdPrefix: clientId.slice(0, 12) }, "Manual exchange: exchanging Self Client code for tokens");

  let tokenData: { access_token?: string; refresh_token?: string; error?: string; message?: string };

  try {
    const tokenRes = await fetch(`https://accounts.zoho.${region}/oauth/v2/token`, {
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
function manualExchangePage(clientId: string, currentRegion: string): string {
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
  <p class="sub">Use Zoho's Self Client to generate a one-time code without any redirect URI</p>

  <div class="card">
    <div class="card-title">Step 1 — Generate a code in Zoho API Console</div>
    <div class="step"><span class="step-n">1</span><div>Go to <a href="https://api-console.zoho.com" target="_blank">api-console.zoho.com</a> — make sure you're logged into the <strong>correct Zoho account</strong></div></div>
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

// POST /api/zoho/webhook
router.post("/zoho/webhook", async (req: Request, res: Response) => {
  logger.info({ method: req.method, url: req.originalUrl, headers: req.headers, body: req.body, query: req.query }, "Zoho Webhook request received (POST)");

  try {
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
    const email = signerAction?.recipient_email;
    const fullName = signerAction?.recipient_name || "Client";

    if (!email || !requestId) {
      logger.error({ requests }, "Zoho Webhook: missing signer email or request ID");
      res.status(400).json({ error: "Missing email or request ID" });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    logger.info({ requestId, email: normalizedEmail }, "Zoho Webhook: document signed, fetching completed PDF");

    const token = await getZohoAccessToken();
    const pdfRes = await fetch(`${getZohoSignBase()}/api/v1/requests/${requestId}/pdf?merge=true`, {
      method: "GET",
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });

    let pdfBuffer: Buffer;

    if (!pdfRes.ok) {
      const errText = await pdfRes.text();
      logger.error({ errText, status: pdfRes.status }, "Zoho Webhook: failed to download PDF from Zoho Sign");

      const isSample = normalizedEmail.includes("zohosign.com") ||
        requestId.toString().startsWith("10000001020") ||
        errText.includes("Invalid Request ID") ||
        errText.includes("code\":4066");

      if (isSample) {
        logger.info({ requestId, email: normalizedEmail }, "Zoho Webhook: Generating mock PDF for test/sample bypass");
        try {
          pdfBuffer = await generateAgreementPDF(fullName, normalizedEmail, "App Launch Essentials", "$2,497",
            new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
            requestId.toString(), { ip: "127.0.0.1", userAgent: "ZohoSign-Bypass", timestamp: new Date().toISOString() });
        } catch (genErr) {
          logger.error({ genErr }, "Zoho Webhook: Failed to generate mock PDF");
          res.status(200).json({ status: "success", message: "Webhook processed (test/sample bypass but PDF generation failed)" });
          return;
        }
      } else {
        res.status(502).json({ error: "Failed to download signed PDF" });
        return;
      }
    } else {
      pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
    }

    const supabase = getSupabase();
    if (!supabase) { res.status(503).json({ error: "Database configuration error" }); return; }

    const storagePath = `agreements/${normalizedEmail}_agreement.pdf`;
    const { error: uploadErr } = await supabase.storage.from("customer-documents").upload(storagePath, pdfBuffer, { contentType: "application/pdf", upsert: true });
    if (uploadErr) { logger.error({ uploadErr }, "Zoho Webhook: upload failed"); res.status(502).json({ error: "Failed to store contract PDF" }); return; }

    const { data: enrollRecord, error: enrollErr } = await supabase.from("customer_enrollment").select("id, selected_package").eq("email", normalizedEmail).maybeSingle();
    if (enrollErr || !enrollRecord) { logger.error({ enrollErr, email: normalizedEmail }, "Zoho Webhook: enrollment record not found"); res.status(404).json({ error: "Enrollment record not found" }); return; }

    const ip = notifications?.ip_address || "Zoho Sign";
    const timestamp = new Date().toISOString();
    const enrolledPackage = (enrollRecord as { id: string; selected_package?: string }).selected_package;

    const webhookInsertErr = await (async () => {
      const record = { user_id: enrollRecord.id, email: normalizedEmail, full_name: fullName, agreement_version: "1.0", signature_image: "ZOHO_SIGNED", signed_at: timestamp, ip_address: ip, user_agent: "Zoho Sign Webhook", pdf_url: storagePath, package_name: enrolledPackage, payment_option: undefined as string | undefined };
      const { error } = await supabase.from("user_agreements").insert(record);
      if (!error) return null;
      const isMissingColumn = error.code === "42703" || (error.message?.toLowerCase().includes("column") && error.message?.toLowerCase().includes("does not exist"));
      if (isMissingColumn) {
        const { package_name: _pn, payment_option: _po, ...base } = record;
        const { error: retryErr } = await supabase.from("user_agreements").insert(base);
        return retryErr;
      }
      return error;
    })();

    if (webhookInsertErr) { res.status(502).json({ error: "Failed to save signature audit record" }); return; }

    const { error: updateErr } = await supabase.from("customer_enrollment").update({ agreement_signed: true, document_url: storagePath, document_name: "Enrollment Agreement.pdf", onboarding_status: "agreement_signed", updated_at: new Date().toISOString() }).eq("email", normalizedEmail);
    if (updateErr) { res.status(502).json({ error: "Failed to update enrollment progress status" }); return; }

    logger.info({ email: normalizedEmail }, "Zoho Webhook: agreement processed successfully");
    res.status(200).json({ success: true, message: "Agreement updated successfully" });

  } catch (err) {
    logger.error({ err }, "Zoho Webhook: unexpected error");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/zoho/create-signature-request
router.post("/zoho/create-signature-request", async (req: Request, res: Response) => {
  const { email, fullName, packageName, price, paymentOption, packageId } = req.body as {
    email?: string; fullName?: string; packageName?: string; price?: string; paymentOption?: string; packageId?: string;
  };

  if (!email || !fullName || !packageName || !price) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0].trim();
    const userAgent = req.headers["user-agent"] || "Unknown User Agent";
    const timestamp = new Date().toISOString();

    const pdfBuffer = await generateAgreementPDF(fullName, normalizedEmail, packageName, price,
      new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      "ZOHO_PLACEHOLDER", { ip, userAgent, timestamp }, { packageId, paymentOption });

    const token = await getZohoAccessToken();

    let origin = req.headers.referer || req.headers.origin || "https://localhost:22474";
    try {
      const parsed = new URL(origin);
      parsed.protocol = "https:";
      origin = parsed.origin;
    } catch { origin = "https://localhost:22474"; }

    const formData = new FormData();
    formData.append("file", new Blob([new Uint8Array(pdfBuffer)], { type: "application/pdf" }), "Agreement.pdf");
    formData.append("data", JSON.stringify({
      requests: {
        request_name: "App Squad Program Agreement",
        is_sequential: true,
        redirect_pages: {
          sign_success:  `${origin}/onboarding/agreement/success?email=${encodeURIComponent(normalizedEmail)}`,
          sign_completed:`${origin}/onboarding/agreement/success?email=${encodeURIComponent(normalizedEmail)}`,
          sign_declined: `${origin}/onboarding/agreement?status=declined&email=${encodeURIComponent(normalizedEmail)}`,
          sign_later:    `${origin}/onboarding/agreement?status=later&email=${encodeURIComponent(normalizedEmail)}`,
        },
        actions: [{ action_type: "SIGN", recipient_name: fullName, recipient_email: normalizedEmail, is_embedded: true, signing_order: 1 }],
      },
    }));

    const createRes = await fetch(`${getZohoSignBase()}/api/v1/requests`, {
      method: "POST", body: formData,
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      logger.error({ errText, status: createRes.status }, "Zoho Request: failed to create draft");
      let errMsg = "Failed to create signature request in Zoho Sign";
      try { const p = JSON.parse(errText); if (p.message) errMsg = p.message; } catch {}
      res.status(502).json({ error: errMsg });
      return;
    }

    const createData = (await createRes.json()) as any;
    if (createData.status !== "success" || !createData.requests) {
      res.status(502).json({ error: createData.message || "Failed to create signature request" });
      return;
    }

    const requestId = createData.requests.request_id;
    const actionId  = createData.requests.actions?.[0]?.action_id;

    if (!requestId || !actionId) {
      res.status(502).json({ error: "Invalid response from signature service" });
      return;
    }

    const submitRes = await fetch(`${getZohoSignBase()}/api/v1/requests/${requestId}/submit`, {
      method: "POST",
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      let errMsg = "Failed to activate signature request";
      try { const p = JSON.parse(errText); if (p.message) errMsg = p.message; } catch {}
      res.status(502).json({ error: errMsg });
      return;
    }

    const embedRes = await fetch(`${getZohoSignBase()}/api/v1/requests/${requestId}/actions/${actionId}/embedtoken?host=${origin}`, {
      method: "POST",
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    });

    if (!embedRes.ok) {
      const errText = await embedRes.text();
      let errMsg = "Failed to generate embedded signing URL";
      try { const p = JSON.parse(errText); if (p.message) errMsg = p.message; } catch {}
      res.status(502).json({ error: errMsg });
      return;
    }

    const embedData = (await embedRes.json()) as any;
    const signUrl = embedData.sign_url || embedData.embedurl;

    if (embedData.status !== "success" || !signUrl) {
      res.status(502).json({ error: embedData.message || "Failed to generate embedded signing link" });
      return;
    }

    logger.info({ email: normalizedEmail, requestId }, "Zoho Request: embedded signing link generated");
    res.json({ success: true, embedUrl: signUrl, requestId });

  } catch (err) {
    logger.error({ err }, "Zoho Request: unexpected error");
    const msg = (err as Error).message || "";
    if (msg.includes("invalid_client_secret") || msg.includes("invalid_client") || msg.includes("ZOHO_SIGN_CLIENT_SECRET")) {
      res.status(503).json({
        error: "Zoho Sign credentials are misconfigured. The Client Secret is incorrect.",
        action: "Update ZOHO_SIGN_CLIENT_SECRET in Replit Secrets with the correct value from api-console.zoho.in",
        detail: msg,
      });
    } else if (msg.includes("refresh") || msg.includes("ZOHO_SIGN_REFRESH_TOKEN")) {
      res.status(503).json({
        error: "Zoho Sign refresh token is missing or invalid.",
        action: "Visit /api/zoho/oauth/start to generate a valid refresh token",
        detail: msg,
      });
    } else {
      res.status(500).json({ error: "Internal server error", detail: msg });
    }
  }
});

export default router;
