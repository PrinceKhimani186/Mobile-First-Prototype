// Enrollment service — all Supabase-backed operations proxied through the API server.
// The frontend never receives Supabase credentials; all DB access goes via /api/enrollment/*.

const BASE = "/api/enrollment";

export interface EnrollmentRecord {
  id?: string;
  full_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  onboarding_status?: string;
  payment_status?: string;
  password_created?: boolean;
  game_selected?: boolean;
  customization_completed?: boolean;
  dashboard_completed?: boolean;
  selected_package?: string;
}

// ── Init (Step 1 submit — insert or upsert) ───────────────────────────────────
export async function initEnrollment(data: {
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
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
      body: JSON.stringify({ email, fields: { game_selected: true } }),
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
      body: JSON.stringify({ email, fields: { customization_completed: true } }),
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
