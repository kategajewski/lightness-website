import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import { test } from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const code = "HOLIDAY-ABCD-1234-EFGH";

function loadTypeScript(relativePath, dependencies = {}, globals = {}) {
  const source = ts.transpileModule(fs.readFileSync(new URL(relativePath, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const loadedModule = { exports: {} };
  const context = {
    exports: loadedModule.exports, module: loadedModule, Buffer, URL, Intl, AbortSignal,
    process, console,
    require(name) { return Object.hasOwn(dependencies, name) ? dependencies[name] : require(name); },
    ...globals,
  };
  // Keep PDF-library arrays and typed arrays in the same JavaScript realm.
  vm.compileFunction(source, Object.keys(context), { filename: relativePath })(...Object.values(context));
  return loadedModule.exports;
}

// The published bundle avoids hundreds of filesystem reads in a test worker.
const pdfLibrary = require(process.env.HOLIDAY_VOUCHER_PDF_TEST_MODULE || "pdf-lib/dist/pdf-lib.js");
const document = loadTypeScript("../src/lib/holiday-voucher-document.ts", { "pdf-lib": pdfLibrary });

for (const amountCents of [500, 1500, 2500, 5000, 10000]) {
  test(`the ${amountCents / 100} dollar voucher includes substituted value and dates in both email formats`, () => {
    const { subject, html, text } = document.buildHolidayVoucherEmail({ amountCents, voucherCode: code });
    const amount = `$${amountCents / 100}`;
    assert.match(subject, new RegExp(`\\${amount}`));
    for (const content of [html, text]) {
      assert.ok(content.includes(amount));
      assert.ok(content.includes(code));
      assert.ok(content.includes("January 1 - March 31, 2027"));
      assert.ok(content.includes("Expires March 31, 2027"));
      assert.ok(content.includes("11:59 PM Eastern Time"));
      assert.ok(content.includes(document.HOLIDAY_VOUCHER_TERMS));
      assert.ok(content.includes("Thank you for spreading a little light this holiday season!"));
      assert.ok(content.includes("Keep it for yourself or pass a little extra love along to someone special."));
      assert.ok(!/\[(?:VOUCHER_AMOUNT|VOUCHER_CODE)\]/.test(content));
      assert.ok(!content.includes("\u2014"));
    }
  });
}

test("all voucher attachments are valid single-page PDFs and retries have identical bytes", async () => {
  const { PDFDocument } = pdfLibrary;
  for (const amountCents of [500, 1500, 2500, 5000, 10000]) {
    const first = await document.createHolidayVoucherPdf({ amountCents, voucherCode: code });
    const second = await document.createHolidayVoucherPdf({ amountCents, voucherCode: code });
    assert.deepEqual(first.pdf, second.pdf);
    assert.ok(first.filename.includes(code));
    const pdf = await PDFDocument.load(first.pdf);
    assert.equal(pdf.getPageCount(), 1);
    assert.match(pdf.getTitle(), /Complimentary Holiday Voucher/);
  }
});

test("invalid voucher data is rejected before producing customer content", async () => {
  assert.throws(() => document.buildHolidayVoucherEmail({ amountCents: -5, voucherCode: code }), /positive integer/);
  assert.throws(() => document.buildHolidayVoucherEmail({ amountCents: 1.1, voucherCode: code }), /positive integer/);
  assert.throws(() => document.buildHolidayVoucherEmail({ amountCents: 500, voucherCode: "<script>bad</script>" }), /code is invalid/);
});

function transportHarness({ configured = true, rejected = false, ambiguous = false, missingId = false } = {}) {
  const requests = [];
  const transport = loadTypeScript("../src/lib/holiday-voucher-email.ts", {
    "server-only": {},
    "@/lib/env": { env: { emailFrom: configured ? "The Lightness Of Being <sender@example.invalid>" : "", resendApiKey: configured ? "synthetic-key" : "" } },
    "@/lib/holiday-voucher-document": document,
  }, {
    fetch: async (url, options) => {
      assert.equal(url, "https://api.resend.com/emails");
      requests.push({ options, body: JSON.parse(options.body) });
      if (ambiguous) throw new Error("Synthetic connection loss after provider acceptance");
      return { ok: !rejected, status: rejected ? 503 : 200, json: async () => missingId ? {} : { id: "synthetic-email-id" } };
    },
  });
  return { transport, requests };
}

const input = { voucherId: "synthetic-voucher-id", purchaserEmail: "purchaser@example.invalid", amountCents: 1500, voucherCode: code };

test("separate purchaser email carries a PDF and the same idempotency key and payload across retries", async () => {
  const h = transportHarness();
  const first = await h.transport.sendHolidayVoucherEmail(input);
  const second = await h.transport.sendHolidayVoucherEmail(input);
  assert.equal(first.providerId, "synthetic-email-id");
  assert.equal(first.idempotencyKey, second.idempotencyKey);
  assert.match(first.idempotencyKey, /^holiday-voucher-2026\/[a-f0-9]{64}$/);
  assert.equal(h.requests.length, 2);
  assert.equal(h.requests[0].options.headers["Idempotency-Key"], first.idempotencyKey);
  assert.equal(h.requests[0].options.body, h.requests[1].options.body);
  assert.equal(h.requests[0].body.to, input.purchaserEmail);
  assert.equal(h.requests[0].body.attachments.length, 1);
  assert.match(Buffer.from(h.requests[0].body.attachments[0].content, "base64").subarray(0, 5).toString(), /^%PDF-/);
});

for (const scenario of ["rejected", "ambiguous", "missingId"]) {
  test(`${scenario} email result remains a retryable failure without a second-provider send`, async () => {
    const h = transportHarness({ [scenario]: true });
    await assert.rejects(() => h.transport.sendHolidayVoucherEmail(input));
    assert.equal(h.requests.length, 1);
  });
}

test("unconfigured voucher email fails before any transport request", async () => {
  const h = transportHarness({ configured: false });
  assert.equal(h.transport.canSendHolidayVoucherEmail(), false);
  await assert.rejects(() => h.transport.sendHolidayVoucherEmail(input), /configured Resend sender/);
  assert.equal(h.requests.length, 0);
});

if (process.env.HOLIDAY_VOUCHER_PREVIEW_DIR) {
  const target = path.resolve(process.env.HOLIDAY_VOUCHER_PREVIEW_DIR);
  fs.mkdirSync(target, { recursive: true });
  const preview = document.buildHolidayVoucherEmail({ amountCents: 10000, voucherCode: code });
  const attachment = await document.createHolidayVoucherPdf({ amountCents: 10000, voucherCode: code });
  fs.writeFileSync(path.join(target, "complimentary-holiday-voucher-preview.pdf"), attachment.pdf);
  fs.writeFileSync(path.join(target, "complimentary-holiday-voucher-preview.html"), preview.html);
}
