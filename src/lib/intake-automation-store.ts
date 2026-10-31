import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { INTAKE_BUCKET } from "@/lib/intake-storage";
import { decryptIntake, encryptIntake, type EncryptedIntake } from "@/lib/intake-crypto";

function path(key: string) {
  if (!/^[a-zA-Z0-9/_-]{1,240}$/.test(key) || key.includes("..")) throw new Error("Invalid automation reference.");
  return `automation/${key}.json`;
}
function missing(error: { statusCode?: string | number; message: string }) {
  return String(error.statusCode) === "404" || /^(Object not found|The resource was not found)$/.test(error.message);
}
export async function readAutomationValue<T>(key: string): Promise<T | null> {
  const { data, error } = await createSupabaseAdminClient().storage.from(INTAKE_BUCKET).download(path(key));
  if (error || !data) {
    if (error && missing(error)) return null;
    throw new Error("Private automation storage is unavailable.");
  }
  return decryptIntake<T>(JSON.parse(await data.text()) as EncryptedIntake, `automation:${key}`);
}
export async function reserveAutomationValue<T>(key: string, value: T): Promise<T> {
  const { error } = await createSupabaseAdminClient().storage.from(INTAKE_BUCKET).upload(path(key), Buffer.from(JSON.stringify(encryptIntake(value, `automation:${key}`))), { contentType: "application/json", cacheControl: "0", upsert: false });
  if (!error) return value;
  if (["400", "409"].includes(String(error.statusCode)) || /already exists/i.test(error.message)) {
    const existing = await readAutomationValue<T>(key);
    if (existing) return existing;
  }
  throw new Error("Private automation storage is unavailable.");
}
export async function writeAutomationValue<T>(key: string, value: T) {
  const { error } = await createSupabaseAdminClient().storage.from(INTAKE_BUCKET).upload(path(key), Buffer.from(JSON.stringify(encryptIntake(value, `automation:${key}`))), { contentType: "application/json", cacheControl: "0", upsert: true });
  if (error) throw new Error("Private automation storage is unavailable.");
}
export async function pendingAutomationJobs(limit = 20) {
  // Attempted jobs move to the back of the queue, including abandoned prewrites.
  const { data, error } = await createSupabaseAdminClient().storage.from(INTAKE_BUCKET).list("automation/jobs", { limit, sortBy: { column: "updated_at", order: "asc" } });
  if (error) throw new Error("Private automation storage is unavailable.");
  return (data || []).filter(item => /^[0-9a-f-]{36}\.json$/.test(item.name)).map(item => item.name.slice(0, -5));
}
export async function acknowledgeAutomationJob(id: string) {
  // Only the queue pointer is removed. Signed records and delivery receipts stay intact.
  const { error } = await createSupabaseAdminClient().storage.from(INTAKE_BUCKET).remove([path(`jobs/${id}`)]);
  if (error) throw new Error("Private automation storage is unavailable.");
}
