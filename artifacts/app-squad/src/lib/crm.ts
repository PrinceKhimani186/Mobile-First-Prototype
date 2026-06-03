// CRM integration — proxies through the API server to GoHighLevel V2.
// The backend route is POST /api/ghl/contact.

const GHL_PROXY = "/api/ghl/contact";

async function upsertGHLContact(payload: {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  tags?: string[];
  customFields?: Record<string, string>;
}) {
  try {
    const res = await fetch(GHL_PROXY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn("[CRM] GHL error:", err);
    }
  } catch (e) {
    console.warn("[CRM] Could not reach proxy:", e);
  }
}

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  const firstName = parts[0] ?? full;
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
}

export function sendLeadToCRM(payload: {
  name: string;
  email: string;
  phone: string;
  source: string;
}) {
  const { firstName, lastName } = splitName(payload.name);
  upsertGHLContact({
    firstName,
    lastName,
    email: payload.email,
    phone: payload.phone,
    tags: ["lead", payload.source],
    customFields: { stage: "lead_captured", source: payload.source },
  });
}

export function sendApplicationToCRM(payload: {
  name: string;
  email: string;
  phone: string;
  goal: string;
  game: string;
  budget: string;
  timeline: string;
  source: string;
}) {
  const { firstName, lastName } = splitName(payload.name);
  upsertGHLContact({
    firstName,
    lastName,
    email: payload.email,
    phone: payload.phone,
    tags: ["application", payload.source],
    customFields: {
      stage: "application_submitted",
      source: payload.source,
      goal: payload.goal,
      game_interest: payload.game,
      budget_range: payload.budget,
      launch_timeline: payload.timeline,
    },
  });
}

export function sendGameSelectionToCRM(payload: {
  clientName: string;
  email: string;
  phone: string;
  selectedGameType: string;
  gameCategory: string;
  templateName: string;
  source: string;
}) {
  const { firstName, lastName } = splitName(payload.clientName);
  upsertGHLContact({
    firstName,
    lastName,
    email: payload.email,
    phone: payload.phone,
    tags: ["onboarding", "game-selected"],
    customFields: {
      stage: "game_selected",
      source: "post_payment_onboarding",
      selected_game_type: payload.selectedGameType,
      game_category: payload.gameCategory,
      template_name: payload.templateName,
    },
  });
}

export function sendCustomizationToCRM(payload: {
  clientName: string;
  email: string;
  phone: string;
  appName: string;
  brandName: string;
  preferredColors: string;
  targetAudience: string;
  appDescription: string;
  monetizationPreference: string;
  notesForDevelopmentTeam: string;
  source: string;
}) {
  const { firstName, lastName } = splitName(payload.clientName);
  upsertGHLContact({
    firstName,
    lastName,
    email: payload.email,
    phone: payload.phone,
    tags: ["onboarding", "customization-submitted"],
    customFields: {
      stage: "customization_submitted",
      source: "post_payment_onboarding",
      app_name: payload.appName,
      brand_name: payload.brandName,
      preferred_colors: payload.preferredColors,
      target_audience: payload.targetAudience,
      app_description: payload.appDescription,
      monetization_preference: payload.monetizationPreference,
      notes_for_dev_team: payload.notesForDevelopmentTeam,
    },
  });
}

export function sendPartnerApplicationToCRM(payload: {
  partnerName: string;
  email: string;
  phone: string;
  company: string;
  website: string;
  promotionMethod: string;
  audienceType: string;
  estimatedLeadVolume: string;
  paidAdsExperience: string;
  bizOppExperience: string;
  reasonForPartnering: string;
}) {
  const { firstName, lastName } = splitName(payload.partnerName);
  upsertGHLContact({
    firstName,
    lastName,
    email: payload.email,
    phone: payload.phone,
    tags: ["partner-application"],
    customFields: {
      stage: "partner_application_submitted",
      source: "partner_program",
      company: payload.company,
      website: payload.website,
      promotion_method: payload.promotionMethod,
      audience_type: payload.audienceType,
      estimated_lead_volume: payload.estimatedLeadVolume,
      paid_ads_experience: payload.paidAdsExperience,
      biz_opp_experience: payload.bizOppExperience,
      reason_for_partnering: payload.reasonForPartnering,
    },
  });
}

export function updateProjectStatusInCRM(payload: {
  clientName: string;
  email: string;
  stage: string;
  status: string;
  source: string;
}) {
  const { firstName, lastName } = splitName(payload.clientName);
  upsertGHLContact({
    firstName,
    lastName,
    email: payload.email,
    phone: "",
    tags: ["project-update", payload.stage],
    customFields: {
      stage: payload.stage,
      status: payload.status,
      source: payload.source,
    },
  });
}
