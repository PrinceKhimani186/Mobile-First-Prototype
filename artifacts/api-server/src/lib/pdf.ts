import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function generateAgreementPDF(
  fullName: string,
  email: string,
  packageName: string,
  price: string,
  date: string,
  signatureBase64: string,
  auditTrail: { ip?: string; userAgent?: string; timestamp: string }
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  
  // Use Letter size: 612 x 792 points
  const page = pdfDoc.addPage([612, 792]);
  const { width, height } = page.getSize();
  
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // ── DRAW HEADER ────────────────────────────────────────────────────────────
  page.drawText("APP SQUAD", {
    x: 50,
    y: height - 60,
    size: 20,
    font: fontHelveticaBold,
    color: rgb(0.96, 0.62, 0.22), // Orange/Gold theme
  });
  
  page.drawText("ENROLLMENT AGREEMENT & TERMS OF SERVICE", {
    x: 50,
    y: height - 90,
    size: 14,
    font: fontHelveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  
  page.drawLine({
    start: { x: 50, y: height - 105 },
    end: { x: width - 50, y: height - 105 },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  // ── DRAW USER DETAILS ──────────────────────────────────────────────────────
  page.drawText("1. CLIENT & SERVICE DETAILS", {
    x: 50,
    y: height - 130,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  const detailsY = height - 150;
  const colWidth = 250;
  
  page.drawText(`Client Name: ${fullName}`, { x: 50, y: detailsY, size: 10, font: fontHelvetica });
  page.drawText(`Client Email: ${email}`, { x: 50, y: detailsY - 15, size: 10, font: fontHelvetica });
  page.drawText(`Selected Package: ${packageName}`, { x: 50 + colWidth, y: detailsY, size: 10, font: fontHelvetica });
  page.drawText(`Total Price: ${price}`, { x: 50 + colWidth, y: detailsY - 15, size: 10, font: fontHelvetica });
  page.drawText(`Agreement Date: ${date}`, { x: 50, y: detailsY - 30, size: 10, font: fontHelvetica });

  page.drawLine({
    start: { x: 50, y: height - 200 },
    end: { x: width - 50, y: height - 200 },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  // ── DRAW TERMS ─────────────────────────────────────────────────────────────
  page.drawText("2. STANDARD TERMS OF ENGAGEMENT", {
    x: 50,
    y: height - 225,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(0.3, 0.3, 0.3),
  });

  const terms = [
    "By signing this document, the Client registers for the App Squad app creation program and agrees to pay the stipulated package price. The package services will include game app customization, publishing preparation, store submission assistance, and follow-up support as specified.",
    "Intellectual Property Rights: Upon full payment of the program package, all custom graphics, branding elements, configurations, and assets developed specifically for the client app will belong to the Client. Standard engines, templates, and pre-existing codebase components remain the sole intellectual property of App Squad.",
    "Liability & Warranties: App Squad works diligently to ensure store acceptance and application stability; however, marketplace approval (Apple App Store / Google Play Store) is subject to developer policies and terms. App Squad is not responsible for policy updates or delays resulting from developer portal changes.",
    "Consent to Electronic Record: The Client acknowledges and agrees that this contract is executed electronically. Under the ESIGN Act and state regulations, this electronic signature constitutes a legally-binding execution of this agreement.",
  ];

  let currentY = height - 245;
  for (const term of terms) {
    // Basic word wrapping for Helvetica (width limit ~512pt)
    const words = term.split(" ");
    let line = "";
    const lines: string[] = [];
    
    for (const word of words) {
      const testLine = line + word + " ";
      const lineWidth = fontHelvetica.widthOfTextAtSize(testLine, 9);
      if (lineWidth > width - 100) {
        lines.push(line.trim());
        line = word + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    for (const l of lines) {
      page.drawText(l, {
        x: 50,
        y: currentY,
        size: 9,
        font: fontHelvetica,
        color: rgb(0.2, 0.2, 0.2),
        lineHeight: 12,
      });
      currentY -= 13;
    }
    currentY -= 6; // paragraph spacing
  }

  page.drawLine({
    start: { x: 50, y: currentY - 5 },
    end: { x: width - 50, y: currentY - 5 },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  // ── DRAW SIGNATURES & AUDIT TRAIL ──────────────────────────────────────────
  const sigY = currentY - 30;
  
  page.drawText("3. EXECUTION & CONSENT", {
    x: 50,
    y: sigY,
    size: 11,
    font: fontHelveticaBold,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Embed PNG signature image or place Zoho text tags
  if (signatureBase64 === "ZOHO_PLACEHOLDER") {
    // Draw Zoho Text Tags in white color (invisible to signer, readable by Zoho Sign OCR)
    page.drawText("{{Signature}}", {
      x: 50,
      y: sigY - 50,
      size: 10,
      font: fontHelvetica,
      color: rgb(1, 1, 1),
    });
    page.drawText("{{Signdate}}", {
      x: 220,
      y: sigY - 50,
      size: 10,
      font: fontHelvetica,
      color: rgb(1, 1, 1),
    });
  } else {
    try {
      const pngData = signatureBase64.replace(/^data:image\/png;base64,/, "");
      const pngBuffer = Buffer.from(pngData, "base64");
      const pngImage = await pdfDoc.embedPng(pngBuffer);
      
      page.drawImage(pngImage, {
        x: 50,
        y: sigY - 75,
        width: 140,
        height: 50,
      });
    } catch (err) {
      // If it's a typed signature, we draw text using a handwritten style look-alike
      page.drawText(signatureBase64, {
        x: 50,
        y: sigY - 50,
        size: 18,
        font: fontHelveticaBold, // italic styling look-alike
        color: rgb(0, 0, 0.8),
      });
    }
  }

  // Draw signature line
  page.drawLine({
    start: { x: 50, y: sigY - 80 },
    end: { x: 200, y: sigY - 80 },
    thickness: 1,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText("Client Signature", {
    x: 50,
    y: sigY - 95,
    size: 9,
    font: fontHelveticaBold,
  });

  page.drawText(`Name: ${fullName}`, {
    x: 50,
    y: sigY - 110,
    size: 9,
    font: fontHelvetica,
  });

  // Audit trail box
  const auditBoxY = sigY - 120;
  page.drawRectangle({
    x: 320,
    y: auditBoxY - 45,
    width: 242,
    height: 100,
    color: rgb(0.97, 0.97, 0.97),
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 1,
  });

  page.drawText("LEGAL AUDIT TRAIL RECORD", {
    x: 330,
    y: auditBoxY + 40,
    size: 8,
    font: fontHelveticaBold,
    color: rgb(0.4, 0.4, 0.4),
  });

  page.drawText(`Signed Timestamp: ${auditTrail.timestamp}`, {
    x: 330,
    y: auditBoxY + 25,
    size: 8,
    font: fontHelvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  page.drawText(`IP Address: ${auditTrail.ip || "Not Available"}`, {
    x: 330,
    y: auditBoxY + 12,
    size: 8,
    font: fontHelvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  // User agent wrapping
  const ua = auditTrail.userAgent || "Unknown User Agent";
  const uaLine1 = ua.substring(0, 42);
  const uaLine2 = ua.substring(42, 84);
  page.drawText(`Browser Agent: ${uaLine1}`, {
    x: 330,
    y: auditBoxY - 1,
    size: 7.5,
    font: fontHelvetica,
    color: rgb(0.3, 0.3, 0.3),
  });
  if (uaLine2) {
    page.drawText(uaLine2, {
      x: 330,
      y: auditBoxY - 10,
      size: 7.5,
      font: fontHelvetica,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  page.drawText("Agreement Version: 1.0 (LATEST)", {
    x: 330,
    y: auditBoxY - 30,
    size: 8,
    font: fontHelveticaBold,
    color: rgb(0.1, 0.6, 0.3),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
