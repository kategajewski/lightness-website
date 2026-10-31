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

const intake = load("../src/lib/sound-bath-intake.ts");
function input(overrides = {}) {
  return {
    submissionId: "e62d16ea-46e5-417f-b145-c8a70634be55", formVersion: intake.SOUND_BATH_FORM_VERSION,
    fullName: "Synthetic Sound Client", email: "", phone: "555 010 1234",
    intentions: "Synthetic testing only", comfortNeeds: "", previousSoundExperience: "", referralSource: "",
    sessionFormat: "virtual", newsletterConsent: false, sessionReadiness: true, consentAccepted: true,
    signatureName: "Synthetic Sound Client", signatureDate: "2026-10-31", website: "", startedAt: Date.now() - 10000,
    ...overrides,
  };
}

test("sound bath intake supports both session formats and independently optional newsletter consent", () => {
  for (const sessionFormat of ["in-person", "virtual"]) {
    assert.equal(intake.validateSoundBathIntake(input({ sessionFormat })).success, true);
  }
  const missingEmail = intake.validateSoundBathIntake(input({ newsletterConsent: true }));
  assert.equal(missingEmail.success, false);
  assert.ok(missingEmail.errors.email);
  const normalized = intake.validateSoundBathIntake(input({
    fullName: "  Synthetic Client  ", intentions: "  Test  ", email: " CLIENT@EXAMPLE.INVALID ", newsletterConsent: true,
    comfortNeeds: "  Lower volume  ", previousSoundExperience: "  First time  ",
  }));
  assert.equal(normalized.success, true);
  assert.equal(normalized.data.email, "client@example.invalid");
  assert.equal(normalized.data.fullName, "Synthetic Client");
  assert.equal(normalized.data.intentions, "Test");
  assert.equal(normalized.data.comfortNeeds, "Lower volume");
  assert.equal(normalized.data.previousSoundExperience, "First time");
  assert.equal(intake.validateSoundBathIntake(input({ newsletterConsent: "true" })).data.newsletterConsent, false);
});

test("sound bath validation requires an explicit format and complete signed consent", () => {
  for (const [field, value] of [
    ["submissionId", "../../private"], ["formVersion", "reiki-2026-10-31-v2"],
    ["fullName", " "], ["phone", "123"], ["intentions", " "], ["email", "invalid"],
    ["sessionFormat", ""], ["sessionFormat", "hybrid"], ["sessionReadiness", false],
    ["consentAccepted", "true"], ["signatureName", ""], ["signatureDate", "2026-02-30"],
    ["intentions", "x".repeat(4001)], ["comfortNeeds", "x".repeat(3001)],
    ["previousSoundExperience", "x".repeat(3001)], ["referralSource", "x".repeat(1001)],
    ["fullName", { value: "name" }],
  ]) {
    const result = intake.validateSoundBathIntake(input({ [field]: value }));
    assert.equal(result.success, false, field);
    assert.ok(result.errors[field], field);
  }
});

function renderWithState(overrides = {}) {
  const component = load("../src/components/sound-bath-intake-form.tsx", {
    react: { ...React, useState(initial) {
      return React.useState(initial && typeof initial === "object" && Object.hasOwn(initial, "sessionFormat") ? { ...initial, ...overrides } : initial);
    } },
    "react/jsx-runtime": jsxRuntime, "@/lib/sound-bath-intake": intake,
    "./hypnotherapy-intake-form.module.css": { default: {} },
  });
  return renderToStaticMarkup(React.createElement(component.SoundBathIntakeForm));
}

test("initial sound bath HTML keeps sensitive answers out of GET URLs and locks submission until hydration", () => {
  const html = renderWithState();
  const form = html.match(/<form\b[^>]*>/)?.[0];
  assert.match(form, /method="post"/i);
  assert.match(form, /action="\/api\/client-intake\/sound-bath"/);
  assert.match(html, /Inner Journey Sound Bath/);
  assert.match(html, /Before your sound bath experience/);
  assert.match(html, /This form is for in-person and remote sessions/);
  assert.match(html, /<option value="in-person">In person<\/option>/);
  assert.match(html, /<option value="virtual">Remote<\/option>/);
  assert.match(html, /id="sessionReadiness"[^>]*disabled=""/);
  assert.match(html, /<noscript>[\s\S]*Please enable JavaScript[\s\S]*<\/noscript>/);
  assert.match(html, /<fieldset\b[^>]*disabled=""/);
  assert.match(html, /<button\b[^>]*type="submit"[^>]*disabled=""/);
  assert.doesNotMatch(html, /name="(?:medicalConditions|touchPreference|previousHypnotherapy)"/);
  for (const field of ["fullName", "phone", "email", "intentions", "comfortNeeds", "referralSource", "previousSoundExperience", "sessionFormat", "signatureName", "signatureDate"]) {
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

test("sound bath session branches show only the selected arrangements", () => {
  const inPerson = renderWithState({ sessionFormat: "in-person" });
  const remote = renderWithState({ sessionFormat: "virtual" });
  assert.ok(inPerson.includes(intake.soundBathSessionStatement("in-person")));
  assert.ok(remote.includes(intake.soundBathSessionStatement("virtual")));
  assert.ok(!inPerson.includes(intake.soundBathSessionStatement("virtual")));
  assert.ok(!remote.includes(intake.soundBathSessionStatement("in-person")));
  assert.doesNotMatch(inPerson, /name="touchPreference"/);
  assert.doesNotMatch(remote, /name="touchPreference"/);
});
