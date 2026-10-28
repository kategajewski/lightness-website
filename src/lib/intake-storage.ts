import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { integrations } from "@/lib/env";
import { decryptIntake, encryptIntake, intakeDigest, intakeEncryptionConfigured, type EncryptedIntake } from "@/lib/intake-crypto";
import { ELECTRONIC_SIGNATURE_STATEMENT, HYPNOTHERAPY_CONSENT_PARAGRAPHS, HYPNOTHERAPY_PRIVACY_NOTICE, REMOTE_SESSION_STATEMENT, type HypnotherapyIntakeAnswers, type HypnotherapyIntakeInput } from "@/lib/hypnotherapy-intake";

export const INTAKE_BUCKET = "client-intakes";
export type SignedIntake = {
  id: string; submittedAt: string; formVersion: string; answers: HypnotherapyIntakeAnswers;
  consent: { paragraphs: readonly string[]; privacyNotice: string; remoteSessionStatement: string; electronicSignatureStatement: string };
  signature: { method: "typed-name"; name: string; date: string; recordedAt: string };
  requestDigest: string; recordDigest: string;
};
export class IntakeConflictError extends Error {}
export function intakeStorageConfigured() { return integrations.supabase && intakeEncryptionConfigured(); }
function objectPath(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new Error("Invalid intake identifier.");
  return `${id.toLowerCase()}.json`;
}
function answersFrom(input: HypnotherapyIntakeInput): HypnotherapyIntakeAnswers {
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
    consent: { paragraphs: HYPNOTHERAPY_CONSENT_PARAGRAPHS, privacyNotice: HYPNOTHERAPY_PRIVACY_NOTICE, remoteSessionStatement: REMOTE_SESSION_STATEMENT, electronicSignatureStatement: ELECTRONIC_SIGNATURE_STATEMENT },
    signature: { method: "typed-name" as const, name: input.signatureName, date: input.signatureDate, recordedAt: submittedAt },
    requestDigest: intakeDigest(answers),
  };
  const record: SignedIntake = { ...unsigned, recordDigest: intakeDigest(unsigned) };
  const encrypted = encryptIntake(record, id);
  const { error } = await createSupabaseAdminClient().storage.from(INTAKE_BUCKET).upload(objectPath(id), Buffer.from(JSON.stringify(encrypted)), { contentType: "application/json", cacheControl: "0", upsert: false });
  if (error) {
    if (["409", "400"].includes(String(error.statusCode)) || error.message.toLowerCase().includes("already exists")) {
      const previous = await getSignedIntake(id);
      if (previous) {
        if (previous.requestDigest !== record.requestDigest) throw new IntakeConflictError("A signed form was already saved from this browser attempt. Please reload the form to submit a new copy.");
        return { id, submittedAt: previous.submittedAt, duplicate: true };
      }
    }
    throw new Error("The signed intake could not be saved. Please try again.");
  }
  return { id, submittedAt, duplicate: false };
}
export async function listSignedIntakes(page = 0) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.storage.from(INTAKE_BUCKET).list("", { limit: 26, offset: page * 25, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw new Error("The private intake inbox could not be opened.");
  const files = (data || []).filter(item => item.name.endsWith(".json"));
  const records = await Promise.all(files.slice(0, 25).map(file => getSignedIntake(file.name.slice(0, -5))));
  return { records: records.filter((record): record is SignedIntake => Boolean(record)), hasNext: files.length > 25 };
}
