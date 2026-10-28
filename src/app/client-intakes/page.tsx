import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getCurrentUserWithAccess } from "@/lib/member-access";
import { isAdminEmail } from "@/lib/site";
import { intakeStorageConfigured, listSignedIntakes } from "@/lib/intake-storage";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Client intakes", robots: { index: false, follow: false } };
export default async function ClientIntakesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { user } = await getCurrentUserWithAccess();
  if (!user?.email) redirect("/login?next=%2Fclient-intakes");
  if (!isAdminEmail(user.email)) redirect("/account");
  const rawPage = (await searchParams).page;
  const page = rawPage && /^\d{1,4}$/.test(rawPage) ? Number(rawPage) : 0;
  let inbox: Awaited<ReturnType<typeof listSignedIntakes>> = { records: [], hasNext: false };
  let unavailable = !intakeStorageConfigured();
  if (!unavailable) { try { inbox = await listSignedIntakes(page); } catch { unavailable = true; } }
  return <PageShell eyebrow="Private inbox" title="Client intakes" description="Review signed forms before your client sessions.">
    <section className="rounded-[24px] border border-[rgba(76,58,48,0.1)] bg-[rgba(255,251,246,0.9)] p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div><h2 className="display-section-title">Hypnotherapy</h2><p className="mt-3 text-[var(--color-muted)]">Share this intake link with a client before their virtual session.</p><a className="mt-3 block break-all underline underline-offset-4" href="/client-intake/hypnotherapy">https://bethelightness.com/client-intake/hypnotherapy</a></div>
        <Link href="/account" className="button-pill">Back to account</Link>
      </div>
      {unavailable ? <p role="alert" className="mt-8 rounded-xl border border-[#b38468] p-5">The private inbox is temporarily unavailable. Please try again later. Signed forms have not been displayed.</p> : inbox.records.length ? <div className="mt-8 divide-y divide-[rgba(76,58,48,0.15)]">{inbox.records.map(record => <article key={record.id} className="flex flex-wrap items-center justify-between gap-4 py-5"><div><h3 className="font-bold">{record.answers.fullName}</h3><p className="mt-1 text-sm text-[var(--color-muted)]">Signed {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" }).format(new Date(record.submittedAt))} Eastern</p></div><Link className="button-pill" href={`/client-intakes/${record.id}`}>Review signed form<span className="sr-only"> for {record.answers.fullName}</span></Link></article>)}</div> : <p className="mt-8 rounded-xl bg-[#f5eade] p-5 text-[var(--color-muted)]">No signed intakes on this page yet.</p>}
      <nav aria-label="Intake pages" className="mt-6 flex flex-wrap gap-4">{page > 0 && <Link className="button-pill" href={`/client-intakes?page=${page - 1}`}>Newer forms</Link>}{inbox.hasNext && <Link className="button-pill" href={`/client-intakes?page=${page + 1}`}>Older forms</Link>}</nav>
    </section>
  </PageShell>;
}
