import { canAccessReikiRisingFall2026, getCurrentUserWithAccess } from "@/lib/member-access";
import { isAdminEmail } from "@/lib/site";
import { createReikiPlaybackUrl, findReikiLesson, isModuleReleased } from "@/lib/reiki-rising-videos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function reply(body: object, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Vary": "Cookie",
    },
  });
}

export async function GET(request: Request, context: { params: Promise<{ lesson: string }> }) {
  const { user, accessRows } = await getCurrentUserWithAccess();
  if (!user) return reply({ error: "Please sign in again to watch your lesson." }, 401);
  if (!canAccessReikiRisingFall2026(user.email ?? "", accessRows)) {
    return reply({ error: "This lesson is part of Reiki Rising Fall 2026." }, 403);
  }
  const { lesson } = await context.params;
  const match = findReikiLesson(lesson);
  if (!match) return reply({ error: "Lesson not found." }, 404);
  const preview = new URL(request.url).searchParams.get("preview") === "1" && isAdminEmail(user.email ?? "");
  if (!isModuleReleased(match.module) && !preview) {
    return reply({ error: `Available ${match.module.date} at midnight New York time.` }, 403);
  }
  const url = createReikiPlaybackUrl(match.lesson.videoId);
  if (!url) return reply({ error: "This video is temporarily unavailable. Please try again shortly or contact Kate." }, 503);
  return reply({ url });
}
