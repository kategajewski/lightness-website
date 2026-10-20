export const mentorshipLeadReceiptMaxAge = 10 * 60;

export const mentorshipLeadForms = [
  { source: "mentorship_application", pathname: "/mentorship-application", cookieName: "lightness_mentorship_lead" },
  { source: "healers_emergence_inquiry", pathname: "/reiki-mentorship/inquire", cookieName: "lightness_reiki_mentorship_lead" },
] as const;

export type MentorshipLeadSource = (typeof mentorshipLeadForms)[number]["source"];
export type MentorshipLeadReceipt = { id: string; source: MentorshipLeadSource; issuedAt: number };

// A short-lived analytics signal, not an authentication credential. No applicant data.
export function readMentorshipLeadReceipt(cookieHeader: string, pathname: string, now = Date.now()) {
  const form = mentorshipLeadForms.find((item) => item.pathname === pathname);
  if (!form) return null;
  const cookie = cookieHeader.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${form.cookieName}=`));
  if (!cookie) return null;
  try {
    const receipt = JSON.parse(decodeURIComponent(cookie.slice(form.cookieName.length + 1))) as MentorshipLeadReceipt;
    if (
      !receipt || typeof receipt.id !== "string" ||
      !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(receipt.id) ||
      receipt.source !== form.source || !Number.isFinite(receipt.issuedAt) ||
      receipt.issuedAt > now + 60_000 || now - receipt.issuedAt > mentorshipLeadReceiptMaxAge * 1000
    ) return null;
    return { ...form, receipt };
  } catch {
    return null;
  }
}
