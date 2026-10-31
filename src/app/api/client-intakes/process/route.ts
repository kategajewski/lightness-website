import { timingSafeEqual } from "node:crypto";
import { after, NextResponse } from "next/server";
import { getCurrentUserWithAccess } from "@/lib/member-access";
import { isAdminEmail } from "@/lib/site";
import { processPendingIntakeAutomations } from "@/lib/intake-automations";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: Request) {
  if (process.env.VERCEL_ENV !== "production") return new NextResponse(null, { status: 403 });
  const secret = process.env.CRON_SECRET || "";
  const expected = `Bearer ${secret}`, supplied = request.headers.get("authorization") || "";
  if (secret.length < 32 || expected.length !== supplied.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) return new NextResponse(null, { status: 403 });
  const result = await processPendingIntakeAutomations();
  return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } });
}
export async function POST(request: Request) {
  if (request.headers.get("origin") !== "https://bethelightness.com" || process.env.VERCEL_ENV !== "production") return new NextResponse(null, { status: 403 });
  const { user } = await getCurrentUserWithAccess();
  if (!user?.email || !isAdminEmail(user.email)) return new NextResponse(null, { status: 403 });
  after(async () => { try { await processPendingIntakeAutomations(); } catch { console.error("Intake automation processing will be retried."); } });
  return NextResponse.redirect("https://bethelightness.com/client-intakes/automation?status=retry-started", 303);
}
