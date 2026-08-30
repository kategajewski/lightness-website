import { createReikiRisingCalendarFile } from "@/lib/reiki-rising-live-calls";

export async function GET() {
  const calendar = createReikiRisingCalendarFile();

  return new Response(calendar.content, {
    headers: {
      "Content-Disposition": `attachment; filename="${calendar.filename}"`,
      "Content-Type": calendar.contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
