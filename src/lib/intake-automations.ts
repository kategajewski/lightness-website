import "server-only";
import { createHmac } from "node:crypto";
import { getSignedIntake, type SignedIntake } from "@/lib/intake-storage";
import { readAutomationValue, reserveAutomationValue, writeAutomationValue, pendingAutomationJobs, acknowledgeAutomationJob } from "@/lib/intake-automation-store";
import { getIntakeDriveConnection, getIntakeDriveAccessToken, driveConnectionKey, type IntakeDriveConnection } from "@/lib/intake-drive-auth";
import { archiveIntakeToDrive, ensureDriveFolder, generateDriveId } from "@/lib/intake-drive";
import { createSignedIntakePdf } from "@/lib/intake-pdf";
import { syncIntakeNewsletterToMailchimp } from "@/lib/intake-mailchimp";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
type Completion = { recordDigest: string; completedAt: string; outcome: string; fileId?: string; destination?: string };
type Allocation = { id: string; identity: string };
export function intakeAutomationsEnabled() {
  // Preview/development deployments must never export production client records.
  return process.env.INTAKE_AUTOMATIONS_ENABLED === "1" && process.env.VERCEL_ENV === "production";
}
export async function enqueueIntakeAutomations(id: string) {
  if (!intakeAutomationsEnabled()) return false;
  if (!uuid.test(id)) throw new Error("Invalid intake reference.");
  const job = await reserveAutomationValue(`jobs/${id}`, { id, createdAt: new Date().toISOString() });
  if (job.id !== id) throw new Error("Invalid automation job.");
  return true;
}
async function allocatedId(key: string, identity: string, accessToken: string) {
  let allocation = await readAutomationValue<Allocation>(key);
  if (!allocation) allocation = await reserveAutomationValue(key, { id: await generateDriveId(accessToken), identity });
  if (allocation.identity !== identity || !/^[a-zA-Z0-9_-]{10,200}$/.test(allocation.id)) throw new Error("The archive reference could not be verified.");
  return allocation.id;
}
async function ensureArchiveRoot(connection: IntakeDriveConnection, accessToken: string) {
  const destination = driveConnectionKey(connection);
  const rootId = await allocatedId(`ids/root-${destination}`, destination, accessToken);
  await ensureDriveFolder({ accessToken, folderId: rootId, name: "Client Intake Records" });
  return { rootId, destination };
}
/** Verify the private destination on connection, without processing client data. */
export async function initializeIntakeDriveArchive() {
  if (process.env.VERCEL_ENV !== "production") throw new Error("Google Drive archive initialization is unavailable.");
  const connection = await getIntakeDriveConnection();
  if (!connection) throw new Error("Google Drive is not connected.");
  const accessToken = await getIntakeDriveAccessToken(connection);
  return ensureArchiveRoot(connection, accessToken);
}
function clientIdentity(record: SignedIntake) {
  const name = record.answers.fullName.normalize("NFKC").trim().toLowerCase();
  const phone = record.answers.phone.replace(/\D/g, "");
  const child = record.formType === "childrens-reiki" ? record.answers.childName.normalize("NFKC").trim().toLowerCase() : "";
  return createHmac("sha256", process.env.INTAKE_ENCRYPTION_KEY || "").update(JSON.stringify([name, phone, child])).digest("hex");
}
function clientFolderLabel(record: SignedIntake) {
  const fullLabel = record.formType === "childrens-reiki"
    ? `${record.answers.childName} (guardian: ${record.answers.fullName})`
    : record.answers.fullName;
  // Only the cosmetic label is shortened. The client key and signed names stay
  // intact. Count UTF-16 units to match the adapter without splitting a pair.
  let label = "";
  for (const character of fullLabel) {
    if (label.length + character.length > 160) break;
    label += character;
  }
  return label;
}
async function completed(record: SignedIntake, provider: "drive" | "mailchimp") {
  const value = await readAutomationValue<Completion>(`done/${record.id}-${provider}`);
  if (value && value.recordDigest !== record.recordDigest) throw new Error("The signed record does not match its delivery receipt.");
  return value;
}
async function finish(record: SignedIntake, provider: "drive" | "mailchimp", result: Omit<Completion, "recordDigest" | "completedAt">) {
  const saved = await reserveAutomationValue<Completion>(`done/${record.id}-${provider}`, { ...result, recordDigest: record.recordDigest, completedAt: new Date().toISOString() });
  if (saved.recordDigest !== record.recordDigest || saved.outcome !== result.outcome || saved.destination !== result.destination || saved.fileId !== result.fileId) throw new Error("The delivery receipt does not match.");
}
async function notePending(id: string, provider: string, code: string) {
  try { await writeAutomationValue(`status/${id}-${provider}`, { code, checkedAt: new Date().toISOString() }); }
  catch { /* Status text is best effort. The original durable job remains queued. */ }
}
export async function processIntakeAutomations(id: string) {
  if (!intakeAutomationsEnabled() || !uuid.test(id)) return { complete: false };
  const job = await readAutomationValue<{ id: string; createdAt: string }>(`jobs/${id}`);
  if (job) await writeAutomationValue(`jobs/${id}`, { ...job, lastAttemptAt: new Date().toISOString() });
  const record = await getSignedIntake(id);
  // A job is reserved before the signed write. Never acknowledge an absent record.
  if (!record) return { complete: false };
  let mailchimpDone = Boolean(await completed(record, "mailchimp"));
  let driveDone = Boolean(await completed(record, "drive"));
  if (!mailchimpDone) {
    try {
      const result = await syncIntakeNewsletterToMailchimp({ name: record.answers.fullName, email: record.answers.email, newsletterConsent: record.answers.newsletterConsent });
      if (result.outcome === "not-configured") await notePending(id, "mailchimp", "connection-needed");
      else {
        await finish(record, "mailchimp", { outcome: result.outcome === "synced" ? `member-${result.status}` : "not-requested" });
        mailchimpDone = true;
      }
    } catch { await notePending(id, "mailchimp", "retry-needed"); }
  }
  if (!driveDone) {
    try {
      const connection = await getIntakeDriveConnection();
      if (!connection) await notePending(id, "drive", "connection-needed");
      else {
        const token = await getIntakeDriveAccessToken(connection);
        const { rootId, destination } = await ensureArchiveRoot(connection, token);
        const clientKey = clientIdentity(record);
        const clientFolderId = await allocatedId(`ids/client-${destination}-${clientKey}`, `${destination}:${clientKey}`, token);
        const fileId = await allocatedId(`ids/file-${id}`, `${destination}:${record.recordDigest}`, token);
        const name = clientFolderLabel(record);
        await ensureDriveFolder({ accessToken: token, folderId: clientFolderId, parentId: rootId, clientKey, name });
        const pdf = await createSignedIntakePdf(record);
        await archiveIntakeToDrive({ record, pdf, accessToken: token, archiveFolderId: rootId, clientFolderId, clientKey, fileId });
        await finish(record, "drive", { outcome: "archived", fileId, destination });
        driveDone = true;
      }
    } catch { await notePending(id, "drive", "retry-needed"); }
  }
  if (mailchimpDone && driveDone) await acknowledgeAutomationJob(id);
  return { complete: mailchimpDone && driveDone };
}
export async function processPendingIntakeAutomations() {
  if (!intakeAutomationsEnabled()) return { processed: 0, completed: 0 };
  const ids = await pendingAutomationJobs(20);
  const started = Date.now();
  let processed = 0, complete = 0;
  for (const id of ids) {
    if (Date.now() - started > 40_000) break;
    try { const result = await processIntakeAutomations(id); complete += Number(result.complete); } catch { /* The immutable job stays queued for another attempt. */ }
    processed++;
  }
  return { processed, completed: complete };
}
