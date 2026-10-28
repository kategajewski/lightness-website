import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export type EncryptedIntake = { version: 1; id: string; iv: string; tag: string; ciphertext: string };
function encryptionKey() {
  const encoded = process.env.INTAKE_ENCRYPTION_KEY?.trim() || "";
  if (!/^[A-Za-z0-9+/]{43}=$/.test(encoded)) throw new Error("Intake encryption is not configured.");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) throw new Error("Intake encryption is not configured.");
  return key;
}
export function intakeEncryptionConfigured() {
  try { encryptionKey(); return true; } catch { return false; }
}
export function intakeDigest(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
}
export function encryptIntake(value: unknown, id: string): EncryptedIntake {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  cipher.setAAD(Buffer.from(`lightness-client-intake:v1:${id}`));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return { version: 1, id, iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), ciphertext: ciphertext.toString("base64") };
}
export function decryptIntake<T>(envelope: EncryptedIntake, expectedId: string): T {
  if (envelope.version !== 1 || envelope.id !== expectedId || typeof envelope.ciphertext !== "string" || envelope.ciphertext.length > 100000) throw new Error("Invalid intake envelope.");
  const iv = Buffer.from(envelope.iv, "base64");
  const tag = Buffer.from(envelope.tag, "base64");
  if (iv.length !== 12 || tag.length !== 16) throw new Error("Invalid intake envelope.");
  const cipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  cipher.setAAD(Buffer.from(`lightness-client-intake:v1:${expectedId}`));
  cipher.setAuthTag(tag);
  const plaintext = Buffer.concat([cipher.update(Buffer.from(envelope.ciphertext, "base64")), cipher.final()]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}
