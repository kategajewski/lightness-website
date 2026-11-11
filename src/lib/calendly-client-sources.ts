import "server-only";

import { isBusinessCalendlyUrl } from "@/lib/calendly-attribution";
import { classifyCalendlySource, type clientSourceLabels } from "@/lib/client-source";

export type ClientSourceService = { slug: string; name: string };
export type ClientSourceRow = {
  source: keyof typeof clientSourceLabels;
  service: string;
  count: number;
  firstRecorded?: number;
  returning?: number;
};

export const clientSourceServices: ClientSourceService[] = [
  { slug: "restandreceiveenergy", name: "Rest & Receive" },
  { slug: "sacredreset", name: "Return to Self: Sacred Reset" },
  { slug: "childrensreiki", name: "Gentle Energy Support for Children" },
  { slug: "innerjourney", name: "The Inner Journey" },
  { slug: "private-sound-healing", name: "Private Sound Immersion" },
  { slug: "mentorship", name: "Personalized Guidance" },
];

type Report =
  | { status: "ready"; rows: ClientSourceRow[]; services: ClientSourceService[] }
  | { status: "unconfigured" | "unavailable" };
type CalendlyReader = <T>(path: string, params?: Record<string, string>) => Promise<T>;
type CalendlyEventType = { uri: string; slug: string; scheduling_url: string };
type CalendlyEvent = { uri: string; event_type: string; start_time: string; status: string };
type CalendlyInvitee = {
  uri: string;
  status: string;
  email?: string | null;
  tracking?: Record<string, unknown> | null;
};
type Appointment = { id: string; service: string; start: number };
type Booking = Omit<Appointment, "id"> & { source: ClientSourceRow["source"]; email?: string };

const calendlyApi = "https://api.calendly.com";
const inviteeConcurrency = 4;
const easternOffset = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  timeZoneName: "longOffset",
});

function easternMidnight(utcMidnight: Date) {
  // UTC midnight is the prior evening in New York, on the same side of any DST change as local midnight.
  const offset = easternOffset.formatToParts(utcMidnight).find((part) => part.type === "timeZoneName")?.value;
  if (!offset?.startsWith("GMT")) throw new Error("Missing New York timezone offset");
  return Date.parse(utcMidnight.toISOString().replace(/Z$/, offset.slice(3) || "Z"));
}

function appointmentMonth(month: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error("Invalid appointment month");
  const start = new Date(`${month}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start: easternMidnight(start), end: easternMidnight(end) };
}

function calendlyReader(token: string, signal: AbortSignal, requestBudget?: number): CalendlyReader {
  let requestsRemaining = requestBudget ?? Infinity;
  return async <T>(path: string, params?: Record<string, string>) => {
    signal.throwIfAborted();
    if (requestsRemaining <= 0) throw new Error("Calendly request budget exhausted");
    requestsRemaining--;
    const url = new URL(path, calendlyApi);
    url.search = new URLSearchParams(params).toString();
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      cache: "no-store",
      redirect: "error",
      signal,
    });
    if (!response.ok) throw new Error("Calendly request failed");
    const remaining = response.headers.get("x-ratelimit-remaining");
    if (requestBudget !== undefined && remaining !== null && /^\d+$/.test(remaining)) {
      requestsRemaining = Math.min(requestsRemaining, Number(remaining) - inviteeConcurrency);
    }
    return response.json() as Promise<T>;
  };
}

async function* calendlyCollection<T>(read: CalendlyReader, path: string, params: Record<string, string>) {
  const seenTokens = new Set<string>();
  let pageToken: string | undefined;
  do {
    const page = await read<{ collection: T[]; pagination: { next_page_token: string | null } }>(path, {
      ...params,
      count: "100",
      ...(pageToken ? { page_token: pageToken } : {}),
    });
    const next = page.pagination?.next_page_token;
    if (!Array.isArray(page.collection) || (next !== null && (typeof next !== "string" || !next || seenTokens.has(next)))) {
      throw new Error("Invalid Calendly pagination");
    }
    yield* page.collection;
    pageToken = next ?? undefined;
    if (pageToken) seenTokens.add(pageToken);
  } while (pageToken);
}

function resourceId(uri: string, collection: "users" | "event_types" | "scheduled_events") {
  const prefix = `${calendlyApi}/${collection}/`;
  const id = uri.startsWith(prefix) ? uri.slice(prefix.length) : "";
  if (!/^[a-z0-9_-]+$/i.test(id)) throw new Error("Invalid Calendly resource");
  return id;
}

async function eventServices(read: CalendlyReader, user: string) {
  const servicesByEventType = new Map<string, string>();
  for await (const eventType of calendlyCollection<CalendlyEventType>(read, "/event_types", { user })) {
    const service = clientSourceServices.find(({ slug }) => slug === eventType.slug);
    if (!service || !isBusinessCalendlyUrl(eventType.scheduling_url)) continue;
    const path = new URL(eventType.scheduling_url).pathname.replace(/\/$/, "");
    if (path !== `/thelightnessofbeing/${service.slug}`) continue;
    const id = resourceId(eventType.uri, "event_types");
    servicesByEventType.set(`${calendlyApi}/event_types/${id}`, service.slug);
  }
  if (new Set(servicesByEventType.values()).size !== clientSourceServices.length) {
    throw new Error("Calendly service mapping is incomplete");
  }
  return servicesByEventType;
}

function includedAppointment(event: CalendlyEvent, services: Map<string, string>): Appointment | undefined {
  if (event.status !== "active") return;
  const service = services.get(event.event_type);
  if (!service) return;
  const start = Date.parse(event.start_time);
  if (!Number.isFinite(start)) throw new Error("Invalid Calendly appointment time");
  return { id: resourceId(event.uri, "scheduled_events"), service, start };
}

function activeInvitees(read: CalendlyReader, appointment: Appointment) {
  return calendlyCollection<CalendlyInvitee>(read, `/scheduled_events/${appointment.id}/invitees`, {
    status: "active",
  });
}

function inviteeEmail(invitee: CalendlyInvitee) {
  return typeof invitee.email === "string" ? invitee.email.trim().toLowerCase() || undefined : undefined;
}

async function mapBatches<T, Result>(items: T[], visit: (item: T) => Promise<Result>) {
  const results: Result[] = [];
  for (let index = 0; index < items.length; index += inviteeConcurrency) {
    results.push(...await Promise.all(items.slice(index, index + inviteeConcurrency).map(visit)));
  }
  return results;
}

async function earlierClients(
  read: CalendlyReader,
  user: string,
  services: Map<string, string>,
  currentEmails: Set<string>,
  before: number,
) {
  const matched = new Set<string>();
  if (!currentEmails.size) return { matched, complete: true };

  const seen = new Set<string>();
  const pending: Appointment[] = [];
  async function scanPending() {
    const results = await Promise.allSettled(pending.splice(0).map(async (appointment) => {
      for await (const invitee of activeInvitees(read, appointment)) {
        const email = inviteeEmail(invitee);
        if (invitee.status === "active" && email && currentEmails.has(email)) matched.add(email);
      }
    }));
    if (results.some(({ status }) => status === "rejected")) throw new Error("Calendly history is incomplete");
  }

  try {
    // Keep invitee emails out of request URLs, which can appear in fetch traces.
    const events = calendlyCollection<CalendlyEvent>(read, "/scheduled_events", {
      user,
      status: "active",
      max_start_time: new Date(before).toISOString(),
      sort: "start_time:desc",
    });
    for await (const event of events) {
      const appointment = includedAppointment(event, services);
      if (!appointment || appointment.start >= before || seen.has(appointment.id)) continue;
      seen.add(appointment.id);
      pending.push(appointment);
      if (pending.length === inviteeConcurrency) await scanPending();
      if (matched.size === currentEmails.size) return { matched, complete: false };
    }
    await scanPending();
    return { matched, complete: true };
  } catch {
    // An incomplete history must not make an appointment look like a client's first one.
    return { matched, complete: false };
  }
}

export async function getCalendlyClientSources(month: string): Promise<Report> {
  const token = process.env.CALENDLY_CLIENT_SOURCES_TOKEN?.trim();
  if (!token) return { status: "unconfigured" };

  try {
    const monthRange = appointmentMonth(month);
    const read = calendlyReader(token, AbortSignal.timeout(20_000));
    const { resource } = await read<{ resource: { uri: string } }>("/users/me");
    const user = `${calendlyApi}/users/${resourceId(resource.uri, "users")}`;
    const services = await eventServices(read, user);
    const appointments = new Map<string, Appointment>();
    const events = calendlyCollection<CalendlyEvent>(read, "/scheduled_events", {
      user,
      status: "active",
      // The API documents min_start_time as exclusive. The local check includes midnight.
      min_start_time: new Date(monthRange.start - 1).toISOString(),
      max_start_time: new Date(monthRange.end).toISOString(),
    });
    for await (const event of events) {
      const appointment = includedAppointment(event, services);
      if (appointment && appointment.start >= monthRange.start && appointment.start < monthRange.end) {
        appointments.set(appointment.id, appointment);
      }
    }

    const bookings = (await mapBatches([...appointments.values()], async (appointment) => {
      const bookingsByInvitee = new Map<string, Booking>();
      for await (const invitee of activeInvitees(read, appointment)) {
        if (invitee.status !== "active") continue;
        if (!invitee.uri) throw new Error("Missing Calendly invitee identifier");
        bookingsByInvitee.set(invitee.uri, {
          service: appointment.service,
          start: appointment.start,
          source: classifyCalendlySource(invitee.tracking),
          email: inviteeEmail(invitee),
        });
      }
      return [...bookingsByInvitee.values()];
    })).flat();

    const firstStarts = new Map<string, number>();
    for (const { email, start } of bookings) {
      if (email) firstStarts.set(email, Math.min(start, firstStarts.get(email) ?? start));
    }
    const historyRead = calendlyReader(token, AbortSignal.timeout(8_000), 48);
    const history = await earlierClients(historyRead, user, services, new Set(firstStarts.keys()), monthRange.start);

    const rows = new Map<string, Required<ClientSourceRow>>();
    for (const { source, service, email, start } of bookings) {
      const key = `${source}:${service}`;
      const row = rows.get(key) ?? { source, service, count: 0, firstRecorded: 0, returning: 0 };
      row.count++;
      if (email) {
        if (history.matched.has(email) || (firstStarts.get(email) ?? start) < start) {
          row.returning++;
        } else if (history.complete) {
          row.firstRecorded++;
        }
      }
      rows.set(key, row);
    }
    return { status: "ready", rows: [...rows.values()], services: clientSourceServices };
  } catch {
    return { status: "unavailable" };
  }
}
