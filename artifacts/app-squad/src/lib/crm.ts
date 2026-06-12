// CRM integration — proxies through the API server to GoHighLevel V2.
// The backend route is POST /api/ghl/contact.
//
// GHL custom field IDs — warm traffic quiz:
//   goal            → yNkDeB2x3gykjpzISYk9
//   game_interest   → XMINgcDYkyeA7WtinhbD
//   budget_range    → 8zDiIiTk1TxHlNvZrOUU
//   launch_timeline → 3KqLQ7tkgokS14sjF7X3
//
// GHL custom field IDs — cold traffic quiz:
//   interest        → 08tFAZ1FAo0smFNtArSn
//   game_style      → 99Xb7QXH5O0tVhNCbzhB
//   budget          → elPxjX2AZpllZiGb4jZB
//   start_timeline  → sLISUfNGXIrXXuz82jef
//
// GHL custom field IDs — onboarding / customization:
//   app_name              → FZBa9ADCLKQWPhmEIk6j
//   app_tagline           → rhBCPC8RdX09mtNGl8r6
//   who_is_app_for        → JfHuVa8do6kqYtf2VelL
//   brand_personality     → K9zxY9OHeXPieU99mDSi
//   color_direction       → V6biP3RQANu8jA6KzuoZ
//   icon_style            → 8rllYdtvo9pJRow7bcS0
//   monetization          → HHedLCiTwIT3U9r0Azs6
//   design_notes          → UTFc9fAbyJj6mHv4TyeF
//   game_template         → R6LEvxoM1oh7RuIi7059

const GHL_PROXY = "/api/ghl/contact";

// Custom fields can be sent as:
//   { key: "field_key", field_value: "..." }   — for key-based fields
//   { id: "ghl_field_id", field_value: "..." } — for ID-based fields (quiz answers)
type GHLField =
  | { key: string; field_value: string }
  | { id: string; field_value: string };

async function upsertGHLContact(payload: {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  tags?: string[];
  customFields?: Record<string, string> | GHLField[];
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

// ─── Cold traffic lead capture (/coldtraffic form) ──────────────────────────
// Tag: "cold calling - form submitted"
export function sendColdLeadToCRM(payload: {
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
    tags: ["lead", "cold calling - form submitted", payload.source],
    customFields: { stage: "lead_captured", source: payload.source },
  });
}

// ─── Cold traffic quiz submission (/coldtraffic-apply) ───────────────────────
// Tag: "cold calling - survey submitted"
// Uses the cold-traffic-specific GHL field IDs.
export function sendColdApplicationToCRM(payload: {
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
    tags: ["application", "cold calling - survey submitted", payload.source],
    customFields: [
      { id: "08tFAZ1FAo0smFNtArSn", field_value: payload.goal },
      { id: "99Xb7QXH5O0tVhNCbzhB", field_value: payload.game },
      { id: "elPxjX2AZpllZiGb4jZB", field_value: payload.budget },
      { id: "sLISUfNGXIrXXuz82jef", field_value: payload.timeline },
    ],
  });
}

// ─── Lead capture (video presentation / start page) ─────────────────────────
// Tag: "ads - form submitted"
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
    tags: ["lead", "ads - form submitted", payload.source],
    customFields: { stage: "lead_captured", source: payload.source },
  });
}

// ─── Quiz / application submission ──────────────────────────────────────────
// Tag: "survey submitted"
// Uses GHL field IDs for the four quiz answer fields.
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
    tags: ["application", "survey submitted", payload.source],
    customFields: [
      { id: "yNkDeB2x3gykjpzISYk9", field_value: payload.goal },
      { id: "XMINgcDYkyeA7WtinhbD", field_value: payload.game },
      { id: "8zDiIiTk1TxHlNvZrOUU", field_value: payload.budget },
      { id: "3KqLQ7tkgokS14sjF7X3", field_value: payload.timeline },
    ],
  });
}

// ─── Call booked (Calendly event_scheduled) ──────────────────────────────────
// Called by book-call.tsx when Calendly fires the booking confirmation event.
export function sendCallBookedToCRM(payload: {
  name: string;
  email: string;
  phone: string;
  source: string;
  scheduledTime?: string;
}) {
  const { firstName, lastName } = splitName(payload.name);
  upsertGHLContact({
    firstName,
    lastName,
    email: payload.email,
    phone: payload.phone,
    tags: ["call-booked", payload.source],
    customFields: {
      stage: "call_booked",
      source: payload.source,
      ...(payload.scheduledTime ? { call_scheduled_time: payload.scheduledTime } : {}),
    },
  });
}

// ─── Post-payment onboarding ─────────────────────────────────────────────────
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
    customFields: [
      { id: "R6LEvxoM1oh7RuIi7059", field_value: payload.templateName },
    ],
  });
}

export function sendCustomizationToCRM(payload: {
  clientName: string;
  email: string;
  phone: string;
  appName: string;
  tagline: string;
  appConcept: string;
  targetAudience: string;
  brandPersonality: string;
  colorDirection: string;
  monetization: string;
  iconStyle: string;
  designNotes: string;
  source: string;
}) {
  const { firstName, lastName } = splitName(payload.clientName);
  const fields: GHLField[] = [
    { id: "FZBa9ADCLKQWPhmEIk6j", field_value: payload.appName },
    { id: "rhBCPC8RdX09mtNGl8r6", field_value: payload.tagline },
    { id: "JfHuVa8do6kqYtf2VelL", field_value: payload.targetAudience },
    { id: "K9zxY9OHeXPieU99mDSi", field_value: payload.brandPersonality },
    { id: "V6biP3RQANu8jA6KzuoZ", field_value: payload.colorDirection },
    { id: "8rllYdtvo9pJRow7bcS0", field_value: payload.iconStyle },
    { id: "HHedLCiTwIT3U9r0Azs6", field_value: payload.monetization },
    { id: "UTFc9fAbyJj6mHv4TyeF", field_value: payload.designNotes },
  ].filter(f => f.field_value.trim() !== "");
  upsertGHLContact({
    firstName,
    lastName,
    email: payload.email,
    phone: payload.phone,
    tags: ["onboarding", "customization-submitted"],
    customFields: fields,
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
