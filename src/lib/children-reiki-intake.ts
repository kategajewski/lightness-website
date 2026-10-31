export const CHILD_REIKI_FORM_VERSION = "childrens-reiki-2026-10-31-v1";
export const CHILD_REIKI_CONSENT_PARAGRAPHS = [
  "I give permission for my child to receive a Gentle Energy Support Reiki session with Kate Gajewski. I understand that Reiki is a complementary energy practice offered for relaxation and stress reduction. The session will be adapted to my child's comfort and needs.",
  "I understand that Reiki practitioners do not diagnose conditions, prescribe or perform medical treatment, prescribe substances or interfere with the treatment of a licensed medical professional. Reiki does not replace medical or psychological care. I will continue my child's existing care and consult a licensed health care professional about physical or psychological concerns.",
  "I understand that no specific result is guaranteed. My child can decline touch, ask for a break or stop the session at any time. My consent does not override my child's wishes or comfort.",
] as const;
export const CHILD_REIKI_PRIVACY_NOTICE = "Your child's completed form is kept in Kate's private intake inbox. Information about your child will not be shared with third parties without written parent or legal guardian consent, except where disclosure is required by law.";
export const CHILD_REIKI_GUARDIAN_AUTHORITY_STATEMENT = "I confirm that I am this child's parent or legal guardian and have authority to consent to this session on their behalf.";
export const CHILD_REIKI_ELECTRONIC_SIGNATURE_STATEMENT = "I have read the consent above and agree to sign this form electronically using my own full name as the child's parent or legal guardian.";
export const CHILD_REIKI_IN_PERSON_STATEMENT = "I understand that this is an in-person session. My selected touch preference is subject to my child's comfort and agreement throughout the session. My child can ask for hands-off support, a break or an end to the session at any time.";
export const CHILD_REIKI_REMOTE_STATEMENT = "I agree to my child receiving Reiki remotely. I will arrange a quiet, private space where my child can sit or lie down comfortably and remain available during their session. We will not take part while driving. If the connection drops, Kate may contact me at the parent or guardian phone number above.";

export type ChildReikiIntakeInput = {
  submissionId: string;
  formVersion: string;
  fullName: string;
  email: string;
  phone: string;
  childName: string;
  childAge: string;
  relationship: string;
  intentions: string;
  comfortNeeds: string;
  referralSource: string;
  previousReiki: string;
  sessionFormat: "" | "in-person" | "virtual";
  touchPreference: "" | "hands-off" | "light-touch";
  newsletterConsent: boolean;
  guardianAuthority: boolean;
  sessionReadiness: boolean;
  consentAccepted: boolean;
  signatureName: string;
  signatureDate: string;
  website: string;
  startedAt: number;
};
export type ChildReikiIntakeAnswers = Omit<ChildReikiIntakeInput, "website" | "startedAt">;
export type ChildReikiIntakeFieldErrors = Partial<Record<keyof ChildReikiIntakeInput, string>>;
export const CHILD_REIKI_ANSWER_LABELS = {
  fullName: "Parent or legal guardian's full name", phone: "Parent or guardian phone number",
  email: "Parent or guardian email address", relationship: "Relationship to child",
  childName: "Child's full name", childAge: "Child's age in whole years",
  intentions: "Intentions for my child's session", comfortNeeds: "Comfort needs and preferences",
  previousReiki: "Child's previous Reiki experience", referralSource: "How we heard about The Lightness of Being",
  sessionFormat: "Session format", touchPreference: "In-person touch preference",
} as const;

export function childReikiSessionStatement(format: ChildReikiIntakeInput["sessionFormat"]) {
  return format === "virtual" ? CHILD_REIKI_REMOTE_STATEMENT : format === "in-person" ? CHILD_REIKI_IN_PERSON_STATEMENT : "Please choose the session format above to read and confirm the arrangements.";
}

export function validateChildReikiIntake(raw: unknown): {
  success: boolean; errors: ChildReikiIntakeFieldErrors; data?: ChildReikiIntakeInput;
} {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { success: false, errors: { fullName: "Please complete the parent intake form." } };
  const source = raw as Record<string, unknown>;
  const errors: ChildReikiIntakeFieldErrors = {};
  function text(key: keyof ChildReikiIntakeInput, maximum = 500) {
    const value = source[key];
    if (value !== undefined && typeof value !== "string") { errors[key] = "Please enter text in this field."; return ""; }
    const result = typeof value === "string" ? value.trim() : "";
    if (result.length > maximum) errors[key] = `Please use no more than ${maximum.toLocaleString()} characters.`;
    return result;
  }
  const data: ChildReikiIntakeInput = {
    submissionId: text("submissionId", 36), formVersion: text("formVersion", 100),
    fullName: text("fullName", 150), email: text("email", 254).toLowerCase(), phone: text("phone", 80),
    childName: text("childName", 150), childAge: text("childAge", 2), relationship: text("relationship", 150),
    intentions: text("intentions", 4000), comfortNeeds: text("comfortNeeds", 3000),
    referralSource: text("referralSource", 1000), previousReiki: text("previousReiki", 3000),
    sessionFormat: text("sessionFormat", 20) as ChildReikiIntakeInput["sessionFormat"],
    touchPreference: text("touchPreference", 20) as ChildReikiIntakeInput["touchPreference"],
    newsletterConsent: source.newsletterConsent === true, guardianAuthority: source.guardianAuthority === true,
    sessionReadiness: source.sessionReadiness === true, consentAccepted: source.consentAccepted === true,
    signatureName: text("signatureName", 150), signatureDate: text("signatureDate", 10),
    website: text("website", 200), startedAt: typeof source.startedAt === "number" ? source.startedAt : 0,
  };
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.submissionId)) errors.submissionId = "Please reload this form before submitting.";
  if (data.formVersion !== CHILD_REIKI_FORM_VERSION) errors.formVersion = "This form has been updated. Please reload it before signing.";
  if (data.fullName.length < 2) errors.fullName = "Please enter the parent or legal guardian's full name.";
  if (data.childName.length < 2) errors.childName = "Please enter your child's full name.";
  if (!/^(?:[0-9]|1[0-7])$/.test(data.childAge)) errors.childAge = "Please enter your child's age in whole years from 0 to 17.";
  if (!data.relationship) errors.relationship = "Please enter your relationship to the child.";
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Please enter a valid email address.";
  if (data.newsletterConsent && !data.email) errors.email = "Please add your email address for updates, or leave the updates option unchecked.";
  if (data.phone.replace(/\D/g, "").length < 7) errors.phone = "Please enter a parent or guardian phone number Kate can use to reach you.";
  if (!data.intentions) errors.intentions = "Please share what you would like Kate to support your child with.";
  if (!["in-person", "virtual"].includes(data.sessionFormat)) errors.sessionFormat = "Please choose the format of your child's booked session.";
  if (data.sessionFormat === "in-person" && !["hands-off", "light-touch"].includes(data.touchPreference)) errors.touchPreference = "Please choose an in-person touch preference.";
  if (data.sessionFormat === "virtual") data.touchPreference = "";
  if (!data.guardianAuthority) errors.guardianAuthority = "A parent or legal guardian must confirm their authority before signing.";
  if (!data.sessionReadiness) errors.sessionReadiness = "Please confirm the session arrangements.";
  if (!data.consentAccepted) errors.consentAccepted = "Please read and accept the consent before signing.";
  if (data.signatureName.length < 2) errors.signatureName = "Please type the parent or legal guardian's full name to sign.";
  const date = new Date(`${data.signatureDate}T12:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.signatureDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== data.signatureDate) errors.signatureDate = "Please enter a valid signature date.";
  return { success: Object.keys(errors).length === 0, errors, data };
}
