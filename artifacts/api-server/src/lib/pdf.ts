import { PDFDocument, rgb, PDFFont, PDFPage } from "pdf-lib";
import { StandardFonts } from "pdf-lib";

// ── Per-package agreement definitions ────────────────────────────────────────
interface PackageDef {
  name: string;
  setupAmt: string;
  monthlyAmt: string;
  fullAmt: string;
  bestFor: string;
  servicesIncluded: string[];
  servicesNotIncluded: string[];
  section15: string;
}

const PACKAGE_DEFS: Record<string, PackageDef> = {
  essentials: {
    name: "App Launch Essentials",
    setupAmt: "$497.00",
    monthlyAmt: "$197.00",
    fullAmt: "$2,497.00",
    bestFor: "First-time app owners seeking one branded mobile game app with guided setup.",
    servicesIncluded: [
      "One mobile game template selected from available App Squad library",
      "Basic app name, color, icon, splash/loading screen, and brand customization",
      "Basic monetization preparation for supported ad placements and/or available in-app purchase options",
      "Google Play and/or Apple App Store publishing assistance, subject to platform approval",
      "Client onboarding dashboard access and project status updates",
      "One (1) reasonable revision round within the approved scope",
      "Thirty (30) days of post-delivery email support",
    ],
    servicesNotIncluded: [
      "Custom game development from scratch",
      "Advanced custom features, multiplayer systems, blockchain/crypto, gambling, sweepstakes, cash-prize, or regulated gaming functionality",
      "Paid advertising management, guaranteed downloads, app rankings, revenue, or return on investment",
      "Developer account fees, platform fees, third-party subscriptions, or advertising spend unless stated in writing",
    ],
    section15: "After the initial 30-day support period, ongoing support is available only if Client enrolls in a separate support or maintenance plan.",
  },
  accelerator: {
    name: "App Ownership Accelerator",
    setupAmt: "$997.00",
    monthlyAmt: "$397.00",
    fullAmt: "$4,997.00",
    bestFor: "Clients seeking upgraded branding, monetization preparation, app store guidance, and launch support.",
    servicesIncluded: [
      "One premium mobile game template selected from available App Squad library",
      "Enhanced app name, color, icon, splash/loading screen, and brand customization",
      "Monetization preparation for supported ad placements and/or available in-app purchase options",
      "Basic App Store Optimization guidance including description direction and keyword considerations",
      "Google Play and/or Apple App Store publishing assistance, subject to platform approval",
      "Client onboarding dashboard access and project status updates",
      "Two (2) reasonable revision rounds within the approved scope",
      "Monthly optimization check-in for the first three (3) months after delivery",
      "Priority email support during the active development period",
    ],
    servicesNotIncluded: [
      "Custom game development from scratch unless separately agreed in writing",
      "Advanced custom features, multiplayer systems, blockchain/crypto, gambling, sweepstakes, cash-prize, or regulated gaming functionality",
      "Paid advertising management, influencer marketing, guaranteed downloads, app rankings, revenue, or return on investment",
      "Developer account fees, platform fees, third-party subscriptions, or advertising spend unless stated in writing",
    ],
    section15: "App Ownership Accelerator includes limited monthly optimization check-ins for the first three (3) months after delivery. Additional support or maintenance requires a separate agreement or plan.",
  },
  empire: {
    name: "App Empire Package",
    setupAmt: "$4,997.00",
    monthlyAmt: "$497.00",
    fullAmt: "$9,997.00",
    bestFor: "Clients seeking a premium app launch experience, expanded creative assets, and strategic guidance.",
    servicesIncluded: [
      "Up to two (2) mobile game templates selected from available App Squad library",
      "Premium app name, color, icon, splash/loading screen, and brand customization",
      "Monetization preparation for supported ad placements and/or available in-app purchase options",
      "App Store Optimization guidance including description direction, keyword considerations, and launch checklist",
      "Google Play and/or Apple App Store publishing assistance, subject to platform approval",
      "Client onboarding dashboard access and project status updates",
      "Three (3) reasonable revision rounds within the approved scope",
      "AI promotional creative starter kit (sample promo copy, short-form script concepts, or app launch graphics direction)",
      "Monthly strategy/optimization check-ins for the first six (6) months after delivery",
      "VIP email support during the active development period",
    ],
    servicesNotIncluded: [
      "Fully custom game development from scratch unless separately agreed in writing",
      "Advanced custom features, multiplayer systems, blockchain/crypto, gambling, sweepstakes, cash-prize, or regulated gaming functionality",
      "Paid advertising management, influencer marketing, guaranteed downloads, app rankings, revenue, or return on investment",
      "Developer account fees, platform fees, third-party subscriptions, or advertising spend unless stated in writing",
    ],
    section15: "App Empire includes limited monthly strategy/optimization check-ins for the first six (6) months after delivery. Additional support, maintenance, marketing, or app expansion requires a separate agreement or plan.",
  },
};

// ── Derive packageId from packageName string ─────────────────────────────────
function resolvePackageId(packageName: string): string {
  const lower = packageName.toLowerCase();
  if (lower.includes("empire"))      return "empire";
  if (lower.includes("accelerator")) return "accelerator";
  if (lower.includes("essentials"))  return "essentials";
  return "essentials";
}

// ── PDF renderer state ────────────────────────────────────────────────────────
interface Ctx {
  doc: PDFDocument;
  normal: PDFFont;
  bold: PDFFont;
  pages: PDFPage[];
  y: number;
}

const PAGE_W = 612;
const PAGE_H = 792;
const MX = 50;
const MB = 68;
const USABLE = PAGE_W - MX * 2;

const COL_BLACK = rgb(0.08, 0.08, 0.08);
const COL_DGRAY = rgb(0.28, 0.28, 0.28);
const COL_MGRAY = rgb(0.50, 0.50, 0.50);
const COL_LGRAY = rgb(0.85, 0.85, 0.85);
const COL_ORANGE = rgb(0.96, 0.52, 0.12);
const COL_GREEN  = rgb(0.10, 0.60, 0.30);

function curPage(ctx: Ctx) { return ctx.pages[ctx.pages.length - 1]; }

function addPage(ctx: Ctx): Ctx {
  const page = ctx.doc.addPage([PAGE_W, PAGE_H]);
  return { ...ctx, pages: [...ctx.pages, page], y: PAGE_H - 55 };
}

function ensureY(ctx: Ctx, need: number): Ctx {
  return ctx.y - need < MB ? addPage(ctx) : ctx;
}

function wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawText(
  ctx: Ctx,
  str: string,
  size: number,
  font: PDFFont,
  color = COL_BLACK,
  indent = 0,
): Ctx {
  let c = ctx;
  const lh = size * 1.42;
  const lines = wrap(str, font, size, USABLE - indent);
  for (const l of lines) {
    c = ensureY(c, lh + 2);
    curPage(c).drawText(l, { x: MX + indent, y: c.y, size, font, color });
    c = { ...c, y: c.y - lh };
  }
  return c;
}

function space(ctx: Ctx, n = 8): Ctx {
  return { ...ctx, y: ctx.y - n };
}

function hr(ctx: Ctx, color = COL_LGRAY): Ctx {
  const c = ensureY(ctx, 6);
  curPage(c).drawLine({
    start: { x: MX, y: c.y },
    end: { x: PAGE_W - MX, y: c.y },
    thickness: 0.5,
    color,
  });
  return { ...c, y: c.y - 6 };
}

function sectionHeader(ctx: Ctx, num: number | null, title: string): Ctx {
  let c = space(ctx, 6);
  const heading = num !== null ? `${num}. ${title.toUpperCase()}` : title.toUpperCase();
  c = drawText(c, heading, 9.5, c.bold, COL_DGRAY);
  return space(c, 3);
}

function para(ctx: Ctx, text: string, size = 8.5, indent = 0): Ctx {
  let c = drawText(ctx, text, size, ctx.normal, COL_BLACK, indent);
  return space(c, 4);
}

function bulletLine(ctx: Ctx, text: string): Ctx {
  const lines = wrap(text, ctx.normal, 8.5, USABLE - 12);
  let c = ctx;
  for (let i = 0; i < lines.length; i++) {
    c = ensureY(c, 8.5 * 1.42);
    curPage(c).drawText(i === 0 ? `\u2022  ${lines[i]}` : `    ${lines[i]}`, {
      x: MX + 4,
      y: c.y,
      size: 8.5,
      font: c.normal,
      color: COL_BLACK,
    });
    c = { ...c, y: c.y - 8.5 * 1.42 };
  }
  return space(c, 1);
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function generateAgreementPDF(
  fullName: string,
  email: string,
  packageName: string,
  price: string,
  date: string,
  signatureBase64: string,
  auditTrail: { ip?: string; userAgent?: string; timestamp: string },
  options?: { packageId?: string; paymentOption?: string; phone?: string; address?: string }
): Promise<Buffer> {

  const packageId  = options?.packageId  ?? resolvePackageId(packageName);
  const paymentOpt = options?.paymentOption ?? "subscription";
  const pkg = PACKAGE_DEFS[packageId] ?? PACKAGE_DEFS.essentials;

  const pdfDoc = await PDFDocument.create();
  const normal = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let ctx: Ctx = addPage({ doc: pdfDoc, normal, bold, pages: [], y: PAGE_H - 55 });

  // ── HEADER ──────────────────────────────────────────────────────────────────
  curPage(ctx).drawText("APP SQUAD INC.", {
    x: MX, y: ctx.y, size: 18, font: bold, color: COL_ORANGE,
  });
  ctx = { ...ctx, y: ctx.y - 22 };

  curPage(ctx).drawText(`${pkg.name.toUpperCase()} AGREEMENT`, {
    x: MX, y: ctx.y, size: 12, font: bold, color: COL_BLACK,
  });
  ctx = space({ ...ctx, y: ctx.y - 15 }, 2);
  ctx = hr(ctx, COL_ORANGE);
  ctx = space(ctx, 4);

  // ── CLIENT DETAILS TABLE ────────────────────────────────────────────────────
  const col2 = MX + 250;
  const lh = 13;

  function detailRow(c: Ctx, label: string, value: string): Ctx {
    curPage(c).drawText(label, { x: MX, y: c.y, size: 8.5, font: bold, color: COL_DGRAY });
    curPage(c).drawText(value || "—", { x: col2, y: c.y, size: 8.5, font: normal, color: COL_BLACK });
    return { ...c, y: c.y - lh };
  }

  ctx = detailRow(ctx, "Agreement Date:", date);
  ctx = detailRow(ctx, "Client Name:", fullName);
  ctx = detailRow(ctx, "Client Email:", email);
  if (options?.phone) ctx = detailRow(ctx, "Client Phone:", options.phone);
  if (options?.address) ctx = detailRow(ctx, "Client Address:", options.address);
  ctx = detailRow(ctx, "Package:", pkg.name);
  ctx = detailRow(ctx, "Company:", `App Squad Inc. ("App Squad")`);
  ctx = space(ctx, 4);
  ctx = hr(ctx);
  ctx = space(ctx, 4);

  // ── INTRO PARAGRAPH ─────────────────────────────────────────────────────────
  ctx = para(ctx,
    `This Agreement is entered into by and between App Squad Inc. ("App Squad," "Company," "we," "us," or "our") and the client identified above ("Client," "you," or "your"). By signing this Agreement, Client agrees to purchase custom mobile game application development, digital product launch consulting, customization, monetization preparation, and publishing assistance services according to the package and payment terms selected below.`
  );

  // ── PACKAGE SUMMARY & PAYMENT OPTIONS ───────────────────────────────────────
  ctx = sectionHeader(ctx, null, "Package Summary and Payment Options");

  const optALabel = `Option A — Setup + Monthly`;
  const optADetail = `${pkg.setupAmt} setup/down payment due at signing, then ${pkg.monthlyAmt} per month for 12 months.`;
  const optBLabel = `Option B — Paid In Full`;
  const optBDetail = `${pkg.fullAmt} paid in full.`;

  const isMonthly = paymentOpt === "monthly";

  // Option A row
  const aColor = isMonthly ? COL_BLACK : COL_MGRAY;
  const bColor = !isMonthly ? COL_BLACK : COL_MGRAY;

  ctx = ensureY(ctx, 28);
  const optAY = ctx.y;
  curPage(ctx).drawText(isMonthly ? "[X]" : "[ ]", { x: MX, y: optAY, size: 9, font: bold, color: isMonthly ? COL_GREEN : COL_MGRAY });
  ctx = drawText({ ...ctx, y: optAY }, `  ${optALabel}`, 9, bold, aColor, 14);
  ctx = drawText(ctx, optADetail, 8.5, normal, aColor, 22);
  ctx = space(ctx, 3);

  const optBY = ctx.y;
  curPage(ctx).drawText(!isMonthly ? "[X]" : "[ ]", { x: MX, y: optBY, size: 9, font: bold, color: !isMonthly ? COL_GREEN : COL_MGRAY });
  ctx = drawText({ ...ctx, y: optBY }, `  ${optBLabel}`, 9, bold, bColor, 14);
  ctx = drawText(ctx, optBDetail, 8.5, normal, bColor, 22);
  ctx = space(ctx, 3);

  // ── SECTION 1: SERVICES INCLUDED ────────────────────────────────────────────
  ctx = sectionHeader(ctx, 1, "Services Included");
  for (const s of pkg.servicesIncluded) ctx = bulletLine(ctx, s);
  ctx = space(ctx, 3);

  // ── SECTION 2: SERVICES NOT INCLUDED ────────────────────────────────────────
  ctx = sectionHeader(ctx, 2, "Services Not Included");
  for (const s of pkg.servicesNotIncluded) ctx = bulletLine(ctx, s);
  ctx = space(ctx, 3);

  // ── SECTION 3: PAYMENT AUTHORIZATION ────────────────────────────────────────
  ctx = sectionHeader(ctx, 3, "Payment Authorization and Recurring Billing");
  ctx = para(ctx,
    `Client authorizes App Squad and/or its payment processor to charge the payment method provided for the selected payment option. ` +
    (isMonthly
      ? `Client authorizes the setup/down payment charge of ${pkg.setupAmt} at signing and recurring monthly charges of ${pkg.monthlyAmt} per month for 12 months. Monthly payments are due every thirty (30) days from the initial payment date unless otherwise agreed in writing.`
      : `Client authorizes a single charge of ${pkg.fullAmt} at signing for the Paid In Full option.`) +
    ` Client agrees to maintain a valid payment method on file during the entire payment term.`
  );

  // ── SECTION 4: LATE PAYMENTS ─────────────────────────────────────────────────
  ctx = sectionHeader(ctx, 4, "Late Payments, Suspension, and Reinstatement");
  ctx = para(ctx,
    "If any payment fails or becomes past due, App Squad may pause development, support, publishing assistance, dashboard access, app availability, or any related services until the account is brought current. If payment is more than thirty (30) days delinquent, App Squad may charge a reinstatement fee of $99.00. If payment is more than sixty (60) days delinquent, App Squad may suspend services and/or terminate this Agreement. Suspension or termination does not waive any unpaid balance."
  );

  // ── SECTION 5: DEVELOPMENT TIMELINE ─────────────────────────────────────────
  ctx = sectionHeader(ctx, 5, "Development Timeline and Client Cooperation");
  ctx = para(ctx,
    "Estimated development timelines depend on package scope, template selection, Client responsiveness, asset delivery, revision requests, third-party platform requirements, and payment status. App Squad will use commercially reasonable efforts to move the project forward, but timelines are estimates and are not guaranteed. Client delays in submitting onboarding forms, assets, login credentials, developer account information, or approvals may extend the timeline."
  );

  // ── SECTION 6: CLIENT RESPONSIBILITIES ───────────────────────────────────────
  ctx = sectionHeader(ctx, 6, "Client Responsibilities");
  ctx = para(ctx,
    "Client agrees to: complete all onboarding forms accurately and promptly; provide app name, branding details, logos, colors, descriptions, target audience, and other requested assets; maintain any required Apple, Google, Amazon, AdMob, or third-party accounts unless App Squad agrees otherwise in writing; comply with app store rules, advertising policies, intellectual property laws, consumer protection laws, and all applicable regulations; and promote and market the app after launch if Client seeks downloads, users, engagement, or monetization activity."
  );

  // ── SECTION 7: REVISION POLICY ───────────────────────────────────────────────
  ctx = sectionHeader(ctx, 7, "Revision Policy");
  ctx = para(ctx,
    "Client is entitled only to the revision rounds expressly included in the selected package. Revisions must be reasonable and within the originally approved scope. New features, redesigns, new templates, additional game mechanics, new integrations, or changes outside the approved scope may require additional fees and a written change order."
  );

  // ── SECTION 8: OWNERSHIP PENDING PAYMENT ─────────────────────────────────────
  ctx = sectionHeader(ctx, 8, "Ownership and Limited License Pending Full Payment");
  ctx = para(ctx,
    "Until Client has paid all amounts due under this Agreement, App Squad retains ownership and control of the application build, source files, project files, development assets, publishing access, and related materials. During the payment term and while Client remains current, Client receives a limited, revocable, non-exclusive license to use the customized app build as permitted by App Squad. If Client defaults, App Squad may suspend access, publishing assistance, app availability, or related services."
  );

  // ── SECTION 9: OWNERSHIP TRANSFER ────────────────────────────────────────────
  ctx = sectionHeader(ctx, 9, "Ownership Transfer After Payment in Full");
  ctx = para(ctx,
    "After Client pays the full balance due under this Agreement, App Squad will transfer to Client the rights in the final customized app build to the extent owned by App Squad and not otherwise restricted by third-party assets, software libraries, licenses, platform rules, or pre-existing App Squad materials. App Squad retains ownership of its pre-existing templates, frameworks, source libraries, reusable code, processes, training materials, systems, designs, and know-how."
  );

  // ── SECTION 10: EARNINGS DISCLAIMER ──────────────────────────────────────────
  ctx = sectionHeader(ctx, 10, "Earnings and Results Disclaimer");
  ctx = para(ctx,
    "Client understands and agrees that App Squad does not guarantee earnings, downloads, users, app store rankings, app approvals, advertising approvals, ad account approvals, ad revenue, in-app purchase revenue, profits, return on investment, business success, or any financial result. Any examples, market data, popular app statistics, case studies, or discussions of monetization are for educational purposes only and are not typical, promised, or guaranteed results."
  );

  // ── SECTION 11: THIRD-PARTY DISCLAIMER ───────────────────────────────────────
  ctx = sectionHeader(ctx, 11, "Third-Party Platform Disclaimer");
  ctx = para(ctx,
    "Apple, Google, Amazon, AdMob, payment processors, ad networks, analytics providers, and other third-party platforms have their own rules, approval standards, fees, review timelines, and enforcement policies. App Squad does not control third-party approval, rejection, suspension, ranking, monetization eligibility, account status, or policy changes. Client remains responsible for third-party account compliance unless otherwise agreed in writing."
  );

  // ── SECTION 12: NO GAMBLING ───────────────────────────────────────────────────
  ctx = sectionHeader(ctx, 12, "No Gambling, Prizes, or Regulated Gaming");
  ctx = para(ctx,
    "Unless expressly approved by App Squad in writing and supported by legal review, the app will not include real-money gambling, cash prizes, sweepstakes, wagering, fantasy sports, games of chance with prizes of value, or other regulated gaming functionality. Slot-style or casino-style templates, if offered, are entertainment-only and must not be marketed or operated as gambling products."
  );

  // ── SECTION 13: REFUND POLICY ────────────────────────────────────────────────
  ctx = sectionHeader(ctx, 13, "Refund and Cancellation Policy");
  ctx = para(ctx,
    "Because App Squad provides custom digital development, onboarding, project management, customization, and software preparation services, setup fees, onboarding payments, development payments, monthly payments, and paid-in-full payments are non-refundable once work has begun or onboarding access has been provided. Client may request cancellation of future recurring services in writing, but cancellation does not eliminate amounts already due or work already performed. Any refund, credit, or accommodation is at App Squad's sole discretion."
  );

  // ── SECTION 14: CHARGEBACKS ───────────────────────────────────────────────────
  ctx = sectionHeader(ctx, 14, "Chargebacks and Payment Disputes");
  ctx = para(ctx,
    "Client agrees to contact App Squad in writing and allow App Squad a reasonable opportunity to resolve any billing or service concern before initiating a chargeback, payment dispute, or bank reversal. Client acknowledges that App Squad's services involve custom digital work, onboarding access, labor, project management, software preparation, and fulfillment activity that may begin immediately after purchase."
  );

  // ── SECTION 15: SUPPORT & MAINTENANCE ────────────────────────────────────────
  ctx = sectionHeader(ctx, 15, "Support and Maintenance");
  ctx = para(ctx, pkg.section15);

  // ── SECTION 16: MARKETING ────────────────────────────────────────────────────
  ctx = sectionHeader(ctx, 16, "Marketing and Client Promotion Responsibility");
  ctx = para(ctx,
    "App Squad may provide launch guidance, marketing suggestions, app store preparation assistance, or optional promotional resources, but Client is solely responsible for promoting the app, acquiring users, creating content, managing advertising spend, and building audience demand unless App Squad agrees to specific marketing services in a separate written agreement."
  );

  // ── SECTION 17: CONFIDENTIALITY ───────────────────────────────────────────────
  ctx = sectionHeader(ctx, 17, "Confidentiality and Non-Circumvention");
  ctx = para(ctx,
    "Client agrees not to misuse, copy, resell, reverse engineer, disclose, or circumvent App Squad's templates, vendor relationships, developer relationships, pricing, internal systems, training materials, workflows, or proprietary processes. Client may not directly solicit App Squad's developers, contractors, vendors, or team members for substantially similar services during the term of this Agreement and for twelve (12) months after termination without App Squad's written consent."
  );

  // ── SECTION 18: LIMITATION OF LIABILITY ──────────────────────────────────────
  ctx = sectionHeader(ctx, 18, "Limitation of Liability");
  ctx = para(ctx,
    "To the maximum extent permitted by law, App Squad's total liability arising out of or relating to this Agreement will not exceed the amount Client actually paid to App Squad under this Agreement during the three (3) months preceding the event giving rise to the claim. App Squad will not be liable for lost profits, lost revenue, lost data, lost business opportunities, consequential damages, incidental damages, punitive damages, or platform decisions outside App Squad's control."
  );

  // ── SECTION 19: INDEMNIFICATION ───────────────────────────────────────────────
  ctx = sectionHeader(ctx, 19, "Indemnification");
  ctx = para(ctx,
    "Client agrees to indemnify, defend, and hold harmless App Squad from claims, losses, liabilities, damages, costs, and expenses arising from Client's content, branding, trademarks, logos, business practices, marketing claims, legal noncompliance, third-party account violations, platform violations, or misuse of the app or services."
  );

  // ── SECTION 20: GOVERNING LAW ────────────────────────────────────────────────
  ctx = sectionHeader(ctx, 20, "Governing Law and Dispute Resolution");
  ctx = para(ctx,
    "This Agreement will be governed by the laws of the State of Arizona unless the parties agree otherwise in writing. Before filing any legal action, the parties agree to first attempt to resolve disputes through good-faith written communication. If not resolved, disputes may be submitted to binding arbitration or a court of competent jurisdiction as permitted by applicable law. The prevailing party in any dispute may seek reasonable attorneys' fees and costs where allowed by law."
  );

  // ── SECTION 21: ELECTRONIC SIGNATURES ────────────────────────────────────────
  ctx = sectionHeader(ctx, 21, "Electronic Signatures and Entire Agreement");
  ctx = para(ctx,
    "Client agrees that electronic signatures, DocuSign signatures, digital acceptance, and electronic records are valid and binding. This Agreement, together with any attached scope of work, payment authorization, or signed addendum, represents the entire agreement between the parties and replaces prior discussions or representations related to the selected package."
  );

  // ── SIGNATURES ────────────────────────────────────────────────────────────────
  ctx = hr(ctx);
  ctx = space(ctx, 4);
  ctx = ensureY(ctx, 180);

  ctx = drawText(ctx, "SIGNATURES", 11, bold, COL_DGRAY);
  ctx = space(ctx, 8);

  const sigColW = (USABLE - 20) / 2;
  const sigRow1Y = ctx.y;

  // Client section
  curPage(ctx).drawText("CLIENT", { x: MX, y: sigRow1Y, size: 9, font: bold, color: COL_DGRAY });
  curPage(ctx).drawText("APP SQUAD INC.", { x: MX + sigColW + 20, y: sigRow1Y, size: 9, font: bold, color: COL_DGRAY });
  ctx = { ...ctx, y: sigRow1Y - 16 };

  // Draw client signature
  const sigBoxY = ctx.y - 10;

  if (signatureBase64 === "ZOHO_PLACEHOLDER") {
    // Invisible Zoho text tags
    curPage(ctx).drawText("{{Signature}}", {
      x: MX + 4,
      y: sigBoxY + 5,
      size: 10,
      font: normal,
      color: rgb(1, 1, 1),
    });
    curPage(ctx).drawText("{{Signdate}}", {
      x: MX + sigColW + 24,
      y: sigBoxY + 5,
      size: 10,
      font: normal,
      color: rgb(1, 1, 1),
    });
  } else if (signatureBase64 && signatureBase64 !== "DEV_MODE") {
    try {
      const pngData = signatureBase64.replace(/^data:image\/png;base64,/, "");
      const pngBuf = Buffer.from(pngData, "base64");
      const img = await pdfDoc.embedPng(pngBuf);
      curPage(ctx).drawImage(img, { x: MX, y: sigBoxY - 35, width: 130, height: 40 });
    } catch {
      curPage(ctx).drawText(signatureBase64, {
        x: MX + 4, y: sigBoxY, size: 14, font: bold, color: rgb(0, 0, 0.75),
      });
    }
  } else {
    curPage(ctx).drawText(signatureBase64 === "DEV_MODE" ? "[DEV MODE BYPASS]" : "_______________", {
      x: MX + 4, y: sigBoxY, size: 10, font: bold, color: COL_MGRAY,
    });
  }

  // Client signature line
  curPage(ctx).drawLine({
    start: { x: MX, y: sigBoxY - 42 },
    end:   { x: MX + sigColW, y: sigBoxY - 42 },
    thickness: 0.5,
    color: COL_BLACK,
  });
  curPage(ctx).drawText("Client Signature", {
    x: MX, y: sigBoxY - 52, size: 7.5, font: bold, color: COL_MGRAY,
  });
  curPage(ctx).drawText(`Printed Name: ${fullName}`, {
    x: MX, y: sigBoxY - 63, size: 7.5, font: normal, color: COL_BLACK,
  });
  curPage(ctx).drawText(`Date: ${date}`, {
    x: MX, y: sigBoxY - 74, size: 7.5, font: normal, color: COL_BLACK,
  });

  // Company signature line
  curPage(ctx).drawLine({
    start: { x: MX + sigColW + 20, y: sigBoxY - 42 },
    end:   { x: PAGE_W - MX, y: sigBoxY - 42 },
    thickness: 0.5,
    color: COL_BLACK,
  });
  curPage(ctx).drawText("App Squad Representative Signature", {
    x: MX + sigColW + 20, y: sigBoxY - 52, size: 7.5, font: bold, color: COL_MGRAY,
  });
  curPage(ctx).drawText("Printed Name: App Squad Inc.", {
    x: MX + sigColW + 20, y: sigBoxY - 63, size: 7.5, font: normal, color: COL_BLACK,
  });
  curPage(ctx).drawText(`Date: ${date}`, {
    x: MX + sigColW + 20, y: sigBoxY - 74, size: 7.5, font: normal, color: COL_BLACK,
  });

  ctx = { ...ctx, y: sigBoxY - 90 };
  ctx = space(ctx, 8);

  // ── AUDIT TRAIL BOX ───────────────────────────────────────────────────────────
  ctx = ensureY(ctx, 90);
  const auditY = ctx.y;
  curPage(ctx).drawRectangle({
    x: MX, y: auditY - 80,
    width: USABLE, height: 88,
    color: rgb(0.97, 0.97, 0.97),
    borderColor: COL_LGRAY,
    borderWidth: 0.75,
  });

  curPage(ctx).drawText("LEGAL AUDIT TRAIL RECORD", {
    x: MX + 8, y: auditY - 10, size: 8, font: bold, color: COL_DGRAY,
  });

  const ua = auditTrail.userAgent ?? "Unknown";
  const uaLine1 = ua.substring(0, 80);
  const uaLine2 = ua.substring(80, 160);

  const rows: [string, string][] = [
    ["Signed Timestamp:", auditTrail.timestamp],
    ["IP Address:",        auditTrail.ip ?? "Not Available"],
    ["User Agent:",        uaLine1],
    ...(uaLine2 ? [["", uaLine2] as [string, string]] : []),
    ["Package:",           `${pkg.name} — ${isMonthly ? "Option A (Setup + Monthly)" : "Option B (Paid In Full)"}`],
    ["Agreement Version:", "1.0"],
  ];

  let auditCurY = auditY - 24;
  for (const [label, value] of rows) {
    if (label) {
      curPage(ctx).drawText(label, { x: MX + 8, y: auditCurY, size: 7.5, font: bold, color: COL_DGRAY });
    }
    curPage(ctx).drawText(value, { x: label ? MX + 90 : MX + 90, y: auditCurY, size: 7.5, font: normal, color: COL_BLACK });
    auditCurY -= 11;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
