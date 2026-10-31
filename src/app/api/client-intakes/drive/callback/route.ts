import { after, NextResponse } from "next/server";
import { getCurrentUserWithAccess } from "@/lib/member-access";
import { isAdminEmail } from "@/lib/site";
import { completeIntakeDriveAuthorization } from "@/lib/intake-drive-auth";
import { processPendingIntakeAutomations } from "@/lib/intake-automations";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: Request) {
  const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };
  if (process.env.VERCEL_ENV !== "production") return new NextResponse(null, { status: 403, headers });
  const { user } = await getCurrentUserWithAccess();
  if (!user?.email || !isAdminEmail(user.email)) return new NextResponse(null, { status: 403, headers });
  let status = "connection-failed";
  try {
    await completeIntakeDriveAuthorization(new URL(request.url), user.id);
    status = "connected";
    after(async () => { try { await processPendingIntakeAutomations(); } catch { console.error("Intake automation processing will be retried."); } });
  } catch { /* Never expose authorization codes, tokens or provider messages. */ }
  return NextResponse.redirect(`https://bethelightness.com/client-intakes/automation?status=${status}`, { status: 303, headers });
}
