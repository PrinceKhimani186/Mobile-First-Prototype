// Auth service — onboarding status backed by app_users in Supabase.
// The frontend never touches Supabase directly; all DB access goes via /api/auth/*.

const BASE = "/api/auth";

export interface OnboardingStatus {
  game_selection_completed: boolean;
  customization_form_completed: boolean;
  selected_game: string | null;
}

// ── Get onboarding flags for a user ──────────────────────────────────────────
export async function getOnboardingStatus(
  email: string,
): Promise<{ status: OnboardingStatus | null; skipped?: boolean }> {
  try {
    const res = await fetch(
      `${BASE}/onboarding-status?email=${encodeURIComponent(email)}`,
      { cache: "no-store" },
    );
    const json = (await res.json()) as {
      status?: OnboardingStatus | null;
      skipped?: boolean;
    };
    return { status: json.status ?? null, skipped: json.skipped };
  } catch {
    return { status: null };
  }
}

// ── Update onboarding flags for a user ───────────────────────────────────────
export async function updateOnboarding(
  email: string,
  fields: Partial<{
    game_selection_completed: boolean;
    customization_form_completed: boolean;
    selected_game: string;
  }>,
): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(`${BASE}/update-onboarding`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, fields }),
    });
    const json = (await res.json()) as { ok?: boolean };
    return { ok: !!json.ok };
  } catch {
    return { ok: false };
  }
}
