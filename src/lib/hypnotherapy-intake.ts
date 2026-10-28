export const HYPNOTHERAPY_FORM_VERSION = "hypnotherapy-remote-2026-10-28-v1";
export const HYPNOTHERAPY_CONSENT_PARAGRAPHS = [
  "I am willing to be guided through relaxation, visual imagery, creative visualization, hypnosis and stress reduction processes and techniques. I understand that the counseling I am receiving is not a substitute for normal medical care and I have been advised to discuss this counseling with any physician who is taking care of me now or in the future. Additionally, I should continue any present medical treatment and consult with my regular physician for treatment of old or new illnesses.",
] as const;
export const HYPNOTHERAPY_PRIVACY_NOTICE = "No information about any client will be discussed or shared with any third party without written consent of the client or parent/guardian if the client is under 18 years of age.";
export const REMOTE_SESSION_STATEMENT = "I will join from a quiet, private space where I can sit or lie down comfortably. I will not take part while driving. If the connection drops, Kate may contact me at the phone number above.";
export const ELECTRONIC_SIGNATURE_STATEMENT = "I have read the consent above and agree to sign this form electronically using my typed full name.";

export type HypnotherapyIntakeInput = {
  submissionId: string;
  formVersion: string;
  fullName: string;
  preferredName: string;
  email: string;
  phone: string;
  address: string;
  maritalStatus: string;
  occupation: string;
  previousHypnotherapy: "yes" | "no" | "";
  previousTherapy: string;
  goals: string;
  previousEfforts: string;
  medicalConditions: string;
  newsletterConsent: boolean;
  remoteReadiness: boolean;
  consentAccepted: boolean;
  signatureName: string;
  signatureDate: string;
  website: string;
  startedAt: number;
};
export type HypnotherapyIntakeAnswers = Omit<HypnotherapyIntakeInput, "website" | "startedAt">;
export type IntakeFieldErrors = Partial<Record<keyof HypnotherapyIntakeInput, string>>;
export const INTAKE_ANSWER_LABELS = {
  fullName: "Full name", preferredName: "Preferred name", email: "Email address", phone: "Phone number",
  address: "Address", maritalStatus: "Marital status", occupation: "Occupation",
  previousHypnotherapy: "Previous hypnotherapy", previousTherapy: "Previous counseling or psychotherapy",
  goals: "What I would like to accomplish", previousEfforts: "Previous efforts to address this concern",
  medicalConditions: "Mental or physical medical conditions and diagnoses",
} as const;

export function validateHypnotherapyIntake(raw: unknown): {
  success: boolean; errors: IntakeFieldErrors; data?: HypnotherapyIntakeInput;
} {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { success: false, errors: { fullName: "Please complete the intake form." } };
  const source = raw as Record<string, unknown>;
  const errors: IntakeFieldErrors = {};
  function text(key: keyof HypnotherapyIntakeInput, maximum = 500) {
    const value = source[key];
    if (value !== undefined && typeof value !== "string") { errors[key] = "Please enter text in this field."; return ""; }
    const result = typeof value === "string" ? value.trim() : "";
    if (result.length > maximum) errors[key] = `Please use no more than ${maximum.toLocaleString()} characters.`;
    return result;
  }
  const data: HypnotherapyIntakeInput = {
    submissionId: text("submissionId", 36), formVersion: text("formVersion", 100),
    fullName: text("fullName", 150), preferredName: text("preferredName", 150), email: text("email", 254).toLowerCase(),
    phone: text("phone", 80), address: text("address", 700), maritalStatus: text("maritalStatus", 150), occupation: text("occupation", 250),
    previousHypnotherapy: text("previousHypnotherapy", 3) as HypnotherapyIntakeInput["previousHypnotherapy"],
    previousTherapy: text("previousTherapy", 4000), goals: text("goals", 4000), previousEfforts: text("previousEfforts", 4000),
    medicalConditions: text("medicalConditions", 4000), newsletterConsent: source.newsletterConsent === true,
    remoteReadiness: source.remoteReadiness === true, consentAccepted: source.consentAccepted === true,
    signatureName: text("signatureName", 150), signatureDate: text("signatureDate", 10), website: text("website", 200),
    startedAt: typeof source.startedAt === "number" ? source.startedAt : 0,
  };
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.submissionId)) errors.submissionId = "Please reload this form before submitting.";
  if (data.formVersion !== HYPNOTHERAPY_FORM_VERSION) errors.formVersion = "This form has been updated. Please reload it before signing.";
  if (data.fullName.length < 2) errors.fullName = "Please enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Please enter a valid email address.";
  if (data.phone.replace(/\D/g, "").length < 7) errors.phone = "Please enter a phone number Kate can use to reach you.";
  if (!data.goals) errors.goals = "Please tell Kate what you would like to work on.";
  if (!["", "yes", "no"].includes(data.previousHypnotherapy)) errors.previousHypnotherapy = "Please choose yes or no, or leave this optional question blank.";
  if (!data.remoteReadiness) errors.remoteReadiness = "Please confirm the remote session arrangements.";
  if (!data.consentAccepted) errors.consentAccepted = "Please read and accept the consent before signing.";
  if (data.signatureName.length < 2) errors.signatureName = "Please type your full name to sign.";
  const date = new Date(`${data.signatureDate}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.signatureDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== data.signatureDate) errors.signatureDate = "Please enter a valid signature date.";
  return { success: Object.keys(errors).length === 0, errors, data };
}
