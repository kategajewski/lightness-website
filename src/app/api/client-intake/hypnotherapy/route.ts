import { createHmac } from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { validateHypnotherapyIntake } from "@/lib/hypnotherapy-intake";
import { IntakeConflictError, intakeStorageConfigured, saveSignedIntake } from "@/lib/intake-storage";
import { sendClientIntakeOwnerNotification } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const maximumBytes = 48000;
const attempts = new Map<string, { start: number; ids: Set<string> }>();
function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store, max-age=0", "X-Robots-Tag": "noindex, nofollow, noarchive", "Referrer-Policy": "no-referrer" } });
}
async function boundedBody(request: Request) {
  const length = Number(request.headers.get("content-length"));
  if (length > maximumBytes) throw new RangeError("Request too large.");
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError("Missing form.");
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > maximumBytes) { await reader.cancel(); throw new RangeError("Request too large."); }
    chunks.push(value);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
}
function rateAllowed(request: Request, id: string) {
  const address = request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!address) return true;
  const key = createHmac("sha256", process.env.INTAKE_ENCRYPTION_KEY || "").update(address).digest("hex");
  const now = Date.now();
  for (const [storedKey, value] of attempts) if (now - value.start > 3600000) attempts.delete(storedKey);
  if (attempts.size > 5000) return false;
  const value = attempts.get(key) || { start: now, ids: new Set<string>() };
  if (!value.ids.has(id) && value.ids.size >= 6) return false;
  value.ids.add(id); attempts.set(key, value);
  return true;
}
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const requestUrl = new URL(request.url);
  const allowedOrigins = [requestUrl.origin, new URL(env.siteUrl).origin];
  // Next may use an internal hostname in request.url. Host retains the actual
  // browser-facing authority; do not trust a caller-supplied forwarded host.
  const host = request.headers.get("host");
  if (host && /^[a-z0-9.-]+(?::\d{1,5})?$/i.test(host)) {
    try { allowedOrigins.push(new URL(`${requestUrl.protocol}//${host}`).origin); } catch { /* Invalid authorities are never accepted. */ }
  }
  if (!origin || !allowedOrigins.includes(origin)) return json({ error: "Please submit this form from the intake page." }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return json({ error: "Please submit this form from the intake page." }, 415);
  if (!intakeStorageConfigured()) return json({ error: "This intake form is temporarily unavailable. Please contact Kate before sending personal information." }, 503);
  let raw: unknown;
  try { raw = await boundedBody(request); }
  catch (error) { return json({ error: error instanceof RangeError ? "The form is too long. Please shorten your answers and try again." : "The form could not be read. Please try again." }, error instanceof RangeError ? 413 : 400); }
  const validation = validateHypnotherapyIntake(raw);
  if (!validation.success || !validation.data) return json({ error: "Please check the highlighted fields.", errors: validation.errors }, 400);
  const input = validation.data;
  const elapsed = Date.now() - input.startedAt;
  if (input.website || !Number.isFinite(elapsed) || elapsed < 4000 || elapsed > 86400000) return json({ error: "Please take a moment to complete the form, then try again. If it has been open since yesterday, reload it before signing." }, 400);
  if (!rateAllowed(request, input.submissionId)) return json({ error: "Several forms were submitted from this connection. Please wait before trying again, or contact Kate." }, 429);
  try {
    const receipt = await saveSignedIntake(input);
    if (!receipt.duplicate) {
      try { await sendClientIntakeOwnerNotification({ id: receipt.id, submittedAt: receipt.submittedAt }); }
      catch { console.error("Client intake owner notification could not be delivered."); }
    }
    return json(receipt, receipt.duplicate ? 200 : 201);
  } catch (error) {
    if (error instanceof IntakeConflictError) return json({ error: error.message }, 409);
    // Do not log request bodies, health answers, signatures or provider error payloads.
    console.error("Client intake persistence failed.");
    return json({ error: "Your signed form could not be saved yet. Your answers are still here. Please try again." }, 503);
  }
}
