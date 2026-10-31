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

const intake = load("../src/lib/children-reiki-intake.ts");
function input(overrides = {}) {
  return { submissionId: "e62d16ea-46e5-417f-b145-c8a70634be55", formVersion: intake.CHILD_REIKI_FORM_VERSION,
    fullName: "Synthetic Parent", phone: "555 010 1234", email: "", childName: "Synthetic Child", childAge: "8", relationship: "Parent",
    intentions: "Synthetic testing only", comfortNeeds: "", referralSource: "", previousReiki: "", sessionFormat: "in-person", touchPreference: "hands-off",
    newsletterConsent: false, guardianAuthority: true, sessionReadiness: true, consentAccepted: true,
    signatureName: "Synthetic Parent", signatureDate: "2026-10-31", website: "", startedAt: Date.now()-10000, ...overrides };
}

test("parent intake uses parent contact with optional email and explicit parent mailing preference", () => {
  assert.equal(intake.validateChildReikiIntake(input()).success,true);
  const noEmail=intake.validateChildReikiIntake(input({newsletterConsent:true}));
  assert.equal(noEmail.success,false); assert.ok(noEmail.errors.email);
  const result=intake.validateChildReikiIntake(input({email:" PARENT@EXAMPLE.INVALID ",fullName:" Synthetic Parent ",newsletterConsent:true}));
  assert.equal(result.success,true); assert.equal(result.data.email,"parent@example.invalid"); assert.equal(result.data.fullName,"Synthetic Parent");
  assert.equal(intake.validateChildReikiIntake(input({newsletterConsent:"true"})).data.newsletterConsent,false);
});

test("child form rejects missing guardian authority, adult ages and invalid signed consent", () => {
  for (const [field,value] of [["guardianAuthority",false],["guardianAuthority","true"],["fullName",""],["childName",""],["relationship",""],
    ["childAge","18"],["childAge","-1"],["childAge","2.5"],["childAge",""],["childAge",8],["sessionFormat","other"],
    ["sessionReadiness",false],["consentAccepted",false],["signatureName",""],["signatureDate","2026-02-30"],
    ["formVersion","reiki-remote-2026-10-31-v1"],["intentions",""],["comfortNeeds","x".repeat(3001)]]) {
    const result=intake.validateChildReikiIntake(input({[field]:value})); assert.equal(result.success,false,field); assert.ok(result.errors[field],field);
  }
  for(const age of ["0","1","17"]) assert.equal(intake.validateChildReikiIntake(input({childAge:age})).success,true);
});

test("in-person touch choice and virtual arrangements remain distinct", () => {
  assert.equal(intake.validateChildReikiIntake(input({touchPreference:""})).success,false);
  assert.equal(intake.validateChildReikiIntake(input({touchPreference:"light-touch"})).success,true);
  const remote=intake.validateChildReikiIntake(input({sessionFormat:"virtual",touchPreference:"light-touch"}));
  assert.equal(remote.success,true); assert.equal(remote.data.touchPreference,"");
  assert.match(intake.childReikiSessionStatement("virtual"),/remain available/);
  assert.match(intake.childReikiSessionStatement("in-person"),/child.*comfort and agreement/);
  assert.match(intake.CHILD_REIKI_CONSENT_PARAGRAPHS.join(" "),/consent does not override my child's wishes/);
});

test("parent form SSR has safe POST, parent-specific signature and no child email or date of birth", () => {
  const component=load("../src/components/children-reiki-intake-form.tsx",{react:React,"react/jsx-runtime":jsxRuntime,
    "@/lib/children-reiki-intake":intake,"./hypnotherapy-intake-form.module.css":{default:{}}});
  const html=renderToStaticMarkup(React.createElement(component.ChildReikiIntakeForm));
  const form = html.match(/<form\b[^>]*>/)?.[0];
  assert.match(form,/method="post"/);
  assert.match(form,/action="\/api\/client-intake\/childrens-reiki"/);
  assert.match(html,/Gentle Energy Support/); assert.match(html,/parent or legal guardian/i);
  assert.match(html,/<fieldset[^>]+disabled=""/); assert.match(html,/<noscript>[\s\S]*enable JavaScript/);
  assert.match(html,/<button[^>]+type="submit"[^>]+disabled=""/);
  for(const field of ["fullName","phone","email","relationship","childName","childAge","intentions","comfortNeeds","guardianAuthority","signatureName","signatureDate","sessionFormat"])
    assert.match(html,new RegExp(`id="${field}"`));
  assert.equal(/name="(?:childEmail|dateOfBirth|childBirthDate|address)"/.test(html),false);
  const fields=[];
  for(const match of html.matchAll(/<\/?(?:fieldset|button)\b[^>]*>/gi)) {
    const tag=match[0];
    if(/^<fieldset\b/i.test(tag)) fields.push(/\bdisabled(?:\s|=|>)/i.test(tag));
    else if(/^<\/fieldset\b/i.test(tag)) fields.pop();
    else if(/^<button\b/i.test(tag)&&/\btype="submit"/i.test(tag)) assert.equal(fields.some(Boolean),false);
  }
});
