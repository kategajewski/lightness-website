import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import {
  clientSourceServices,
  getCalendlyClientSources,
  type ClientSourceRow,
  type ClientSourceService,
} from "@/lib/calendly-client-sources";
import { clientSourceLabels } from "@/lib/client-source";
import { getCurrentUserWithAccess } from "@/lib/member-access";
import { isAdminEmail } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Client Sources",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

const reportPath = "/admin/client-sources";
const reportTimeZone = "America/New_York";
const monthPattern = "[1-9][0-9]{3}-(0[1-9]|1[0-2])";
const validMonth = new RegExp(`^${monthPattern}$`);
const monthValueFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: reportTimeZone,
  year: "numeric",
  month: "2-digit",
});
const monthLabelFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: reportTimeZone,
  year: "numeric",
  month: "long",
});
const numberFormatter = new Intl.NumberFormat("en-US");
const panelClass =
  "rounded-[24px] border border-[rgba(76,58,48,0.12)] bg-[rgba(255,251,246,0.9)] p-5 sm:p-7";
const filterControlClass =
  "min-h-12 max-w-full rounded-xl border border-[#9b7c6b] bg-[var(--color-ivory)] px-3 py-2 text-base";

function getCurrentMonth() {
  const parts = monthValueFormatter.formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}

function getSampleRows(): ClientSourceRow[] {
  return clientSourceServices.flatMap(({ slug }, index) => [
    {
      source: "organic_google",
      service: slug,
      count: index + 1,
      firstRecorded: 1,
      returning: index,
    },
    {
      source: index % 2 === 0 ? "instagram_kate" : "google_ads",
      service: slug,
      count: 2,
      firstRecorded: 1,
    },
  ]);
}

function BookingCounts({
  title,
  label,
  entries,
  showFirstRecorded = false,
}: {
  title: string;
  label: string;
  entries: Array<{ label: string; count: number; firstRecorded?: number }>;
  showFirstRecorded?: boolean;
}) {
  return (
    <table className="w-full text-sm">
      <caption className="mb-2 text-left text-lg font-bold">
        {title}
      </caption>
      <thead className="border-b border-[rgba(76,58,48,0.22)] text-[var(--color-muted)]">
        <tr>
          <th scope="col" className="py-2 pr-4 text-left font-bold">
            {label}
          </th>
          <th scope="col" className="py-2 text-right font-bold">
            Bookings
          </th>
          {showFirstRecorded && (
            <th scope="col" className="py-2 pl-3 text-right font-bold">
              First recorded
            </th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-[rgba(76,58,48,0.12)]">
        {entries.map((entry) => (
          <tr key={entry.label}>
            <th scope="row" className="py-3 pr-4 text-left font-normal">
              {entry.label}
            </th>
            <td className="py-3 text-right tabular-nums">
              {numberFormatter.format(entry.count)}
            </td>
            {showFirstRecorded && (
              <td className="py-3 pl-3 text-right tabular-nums">
                {numberFormatter.format(entry.firstRecorded ?? 0)}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReportCounts({
  rows,
  services,
  monthLabel,
  selectedService,
  isSample,
}: {
  rows: ClientSourceRow[];
  services: readonly ClientSourceService[];
  monthLabel: string;
  selectedService?: ClientSourceService;
  isSample: boolean;
}) {
  const matchingRows = selectedService ? rows.filter((row) => row.service === selectedService.slug) : rows;
  const matchingServices = selectedService ? [selectedService] : services;
  const sourceTotals = new Map<string, { count: number; firstRecorded: number }>();
  const serviceTotals = new Map<string, number>();
  let total = 0;
  let firstRecorded = 0;
  let returning = 0;

  for (const row of matchingRows) {
    const sourceTotal = sourceTotals.get(row.source) ?? { count: 0, firstRecorded: 0 };
    sourceTotal.count += row.count;
    sourceTotal.firstRecorded += row.firstRecorded ?? 0;
    sourceTotals.set(row.source, sourceTotal);
    serviceTotals.set(row.service, (serviceTotals.get(row.service) ?? 0) + row.count);
    total += row.count;
    firstRecorded += row.firstRecorded ?? 0;
    returning += row.returning ?? 0;
  }

  return (
    <section className={panelClass} aria-labelledby="client-sources-month">
      {isSample && (
        <p className="mb-5 rounded-xl border border-[#b38468] bg-[var(--color-beige)] px-4 py-3 text-sm">
          <strong>Sample data.</strong> These example counts show how the report will look after Calendly is connected.
        </p>
      )}
      <h2 id="client-sources-month" className="display-section-title">
        {monthLabel}
      </h2>
      {selectedService && <p className="mt-2 font-bold">{selectedService.name}</p>}
      <p className="mt-2 text-[var(--color-muted)]">
        {total === 0
          ? "No Calendly bookings match these filters."
          : `${numberFormatter.format(total)} Calendly ${total === 1 ? "booking" : "bookings"}`}
      </p>
      <div className="mt-6 grid items-start gap-7 md:grid-cols-2 md:gap-10">
        <div>
          <BookingCounts
            title="By source"
            label="Source"
            entries={Object.entries(clientSourceLabels).map(([key, label]) => {
              const counts = sourceTotals.get(key);
              return { label, count: counts?.count ?? 0, firstRecorded: counts?.firstRecorded ?? 0 };
            })}
            showFirstRecorded
          />
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            A booking has an unknown source when Calendly has no recognized source information.
          </p>
        </div>
        <BookingCounts
          title="By appointment type"
          label="Appointment type"
          entries={matchingServices.map(({ slug, name }) => ({
            label: name,
            count: serviceTotals.get(slug) ?? 0,
          }))}
        />
      </div>
      <div className="mt-7 border-t border-[rgba(76,58,48,0.22)] pt-5">
        <h3 className="text-lg font-bold">Client history</h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          A first recorded booking has no earlier active booking for the same client across the six tracked appointment types.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { label: "First recorded", count: firstRecorded },
            { label: "Returning", count: returning },
            { label: "History unknown", count: total - firstRecorded - returning },
          ].map(({ label, count }) => (
            <div key={label}>
              <dt className="text-sm text-[var(--color-muted)]">{label}</dt>
              <dd className="mt-1 text-2xl font-bold tabular-nums">
                {numberFormatter.format(count)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

async function ClientSourcesReport({
  month,
  monthLabel,
  selectedService,
}: {
  month: string;
  monthLabel: string;
  selectedService?: ClientSourceService;
}) {
  const report = await getCalendlyClientSources(month);

  if (report.status === "ready") {
    return (
      <ReportCounts
        rows={report.rows}
        services={report.services}
        monthLabel={monthLabel}
        selectedService={selectedService}
        isSample={false}
      />
    );
  }

  if (report.status === "unconfigured" && process.env.VERCEL_ENV === "preview") {
    return (
      <ReportCounts
        rows={getSampleRows()}
        services={clientSourceServices}
        monthLabel={monthLabel}
        selectedService={selectedService}
        isSample
      />
    );
  }

  return (
    <section className={panelClass} aria-labelledby="client-sources-status">
      <h2 id="client-sources-status" className="text-lg font-bold">
        {report.status === "unconfigured" ? "Calendly connection needed" : "Calendly is temporarily unavailable"}
      </h2>
      <p className="mt-2 text-[var(--color-muted)]">
        {report.status === "unconfigured"
          ? "Connect Calendly to see client sources and appointment counts."
          : "We couldn’t load booking counts for this month. Select View report to try again."}
      </p>
    </section>
  );
}

export default async function ClientSourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string | string[]; service?: string | string[] }>;
}) {
  const { user } = await getCurrentUserWithAccess();

  if (!user?.email) redirect("/login");
  if (!isAdminEmail(user.email)) redirect("/account");

  const { month: requestedMonth, service: requestedService } = await searchParams;
  const month = typeof requestedMonth === "string" && validMonth.test(requestedMonth)
    ? requestedMonth
    : getCurrentMonth();
  const monthLabel = monthLabelFormatter.format(new Date(`${month}-01T12:00:00Z`));
  const invalidMonth = requestedMonth !== undefined && requestedMonth !== month;
  const selectedService = clientSourceServices.find((service) => service.slug === requestedService);
  const invalidService = requestedService !== undefined && requestedService !== "" && !selectedService;

  return (
    <PageShell
      eyebrow="Admin"
      title="Client Sources"
      description="See where Calendly clients found you and which appointments they booked."
    >
      <section className={panelClass} aria-label="Report controls">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <form method="get" action={reportPath} className="flex min-w-0 flex-wrap items-end gap-3">
            <div className="min-w-0">
              <label htmlFor="client-sources-filter-month" className="mb-2 block text-sm font-bold">
                Appointment month
              </label>
              <input
                id="client-sources-filter-month"
                name="month"
                type="month"
                pattern={monthPattern}
                defaultValue={month}
                required
                aria-describedby="client-sources-month-help"
                className={filterControlClass}
              />
            </div>
            <div className="min-w-0">
              <label htmlFor="client-sources-filter-service" className="mb-2 block text-sm font-bold">
                Appointment type
              </label>
              <select
                id="client-sources-filter-service"
                name="service"
                defaultValue={selectedService?.slug ?? ""}
                className={filterControlClass}
              >
                <option value="">All appointment types</option>
                {clientSourceServices.map(({ slug, name }) => (
                  <option key={slug} value={slug}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="button-pill">
              View report
            </button>
          </form>
          <Link href="/admin" className="inline-flex min-h-12 items-center font-bold underline underline-offset-4">
            Back to admin tools
          </Link>
        </div>
        <p id="client-sources-month-help" className="mt-2 text-sm text-[var(--color-muted)]">
          Appointments are grouped by date in Eastern Time. Enter a month as YYYY-MM if typing it as text.
        </p>
        {invalidMonth && (
          <p role="alert" className="mt-3 text-sm font-bold">
            Choose a valid month. The report is showing {monthLabel}.
          </p>
        )}
        {invalidService && (
          <p role="alert" className="mt-3 text-sm font-bold">
            Choose a listed appointment type. The report is showing all appointment types.
          </p>
        )}
      </section>
      <Suspense
        key={`${month}-${selectedService?.slug ?? "all"}`}
        fallback={
          <p role="status" className={panelClass}>
            Loading the report for {monthLabel}…
          </p>
        }
      >
        <ClientSourcesReport
          month={month}
          monthLabel={monthLabel}
          selectedService={selectedService}
        />
      </Suspense>
    </PageShell>
  );
}
