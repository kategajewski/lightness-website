"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ELECTRONIC_SIGNATURE_STATEMENT,
  HYPNOTHERAPY_CONSENT_PARAGRAPHS,
  HYPNOTHERAPY_FORM_VERSION,
  HYPNOTHERAPY_PRIVACY_NOTICE,
  INTAKE_ANSWER_LABELS,
  REMOTE_SESSION_STATEMENT,
  validateHypnotherapyIntake,
  type HypnotherapyIntakeInput,
  type IntakeFieldErrors,
} from "@/lib/hypnotherapy-intake";
import styles from "./hypnotherapy-intake-form.module.css";

type Answers = Omit<HypnotherapyIntakeInput, "submissionId" | "formVersion" | "startedAt">;
type TextAnswer = {
  [K in keyof Answers]: Answers[K] extends string ? K : never;
}[keyof Answers];
type Receipt = { id: string; submittedAt: string; answers: HypnotherapyIntakeInput };

const initialAnswers: Answers = {
  fullName: "", preferredName: "", email: "", phone: "", address: "",
  maritalStatus: "", occupation: "", previousHypnotherapy: "", previousTherapy: "",
  goals: "", previousEfforts: "", medicalConditions: "", newsletterConsent: false,
  remoteReadiness: false, consentAccepted: false, signatureName: "", signatureDate: "", website: "",
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

export function HypnotherapyIntakeForm() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [errors, setErrors] = useState<IntakeFieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [pendingPayload, setPendingPayload] = useState<HypnotherapyIntakeInput | null>(null);
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

  function focusFirstError(fieldErrors: IntakeFieldErrors) {
    requestAnimationFrame(() => {
      const first = Array.from(formRef.current?.elements ?? []).find((element) => {
        const field = element as HTMLInputElement;
        return field.name && fieldErrors[field.name as keyof HypnotherapyIntakeInput];
      });
      if (first) (first as HTMLElement).focus();
      else errorSummaryRef.current?.focus();
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || !isReady) return;
    if (!identity.current) identity.current = { submissionId: crypto.randomUUID(), startedAt: Date.now() };
    const validation = validateHypnotherapyIntake(pendingPayload ?? {
      ...answers,
      ...identity.current,
      formVersion: HYPNOTHERAPY_FORM_VERSION,
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
      const response = await fetch("/api/client-intake/hypnotherapy", {
        method: "POST",
        credentials: "same-origin",
        referrerPolicy: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status < 500) setPendingPayload(null);
        const fieldErrors: IntakeFieldErrors = result?.errors ?? result?.fieldErrors ?? {};
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

  function field({ key, label, required = false, type = "text", autoComplete, hint, multiline = false, maxLength = 150 }: {
    key: TextAnswer;
    label: string;
    required?: boolean;
    type?: "text" | "email" | "tel" | "date";
    autoComplete?: string;
    hint?: string;
    multiline?: boolean;
    maxLength?: number;
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
    {HYPNOTHERAPY_CONSENT_PARAGRAPHS.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
  </div>;

  return (
    <main className={styles.root} id="hypnotherapy-intake">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Virtual hypnotherapy</p>
        <h1 className={styles.title}>Before your virtual session</h1>
        <p>Take a little time to share what brings you here. Complete these questions and sign the consent below so Kate can prepare for your session.</p>
        <p>No account is needed. Questions marked required must be completed. Please keep this page open until you see your confirmation.</p>
      </div>

      {receipt ? <>
        <section className={styles.status} aria-labelledby="intake-received">
          <h2 id="intake-received" ref={receiptRef} tabIndex={-1}>Your intake form has been received.</h2>
          <p>Thank you for sharing. Kate can review your answers before your session. You can save or print your completed form below.</p>
        </section>
        <div className={`${styles.noPrint} mb-6`}>
          <button type="button" className={`button-pill ${styles.submit}`} onClick={() => window.print()}>Save or print a copy</button>
          <p className={`${styles.hint} mt-3`}>Choose Save as PDF in your print options to keep a digital copy. Save it somewhere private.</p>
        </div>
        <article className={styles.receipt} aria-labelledby="completed-intake-title">
          <p className={styles.eyebrow}>The Lightness of Being</p>
          <h2 id="completed-intake-title">Virtual hypnotherapy intake</h2>
          <p className={styles.receiptMeta}>Received {new Date(receipt.submittedAt).toLocaleString()}<br />Reference: {receipt.id}<br />Form version: {HYPNOTHERAPY_FORM_VERSION}</p>
          <h3>Your answers</h3>
          <dl>
            {(Object.entries(INTAKE_ANSWER_LABELS) as [keyof typeof INTAKE_ANSWER_LABELS, string][]).map(([key, label]) => <div key={key}>
              <dt>{label}</dt>
              <dd>{key === "previousHypnotherapy" ? (receipt.answers[key] === "yes" ? "Yes" : receipt.answers[key] === "no" ? "No" : "Not provided") : receipt.answers[key] || "Not provided"}</dd>
            </div>)}
            <div><dt>Optional newsletter preference</dt><dd>{receipt.answers.newsletterConsent ? "Yes, I would like to receive occasional email updates." : "I did not request email updates."}</dd></div>
          </dl>
          <h3>Remote session arrangements</h3>
          <p>{REMOTE_SESSION_STATEMENT}</p>
          <p><strong>Confirmed</strong></p>
          <h3>Consent</h3>
          {consent}
          <p className="mt-4">{ELECTRONIC_SIGNATURE_STATEMENT}</p>
          <dl>
            <div><dt>Electronic signature</dt><dd>{receipt.answers.signatureName}</dd></div>
            <div><dt>Date signed</dt><dd>{formattedDate(receipt.answers.signatureDate)}</dd></div>
            <div><dt>Consent accepted</dt><dd>Yes</dd></div>
          </dl>
          <h3>Privacy notice</h3>
          <p>{HYPNOTHERAPY_PRIVACY_NOTICE}</p>
        </article>
      </> : <form ref={formRef} className={styles.form} method="post" action="/api/client-intake/hypnotherapy" onSubmit={submit} noValidate aria-label="Virtual hypnotherapy intake form" aria-busy={isSubmitting}>
        <noscript><p className={styles.errorSummary}>Please enable JavaScript to complete and sign this form, or contact Kate at kate@bethelightness.com for another way to complete your intake.</p></noscript>
        {errorMessage ? <div ref={errorSummaryRef} tabIndex={-1} className={styles.errorSummary} role="alert"><p>{errorMessage}</p></div> : null}
        {!isReady ? <p className={styles.hint} role="status">Preparing your intake form. Please wait before entering your answers.</p> : null}
        <fieldset id="intake-answers" className={styles.fields} disabled={!isReady || isSubmitting || Boolean(pendingPayload)}>
          <legend className="sr-only">Your intake questions and consent</legend>
          <label className={styles.hiddenField} aria-hidden="true">Website<input name="website" value={answers.website} onChange={(event) => update("website", event.target.value)} tabIndex={-1} autoComplete="off" /></label>

          <fieldset className={styles.section}>
            <legend>Your details</legend>
            <div className={styles.sectionBody}>
              <p className={styles.sectionIntro}>A few details so Kate can prepare and reach you if needed.</p>
              <div className={styles.grid}>
                {field({ key: "fullName", label: "Full name", required: true, autoComplete: "name" })}
                {field({ key: "preferredName", label: "What would you like to be called?", autoComplete: "nickname" })}
                {field({ key: "email", label: "Email address", type: "email", required: true, autoComplete: "email", maxLength: 254 })}
                {field({ key: "phone", label: "Phone number", type: "tel", required: true, autoComplete: "tel", maxLength: 80, hint: "A number Kate can use if your connection drops." })}
              </div>
              {field({ key: "address", label: "Address", autoComplete: "street-address", multiline: true, maxLength: 700 })}
              <div className={styles.grid}>
                {field({ key: "maritalStatus", label: "Marital status" })}
                {field({ key: "occupation", label: "Occupation", autoComplete: "organization-title", maxLength: 250 })}
              </div>
              <label className={styles.check}>
                <input type="checkbox" name="newsletterConsent" checked={answers.newsletterConsent} onChange={(event) => update("newsletterConsent", event.target.checked)} />
                <span>I would like to receive occasional email updates from The Lightness of Being. <span className={styles.optional}>(optional)</span></span>
              </label>
            </div>
          </fieldset>

          <fieldset className={styles.section}>
            <legend>What brings you here</legend>
            <div className={styles.sectionBody}>
              <p className={styles.sectionIntro}>Share what feels helpful for Kate to know before you meet.</p>
              <fieldset className={styles.checkGroup}>
                <legend>Have you had hypnotherapy before? <span className={styles.optional}>(optional)</span></legend>
                <div className={styles.radioChoices}>
                  {(["yes", "no"] as const).map((value) => <label key={value} className={styles.check}>
                    <input type="radio" name="previousHypnotherapy" value={value} checked={answers.previousHypnotherapy === value} onChange={() => update("previousHypnotherapy", value)} aria-describedby={errors.previousHypnotherapy ? "previousHypnotherapy-error" : undefined} />
                    <span>{value === "yes" ? "Yes" : "No"}</span>
                  </label>)}
                </div>
                {errors.previousHypnotherapy ? <p className={styles.error} id="previousHypnotherapy-error">{errors.previousHypnotherapy}</p> : null}
              </fieldset>
              {field({ key: "previousTherapy", label: "Have you had counseling or psychotherapy before? If so, please describe.", multiline: true, maxLength: 4000 })}
              {field({ key: "goals", label: "What would you like to accomplish through hypnotherapy?", required: true, multiline: true, maxLength: 4000 })}
              {field({ key: "previousEfforts", label: "What have you done so far to address this concern?", multiline: true, maxLength: 4000 })}
              {field({ key: "medicalConditions", label: "Do you have any mental or physical medical conditions or diagnoses? If so, please describe.", multiline: true, maxLength: 4000 })}
            </div>
          </fieldset>

          <fieldset className={styles.section}>
            <legend>Your virtual session</legend>
            <div className={styles.sectionBody}>
              <div>
                <label className={styles.check}>
                  <input id="remoteReadiness" type="checkbox" name="remoteReadiness" required aria-required="true" checked={answers.remoteReadiness} onChange={(event) => update("remoteReadiness", event.target.checked)} aria-invalid={Boolean(errors.remoteReadiness) || undefined} aria-describedby={errors.remoteReadiness ? "remoteReadiness-error" : undefined} />
                  <span>{REMOTE_SESSION_STATEMENT} <span className={styles.optional}>(required)</span></span>
                </label>
                {errors.remoteReadiness ? <p className={styles.error} id="remoteReadiness-error">{errors.remoteReadiness}</p> : null}
              </div>
            </div>
          </fieldset>

          <fieldset className={styles.section}>
            <legend>Consent and signature</legend>
            <div className={styles.sectionBody}>
              <p className={styles.sectionIntro}>Read the consent below before adding your electronic signature.</p>
              {consent}
              <div className={styles.signature}>
                <h2>Sign electronically</h2>
                <p className={styles.hint}>Typing your full name below is your electronic signature. You do not need to draw a signature.</p>
                <div>
                  <label className={styles.check}>
                    <input id="consentAccepted" type="checkbox" name="consentAccepted" required aria-required="true" checked={answers.consentAccepted} onChange={(event) => update("consentAccepted", event.target.checked)} aria-invalid={Boolean(errors.consentAccepted) || undefined} aria-describedby={errors.consentAccepted ? "consentAccepted-error" : undefined} />
                    <span>{ELECTRONIC_SIGNATURE_STATEMENT} <span className={styles.optional}>(required)</span></span>
                  </label>
                  {errors.consentAccepted ? <p className={styles.error} id="consentAccepted-error">{errors.consentAccepted}</p> : null}
                </div>
                <div className={`${styles.grid} mt-4`}>
                  {field({ key: "signatureName", label: "Type your full name to sign", required: true, autoComplete: "off" })}
                  {field({ key: "signatureDate", label: "Date signed", required: true, type: "date", maxLength: 10 })}
                </div>
              </div>
              <div>
                <h2 className="mb-2 text-base font-bold">Privacy notice</h2>
                <p className={styles.hint}>{HYPNOTHERAPY_PRIVACY_NOTICE}</p>
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
