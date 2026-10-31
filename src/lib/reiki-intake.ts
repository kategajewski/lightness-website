export const REIKI_FORM_VERSION = "reiki-remote-2026-10-31-v1";
export const REIKI_CONSENT_PARAGRAPHS = [
  "I understand that Reiki is a complementary energy practice offered for relaxation and stress reduction. My Reiki session will take place remotely.",
  "I understand that Reiki practitioners do not diagnose conditions, prescribe or perform medical treatment, prescribe substances or interfere with the treatment of a licensed medical professional. I understand that Reiki does not take the place of medical or psychological care. I will continue my existing care and consult a licensed health care professional about physical or psychological concerns.",
  "I understand that no specific result is guaranteed. I may ask questions, pause or end the session at any time.",
] as const;
export const REIKI_PRIVACY_NOTICE = "No information about any client will be discussed or shared with any third party without written consent of the client or parent/guardian if the client is under 18 years of age.";
export const REIKI_REMOTE_SESSION_STATEMENT = "I agree to receive Reiki remotely. I will join from a quiet, private space where I can sit or lie down comfortably. I will not take part while driving. If the connection drops, Kate may contact me at the phone number above.";
export const REIKI_ELECTRONIC_SIGNATURE_STATEMENT = "I have read the consent above and agree to sign this form electronically using my typed full name.";

export type ReikiIntakeInput = {
  submissionId: string;
  formVersion: string;
  fullName: string;
  email: string;
  phone: string;
  intentions: string;
  referralSource: string;
  previousReiki: string;
  newsletterConsent: boolean;
  remoteReadiness: boolean;
  consentAccepted: boolean;
  signatureName: string;
  signatureDate: string;
  website: string;
  startedAt: number;
};
export type ReikiIntakeAnswers = Omit<ReikiIntakeInput, "website" | "startedAt">;
export type ReikiIntakeFieldErrors = Partial<Record<keyof ReikiIntakeInput, string>>;
export const REIKI_INTAKE_ANSWER_LABELS = {
  fullName: "Full name",
  email: "Email address",
  phone: "Phone number",
  intentions: "Intentions for my session",
  referralSource: "How I heard about The Lightness of Being",
  previousReiki: "Previous Reiki experience and most recent session",
} as const;

export function validateReikiIntake(raw: unknown): {
  success: boolean; errors: ReikiIntakeFieldErrors; data?: ReikiIntakeInput;
} {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { success: false, errors: { fullName: "Please complete the intake form." } };
  const source = raw as Record<string, unknown>;
  const errors: ReikiIntakeFieldErrors = {};
  function text(key: keyof ReikiIntakeInput, maximum = 500) {
    const value = source[key];
    if (value !== undefined && typeof value !== "string") { errors[key] = "Please enter text in this field."; return ""; }
    const result = typeof value === "string" ? value.trim() : "";
    if (result.length > maximum) errors[key] = `Please use no more than ${maximum.toLocaleString()} characters.`;
    return result;
  }
  const data: ReikiIntakeInput = {
    submissionId: text("submissionId", 36), formVersion: text("formVersion", 100),
    fullName: text("fullName", 150), email: text("email", 254).toLowerCase(), phone: text("phone", 80),
    intentions: text("intentions", 4000), referralSource: text("referralSource", 1000), previousReiki: text("previousReiki", 3000),
    newsletterConsent: source.newsletterConsent === true, remoteReadiness: source.remoteReadiness === true,
    consentAccepted: source.consentAccepted === true, signatureName: text("signatureName", 150),
    signatureDate: text("signatureDate", 10), website: text("website", 200),
    startedAt: typeof source.startedAt === "number" ? source.startedAt : 0,
  };
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.submissionId)) errors.submissionId = "Please reload this form before submitting.";
  if (data.formVersion !== REIKI_FORM_VERSION) errors.formVersion = "This form has been updated. Please reload it before signing.";
  if (data.fullName.length < 2) errors.fullName = "Please enter your full name.";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Please enter a valid email address.";
  if (data.newsletterConsent && !data.email) errors.email = "Please add your email address to receive event and program updates, or leave the updates option unchecked.";
  if (data.phone.replace(/\D/g, "").length < 7) errors.phone = "Please enter a phone number Kate can use to reach you.";
  if (!data.intentions) errors.intentions = "Please share your intentions for the session.";
  if (!data.remoteReadiness) errors.remoteReadiness = "Please confirm the remote session arrangements.";
  if (!data.consentAccepted) errors.consentAccepted = "Please read and accept the consent before signing.";
  if (data.signatureName.length < 2) errors.signatureName = "Please type your full name to sign.";
  const date = new Date(`${data.signatureDate}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.signatureDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== data.signatureDate) errors.signatureDate = "Please enter a valid signature date.";
  return { success: Object.keys(errors).length === 0, errors, data };
}
