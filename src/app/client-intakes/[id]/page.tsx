import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getCurrentUserWithAccess } from "@/lib/member-access";
import { isAdminEmail } from "@/lib/site";
import { getSignedIntake, intakeStorageConfigured, type SignedIntake } from "@/lib/intake-storage";
import { INTAKE_ANSWER_LABELS } from "@/lib/hypnotherapy-intake";
import { PrintIntakeButton } from "@/components/print-intake-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Signed client intake", robots: { index: false, follow: false } };
export default async function IntakeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await getCurrentUserWithAccess();
  if (!user?.email) redirect("/login?next=%2Fclient-intakes");
  if (!isAdminEmail(user.email)) redirect("/account");
  const id = (await params).id.toLowerCase();
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  let record: SignedIntake | null = null;
  let unavailable = !intakeStorageConfigured();
  if (!unavailable) { try { record = await getSignedIntake(id); } catch { unavailable = true; } }
  if (unavailable) return <PageShell eyebrow="Private signed form" title="Intake temporarily unavailable" description="Please try opening this form again later."><p role="alert">The signed form could not be opened right now. No client answers have been displayed.</p><Link href="/client-intakes" className="button-pill">Back to client intakes</Link></PageShell>;
  if (!record) notFound();
  return <PageShell eyebrow="Private signed form" title="Hypnotherapy intake" description="A saved copy of the client’s answers and consent.">
    <div className="intake-admin-tools flex flex-wrap gap-3"><Link href="/client-intakes" className="button-pill">Back to client intakes</Link><PrintIntakeButton /></div>
    <article className="intake-signed-record rounded-[24px] border border-[rgba(76,58,48,0.1)] bg-[#fffaf4] p-6 sm:p-10">
      <h2 className="display-section-title">{record.answers.fullName}</h2><p className="mt-2 text-[var(--color-muted)]">Received {new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeStyle: "short", timeZone: "America/New_York" }).format(new Date(record.submittedAt))} Eastern</p>
      <dl className="mt-8 grid gap-6">{Object.entries(INTAKE_ANSWER_LABELS).map(([key, label]) => { const answer = record.answers[key as keyof typeof INTAKE_ANSWER_LABELS]; return <div key={key}><dt className="text-sm font-bold">{label}</dt><dd className="mt-2 whitespace-pre-wrap break-words">{answer || "Not provided"}</dd></div>; })}</dl>
      <section className="mt-10 border-t border-[rgba(76,58,48,0.15)] pt-7"><h3 className="font-bold">Remote session arrangements</h3><p className="mt-3">{record.consent.remoteSessionStatement}</p><p className="mt-2 text-sm">Confirmed by client.</p></section>
      <section className="mt-7"><h3 className="font-bold">Consent</h3>{record.consent.paragraphs.map((paragraph, index) => <p key={index} className="mt-3 leading-7">{paragraph}</p>)}<p className="mt-4">{record.consent.electronicSignatureStatement}</p></section>
      <section className="mt-7 rounded-xl border border-[rgba(76,58,48,0.2)] p-5"><h3 className="text-sm font-bold">Electronic signature</h3><p className="mt-3 font-[family-name:var(--font-lightness-display)] text-4xl italic">{record.signature.name}</p><p className="mt-3">Signature date: {record.signature.date}</p><p className="mt-1 text-sm">Method: typed full name. Consent accepted.</p></section>
      <section className="mt-7"><h3 className="font-bold">Privacy notice</h3><p className="mt-3">{record.consent.privacyNotice}</p><p className="mt-4 text-sm">Newsletter preference: {record.answers.newsletterConsent ? "Client asked to receive updates." : "Client did not ask to receive updates."}</p></section>
      <footer className="mt-9 border-t border-[rgba(76,58,48,0.15)] pt-5 text-xs leading-6 text-[var(--color-muted)]"><p>Form version: {record.formVersion}</p><p>Reference: {record.id}</p><p className="break-all">Record fingerprint: {record.recordDigest}</p></footer>
    </article>
    <style>{`@media print { header, body > footer, .intake-admin-tools { display:none !important; } .intake-signed-record { border:0; padding:0; box-shadow:none; background:white; } .intake-signed-record section { break-inside:avoid; } }`}</style>
  </PageShell>;
}
