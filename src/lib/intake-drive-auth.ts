import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { encryptIntake, decryptIntake, type EncryptedIntake } from "@/lib/intake-crypto";
import { readAutomationValue, writeAutomationValue } from "@/lib/intake-automation-store";

const cookieName = "lightness_intake_drive_oauth";
const callbackUrl = "https://bethelightness.com/api/client-intakes/drive/callback";
const driveScope = "https://www.googleapis.com/auth/drive.file";
const targetEmail = "kategajewski@gmail.com";
export type IntakeDriveConnection = { email: string; refreshToken: string; connectedAt: string; clientId: string };
function client() {
  return { id: process.env.GOOGLE_DRIVE_CLIENT_ID?.trim() || "", secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET?.trim() || "" };
}
export function intakeDriveOAuthConfigured() { const c = client(); return Boolean(c.id && c.secret); }
export async function getIntakeDriveConnection() {
  const value = await readAutomationValue<IntakeDriveConnection>("config/drive");
  if (!value) return null;
  if (value.email !== targetEmail || value.clientId !== client().id || typeof value.refreshToken !== "string" || !value.refreshToken || typeof value.connectedAt !== "string") return null;
  return value;
}
export function driveConnectionKey(connection: IntakeDriveConnection) {
  return createHash("sha256").update(`${connection.clientId}:${connection.email}`).digest("hex");
}
async function tokenRequest(parameters: URLSearchParams) {
  try {
  const response = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: parameters, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("Google Drive authorization needs attention.");
  const value = await response.json() as { access_token?: string; refresh_token?: string; scope?: string };
  if (!value || typeof value.access_token !== "string" || !value.access_token || (value.refresh_token !== undefined && (typeof value.refresh_token !== "string" || !value.refresh_token)) || (value.scope !== undefined && typeof value.scope !== "string")) throw new Error("Google Drive authorization needs attention.");
  return value;
  } catch { throw new Error("Google Drive authorization needs attention."); }
}
export async function getIntakeDriveAccessToken(connection: IntakeDriveConnection) {
  const c = client();
  if (!c.id || !c.secret || connection.clientId !== c.id || connection.email !== targetEmail) throw new Error("Google Drive is not connected.");
  const token = await tokenRequest(new URLSearchParams({ client_id: c.id, client_secret: c.secret, refresh_token: connection.refreshToken, grant_type: "refresh_token" }));
  return token.access_token!;
}
export async function beginIntakeDriveAuthorization(userId: string) {
  if (!intakeDriveOAuthConfigured()) throw new Error("Google Drive connection setup is not ready.");
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const value = encryptIntake({ state, verifier, userId, expiresAt: Date.now() + 15 * 60_000 }, "drive-oauth-state");
  (await cookies()).set(cookieName, Buffer.from(JSON.stringify(value)).toString("base64url"), { httpOnly: true, secure: true, sameSite: "lax", path: "/api/client-intakes/drive", maxAge: 900 });
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: client().id, redirect_uri: callbackUrl, response_type: "code", scope: `openid email ${driveScope}`, access_type: "offline", prompt: "consent", login_hint: targetEmail, state, code_challenge: createHash("sha256").update(verifier).digest("base64url"), code_challenge_method: "S256" }).toString();
  return url.toString();
}
export async function completeIntakeDriveAuthorization(url: URL, userId: string) {
  const jar = await cookies();
  const raw = jar.get(cookieName)?.value;
  jar.delete({ name: cookieName, path: "/api/client-intakes/drive" });
  if (!raw || raw.length > 8000) throw new Error("Google Drive authorization expired.");
  const saved = decryptIntake<{ state: string; verifier: string; userId: string; expiresAt: number }>(JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as EncryptedIntake, "drive-oauth-state");
  const state = url.searchParams.get("state") || "";
  if (!saved || typeof saved.state !== "string" || typeof saved.verifier !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(saved.verifier) || saved.userId !== userId || !Number.isFinite(saved.expiresAt) || saved.expiresAt < Date.now() || Buffer.byteLength(state) !== Buffer.byteLength(saved.state) || !timingSafeEqual(Buffer.from(state), Buffer.from(saved.state))) throw new Error("Google Drive authorization expired.");
  const code = url.searchParams.get("code");
  if (!code || url.searchParams.has("error")) throw new Error("Google Drive was not connected.");
  const c = client();
  const token = await tokenRequest(new URLSearchParams({ client_id: c.id, client_secret: c.secret, code, code_verifier: saved.verifier, redirect_uri: callbackUrl, grant_type: "authorization_code" }));
  if (!token.scope?.split(" ").includes(driveScope)) throw new Error("Google Drive permission was not granted.");
  let profile: { email?: string; email_verified?: boolean };
  try {
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error();
    profile = await response.json() as typeof profile;
    if (!profile || typeof profile !== "object") throw new Error();
  } catch { throw new Error("Google Drive account could not be verified."); }
  if (profile.email !== targetEmail || profile.email_verified !== true) throw new Error("Please connect the selected Gmail account.");
  const previous = await getIntakeDriveConnection();
  const refreshToken = token.refresh_token || previous?.refreshToken;
  if (!refreshToken) throw new Error("Google Drive offline permission was not granted.");
  await writeAutomationValue<IntakeDriveConnection>("config/drive", { email: targetEmail, refreshToken, clientId: c.id, connectedAt: new Date().toISOString() });
}
