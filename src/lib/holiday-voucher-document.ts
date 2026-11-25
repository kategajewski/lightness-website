import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, rgb, StandardFonts, type PDFFont, type PDFPage } from "pdf-lib";

export type HolidayVoucherDocumentInput = {
  amountCents: number;
  voucherCode: string;
};

export const HOLIDAY_VOUCHER_TERMS =
  "Complimentary promotional voucher. Expires March 31, 2027. Valid toward private healing services. Transferable. Cannot be combined with other promotions. Terms and conditions apply.";

export function formatHolidayVoucherAmount(amountCents: number) {
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
    throw new Error("The promotional voucher amount must be a positive integer in cents.");
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
  }).format(amountCents / 100);
}

function assertVoucherCode(code: string) {
  if (!/^[A-Z0-9-]{8,80}$/.test(code)) {
    throw new Error("The promotional voucher code is invalid.");
  }
}

export function buildHolidayVoucherEmail(input: HolidayVoucherDocumentInput) {
  assertVoucherCode(input.voucherCode);
  const amount = formatHolidayVoucherAmount(input.amountCents);
  const subject = `Your complimentary ${amount} holiday voucher`;
  const opening = "Thank you for spreading a little light this holiday season!";
  const gift = `As a gift from me to you, please enjoy your complimentary ${amount} voucher toward a private healing experience at The Lightness Of Being.`;
  const transfer = "Keep it for yourself or pass a little extra love along to someone special.";
  const closing = "Wishing you a beautiful holiday season filled with love, light and a little extra magic.";
  const text = [
    opening,
    "",
    gift,
    "",
    transfer,
    "",
    "YOUR COMPLIMENTARY HOLIDAY VOUCHER",
    "",
    `Value: ${amount}`,
    "",
    `Voucher code: ${input.voucherCode}`,
    "",
    "Valid: January 1 - March 31, 2027",
    "Expires March 31, 2027 at 11:59 PM Eastern Time.",
    "",
    closing,
    "",
    "With love,",
    "",
    "Kate",
    "The Lightness Of Being",
    "",
    HOLIDAY_VOUCHER_TERMS,
  ].join("\n");
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:28px 16px;background:#f6eee5;color:#2f2520;">
  <div style="max-width:620px;margin:0 auto;border:1px solid #c9a79c;border-radius:24px;background:#fffaf4;overflow:hidden;font-family:Lato,'Avenir Next','Helvetica Neue',Arial,sans-serif;font-size:16px;line-height:1.7;">
    <div style="padding:30px 30px 24px;background:#efded7;">
      <p style="margin:0 0 10px;font-family:Belleza,Georgia,serif;font-size:14px;letter-spacing:1.5px;">THE LIGHTNESS OF BEING</p>
      <h1 style="margin:0;font-family:'Cormorant Garamond',Georgia,serif;font-size:34px;font-weight:400;line-height:1.15;">A Little Light Goes a Long Way</h1>
      <p style="margin:12px 0 0;">Give a little. Get a little.</p>
    </div>
    <div style="padding:28px 30px;">
      <p style="margin:0 0 20px;">${opening}</p>
      <p style="margin:0 0 20px;">${gift}</p>
      <p style="margin:0 0 24px;">${transfer}</p>
      <div style="padding:24px 20px;border:1px solid #c9a79c;border-radius:18px;background:#f8eee4;text-align:center;">
        <h2 style="margin:0 0 16px;font-size:14px;letter-spacing:1.2px;line-height:1.5;">YOUR COMPLIMENTARY HOLIDAY VOUCHER</h2>
        <p style="margin:0 0 8px;">Value: <strong style="font-family:'Cormorant Garamond',Georgia,serif;font-size:40px;line-height:1.2;">${amount}</strong></p>
        <p style="margin:0 0 16px;">Voucher code:<br><strong style="font-size:19px;letter-spacing:1px;overflow-wrap:anywhere;">${input.voucherCode}</strong></p>
        <p style="margin:0;font-weight:700;">Valid: January 1 - March 31, 2027</p>
        <p style="margin:8px 0 0;font-weight:700;">Expires March 31, 2027<br>at 11:59 PM Eastern Time</p>
      </div>
      <p style="margin:24px 0 20px;">${closing}</p>
      <p style="margin:0;">With love,</p>
      <p style="margin:10px 0 20px;"><span style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:28px;">Kate</span><br>The Lightness Of Being</p>
      <p style="margin:0;font-size:13px;color:#554842;line-height:1.65;"><em>${HOLIDAY_VOUCHER_TERMS}</em></p>
    </div>
  </div>
</body></html>`;
  return { subject, text, html };
}

export async function createHolidayVoucherPdf(input: HolidayVoucherDocumentInput) {
  assertVoucherCode(input.voucherCode);
  const amount = formatHolidayVoucherAmount(input.amountCents);
  // The same immutable voucher produces the same attachment on an email retry.
  const pdf = await PDFDocument.create({ updateMetadata: false });
  pdf.setTitle("Complimentary Holiday Voucher | The Lightness Of Being");
  pdf.setAuthor("The Lightness Of Being");
  pdf.setSubject("A Little Light Goes a Long Way. Valid January 1 through March 31, 2027.");
  const page = pdf.addPage([792, 612]);
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const cocoa = rgb(47 / 255, 37 / 255, 32 / 255);
  const rose = rgb(201 / 255, 167 / 255, 156 / 255);
  const cream = rgb(246 / 255, 240 / 255, 232 / 255);

  page.drawRectangle({ x: 0, y: 0, width: 792, height: 612, color: cream });
  page.drawRectangle({ x: 28, y: 28, width: 736, height: 556, borderWidth: 1.5, borderColor: rose });
  page.drawRectangle({ x: 42, y: 42, width: 708, height: 528, borderWidth: 0.5, borderColor: rose });

  try {
    const logo = await pdf.embedPng(await readFile(path.join(process.cwd(), "public/homepage-images/hand-logo.png")));
    page.drawImage(logo, { x: 375, y: 510, width: 42, height: 42 });
  } catch {
    // The brand name remains visible if the optional logo cannot be loaded.
  }

  const center = (text: string, font: PDFFont, size: number, y: number) => {
    const available = 660;
    const fittedSize = Math.min(size, available / font.widthOfTextAtSize(text, 1));
    page.drawText(text, { x: (792 - font.widthOfTextAtSize(text, fittedSize)) / 2, y, size: fittedSize, font, color: cocoa });
  };
  center("THE LIGHTNESS OF BEING", sansBold, 11, 488);
  center("A Little Light Goes a Long Way", serif, 34, 444);
  center("Give a little. Get a little.", serif, 18, 418);
  center("COMPLIMENTARY PROMOTIONAL VOUCHER", sansBold, 13, 378);
  center(amount, serifBold, 60, 310);
  center("toward a private healing experience", serif, 20, 279);
  center("VOUCHER CODE", sansBold, 10, 246);
  center(input.voucherCode, sansBold, 21, 218);
  page.drawRectangle({ x: 140, y: 128, width: 512, height: 66, color: rgb(239 / 255, 222 / 255, 215 / 255) });
  center("VALID JANUARY 1 - MARCH 31, 2027", sansBold, 15, 166);
  center("EXPIRES MARCH 31, 2027 AT 11:59 PM EASTERN TIME", sansBold, 12, 144);
  drawWrappedText(page, HOLIDAY_VOUCHER_TERMS, sans, 10, 96, 640, cocoa);
  return {
    filename: `lightness-complimentary-holiday-voucher-${input.voucherCode}.pdf`,
    pdf: Buffer.from(await pdf.save()),
  };
}

function drawWrappedText(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  y: number,
  maxWidth: number,
  color: ReturnType<typeof rgb>,
) {
  const lines: string[] = [];
  for (const word of text.split(" ")) {
    const candidate = lines.length ? `${lines[lines.length - 1]} ${word}` : word;
    if (lines.length && font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      lines[lines.length - 1] = candidate;
    } else {
      lines.push(word);
    }
  }
  lines.forEach((line, index) => {
    page.drawText(line, {
      x: (792 - font.widthOfTextAtSize(line, size)) / 2,
      y: y - index * 14,
      font,
      size,
      color,
    });
  });
}
