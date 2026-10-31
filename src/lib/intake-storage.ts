import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { integrations } from "@/lib/env";
import { decryptIntake, encryptIntake, intakeDigest, intakeEncryptionConfigured, type EncryptedIntake } from "@/lib/intake-crypto";
import { ELECTRONIC_SIGNATURE_STATEMENT, HYPNOTHERAPY_CONSENT_PARAGRAPHS, HYPNOTHERAPY_PRIVACY_NOTICE, hypnotherapySessionStatement, type HypnotherapyIntakeAnswers, type HypnotherapyIntakeInput } from "@/lib/hypnotherapy-intake";
import { REIKI_CONSENT_PARAGRAPHS, REIKI_PRIVACY_NOTICE, reikiSessionStatement, REIKI_ELECTRONIC_SIGNATURE_STATEMENT, type ReikiIntakeAnswers, type ReikiIntakeInput } from "@/lib/reiki-intake";
import { CHILD_REIKI_CONSENT_PARAGRAPHS, CHILD_REIKI_PRIVACY_NOTICE, CHILD_REIKI_GUARDIAN_AUTHORITY_STATEMENT, CHILD_REIKI_ELECTRONIC_SIGNATURE_STATEMENT, childReikiSessionStatement, type ChildReikiIntakeAnswers, type ChildReikiIntakeInput } from "@/lib/children-reiki-intake";
import { SOUND_BATH_CONSENT_PARAGRAPHS, SOUND_BATH_PRIVACY_NOTICE, SOUND_BATH_ELECTRONIC_SIGNATURE_STATEMENT, soundBathSessionStatement, type SoundBathIntakeAnswers, type SoundBathIntakeInput } from "@/lib/sound-bath-intake";

export const INTAKE_BUCKET = "client-intakes";
type SignedIntakeRecord<Answers> = {
  id: string; submittedAt: string; formVersion: string; answers: Answers;
  consent: { paragraphs: readonly string[]; privacyNotice: string; remoteSessionStatement: string; electronicSignatureStatement: string; guardianAuthorityStatement?: string };
  signature: { method: "typed-name"; name: string; date: string; recordedAt: string };
  requestDigest: string; recordDigest: string;
};
// Existing signed hypnotherapy records have no discriminator. Keep their stored
// shape intact so their original fingerprints and matching retries still verify.
export type SignedHypnotherapyIntake = SignedIntakeRecord<HypnotherapyIntakeAnswers> & { formType?: "hypnotherapy" };
export type SignedReikiIntake = SignedIntakeRecord<ReikiIntakeAnswers> & { formType: "reiki" };
export type SignedChildReikiIntake = SignedIntakeRecord<ChildReikiIntakeAnswers> & { formType: "childrens-reiki" };
export type SignedSoundBathIntake = SignedIntakeRecord<SoundBathIntakeAnswers> & { formType: "sound-bath" };
export type SignedIntake = SignedHypnotherapyIntake | SignedReikiIntake | SignedChildReikiIntake | SignedSoundBathIntake;
export class IntakeConflictError extends Error {}
export function intakeStorageConfigured() { return integrations.supabase && intakeEncryptionConfigured(); }
function objectPath(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new Error("Invalid intake identifier.");
  return `${id.toLowerCase()}.json`;
}
function answersFrom<Input extends HypnotherapyIntakeInput | ReikiIntakeInput | ChildReikiIntakeInput | SoundBathIntakeInput>(input: Input): Omit<Input, "website" | "startedAt"> {
  const { website: _website, startedAt: _startedAt, ...answers } = input;
  void _website; void _startedAt;
  return answers;
}
export async function getSignedIntake(id: string): Promise<SignedIntake | null> {
  id = id.toLowerCase();
  const { data, error } = await createSupabaseAdminClient().storage.from(INTAKE_BUCKET).download(objectPath(id));
  if (error || !data) {
    if (error && (String(error.statusCode) === "404" || error.message === "Object not found" || error.message === "The resource was not found")) return null;
    throw new Error("The intake could not be opened.");
  }
  const record = decryptIntake<SignedIntake>(JSON.parse(await data.text()) as EncryptedIntake, id);
  const { recordDigest, ...unsigned } = record;
  if (record.id !== id || intakeDigest(unsigned) !== recordDigest) throw new Error("The intake record could not be verified.");
  return record;
}
export async function saveSignedIntake(input: HypnotherapyIntakeInput) {
  if (!intakeStorageConfigured()) throw new Error("The intake form is temporarily unavailable.");
  const answers = answersFrom(input);
  const id = input.submissionId.toLowerCase();
  const submittedAt = new Date().toISOString();
  const unsigned = {
    id, submittedAt, formVersion: input.formVersion, answers,
    consent: { paragraphs: HYPNOTHERAPY_CONSENT_PARAGRAPHS, privacyNotice: HYPNOTHERAPY_PRIVACY_NOTICE, remoteSessionStatement: hypnotherapySessionStatement(input.sessionFormat), electronicSignatureStatement: ELECTRONIC_SIGNATURE_STATEMENT },
    signature: { method: "typed-name" as const, name: input.signatureName, date: input.signatureDate, recordedAt: submittedAt },
    requestDigest: intakeDigest(answers),
  };
  return writeSignedIntake({ ...unsigned, recordDigest: intakeDigest(unsigned) });
}
export async function saveSignedReikiIntake(input: ReikiIntakeInput) {
  if (!intakeStorageConfigured()) throw new Error("The intake form is temporarily unavailable.");
  const answers = answersFrom(input);
  const id = input.submissionId.toLowerCase();
  const submittedAt = new Date().toISOString();
  const unsigned = {
    id, submittedAt, formVersion: input.formVersion, answers,
    consent: { paragraphs: REIKI_CONSENT_PARAGRAPHS, privacyNotice: REIKI_PRIVACY_NOTICE, remoteSessionStatement: reikiSessionStatement(input.sessionFormat), electronicSignatureStatement: REIKI_ELECTRONIC_SIGNATURE_STATEMENT },
    signature: { method: "typed-name" as const, name: input.signatureName, date: input.signatureDate, recordedAt: submittedAt },
    requestDigest: intakeDigest(answers),
    formType: "reiki" as const,
  };
  return writeSignedIntake({ ...unsigned, recordDigest: intakeDigest(unsigned) });
}
export async function saveSignedChildReikiIntake(input: ChildReikiIntakeInput) {
  if (!intakeStorageConfigured()) throw new Error("The intake form is temporarily unavailable.");
  const answers = answersFrom(input);
  const id = input.submissionId.toLowerCase();
  const submittedAt = new Date().toISOString();
  const unsigned = {
    id, submittedAt, formVersion: input.formVersion, answers,
    consent: { paragraphs: CHILD_REIKI_CONSENT_PARAGRAPHS, privacyNotice: CHILD_REIKI_PRIVACY_NOTICE, remoteSessionStatement: childReikiSessionStatement(input.sessionFormat), electronicSignatureStatement: CHILD_REIKI_ELECTRONIC_SIGNATURE_STATEMENT, guardianAuthorityStatement: CHILD_REIKI_GUARDIAN_AUTHORITY_STATEMENT },
    signature: { method: "typed-name" as const, name: input.signatureName, date: input.signatureDate, recordedAt: submittedAt },
    requestDigest: intakeDigest(answers),
    formType: "childrens-reiki" as const,
  };
  return writeSignedIntake({ ...unsigned, recordDigest: intakeDigest(unsigned) });
}
export async function saveSignedSoundBathIntake(input: SoundBathIntakeInput) {
  if (!intakeStorageConfigured()) throw new Error("The intake form is temporarily unavailable.");
  const answers = answersFrom(input);
  const id = input.submissionId.toLowerCase();
  const submittedAt = new Date().toISOString();
  const unsigned = {
    id, submittedAt, formVersion: input.formVersion, answers,
    consent: { paragraphs: SOUND_BATH_CONSENT_PARAGRAPHS, privacyNotice: SOUND_BATH_PRIVACY_NOTICE, remoteSessionStatement: soundBathSessionStatement(input.sessionFormat), electronicSignatureStatement: SOUND_BATH_ELECTRONIC_SIGNATURE_STATEMENT },
    signature: { method: "typed-name" as const, name: input.signatureName, date: input.signatureDate, recordedAt: submittedAt },
    requestDigest: intakeDigest(answers),
    formType: "sound-bath" as const,
  };
  return writeSignedIntake({ ...unsigned, recordDigest: intakeDigest(unsigned) });
}
async function writeSignedIntake(record: SignedIntake) {
  const { id, submittedAt } = record;
  const encrypted = encryptIntake(record, id);
  const { error } = await createSupabaseAdminClient().storage.from(INTAKE_BUCKET).upload(objectPath(id), Buffer.from(JSON.stringify(encrypted)), { contentType: "application/json", cacheControl: "0", upsert: false });
  if (error) {
    if (["409", "400"].includes(String(error.statusCode)) || error.message.toLowerCase().includes("already exists")) {
      const previous = await getSignedIntake(id);
      if (previous) {
        if ((previous.formType || "hypnotherapy") !== (record.formType || "hypnotherapy") || previous.requestDigest !== record.requestDigest) throw new IntakeConflictError("A signed form was already saved from this browser attempt. Please reload the form to submit a new copy.");
        return { id, submittedAt: previous.submittedAt, duplicate: true };
      }
    }
    throw new Error("The signed intake could not be saved. Please try again.");
  }
  return { id, submittedAt, duplicate: false };
}
export async function listSignedIntakes(page = 0) {
  const supabase = createSupabaseAdminClient();
  const ids: string[] = [];
  const first = page * 25;
  let offset = 0;
  // Internal automation directories do not count as signed forms or hide a page.
  while (ids.length < first + 26) {
    const { data, error } = await supabase.storage.from(INTAKE_BUCKET).list("", { limit: 100, offset, sortBy: { column: "created_at", order: "desc" } });
    if (error) throw new Error("The private intake inbox could not be opened.");
    const batch = data || [];
    ids.push(...batch.filter(item => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.json$/i.test(item.name)).map(item => item.name.slice(0, -5)));
    offset += batch.length;
    if (batch.length < 100) break;
  }
  const records = await Promise.all(ids.slice(first, first + 25).map(id => getSignedIntake(id)));
  return { records: records.filter((record): record is SignedIntake => Boolean(record)), hasNext: ids.length > first + 25 };
}
