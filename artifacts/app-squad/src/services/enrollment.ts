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
): Promise<{ success: boolean; embedUrl?: string; requestId?: string; error?: string }> {
  try {
    const res = await fetch(`/api/zoho/create-signature-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fullName, packageName, price, paymentOption, packageId }),
    });
    const json = (await res.json()) as { success?: boolean; embedUrl?: string; requestId?: string; error?: string };
    return { success: !!json.success, embedUrl: json.embedUrl, requestId: json.requestId, error: json.error };
  } catch {
    return { success: false, error: "Unable to connect to the Zoho Sign service." };
  }
}

// ── Get progress ──────────────────────────────────────────────────────────────
export async function getEnrollmentProgress(
  email: string,
): Promise<{ record: EnrollmentRecord | null; error?: string }> {
  try {
    const res = await fetch(`${BASE}/progress?email=${encodeURIComponent(email)}`, {
      cache: "no-store",
    });
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
    localStorage.getItem("appSquadEnrollmentEmail") ||
    localStorage.getItem("appSquadUserEmail") ||
    ""
  ).trim().toLowerCase();
}
