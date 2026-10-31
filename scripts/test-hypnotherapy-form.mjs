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

const intake = load("../src/lib/hypnotherapy-intake.ts");
function input(overrides = {}) {
  return {
    submissionId: "e62d16ea-46e5-417f-b145-c8a70634be55", formVersion: intake.HYPNOTHERAPY_FORM_VERSION,
    fullName: "Synthetic Hypnotherapy Client", preferredName: "", email: "test@example.invalid", phone: "555 010 1234",
    address: "", maritalStatus: "", occupation: "", previousHypnotherapy: "", previousTherapy: "",
    goals: "Synthetic testing only", previousEfforts: "", medicalConditions: "", sessionFormat: "in-person",
    newsletterConsent: false, remoteReadiness: true, consentAccepted: true,
    signatureName: "Synthetic Hypnotherapy Client", signatureDate: "2026-10-31", website: "", startedAt: Date.now() - 10000,
    ...overrides,
  };
}

test("hypnotherapy accepts either explicitly selected mode with its own arrangements", () => {
  for (const mode of ["in-person", "virtual"]) assert.equal(intake.validateHypnotherapyIntake(input({ sessionFormat: mode })).success, true);
  for (const mode of ["", "remote", undefined, 1]) {
    const result = intake.validateHypnotherapyIntake(input({ sessionFormat: mode }));
    assert.equal(result.success, false); assert.ok(result.errors.sessionFormat);
  }
  assert.match(intake.hypnotherapySessionStatement("virtual"), /connection drops/);
  assert.match(intake.hypnotherapySessionStatement("in-person"), /request a break or end/);
  assert.doesNotMatch(intake.hypnotherapySessionStatement("in-person"), /connection|driving|quiet, private/);
  assert.match(intake.hypnotherapySessionStatement(""), /choose your session format/);
});

test("hypnotherapy rejects stale remote-only forms and unconfirmed arrangements", () => {
  for (const [field, value] of [["formVersion", "hypnotherapy-remote-2026-10-28-v1"], ["remoteReadiness", false],
    ["remoteReadiness", "true"], ["consentAccepted", false], ["signatureName", ""], ["signatureDate", "2026-02-30"]]) {
    const result = intake.validateHypnotherapyIntake(input({ [field]: value }));
    assert.equal(result.success, false); assert.ok(result.errors[field]);
  }
});

test("hypnotherapy initial HTML is mode neutral, labelled and safe before hydration", () => {
  const component = load("../src/components/hypnotherapy-intake-form.tsx", {
    react: React, "react/jsx-runtime": jsxRuntime, "@/lib/hypnotherapy-intake": intake,
    "./hypnotherapy-intake-form.module.css": { default: {} },
  });
  const html = renderToStaticMarkup(React.createElement(component.HypnotherapyIntakeForm));
  const form = html.match(/<form\b[^>]*>/)?.[0];
  assert.match(form, /method="post"/i);
  assert.match(form, /action="\/api\/client-intake\/hypnotherapy"/);
  assert.match(html, /Before your hypnotherapy session/);
  assert.match(html, /in-person or remote session/);
  assert.doesNotMatch(html, /Before your virtual|Virtual hypnotherapy|Your virtual session/);
  assert.match(html, /<label for="sessionFormat"/);
  assert.match(html, /<option value="in-person">In person/);
  assert.match(html, /<option value="virtual">Virtual/);
  assert.match(html, /<input id="remoteReadiness"[^>]*disabled=""/);
  assert.match(html, /<fieldset\b[^>]*disabled=""/);
  assert.match(html, /<button\b[^>]*type="submit"[^>]*disabled=""/);
  assert.match(html, /<noscript>[\s\S]*enable JavaScript/);
});
