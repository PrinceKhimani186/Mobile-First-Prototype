// Enrollment service — all Supabase-backed operations proxied through the API server.
// The frontend never receives Supabase credentials; all DB access goes via /api/enrollment/*.

const BASE = "/api/enrollment";

export interface EnrollmentRecord {
  id?: string;
  full_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  country?: string;
  business_type?: string;
  preferred_contact?: string;
  onboarding_status?: string;
  payment_status?: string;
  password_created?: boolean;
  game_selected?: boolean;
  customization_completed?: boolean;
  dashboard_completed?: boolean;
  selected_package?: string;
  document_name?: string;
  document_url?: string;
  agreement_signed?: boolean;
  agreement_signing_url?: string;
  agreement_contract_id?: string;
  game_type?: string;
  app_name?: string;
  tagline?: string;
  monetization?: string;
  payment_type?: string;
  source?: string;
}

// ── Upload document to Supabase Storage ───────────────────────────────────────
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function uploadDocument(
  file: File,
  email: string,
): Promise<{ ok: boolean; documentName?: string; documentUrl?: string; error?: string }> {
  try {
    const base64 = await fileToBase64(file);
    const res = await fetch(`${BASE}/upload-document`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        fileName: file.name,
        mimeType: file.type,
        base64,
      }),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      documentName?: string;
      documentUrl?: string;
      error?: string;
      skipped?: boolean;
    };
    if (json.skipped) return { ok: true, documentName: file.name, documentUrl: "" };
    return { ok: !!json.ok, documentName: json.documentName, documentUrl: json.documentUrl, error: json.error };
  } catch {
    return { ok: false, error: "Unable to upload document." };
  }
}

// ── Init (Step 1 submit — insert or upsert) ───────────────────────────────────
export async function initEnrollment(data: {
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  country?: string;
  businessType?: string;
  preferredContact?: string;
  documentName?: string;
  documentUrl?: string;
  selectedPackage?: string;
  paymentType?: string;
  source?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE}/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    return { ok: !!json.ok, error: json.error };
  } catch {
    return { ok: false, error: "Unable to connect to the database." };
  }
}

// ── Update package (Step 2 — plan selected) ───────────────────────────────────
export async function updatePackage(
  email: string,
  selectedPackage: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fields: { selected_package: selectedPackage } }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    return { ok: !!json.ok, error: json.error };
  } catch {
    return { ok: false, error: "Unable to save your information." };
  }
}

// ── Mark payment paid (Stripe success redirect) ───────────────────────────────
export async function markPaymentPaid(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fields: { payment_status: "paid" } }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    return { ok: !!json.ok, error: json.error };
  } catch {
    return { ok: false, error: "Unable to save your information." };
  }
}

// ── Mark password created ─────────────────────────────────────────────────────
export async function markPasswordCreated(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fields: { password_created: true } }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    return { ok: !!json.ok, error: json.error };
  } catch {
    return { ok: false, error: "Unable to save your information." };
  }
}

// ── Mark game selected ────────────────────────────────────────────────────────
export async function markGameSelected(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fields: { game_selected: true, onboarding_status: "game_selected" } }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    return { ok: !!json.ok, error: json.error };
  } catch {
    return { ok: false, error: "Unable to save your information." };
  }
}

// ── Mark customization completed ──────────────────────────────────────────────
export async function markCustomizationCompleted(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fields: { customization_completed: true, onboarding_status: "customization_completed" } }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    return { ok: !!json.ok, error: json.error };
  } catch {
    return { ok: false, error: "Unable to save your information." };
  }
}

// ── Persist onboarding content fields (game/customization/payment/source) ─────
// These are the customer-facing values shown on the dashboard. Unlike the
// completion flags above, they carry actual content, so the dashboard can
// display the right client data even on a different device/browser than the
// one that filled out onboarding.
export async function updateEnrollmentFields(
  email: string,
  fields: Partial<Pick<EnrollmentRecord, "game_type" | "app_name" | "tagline" | "monetization" | "payment_type" | "source">>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fields }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    return { ok: !!json.ok, error: json.error };
  } catch {
    return { ok: false, error: "Unable to save your information." };
  }
}

// ── Mark dashboard completed ──────────────────────────────────────────────────
export async function markDashboardCompleted(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fields: { dashboard_completed: true } }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    return { ok: !!json.ok, error: json.error };
  } catch {
    return { ok: false, error: "Unable to save your information." };
  }
}

export async function markAgreementSigned(
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${BASE}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fields: { agreement_signed: true, onboarding_status: "agreement_signed" } }),
    });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    return { ok: !!json.ok, error: json.error };
  } catch {
    return { ok: false, error: "Unable to save your information." };
  }
}

export async function verifySignature(
  email: string,
): Promise<{ signed: boolean; pdfUrl?: string; error?: string }> {
  try {
    const res = await fetch(`/api/enrollment/agreement-status?email=${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
    const json = (await res.json()) as { signed?: boolean; pdfUrl?: string; error?: string };
    return { signed: !!json.signed, pdfUrl: json.pdfUrl, error: json.error };
  } catch {
    return { signed: false, error: "Unable to verify signature." };
  }
}

// ── Poll Zoho signature completion (post-sign redirect fallback) ──────────────
// Checks the DB first, then falls back to an authoritative Zoho request-status
// lookup (which also finalizes the agreement server-side if Zoho reports it
// completed but the webhook hasn't landed yet).
export async function pollZohoRequestStatus(
  email: string,
  requestId?: string,
  fullName?: string,
): Promise<{ signed: boolean; status?: string; error?: string }> {
  try {
    const params = new URLSearchParams({ email });
    if (requestId) params.set("requestId", requestId);
    if (fullName) params.set("fullName", fullName);
    const res = await fetch(`/api/zoho/request-status?${params.toString()}`, {
      cache: "no-store",
    });
    const json = (await res.json()) as { signed?: boolean; status?: string; error?: string };
    return { signed: !!json.signed, status: json.status, error: json.error };
  } catch {
    return { signed: false, error: "Unable to poll signature status." };
  }
}

export async function customSign(
  email: string,
  fullName: string,
  packageName: string,
  price: string,
  signatureImage: string,
): Promise<{ success: boolean; pdfUrl?: string; error?: string }> {
  try {
    const res = await fetch(`/api/enrollment/custom-sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName, packageName, price, signatureImage }),
    });
    const json = (await res.json()) as { success?: boolean; pdfUrl?: string; error?: string };
    return { success: !!json.success, pdfUrl: json.pdfUrl, error: json.error };
  } catch {
    return { success: false, error: "Unable to save your signature." };
  }
}

export async function createZohoSignRequest(
  email: string,
  fullName: string,
  packageName: string,
  price: string,
  paymentOption?: string,
  packageId?: string,
  phone?: string,
  address?: string,
): Promise<{ success: boolean; embedUrl?: string; requestId?: string; alreadySigned?: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/zoho/create-signature-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName, packageName, price, paymentOption, packageId, phone, address }),
    });
    const json = (await res.json()) as { success?: boolean; embedUrl?: string; requestId?: string; alreadySigned?: boolean; error?: string; action?: string };
    const errorMsg = json.error
      ? (json.action ? `${json.error} — ${json.action}` : json.error)
      : undefined;
    return { success: !!json.success, embedUrl: json.embedUrl, requestId: json.requestId, alreadySigned: json.alreadySigned, error: errorMsg };
  } catch {
    return { success: false, error: "Unable to connect to the Zoho Sign service." };
  }
}

// ── Get progress ──────────────────────────────────────────────────────────────
export async function getEnrollmentProgress(
  email: string,
  sessionId?: string,
): Promise<{ record: EnrollmentRecord | null; error?: string }> {
  try {
    const url = sessionId
      ? `${BASE}/progress?email=${encodeURIComponent(email)}&session_id=${encodeURIComponent(sessionId)}`
      : `${BASE}/progress?email=${encodeURIComponent(email)}`;
    const res = await fetch(url, {
      cache: "no-store",
    });
    if (res.status === 403) {
      return { record: null, error: "unauthorized" };
    }
    const json = (await res.json()) as { record?: EnrollmentRecord; error?: string };
    return { record: json.record ?? null, error: json.error };
  } catch {
    return { record: null, error: "Unable to connect to the database." };
  }
}

// ── Get onboarding email helper ────────────────────────────────────────────────
export function getOnboardingEmail(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  const emailFromUrl = params.get("email");

  return (
    emailFromUrl ||
    localStorage.getItem("appSquadUserEmail") ||
    localStorage.getItem("appSquadEnrollmentEmail") ||
    ""
  ).trim().toLowerCase();
}

// ── Allowed games for the purchased plan ──────────────────────────────────────
// The server resolves the customer's VERIFIED purchased plan and returns only
// the permitted game template IDs. The frontend holds no plan logic.
export interface AllowedGamesResult {
  status: number;
  plan?: string;
  gameIds?: string[];
  error?: string;
  message?: string;
}

export async function fetchAllowedGames(email: string): Promise<AllowedGamesResult> {
  try {
    const params = new URLSearchParams({ email });
    if (typeof window !== "undefined") {
      const sid = new URLSearchParams(window.location.search).get("session_id");
      if (sid) params.set("session_id", sid);
    }
    const res = await fetch(`${BASE}/allowed-games?${params.toString()}`, { cache: "no-store" });
    const json = (await res.json().catch(() => ({}))) as Omit<AllowedGamesResult, "status">;
    return { status: res.status, ...json };
  } catch {
    return { status: 0, error: "network_error", message: "Network error. Please check your connection." };
  }
}
