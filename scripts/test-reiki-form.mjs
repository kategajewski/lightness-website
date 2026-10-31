import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { test } from "node:test";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

function load(file, dependencies = {}) {
  const source = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const context = { exports: {}, require(name) {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected import: ${name}`);
    return dependencies[name];
  } };
  vm.runInNewContext(source, context, { filename: file });
  return context.exports;
}

const intake = load("../src/lib/reiki-intake.ts");
function input(overrides = {}) {
  return {
    submissionId: "e62d16ea-46e5-417f-b145-c8a70634be55", formVersion: intake.REIKI_FORM_VERSION,
    fullName: "Synthetic Reiki Client", email: "", phone: "555 010 1234",
    intentions: "Synthetic testing only", referralSource: "", previousReiki: "",
    sessionFormat: "virtual", touchPreference: "",
    newsletterConsent: false, remoteReadiness: true, consentAccepted: true,
    signatureName: "Synthetic Reiki Client", signatureDate: "2026-10-31", website: "", startedAt: Date.now() - 10000,
    ...overrides,
  };
}

test("new-client Reiki form preserves optional email and independently optional marketing consent", () => {
  assert.equal(intake.validateReikiIntake(input()).success, true);
  assert.equal(intake.validateReikiIntake(input({ newsletterConsent: true })).success, false);
  assert.ok(intake.validateReikiIntake(input({ newsletterConsent: true })).errors.email);
  const result = intake.validateReikiIntake(input({ fullName: "  Synthetic Client  ", intentions: "  Test  ", email: " CLIENT@EXAMPLE.INVALID ", newsletterConsent: true }));
  assert.equal(result.success, true);
  assert.equal(result.data.fullName, "Synthetic Client");
  assert.equal(result.data.email, "client@example.invalid");
  assert.equal(result.data.intentions, "Test");
  assert.equal(result.data.newsletterConsent, true);
  assert.equal(intake.validateReikiIntake(input({ newsletterConsent: "true" })).data.newsletterConsent, false);
});

test("Reiki validation requires current form, explicit session format and a complete signed consent", () => {
  for (const [field, value] of [
    ["submissionId", "../../private"], ["formVersion", "hypnotherapy-remote-2026-10-28-v1"],
    ["fullName", " "], ["phone", "123"], ["intentions", " "], ["email", "invalid"],
    ["sessionFormat", ""], ["sessionFormat", "hybrid"],
    ["remoteReadiness", false], ["consentAccepted", "true"], ["signatureName", ""],
    ["signatureDate", "2026-02-30"], ["intentions", "x".repeat(4001)],
    ["previousReiki", "x".repeat(3001)], ["referralSource", "x".repeat(1001)], ["fullName", { value: "name" }],
  ]) {
    const result = intake.validateReikiIntake(input({ [field]: value }));
    assert.equal(result.success, false, field);
    assert.ok(result.errors[field], field);
  }
});

test("in-person Reiki requires an explicit touch choice while remote sessions discard touch permission", () => {
  const missingTouch = intake.validateReikiIntake(input({ sessionFormat: "in-person" }));
  assert.equal(missingTouch.success, false);
  assert.ok(missingTouch.errors.touchPreference);
  for (const touchPreference of ["hands-off", "light-touch"]) {
    const result = intake.validateReikiIntake(input({ sessionFormat: "in-person", touchPreference }));
    assert.equal(result.success, true);
    assert.equal(result.data.touchPreference, touchPreference);
  }
  assert.equal(intake.validateReikiIntake(input({ sessionFormat: "in-person", touchPreference: "anything" })).success, false);
  const remote = intake.validateReikiIntake(input({ touchPreference: "light-touch" }));
  assert.equal(remote.success, true);
  assert.equal(remote.data.touchPreference, "");
  assert.equal(intake.validateReikiIntake(input({ formVersion: "reiki-remote-2026-10-31-v1" })).success, false);
  assert.match(intake.reikiSessionStatement("virtual"), /quiet, private space/);
  assert.match(intake.reikiSessionStatement("in-person"), /ongoing agreement/);
  assert.doesNotMatch(intake.reikiSessionStatement("in-person"), /driving|connection/);
  assert.doesNotMatch(intake.REIKI_CONSENT_PARAGRAPHS.join(" "), /will take place remotely/);
});

test("initial Reiki HTML prevents native GET submission and clearly applies to new clients in either format", () => {
  const component = load("../src/components/reiki-intake-form.tsx", {
    react: React, "react/jsx-runtime": jsxRuntime, "@/lib/reiki-intake": intake,
    "./hypnotherapy-intake-form.module.css": { default: {} },
  });
  const html = renderToStaticMarkup(React.createElement(component.ReikiIntakeForm));
  const form = html.match(/<form\b[^>]*>/)?.[0];
  assert.match(form, /method="post"/i);
  assert.match(form, /action="\/api\/client-intake\/reiki"/);
  assert.match(html, /before your first Reiki session with Kate/i);
  assert.match(html, /Returning Reiki clients do not need to complete a new intake/);
  assert.match(html, /This form is for in-person and remote sessions/);
  assert.doesNotMatch(html, /Virtual Reiki intake|first virtual Reiki session/);
  assert.match(html, /<option value="in-person">In person<\/option>/);
  assert.match(html, /<option value="virtual">Remote<\/option>/);
  assert.match(html, /id="remoteReadiness"[^>]*disabled=""/);
  assert.match(html, /<noscript>[\s\S]*Please enable JavaScript[\s\S]*<\/noscript>/);
  assert.match(html, /<fieldset\b[^>]*disabled=""/);
  assert.match(html, /<button\b[^>]*type="submit"[^>]*disabled=""/);
  assert.equal(html.includes("permission to be lightly touched"), false);
  assert.equal(html.includes("name=\"medicalConditions\""), false);
  for (const field of ["fullName", "phone", "email", "intentions", "referralSource", "previousReiki", "sessionFormat", "signatureName", "signatureDate"]) {
    assert.match(html, new RegExp(`for="${field}"`));
    assert.match(html, new RegExp(`id="${field}"`));
  }
  const fieldsets = [];
  for (const match of html.matchAll(/<\/?(?:fieldset|button)\b[^>]*>/gi)) {
    const tag = match[0];
    if (/^<fieldset\b/i.test(tag)) fieldsets.push(/\bdisabled(?:\s|=|>)/i.test(tag));
    else if (/^<\/fieldset\b/i.test(tag)) fieldsets.pop();
    else if (/^<button\b/i.test(tag) && /\btype="submit"/i.test(tag)) assert.equal(fieldsets.some(Boolean), false, "Retry stays outside locked answers");
  }
});

test("Reiki session branches show only the relevant consent and touch choices", () => {
  function renderSession(sessionFormat) {
    const component = load("../src/components/reiki-intake-form.tsx", {
      react: { ...React, useState(initial) {
        return React.useState(initial && typeof initial === "object" && Object.hasOwn(initial, "sessionFormat") ? { ...initial, sessionFormat } : initial);
      } },
      "react/jsx-runtime": jsxRuntime, "@/lib/reiki-intake": intake,
      "./hypnotherapy-intake-form.module.css": { default: {} },
    });
    return renderToStaticMarkup(React.createElement(component.ReikiIntakeForm));
  }
  const inPerson = renderSession("in-person");
  assert.match(inPerson, /name="touchPreference" value="hands-off"/);
  assert.match(inPerson, /name="touchPreference" value="light-touch"/);
  assert.match(inPerson, /My selected touch preference is subject to my comfort and ongoing agreement/);
  assert.doesNotMatch(inPerson, /If the connection drops/);
  const remote = renderSession("virtual");
  assert.doesNotMatch(remote, /name="touchPreference"/);
  assert.match(remote, /If the connection drops/);
  assert.doesNotMatch(remote, /My selected touch preference/);
});
