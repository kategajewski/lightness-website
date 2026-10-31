export const SOUND_BATH_FORM_VERSION = "sound-bath-2026-10-31-v1";
export const SOUND_BATH_CONSENT_PARAGRAPHS = [
  "I understand that this is a sound bath offered for relaxation. I may ask for changes in volume, change position, take a break or stop at any time. I will let Kate know if I feel uncomfortable.",
  "I understand that this experience is not a substitute for medical or psychological care. I will continue my existing care and consult a licensed health care professional about any health concerns. No particular outcome is promised.",
] as const;
export const SOUND_BATH_PRIVACY_NOTICE = "Your completed form is kept in Kate's private intake inbox. Information about you will not be shared with third parties without your written consent, except where disclosure is required by law.";
export const SOUND_BATH_IN_PERSON_STATEMENT = "I understand that my sound bath will take place in person. I can ask Kate to adjust the volume, change position, take a break or end the session if I feel uncomfortable.";
export const SOUND_BATH_REMOTE_STATEMENT = "I will join from a quiet, private space where I can sit or lie down comfortably. I will use a comfortable listening volume and can lower it or stop the audio if needed. I will not take part while driving. If the connection drops, Kate may contact me at the phone number above.";
export const SOUND_BATH_ELECTRONIC_SIGNATURE_STATEMENT = "I have read the consent above and agree to sign this form electronically using my typed full name.";

export type SoundBathIntakeInput = {
  submissionId: string;
  formVersion: string;
  fullName: string;
  email: string;
  phone: string;
  intentions: string;
  comfortNeeds: string;
  previousSoundExperience: string;
  referralSource: string;
  sessionFormat: "" | "in-person" | "virtual";
  newsletterConsent: boolean;
  sessionReadiness: boolean;
  consentAccepted: boolean;
  signatureName: string;
  signatureDate: string;
  website: string;
  startedAt: number;
};
export type SoundBathIntakeAnswers = Omit<SoundBathIntakeInput, "website" | "startedAt">;
export type SoundBathIntakeFieldErrors = Partial<Record<keyof SoundBathIntakeInput, string>>;
export const SOUND_BATH_ANSWER_LABELS = {
  fullName: "Full name",
  email: "Email address",
  phone: "Phone number",
  intentions: "Intentions for my sound bath",
  comfortNeeds: "Sound, sensory and access preferences",
  previousSoundExperience: "Previous sound bath experience",
  referralSource: "How I heard about The Lightness of Being",
  sessionFormat: "Session format",
} as const;

export function soundBathSessionStatement(format: SoundBathIntakeInput["sessionFormat"]) {
  return format === "virtual" ? SOUND_BATH_REMOTE_STATEMENT : format === "in-person" ? SOUND_BATH_IN_PERSON_STATEMENT : "Please choose your session format above to review the arrangements.";
}

export function validateSoundBathIntake(raw: unknown): {
  success: boolean; errors: SoundBathIntakeFieldErrors; data?: SoundBathIntakeInput;
} {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { success: false, errors: { fullName: "Please complete the intake form." } };
  const source = raw as Record<string, unknown>;
  const errors: SoundBathIntakeFieldErrors = {};
  function text(key: keyof SoundBathIntakeInput, maximum = 500) {
    const value = source[key];
    if (value !== undefined && typeof value !== "string") { errors[key] = "Please enter text in this field."; return ""; }
    const result = typeof value === "string" ? value.trim() : "";
    if (result.length > maximum) errors[key] = `Please use no more than ${maximum.toLocaleString()} characters.`;
    return result;
  }
  const data: SoundBathIntakeInput = {
    submissionId: text("submissionId", 36), formVersion: text("formVersion", 100),
    fullName: text("fullName", 150), email: text("email", 254).toLowerCase(), phone: text("phone", 80),
    intentions: text("intentions", 4000), comfortNeeds: text("comfortNeeds", 3000),
    previousSoundExperience: text("previousSoundExperience", 3000), referralSource: text("referralSource", 1000),
    sessionFormat: text("sessionFormat", 20) as SoundBathIntakeInput["sessionFormat"],
    newsletterConsent: source.newsletterConsent === true, sessionReadiness: source.sessionReadiness === true,
    consentAccepted: source.consentAccepted === true, signatureName: text("signatureName", 150),
    signatureDate: text("signatureDate", 10), website: text("website", 200),
    startedAt: typeof source.startedAt === "number" ? source.startedAt : 0,
  };
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.submissionId)) errors.submissionId = "Please reload this form before submitting.";
  if (data.formVersion !== SOUND_BATH_FORM_VERSION) errors.formVersion = "This form has been updated. Please reload it before signing.";
  if (data.fullName.length < 2) errors.fullName = "Please enter your full name.";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Please enter a valid email address.";
  if (data.newsletterConsent && !data.email) errors.email = "Please add your email address to receive event and program updates, or leave the updates option unchecked.";
  if (data.phone.replace(/\D/g, "").length < 7) errors.phone = "Please enter a phone number Kate can use to reach you.";
  if (!data.intentions) errors.intentions = "Please share what you would like from your sound bath.";
  if (!["in-person", "virtual"].includes(data.sessionFormat)) errors.sessionFormat = "Please choose whether your booked session is in person or remote.";
  if (!data.sessionReadiness) errors.sessionReadiness = "Please confirm the arrangements for your selected session format.";
  if (!data.consentAccepted) errors.consentAccepted = "Please read and accept the consent before signing.";
  if (data.signatureName.length < 2) errors.signatureName = "Please type your full name to sign.";
  const date = new Date(`${data.signatureDate}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.signatureDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== data.signatureDate) errors.signatureDate = "Please enter a valid signature date.";
  return { success: Object.keys(errors).length === 0, errors, data };
}
