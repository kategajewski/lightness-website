import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { SignedIntake } from "@/lib/intake-storage";
import { INTAKE_ANSWER_LABELS } from "@/lib/hypnotherapy-intake";
import { REIKI_INTAKE_ANSWER_LABELS } from "@/lib/reiki-intake";
import { CHILD_REIKI_ANSWER_LABELS } from "@/lib/children-reiki-intake";
import { SOUND_BATH_ANSWER_LABELS } from "@/lib/sound-bath-intake";

const pageWidth = 612;
const pageHeight = 792;
const margin = 48;
const contentWidth = pageWidth - margin * 2;
const ink = rgb(0.22, 0.19, 0.17);
const muted = rgb(0.39, 0.36, 0.33);
const rule = rgb(0.82, 0.79, 0.74);
let fontFiles: Promise<[Buffer, Buffer]> | undefined;

function getFontFiles() {
  fontFiles ??= Promise.all([
    readFile(path.join(process.cwd(), "public/fonts/intake/DejaVuSans.ttf")),
    readFile(path.join(process.cwd(), "public/fonts/intake/DejaVuSans-Bold.ttf")),
  ]).catch(() => {
    fontFiles = undefined;
    throw new Error("The signed intake PDF could not be prepared.");
  });
  return fontFiles;
}

function formatAnswer(format: string | undefined) {
  return format === "in-person" ? "In person" : format === "virtual" ? "Virtual" : format === undefined ? "Virtual (legacy intake)" : "Not provided";
}

function answerEntries(record: SignedIntake) {
  const labels = record.formType === "sound-bath" ? SOUND_BATH_ANSWER_LABELS
    : record.formType === "childrens-reiki" ? CHILD_REIKI_ANSWER_LABELS
      : record.formType === "reiki" ? REIKI_INTAKE_ANSWER_LABELS : INTAKE_ANSWER_LABELS;
  const answers = record.answers as unknown as Record<string, unknown>;
  return Object.entries(labels).map(([key, label]) => {
    let answer = answers[key];
    if (key === "sessionFormat") answer = formatAnswer(answers.sessionFormat as string | undefined);
    if (key === "touchPreference") answer = answers.sessionFormat !== "in-person" ? "Not applicable for a virtual session" : answers.touchPreference === "light-touch" ? "Light touch" : "Hands off";
    return { label, answer: typeof answer === "string" && answer ? answer : "Not provided" };
  });
}

function typeName(record: SignedIntake) {
  return record.formType === "sound-bath" ? "Inner Journey Sound Bath"
    : record.formType === "childrens-reiki" ? "Gentle Energy Support (children's Reiki)"
      : record.formType === "reiki" ? "Reiki, new client" : "Hypnotherapy";
}

/** Render a verified stored record without changing its signed content. */
export async function createSignedIntakePdf(record: SignedIntake): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  pdf.setTitle("Signed client intake");
  pdf.setAuthor("The Lightness of Being");
  pdf.setSubject("Private signed record");
  pdf.setCreator("The Lightness of Being");
  const [regularBytes, boldBytes] = await getFontFiles();
  const fontOptions = { subset: true, features: { liga: false, clig: false } };
  const regular = await pdf.embedFont(regularBytes, fontOptions);
  const bold = await pdf.embedFont(boldBytes, fontOptions);
  const boldCharacters = new Set(bold.getCharacterSet());
  const available = new Set(regular.getCharacterSet().filter(code => boldCharacters.has(code)));
  let hasUnicodeEscapes = false;
  function safeText(text: string) {
    return Array.from(text.replace(/\r\n?/g, "\n")).map(character => {
      if (character === "\n") return character;
      if (character === "\t") return "    ";
      const code = character.codePointAt(0)!;
      if (available.has(code) && code >= 32) return character;
      hasUnicodeEscapes = true;
      return `[U+${code.toString(16).toUpperCase().padStart(4, "0")}]`;
    }).join("");
  }
  function wrap(text: string, font: PDFFont, size: number) {
    const lines: string[] = [];
    for (const paragraph of safeText(text).split("\n")) {
      if (!paragraph) { lines.push(""); continue; }
      let line = "";
      for (const token of paragraph.match(/\S+|\s+/gu) ?? []) {
        if (font.widthOfTextAtSize(line + token, size) <= contentWidth) { line += token; continue; }
        if (line) { lines.push(line.trimEnd()); line = ""; }
        if (!token.trim()) continue;
        if (font.widthOfTextAtSize(token, size) <= contentWidth) { line = token; continue; }
        for (const character of Array.from(token)) {
          if (line && font.widthOfTextAtSize(line + character, size) > contentWidth) { lines.push(line); line = ""; }
          line += character;
        }
      }
      if (line) lines.push(line.trimEnd());
    }
    return lines;
  }

  let page: PDFPage;
  let y = 0;
  function nextPage() {
    page = pdf.addPage([pageWidth, pageHeight]);
    page.drawText("THE LIGHTNESS OF BEING", { x: margin, y: pageHeight - 39, size: 8, font: bold, color: muted });
    page.drawText("Private signed intake", { x: pageWidth - margin - 112, y: pageHeight - 39, size: 8, font: regular, color: muted });
    page.drawLine({ start: { x: margin, y: pageHeight - 49 }, end: { x: pageWidth - margin, y: pageHeight - 49 }, color: rule, thickness: 0.6 });
    y = pageHeight - 76;
  }
  function ensure(height: number) { if (y - height < 49) nextPage(); }
  function paragraph(text: string, options: { bold?: boolean; size?: number; gap?: number; color?: ReturnType<typeof rgb> } = {}) {
    const font = options.bold ? bold : regular;
    const size = options.size ?? 10;
    const leading = size * 1.5;
    for (const line of wrap(text, font, size)) {
      ensure(leading);
      if (line) page.drawText(line, { x: margin, y, size, font, color: options.color ?? ink });
      y -= leading;
    }
    y -= options.gap ?? 7;
  }
  function heading(text: string) {
    ensure(58);
    y -= 8;
    paragraph(text, { bold: true, size: 12, gap: 4 });
  }
  function entry(label: string, value: string) {
    ensure(46);
    paragraph(label, { bold: true, gap: 1 });
    paragraph(value, { gap: 11 });
  }
  function recordDetail(label: string, value: string) {
    ensure(35);
    paragraph(label, { bold: true, size: 9, gap: 0 });
    paragraph(value, { size: 9, gap: 5 });
  }

  nextPage();
  paragraph("Signed client intake", { bold: true, size: 20, gap: 4 });
  paragraph(typeName(record), { bold: true, size: 12, gap: 8 });
  paragraph(record.formType === "childrens-reiki" ? record.answers.childName : record.answers.fullName, { size: 16, gap: 4 });
  if (record.formType === "childrens-reiki") paragraph(`Parent or legal guardian: ${record.answers.fullName}`, { gap: 4 });
  paragraph(`Received ${new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short", timeZone: "America/New_York" }).format(new Date(record.submittedAt))} Eastern`, { size: 9, color: muted, gap: 12 });

  heading("Client answers");
  for (const entryData of answerEntries(record)) entry(entryData.label, entryData.answer);
  heading("Session arrangements");
  paragraph(record.consent.remoteSessionStatement);
  paragraph(record.formType === "childrens-reiki" ? "Confirmed by parent or legal guardian." : "Confirmed by client.");
  if (record.consent.guardianAuthorityStatement) {
    heading("Parent or legal guardian authority");
    paragraph(record.consent.guardianAuthorityStatement);
    paragraph("Confirmed by parent or legal guardian.");
  }
  heading("Consent");
  for (const consent of record.consent.paragraphs) paragraph(consent);
  paragraph(record.consent.electronicSignatureStatement);
  heading(record.formType === "childrens-reiki" ? "Parent or legal guardian signature" : "Electronic signature");
  paragraph(record.signature.name, { size: 16 });
  paragraph(`Signature date: ${record.signature.date}`, { gap: 2 });
  paragraph("Method: typed full name. Consent accepted.", { gap: 2 });
  paragraph(`Signature recorded by server: ${record.signature.recordedAt}`, { size: 9 });
  heading("Privacy notice");
  paragraph(record.consent.privacyNotice);
  paragraph(`Newsletter preference: ${record.answers.newsletterConsent ? "Client asked to receive updates." : "Client did not ask to receive updates."}`);
  heading("Record details");
  recordDetail("Form version", record.formVersion);
  recordDetail("Reference", record.id);
  recordDetail("Received by server (UTC)", record.submittedAt);
  recordDetail("Request fingerprint", record.requestDigest);
  recordDetail("Record fingerprint", record.recordDigest);
  heading("Original signed record");
  paragraph("This PDF includes the unchanged signed record as an attached JSON file named signed-record.json. The attachment preserves every original field and character for verification.", { size: 9 });
  if (hasUnicodeEscapes) paragraph("Characters outside the embedded font are shown as [U+XXXX] Unicode code points. The original characters are preserved in the attached signed record.", { size: 9 });

  await pdf.attach(Buffer.from(JSON.stringify(record), "utf8"), "signed-record.json", {
    mimeType: "application/json",
    description: "Original unchanged signed client intake record",
  });
  const pages = pdf.getPages();
  for (const [index, current] of pages.entries()) {
    current.drawLine({ start: { x: margin, y: 35 }, end: { x: pageWidth - margin, y: 35 }, color: rule, thickness: 0.6 });
    current.drawText(`Private client record | Page ${index + 1} of ${pages.length}`, { x: margin, y: 23, size: 8, font: regular, color: muted });
  }
  return Buffer.from(await pdf.save());
}
