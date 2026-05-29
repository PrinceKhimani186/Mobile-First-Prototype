// CRM integration stubs — replace console.log with GoHighLevel webhook calls when ready.

export function sendLeadToCRM(payload: {
  name: string;
  email: string;
  phone: string;
  source: string;
}) {
  // TODO: Replace with GoHighLevel webhook endpoint
  const data = {
    source: payload.source,
    stage: "lead_captured",
    clientName: payload.name,
    email: payload.email,
    phone: payload.phone,
    timestamp: new Date().toISOString(),
  };
  console.log("[CRM] sendLeadToCRM:", JSON.stringify(data, null, 2));
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
  // TODO: Replace with GoHighLevel webhook endpoint
  const data = {
    source: payload.source,
    stage: "application_submitted",
    clientName: payload.name,
    email: payload.email,
    phone: payload.phone,
    goal: payload.goal,
    gameInterest: payload.game,
    budgetRange: payload.budget,
    launchTimeline: payload.timeline,
    timestamp: new Date().toISOString(),
  };
  console.log("[CRM] sendApplicationToCRM:", JSON.stringify(data, null, 2));
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
  // TODO: Replace with GoHighLevel webhook endpoint
  const data = {
    source: "post_payment_onboarding",
    stage: "game_selected",
    clientName: payload.clientName,
    email: payload.email,
    phone: payload.phone,
    selectedGameType: payload.selectedGameType,
    gameCategory: payload.gameCategory,
    templateName: payload.templateName,
    timestamp: new Date().toISOString(),
  };
  console.log("[CRM] sendGameSelectionToCRM:", JSON.stringify(data, null, 2));
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
  // TODO: Replace with GoHighLevel webhook endpoint
  const data = {
    source: "post_payment_onboarding",
    stage: "customization_submitted",
    clientName: payload.clientName,
    email: payload.email,
    phone: payload.phone,
    appName: payload.appName,
    brandName: payload.brandName,
    preferredColors: payload.preferredColors,
    targetAudience: payload.targetAudience,
    appDescription: payload.appDescription,
    monetizationPreference: payload.monetizationPreference,
    notesForDevelopmentTeam: payload.notesForDevelopmentTeam,
    timestamp: new Date().toISOString(),
  };
  console.log("[CRM] sendCustomizationToCRM:", JSON.stringify(data, null, 2));
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
  // TODO: Replace with GoHighLevel webhook endpoint
  const data = {
    source: "partner_program",
    stage: "partner_application_submitted",
    partnerName: payload.partnerName,
    email: payload.email,
    phone: payload.phone,
    company: payload.company,
    website: payload.website,
    promotionMethod: payload.promotionMethod,
    audienceType: payload.audienceType,
    estimatedLeadVolume: payload.estimatedLeadVolume,
    paidAdsExperience: payload.paidAdsExperience,
    bizOppExperience: payload.bizOppExperience,
    reasonForPartnering: payload.reasonForPartnering,
    timestamp: new Date().toISOString(),
  };
  console.log("[CRM] sendPartnerApplicationToCRM:", JSON.stringify(data, null, 2));
}

export function updateProjectStatusInCRM(payload: {
  clientName: string;
  email: string;
  stage: string;
  status: string;
  source: string;
}) {
  // TODO: Replace with GoHighLevel webhook endpoint
  const data = {
    source: "post_payment_onboarding",
    stage: payload.stage,
    status: payload.status,
    clientName: payload.clientName,
    email: payload.email,
    timestamp: new Date().toISOString(),
  };
  console.log("[CRM] updateProjectStatusInCRM:", JSON.stringify(data, null, 2));
}
