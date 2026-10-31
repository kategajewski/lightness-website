import assert from "node:assert/strict";
import fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test } from "node:test";

const stageRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const sourceRoot = process.env.LIGHTNESS_TEST_SOURCE_ROOT ?? stageRoot;
const require = createRequire(path.join(process.env.LIGHTNESS_TEST_DEPENDENCY_ROOT ?? sourceRoot, "package.json"));
const localRequire = createRequire(path.join(stageRoot, "package.json"));
const ts = require("typescript");
const pdfLib = require("pdf-lib");
let fontkit;
try { fontkit = localRequire("@pdf-lib/fontkit"); } catch { fontkit = require("@pdf-lib/fontkit"); }
const pdfjsRoot = process.env.LIGHTNESS_TEST_PDFJS_ROOT ?? "/Users/magicalbeing/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pdfjs-dist";
const pdfjs = await import(pathToFileURL(path.join(pdfjsRoot, "legacy/build/pdf.mjs")).href);

function load(file, dependencies = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText;
  const context = {
    exports: {}, Buffer, Intl,
    process: { cwd: () => stageRoot },
    console: new Proxy({}, { get() { return () => { throw new Error("Unexpected logging while rendering a signed intake"); }; } }),
    require(name) {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  };
  // pdf-lib validates Array instances, so render in this realm while supplying
  // an explicit dependency map and a staging-only cwd.
  new Function(...Object.keys(context), source)(...Object.values(context));
  return context.exports;
}
const modules = {};
for (const name of ["hypnotherapy", "reiki", "children-reiki", "sound-bath"]) {
  modules[`@/lib/${name}-intake`] = load(path.join(sourceRoot, `src/lib/${name}-intake.ts`));
}
const renderer = load(path.join(stageRoot, "src/lib/intake-pdf.ts"), {
  ...modules, "server-only": {}, "node:fs/promises": fsPromises, "node:path": path,
  "@pdf-lib/fontkit": fontkit, "pdf-lib": pdfLib,
});
function deepFreeze(value) {
  if (value && typeof value === "object") { Object.values(value).forEach(deepFreeze); Object.freeze(value); }
  return value;
}
function makeRecord(formType, extras = {}) {
  return {
    id: "33492f7f-1686-4b48-97ee-51863f932859", submittedAt: "2026-10-31T17:34:56.000Z",
    formVersion: `${formType ?? "hypnotherapy"}-historical-version`,
    answers: {
      submissionId: "33492f7f-1686-4b48-97ee-51863f932859", formVersion: "signed-historical-answer-version",
      fullName: "Zoë Łukasz Жанна", preferredName: "Zee", email: "synthetic@example.invalid", phone: "555 010 1234",
      address: "17 Synthetic Street\nImaginary Town", maritalStatus: "Synthetic marital answer", occupation: "Synthetic occupation",
      previousHypnotherapy: "no", previousTherapy: "Synthetic therapy answer", goals: "Synthetic goal answer",
      previousEfforts: "Synthetic efforts answer", medicalConditions: "Synthetic medical answer",
      childName: "Élodie Synthetic", childAge: "8", relationship: "Parent", intentions: "Synthetic intentions answer",
      comfortNeeds: "Quiet volume\nPlease explain transitions", referralSource: "Synthetic referral answer",
      previousReiki: "Synthetic Reiki answer", previousSoundExperience: "Synthetic sound answer",
      sessionFormat: "in-person", touchPreference: "hands-off", newsletterConsent: true,
      guardianAuthority: true, sessionReadiness: true, remoteReadiness: true, consentAccepted: true,
      signatureName: "Zoë Łukasz Жанна", signatureDate: "2026-10-31",
    },
    consent: {
      paragraphs: ["Historical consent snapshot one. This text must never come from a newer template.", "Historical consent snapshot two."],
      privacyNotice: "Historical privacy notice exactly as signed.",
      remoteSessionStatement: "Historical session arrangement exactly as signed.",
      electronicSignatureStatement: "Historical electronic signature statement exactly as signed.",
      ...(formType === "childrens-reiki" ? { guardianAuthorityStatement: "Historical guardian authority exactly as signed." } : {}),
    },
    signature: { method: "typed-name", name: "Zoë Łukasz Жанна", date: "2026-10-31", recordedAt: "2026-10-31T17:34:56.000Z" },
    requestDigest: "0123456789abcdef".repeat(4), recordDigest: "fedcba9876543210".repeat(4),
    ...(formType ? { formType } : {}), ...extras,
  };
}
function normalize(text) { return text.replace(/\s+/g, " ").trim(); }
async function openPdf(buffer) {
  return pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: false, disableFontFace: true }).promise;
}
async function extract(document) {
  const pieces = [];
  for (let number = 1; number <= document.numPages; number += 1) {
    const page = await document.getPage(number);
    const content = await page.getTextContent();
    for (const item of content.items) {
      if (!item.str) continue;
      assert.ok(item.transform[4] >= 47, `Text starts outside its margin on page ${number}`);
      assert.ok(item.transform[4] + item.width <= 565, `Text exceeds its right margin on page ${number}: ${item.str}`);
      assert.ok(item.transform[5] >= 20 && item.transform[5] <= 756, `Text exceeds page bounds on page ${number}`);
      pieces.push(item.str);
    }
  }
  return normalize(pieces.join(" "));
}
await fsPromises.mkdir(path.join(stageRoot, "output/pdf"), { recursive: true });

for (const [formType, title, labels] of [
  [undefined, "Hypnotherapy", modules["@/lib/hypnotherapy-intake"].INTAKE_ANSWER_LABELS],
  ["reiki", "Reiki, new client", modules["@/lib/reiki-intake"].REIKI_INTAKE_ANSWER_LABELS],
  ["childrens-reiki", "Gentle Energy Support (children's Reiki)", modules["@/lib/children-reiki-intake"].CHILD_REIKI_ANSWER_LABELS],
  ["sound-bath", "Inner Journey Sound Bath", modules["@/lib/sound-bath-intake"].SOUND_BATH_ANSWER_LABELS],
]) {
  test(`${formType ?? "hypnotherapy"} PDF includes every labeled answer, original consent, signature and exact JSON attachment`, async () => {
    const record = deepFreeze(makeRecord(formType));
    const original = JSON.stringify(record);
    const buffer = await renderer.createSignedIntakePdf(record);
    assert.ok(Buffer.isBuffer(buffer));
    assert.match(buffer.subarray(0, 8).toString(), /^%PDF-/);
    assert.equal(JSON.stringify(record), original);
    const document = await openPdf(buffer);
    const text = await extract(document);
    assert.ok(text.includes(title));
    for (const [key, label] of Object.entries(labels)) {
      assert.ok(text.includes(label), label);
      const answer = key === "sessionFormat" ? "In person" : key === "touchPreference" ? "Hands off" : record.answers[key];
      assert.ok(text.includes(normalize(answer)), `Missing answer: ${key}`);
    }
    for (const value of [...record.consent.paragraphs, record.consent.privacyNotice,
      record.consent.remoteSessionStatement, record.consent.electronicSignatureStatement,
      record.signature.name, record.signature.date, record.signature.recordedAt,
      record.submittedAt, record.formVersion, record.id, record.requestDigest, record.recordDigest]) {
      assert.ok(text.includes(value), `Missing signed content: ${value}`);
    }
    assert.ok(text.includes("Newsletter preference: Client asked to receive updates."));
    if (formType === "childrens-reiki") {
      assert.ok(text.includes("Parent or legal guardian signature"));
      assert.ok(text.includes(record.consent.guardianAuthorityStatement));
    }
    const attachments = await document.getAttachments();
    const attachment = Object.values(attachments).find(item => item.filename === "signed-record.json");
    assert.ok(attachment);
    assert.equal(Buffer.from(attachment.content).toString("utf8"), original);
    await fsPromises.writeFile(path.join(stageRoot, `output/pdf/synthetic-${formType ?? "hypnotherapy"}.pdf`), buffer);
    await document.destroy();
  });
}

test("legacy remote intake uses its original snapshots and labels missing format without changing the record", async () => {
  const record = makeRecord("reiki");
  delete record.answers.sessionFormat;
  delete record.answers.touchPreference;
  record.answers.newsletterConsent = false;
  record.consent.remoteSessionStatement = "Historical remote-only session confirmation.";
  const buffer = await renderer.createSignedIntakePdf(deepFreeze(record));
  const document = await openPdf(buffer);
  const text = await extract(document);
  for (const value of ["Virtual (legacy intake)", "Not applicable for a virtual session", record.consent.remoteSessionStatement, "Client did not ask to receive updates."]) assert.ok(text.includes(value), value);
  await fsPromises.writeFile(path.join(stageRoot, "output/pdf/synthetic-legacy-reiki.pdf"), buffer);
  await document.destroy();
});

test("long multiline answers paginate without truncation and unsupported Unicode is preserved explicitly and in JSON", async () => {
  const record = makeRecord("sound-bath");
  record.answers.fullName = "李明 Zoë 🤍";
  record.signature.name = record.answers.fullName;
  const markers = Array.from({ length: 230 }, (_, index) => `LONGANSWER${String(index).padStart(3, "0")}`);
  record.answers.intentions = markers.map(marker => `${marker} office affinity Synthetic answer with safe wrapping.`).join("\n");
  record.answers.comfortNeeds = `Unbroken token: ${"x".repeat(2000)}\nFINAL-LONG-ANSWER-MARKER`;
  const original = JSON.stringify(record);
  const buffer = await renderer.createSignedIntakePdf(deepFreeze(record));
  const document = await openPdf(buffer);
  assert.ok(document.numPages >= 8, `Expected several pages, got ${document.numPages}`);
  const text = await extract(document);
  for (const marker of markers) assert.ok(text.includes(marker), marker);
  for (const value of ["FINAL-LONG-ANSWER-MARKER", "[U+674E][U+660E] Zoë [U+1F90D]", "Characters outside the embedded font", record.recordDigest, "Original signed record"]) assert.ok(text.includes(value), value);
  assert.equal((text.match(/office affinity/g) ?? []).length, markers.length, "Font ligatures must not lose extractable letters");
  const attachments = await document.getAttachments();
  assert.equal(Buffer.from(Object.values(attachments)[0].content).toString("utf8"), original);
  assert.equal(JSON.stringify(record), original);
  await fsPromises.writeFile(path.join(stageRoot, "output/pdf/synthetic-long-unicode.pdf"), buffer);
  await document.destroy();
});
