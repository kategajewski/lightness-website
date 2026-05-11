import { createHash } from "crypto";
import { readFile } from "fs/promises";
import path from "path";
import {
  PDFDocument,
  type PDFFont,
  type PDFPage,
  rgb,
  type RGB,
  StandardFonts,
} from "pdf-lib";

type GiftCertificateInput = {
  amountLabel: string;
  buyerName?: string | null;
  purchasedAt?: number | null;
  sessionId?: string | null;
};

export function createGiftCertificateCode(sessionId?: string | null) {
  const source = sessionId || `${Date.now()}-${Math.random()}`;
  const digest = createHash("sha256").update(source).digest("hex");
  return `LIGHT-${digest.slice(0, 4).toUpperCase()}-${digest
    .slice(4, 10)
    .toUpperCase()}`;
}

export async function createGiftCertificatePdf(input: GiftCertificateInput) {
  const certificateCode = createGiftCertificateCode(input.sessionId);
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([792, 612]);
  const logo = await embedLogo(pdf);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const width = page.getWidth();
  const height = page.getHeight();

  const cream = rgb(0.99, 0.96, 0.91);
  const blush = rgb(0.91, 0.78, 0.68);
  const clay = rgb(0.48, 0.34, 0.28);
  const cocoa = rgb(0.24, 0.18, 0.15);
  const sage = rgb(0.5, 0.58, 0.48);

  page.drawRectangle({ x: 0, y: 0, width, height, color: cream });
  page.drawRectangle({
    x: 34,
    y: 34,
    width: width - 68,
    height: height - 68,
    borderColor: blush,
    borderWidth: 2,
  });
  page.drawRectangle({
    x: 50,
    y: 50,
    width: width - 100,
    height: height - 100,
    borderColor: rgb(0.75, 0.57, 0.46),
    borderWidth: 0.7,
  });

  if (logo) {
    page.drawImage(logo, {
      x: (width - 58) / 2,
      y: 492,
      width: 58,
      height: 58,
    });
  }

  drawCenteredText(page, "THE LIGHTNESS OF BEING", sansBold, 13, 466, sage);
  drawCenteredText(page, "Gift Certificate", serifBold, 56, 400, cocoa);
  drawCenteredText(page, input.amountLabel, serifBold, 34, 346, clay);

  drawCenteredText(
    page,
    "for healing, calm, care, and embodied support",
    serif,
    18,
    304,
    cocoa,
  );

  page.drawLine({
    start: { x: 204, y: 257 },
    end: { x: 588, y: 257 },
    thickness: 0.8,
    color: blush,
  });
  drawCenteredText(page, "TO", sansBold, 10, 272, sage);

  const purchasedLabel = input.purchasedAt
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeZone: "America/New_York",
      }).format(new Date(input.purchasedAt * 1000))
    : new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeZone: "America/New_York",
      }).format(new Date());

  drawCenteredText(
    page,
    `Purchased by ${input.buyerName || "a loved one"} on ${purchasedLabel}`,
    serif,
    14,
    224,
    cocoa,
  );
  drawCenteredText(
    page,
    "Redeem toward private sessions, Reiki, sound healing, yoga, ceremonies, trainings, or offerings with Kate.",
    serif,
    13,
    194,
    cocoa,
  );
  drawCenteredText(page, "Certificate Code", sansBold, 10, 148, sage);
  drawCenteredText(page, certificateCode, sansBold, 21, 122, clay);
  drawCenteredText(
    page,
    "To redeem, contact Kate at bethelightness.com/contact and include this code.",
    sans,
    11,
    82,
    cocoa,
  );

  const bytes = await pdf.save();

  return {
    certificateCode,
    filename: `lightness-gift-certificate-${certificateCode}.pdf`,
    pdf: Buffer.from(bytes),
  };
}

async function embedLogo(pdf: PDFDocument) {
  try {
    const logoPath = path.join(
      process.cwd(),
      "public",
      "homepage-images",
      "hand-logo.png",
    );
    const logoBytes = await readFile(logoPath);

    return pdf.embedPng(logoBytes);
  } catch (error) {
    console.error("Gift certificate logo could not be embedded", error);
    return null;
  }
}

function drawCenteredText(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  y: number,
  color: RGB,
) {
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: (page.getWidth() - textWidth) / 2,
    y,
    size,
    font,
    color,
  });
}
