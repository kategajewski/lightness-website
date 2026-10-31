"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  CHILD_REIKI_ELECTRONIC_SIGNATURE_STATEMENT,
  CHILD_REIKI_CONSENT_PARAGRAPHS,
  CHILD_REIKI_FORM_VERSION,
  CHILD_REIKI_PRIVACY_NOTICE,
  CHILD_REIKI_ANSWER_LABELS,
  CHILD_REIKI_GUARDIAN_AUTHORITY_STATEMENT,
  childReikiSessionStatement,
  validateChildReikiIntake,
  type ChildReikiIntakeInput,
  type ChildReikiIntakeFieldErrors,
} from "@/lib/children-reiki-intake";
import styles from "./hypnotherapy-intake-form.module.css";

type Answers = Omit<ChildReikiIntakeInput, "submissionId" | "formVersion" | "startedAt">;
type TextAnswer = {
  [K in keyof Answers]: Answers[K] extends string ? K : never;
}[keyof Answers];
type Receipt = { id: string; submittedAt: string; answers: ChildReikiIntakeInput };

const initialAnswers: Answers = {
  fullName: "", email: "", phone: "", childName: "", childAge: "", relationship: "",
  intentions: "", comfortNeeds: "", referralSource: "", previousReiki: "",
  sessionFormat: "", touchPreference: "", newsletterConsent: false, guardianAuthority: false,
  sessionReadiness: false, consentAccepted: false, signatureName: "", signatureDate: "", website: "",
};

function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function formattedDate(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
    : value;
}

export function ChildReikiIntakeForm() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [errors, setErrors] = useState<ChildReikiIntakeFieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [pendingPayload, setPendingPayload] = useState<ChildReikiIntakeInput | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const receiptRef = useRef<HTMLHeadingElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const identity = useRef<{ submissionId: string; startedAt: number } | null>(null);

  useEffect(() => {
    identity.current = { submissionId: crypto.randomUUID(), startedAt: Date.now() };
    setAnswers((current) => ({ ...current, signatureDate: localDate() }));
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (receipt) receiptRef.current?.focus();
  }, [receipt]);

  function update<K extends keyof Answers>(key: K, value: Answers[K]) {
    setAnswers((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function focusFirstError(fieldErrors: ChildReikiIntakeFieldErrors) {
    requestAnimationFrame(() => {
      const first = Array.from(formRef.current?.elements ?? []).find((element) => {
        const field = element as HTMLInputElement;
        return field.name && fieldErrors[field.name as keyof ChildReikiIntakeInput];
      });
      if (first) (first as HTMLElement).focus();
      else errorSummaryRef.current?.focus();
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || !isReady) return;
    if (!identity.current) identity.current = { submissionId: crypto.randomUUID(), startedAt: Date.now() };
    const validation = validateChildReikiIntake(pendingPayload ?? {
      ...answers,
      ...identity.current,
      formVersion: CHILD_REIKI_FORM_VERSION,
    });
    setErrors(validation.errors);
    setErrorMessage("");
    if (!validation.success || !validation.data) {
      setErrorMessage("Please check the questions marked below before submitting.");
      focusFirstError(validation.errors);
      return;
    }

    const payload = validation.data;
    setPendingPayload(payload);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/client-intake/childrens-reiki", {
        method: "POST",
        credentials: "same-origin",
        referrerPolicy: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status < 500) setPendingPayload(null);
        const fieldErrors: ChildReikiIntakeFieldErrors = result?.errors ?? result?.fieldErrors ?? {};
        setErrors(fieldErrors);
        setErrorMessage(typeof result?.error === "string"
          ? result.error
          : "Your form could not be submitted. Your answers are still here. Please try again.");
        focusFirstError(fieldErrors);
        return;
      }
      if (typeof result?.id !== "string" || typeof result?.submittedAt !== "string") {
        throw new Error("Missing submission receipt");
      }
      setReceipt({ id: result.id, submittedAt: result.submittedAt, answers: payload });
    } catch {
      setErrorMessage("We could not confirm your submission. Your answers are still here. Please try submitting again.");
      focusFirstError({});
    } finally {
      setIsSubmitting(false);
    }
  }

  function description(key: keyof Answers, hint?: string) {
    return [hint ? `${key}-hint` : "", errors[key] ? `${key}-error` : ""].filter(Boolean).join(" ") || undefined;
  }

  function field({ key, label, required = false, type = "text", autoComplete, hint, multiline = false, maxLength = 150, numeric = false }: {
    key: TextAnswer;
    label: string;
    required?: boolean;
    type?: "text" | "email" | "tel" | "date";
    autoComplete?: string;
    hint?: string;
    multiline?: boolean;
    maxLength?: number;
    numeric?: boolean;
  }) {
    const shared = {
      id: key,
      name: key,
      value: answers[key],
      required,
      "aria-required": required || undefined,
      "aria-invalid": Boolean(errors[key]) || undefined,
      "aria-describedby": description(key, hint),
      maxLength,
      autoComplete,
      inputMode: numeric ? "numeric" as const : undefined,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(key, event.target.value as Answers[typeof key]),
    };
    return (
      <div className={styles.field}>
        <label htmlFor={key} className={styles.label}>
          {label} {required ? <span className={styles.optional}>(required)</span> : <span className={styles.optional}>(optional)</span>}
        </label>
        {hint ? <p className={styles.hint} id={`${key}-hint`}>{hint}</p> : null}
        {multiline ? <textarea {...shared} className={styles.textarea} rows={4} /> : <input {...shared} type={type} className={styles.input} />}
        {errors[key] ? <p className={styles.error} id={`${key}-error`}>{errors[key]}</p> : null}
      </div>
    );
  }

  const consent = <div className={styles.consent}>
    {CHILD_REIKI_CONSENT_PARAGRAPHS.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
  </div>;

  return (
    <main className={styles.root} id="children-reiki-intake">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Gentle Energy Support · Children</p>
        <h1 className={styles.title}>Before your child’s Reiki session</h1>
        <p>A little about your child, from you. This form is for a parent or legal guardian to complete and sign before their child’s Gentle Energy Support session with Kate.</p>
        <p>No account is needed. Questions marked required must be completed. Please keep this page open until you see your confirmation.</p>
      </div>

      {receipt ? <>
        <section className={styles.status} aria-labelledby="intake-received">
          <h2 id="intake-received" ref={receiptRef} tabIndex={-1}>Your child’s intake form has been received.</h2>
          <p>Thank you for sharing. Kate can review your child’s intake before the session. You can save or print your completed form below.</p>
        </section>
        <div className={`${styles.noPrint} mb-6`}>
          <button type="button" className={`button-pill ${styles.submit}`} onClick={() => window.print()}>Save or print a copy</button>
          <p className={`${styles.hint} mt-3`}>Choose Save as PDF in your print options to keep a digital copy. Save it somewhere private.</p>
        </div>
        <article className={styles.receipt} aria-labelledby="completed-intake-title">
          <p className={styles.eyebrow}>The Lightness of Being</p>
          <h2 id="completed-intake-title">Gentle Energy Support parent intake</h2>
          <p className={styles.receiptMeta}>Received {new Date(receipt.submittedAt).toLocaleString()}<br />Reference: {receipt.id}<br />Form version: {CHILD_REIKI_FORM_VERSION}</p>
          <h3>Your answers</h3>
          <dl>
            {(Object.entries(CHILD_REIKI_ANSWER_LABELS) as [keyof typeof CHILD_REIKI_ANSWER_LABELS, string][]).map(([key, label]) => <div key={key}>
              <dt>{label}</dt>
              <dd>{key === "sessionFormat" ? (receipt.answers.sessionFormat === "in-person" ? "In person" : "Virtual") : key === "touchPreference" ? (receipt.answers.sessionFormat === "virtual" ? "Not applicable to a virtual session" : receipt.answers.touchPreference === "hands-off" ? "Hands-off support" : "Light touch only if my child is comfortable") : receipt.answers[key] || "Not provided"}</dd>
            </div>)}
            <div><dt>Optional newsletter preference</dt><dd>{receipt.answers.newsletterConsent ? "Yes, I would like to receive occasional email updates." : "I did not request email updates."}</dd></div>
          </dl>
          <h3>Session arrangements</h3>
          <p>{childReikiSessionStatement(receipt.answers.sessionFormat)}</p>
          <p><strong>Confirmed</strong></p>
          <h3>Parent or guardian authority</h3>
          <p>{CHILD_REIKI_GUARDIAN_AUTHORITY_STATEMENT}</p>
          <p><strong>Confirmed</strong></p>
          <h3>Consent</h3>
          {consent}
          <p className="mt-4">{CHILD_REIKI_ELECTRONIC_SIGNATURE_STATEMENT}</p>
          <dl>
            <div><dt>Parent or legal guardian’s electronic signature</dt><dd>{receipt.answers.signatureName}</dd></div>
            <div><dt>Date signed</dt><dd>{formattedDate(receipt.answers.signatureDate)}</dd></div>
            <div><dt>Consent accepted</dt><dd>Yes</dd></div>
          </dl>
          <h3>Privacy notice</h3>
          <p>{CHILD_REIKI_PRIVACY_NOTICE}</p>
        </article>
      </> : <form ref={formRef} className={styles.form} method="post" action="/api/client-intake/childrens-reiki" onSubmit={submit} noValidate aria-label="Parent intake for Gentle Energy Support" aria-busy={isSubmitting}>
        <noscript><p className={styles.errorSummary}>Please enable JavaScript to complete and sign this form, or contact Kate at kate@bethelightness.com for another way to complete your intake.</p></noscript>
        {errorMessage ? <div ref={errorSummaryRef} tabIndex={-1} className={styles.errorSummary} role="alert"><p>{errorMessage}</p></div> : null}
        {!isReady ? <p className={styles.hint} role="status">Preparing your intake form. Please wait before entering your answers.</p> : null}
        <fieldset id="intake-answers" className={styles.fields} disabled={!isReady || isSubmitting || Boolean(pendingPayload)}>
          <legend className="sr-only">Your child’s intake questions and guardian consent</legend>
          <label className={styles.hiddenField} aria-hidden="true">Website<input name="website" value={answers.website} onChange={(event) => update("website", event.target.value)} tabIndex={-1} autoComplete="off" /></label>

          <fieldset className={styles.section}>
            <legend>Parent or guardian details</legend>
            <div className={styles.sectionBody}>
              <p className={styles.sectionIntro}>Use your own contact information here. Please do not enter a child’s email address.</p>
              {field({ key: "fullName", label: "Parent or legal guardian’s full name", required: true, autoComplete: "name" })}
              <div className={styles.grid}>
                {field({ key: "phone", label: "Parent or guardian phone number", type: "tel", required: true, autoComplete: "tel", maxLength: 80 })}
                {field({ key: "relationship", label: "Your relationship to the child", required: true, maxLength: 150, autoComplete: "off" })}
              </div>
              {field({ key: "email", label: "Parent or guardian email address", type: "email", required: answers.newsletterConsent, autoComplete: "email", maxLength: 254, hint: "Optional unless you would like event and program updates." })}
              <label className={styles.check}>
                <input type="checkbox" name="newsletterConsent" checked={answers.newsletterConsent} onChange={(event) => update("newsletterConsent", event.target.checked)} />
                <span>I would like to receive email updates about events and programs from The Lightness of Being. <span className={styles.optional}>(optional)</span></span>
              </label>
            </div>
          </fieldset>

          <fieldset className={styles.section}>
            <legend>About your child</legend>
            <div className={styles.sectionBody}>
              <div className={styles.grid}>
                {field({ key: "childName", label: "Child’s full name", required: true, autoComplete: "off" })}
                {field({ key: "childAge", label: "Child’s age in whole years", required: true, numeric: true, maxLength: 2, autoComplete: "off", hint: "For children under 18. Enter 0 for a child under 1." })}
              </div>
              {field({ key: "intentions", label: "What would you like Kate to support your child with?", required: true, multiline: true, maxLength: 4000 })}
              {field({ key: "comfortNeeds", label: "What helps your child feel safe and comfortable?", hint: "Share any sensitivities, communication needs or preferences that would be helpful for the session.", multiline: true, maxLength: 3000 })}
              {field({ key: "previousReiki", label: "Has your child received Reiki before? If so, when was their last session?", multiline: true, maxLength: 3000 })}
              {field({ key: "referralSource", label: "How did you hear about The Lightness of Being?", multiline: true, maxLength: 1000 })}
            </div>
          </fieldset>

          <fieldset className={styles.section}>
            <legend>Session preferences</legend>
            <div className={styles.sectionBody}>
              <div className={styles.field}>
                <label htmlFor="sessionFormat" className={styles.label}>Your child’s booked session <span className={styles.optional}>(required)</span></label>
                <select id="sessionFormat" name="sessionFormat" className={styles.select} required aria-required="true" value={answers.sessionFormat} onChange={(event) => {
                  update("sessionFormat", event.target.value as Answers["sessionFormat"]);
                  update("touchPreference", "");
                  update("sessionReadiness", false);
                }} aria-invalid={Boolean(errors.sessionFormat) || undefined} aria-describedby={errors.sessionFormat ? "sessionFormat-error" : undefined}>
                  <option value="">Choose session format</option>
                  <option value="in-person">In person</option>
                  <option value="virtual">Virtual</option>
                </select>
                {errors.sessionFormat ? <p className={styles.error} id="sessionFormat-error">{errors.sessionFormat}</p> : null}
              </div>
              {answers.sessionFormat === "in-person" ? <fieldset className={styles.checkGroup}>
                <legend>Touch preference <span className={styles.optional}>(required)</span></legend>
                <p className={styles.hint}>Your child’s comfort guides the session. They can decline touch at any time.</p>
                {(["hands-off", "light-touch"] as const).map((value) => <label key={value} className={styles.check}>
                  <input type="radio" name="touchPreference" value={value} required checked={answers.touchPreference === value} onChange={() => update("touchPreference", value)} aria-describedby={errors.touchPreference ? "touchPreference-error" : undefined} />
                  <span>{value === "hands-off" ? "Hands-off support" : "Light touch only if my child is comfortable"}</span>
                </label>)}
                {errors.touchPreference ? <p className={styles.error} id="touchPreference-error">{errors.touchPreference}</p> : null}
              </fieldset> : null}
              <div>
                <label className={styles.check}>
                  <input id="sessionReadiness" type="checkbox" name="sessionReadiness" required aria-required="true" disabled={!answers.sessionFormat} checked={answers.sessionReadiness} onChange={(event) => update("sessionReadiness", event.target.checked)} aria-invalid={Boolean(errors.sessionReadiness) || undefined} aria-describedby={errors.sessionReadiness ? "sessionReadiness-error" : undefined} />
                  <span>{childReikiSessionStatement(answers.sessionFormat)} <span className={styles.optional}>(required)</span></span>
                </label>
                {errors.sessionReadiness ? <p className={styles.error} id="sessionReadiness-error">{errors.sessionReadiness}</p> : null}
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.section}>
            <legend>Consent and signature</legend>
            <div className={styles.sectionBody}>
              <p className={styles.sectionIntro}>Read the consent below before adding your electronic signature.</p>
              {consent}
              <div>
                <label className={styles.check}>
                  <input id="guardianAuthority" type="checkbox" name="guardianAuthority" required aria-required="true" checked={answers.guardianAuthority} onChange={(event) => update("guardianAuthority", event.target.checked)} aria-invalid={Boolean(errors.guardianAuthority) || undefined} aria-describedby={errors.guardianAuthority ? "guardianAuthority-error" : undefined} />
                  <span>{CHILD_REIKI_GUARDIAN_AUTHORITY_STATEMENT} <span className={styles.optional}>(required)</span></span>
                </label>
                {errors.guardianAuthority ? <p className={styles.error} id="guardianAuthority-error">{errors.guardianAuthority}</p> : null}
              </div>
              <div className={styles.signature}>
                <h2>Sign electronically</h2>
                <p className={styles.hint}>Please sign using your own full name as the parent or legal guardian, rather than your child’s name.</p>
                <div>
                  <label className={styles.check}>
                    <input id="consentAccepted" type="checkbox" name="consentAccepted" required aria-required="true" checked={answers.consentAccepted} onChange={(event) => update("consentAccepted", event.target.checked)} aria-invalid={Boolean(errors.consentAccepted) || undefined} aria-describedby={errors.consentAccepted ? "consentAccepted-error" : undefined} />
                    <span>{CHILD_REIKI_ELECTRONIC_SIGNATURE_STATEMENT} <span className={styles.optional}>(required)</span></span>
                  </label>
                  {errors.consentAccepted ? <p className={styles.error} id="consentAccepted-error">{errors.consentAccepted}</p> : null}
                </div>
                <div className={`${styles.grid} mt-4`}>
                  {field({ key: "signatureName", label: "Type the parent or legal guardian’s full name to sign", required: true, autoComplete: "off" })}
                  {field({ key: "signatureDate", label: "Date signed", required: true, type: "date", maxLength: 10 })}
                </div>
              </div>
              <div>
                <h2 className="mb-2 text-base font-bold">Privacy notice</h2>
                <p className={styles.hint}>{CHILD_REIKI_PRIVACY_NOTICE}</p>
              </div>
            </div>
          </fieldset>
        </fieldset>
        <div className={styles.actions}>
          {pendingPayload && !isSubmitting ? <p className={styles.hint}>Your signed answers are kept here while we confirm this submission. Try again below to send the same form.</p> : null}
          <button type="submit" disabled={!isReady || isSubmitting} className={`button-pill ${styles.submit}`}>{isSubmitting ? "Submitting your form…" : pendingPayload ? "Try submitting again" : "Submit signed intake form"}</button>
          <p className={styles.hint}>You will see a confirmation here when your completed form has been received. You can then save or print a copy for your records.</p>
        </div>
      </form>}
    </main>
  );
}
