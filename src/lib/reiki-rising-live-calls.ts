const googleCalendarBaseUrl = "https://calendar.google.com/calendar/render";

export const reikiRisingLiveCalls = {
  title: "Reiki Rising Fall 2026 Weekly Live Call",
  meetHref: "https://meet.google.com/vka-htoq-sgj",
  dialIn: "+1 361-271-1087",
  pin: "387 491 998#",
  morePhoneNumbersHref:
    "https://tel.meet/vka-htoq-sgj?pin=6590341127818",
  calendarFileHref: "/api/calendar/reiki-rising-fall-2026",
} as const;

const calendarDescription = [
  "Welcome to the Reiki Rising Fall 2026 weekly live call with Kate.",
  "",
  "We will gather for teaching, questions, guided Reiki experiences, placements, practice and integration. Each week will support the corresponding module released on Sunday.",
  "",
  "Please join from a quiet, comfortable space with your journal and anything you need to feel grounded. You are welcome to enter the meeting a few minutes early.",
  "",
  "Important: The Level One and Level Two placement calls must be attended live for certification. Please check the student portal for each week's focus, preparation guidance and replay information.",
  "",
  `Video call: ${reikiRisingLiveCalls.meetHref}`,
  `Dial in: ${reikiRisingLiveCalls.dialIn} PIN: ${reikiRisingLiveCalls.pin}`,
  `More phone numbers: ${reikiRisingLiveCalls.morePhoneNumbersHref}`,
  "Student portal: https://bethelightness.com/account",
].join("\n");

const googleCalendarParams = new URLSearchParams({
  action: "TEMPLATE",
  text: reikiRisingLiveCalls.title,
  dates: "20260930T190000/20260930T201500",
  ctz: "America/New_York",
  recur: "RRULE:FREQ=WEEKLY;COUNT=10",
  details: calendarDescription,
  location: reikiRisingLiveCalls.meetHref,
});

export const reikiRisingGoogleCalendarHref =
  `${googleCalendarBaseUrl}?${googleCalendarParams.toString()}`;

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

export function createReikiRisingCalendarFile() {
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Lightness of Being//Reiki Rising Fall 2026//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:reiki-rising-fall-2026-live-calls@bethelightness.com",
    "DTSTAMP:20260829T120000Z",
    "DTSTART;TZID=America/New_York:20260930T190000",
    "DTEND;TZID=America/New_York:20260930T201500",
    "RRULE:FREQ=WEEKLY;COUNT=10",
    `SUMMARY:${escapeIcsText(reikiRisingLiveCalls.title)}`,
    `DESCRIPTION:${escapeIcsText(calendarDescription)}`,
    `LOCATION:${escapeIcsText(reikiRisingLiveCalls.meetHref)}`,
    `URL:${reikiRisingLiveCalls.meetHref}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return {
    filename: "reiki-rising-fall-2026-live-calls.ics",
    content: Buffer.from(content, "utf8"),
    contentType: "text/calendar; charset=utf-8; method=PUBLISH",
  };
}

export const reikiRisingCalendarAttachment =
  createReikiRisingCalendarFile();
