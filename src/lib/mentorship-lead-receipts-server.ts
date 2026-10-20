import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { mentorshipLeadForms, mentorshipLeadReceiptMaxAge, type MentorshipLeadSource } from "@/lib/mentorship-lead-receipts";

export async function markMentorshipLeadSaved(source: MentorshipLeadSource) {
  const form = mentorshipLeadForms.find((item) => item.source === source);
  if (!form) return;
  const cookieStore = await cookies();
  cookieStore.set(form.cookieName, JSON.stringify({ id: randomUUID(), source, issuedAt: Date.now() }), {
    // The client consumes this non-sensitive analytics receipt after queueing the event.
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: form.pathname,
    maxAge: mentorshipLeadReceiptMaxAge,
  });
}
