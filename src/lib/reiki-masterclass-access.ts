export const reikiMasterclassAccess = {
  title: "Called to Reiki | Holy Fire® Reiki Masterclass + Healing Experience",
  dateLabel: "Wednesday, September 16, 2026",
  timeLabel: "7:00-8:15 PM Eastern Time",
  meetHref: "https://meet.google.com/myw-kuih-cgh",
  dialInText: "+1 740-324-5018, PIN: 682453263",
  morePhoneNumbersHref:
    "https://tel.meet/myw-kuih-cgh?pin=5444824961536",
} as const;

export const reikiMasterclassGoogleCalendarHref =
  "https://calendar.google.com/calendar/render?" +
  new URLSearchParams({
    action: "TEMPLATE",
    text: reikiMasterclassAccess.title,
    dates: "20260916T230000Z/20260917T001500Z",
    details: [
      "A live Holy Fire® Reiki masterclass and healing experience with Kate Gajewski.",
      "",
      `Join Google Meet: ${reikiMasterclassAccess.meetHref}`,
      `Or dial: ${reikiMasterclassAccess.dialInText}`,
      `More phone numbers: ${reikiMasterclassAccess.morePhoneNumbersHref}`,
      "",
      "Please settle into a quiet, comfortable space. You may want water, a journal and headphones nearby.",
    ].join("\n"),
    location: reikiMasterclassAccess.meetHref,
    ctz: "America/New_York",
  }).toString();

export const reikiMasterclassCalendarAttachment = {
  filename: "called-to-reiki.ics",
  content: Buffer.from(
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//The Lightness of Being//Reiki Masterclass//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "UID:reiki-masterclass-20260916@bethelightness.com",
      "DTSTAMP:20260829T010000Z",
      "DTSTART:20260916T230000Z",
      "DTEND:20260917T001500Z",
      `SUMMARY:${reikiMasterclassAccess.title}`,
      `DESCRIPTION:A live Holy Fire® Reiki masterclass and healing experience with Kate Gajewski.\\n\\nJoin Google Meet: ${reikiMasterclassAccess.meetHref}\\nOr dial: ${reikiMasterclassAccess.dialInText}\\nMore phone numbers: ${reikiMasterclassAccess.morePhoneNumbersHref}`,
      `LOCATION:${reikiMasterclassAccess.meetHref}`,
      `URL:${reikiMasterclassAccess.meetHref}`,
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      "DESCRIPTION:Called to Reiki begins tomorrow",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
      "",
    ].join("\r\n"),
    "utf8",
  ),
  contentType: "text/calendar; charset=utf-8; method=PUBLISH",
};
