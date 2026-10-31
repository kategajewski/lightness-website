import { NextResponse } from "next/server";
import { getCurrentUserWithAccess } from "@/lib/member-access";
import { isAdminEmail } from "@/lib/site";
import { beginIntakeDriveAuthorization } from "@/lib/intake-drive-auth";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (request.headers.get("origin") !== "https://bethelightness.com" || process.env.VERCEL_ENV !== "production") return new NextResponse(null, { status: 403 });
  const { user } = await getCurrentUserWithAccess();
  if (!user?.email || !isAdminEmail(user.email)) return new NextResponse(null, { status: 403 });
  try { return NextResponse.redirect(await beginIntakeDriveAuthorization(user.id), 303); }
  catch { return NextResponse.redirect("https://bethelightness.com/client-intakes/automation?status=setup-needed", 303); }
}
