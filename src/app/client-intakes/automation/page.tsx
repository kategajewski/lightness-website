import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getCurrentUserWithAccess } from "@/lib/member-access";
import { isAdminEmail } from "@/lib/site";
import { getIntakeDriveConnection, intakeDriveOAuthConfigured } from "@/lib/intake-drive-auth";
import { intakeAutomationsEnabled } from "@/lib/intake-automations";
import { intakeMailchimpConfigured } from "@/lib/intake-mailchimp";
import { pendingAutomationJobs } from "@/lib/intake-automation-store";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Intake connections", robots: { index: false, follow: false } };
export default async function IntakeAutomationPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { user } = await getCurrentUserWithAccess();
  if (!user?.email) redirect("/login?next=%2Fclient-intakes%2Fautomation");
  if (!isAdminEmail(user.email)) redirect("/account");
  const status = (await searchParams).status;
  let connected = false, pending = 0, unavailable = false;
  try { connected = Boolean(await getIntakeDriveConnection()); pending = (await pendingAutomationJobs(100)).length; } catch { unavailable = true; }
  const notices: Record<string, string> = { connected: "Your Gmail Drive connection was saved. Waiting backups will be retried.", "connection-failed": "Google Drive could not be connected. Please try again using kategajewski@gmail.com.", "setup-needed": "Google Drive connection setup needs to be completed before connecting your Gmail account.", "retry-started": "Waiting forms are being checked again. Refresh this page in a moment to see the latest status." };
  return <PageShell eyebrow="Private settings" title="Intake connections" description="Automatic signed-form backups and optional email updates.">
    <Link className="button-pill" href="/client-intakes">Back to client intakes</Link>
    {notices[status || ""] && <p role="status" className="mt-6 rounded-xl border border-[rgba(76,58,48,0.2)] bg-[#fffaf4] p-5">{notices[status || ""]}</p>}
    {unavailable && <p role="alert" className="mt-6 rounded-xl border border-[#b38468] p-5">Connection status is temporarily unavailable. Please try again later.</p>}
    <div className="mt-7 grid gap-6">
      <section aria-labelledby="drive-title" className="rounded-[24px] border border-[rgba(76,58,48,0.15)] bg-[#fffaf4] p-6 sm:p-8">
        <h2 id="drive-title" className="display-section-title">Google Drive archive</h2>
        <p className="mt-4 font-bold">{connected ? "Connected: kategajewski@gmail.com" : "Waiting for the Gmail Drive connection"}</p>
        <p className="mt-3 leading-7">Each new signed intake is saved as a dated PDF in Client Intake Records, inside a folder for that client. Children’s forms use a separate child folder with the guardian’s name. The original signed record stays in your private inbox.</p>
        <p className="mt-3 leading-7">The connection can create and manage only files made by this website. Archive folders must stay private.</p>
        {intakeDriveOAuthConfigured() ? <form action="/api/client-intakes/drive/connect" method="post" className="mt-5"><button type="submit" className="button-pill">{connected ? "Reconnect Gmail Drive" : "Connect Gmail Drive"}</button></form> : <p className="mt-4 text-[var(--color-muted)]">Connection setup is pending. Automatic Drive copies will begin once the Gmail connection is ready.</p>}
      </section>
      <section aria-labelledby="mailchimp-title" className="rounded-[24px] border border-[rgba(76,58,48,0.15)] bg-[#fffaf4] p-6 sm:p-8">
        <h2 id="mailchimp-title" className="display-section-title">Mailchimp email updates</h2>
        <p className="mt-4 font-bold">{intakeMailchimpConfigured() ? "Connected to your existing audience" : "Mailchimp connection needs attention"}</p>
        <p className="mt-3 leading-7">Only clients who select the optional email updates checkbox are sent to Mailchimp. For children’s forms, the parent or guardian’s name and email are used. Intake answers and signatures stay out of Mailchimp.</p>
        <p className="mt-3 leading-7">Your audience’s confirmation settings are respected. Existing unsubscribed or bounced contacts keep their current status.</p>
      </section>
      <section aria-labelledby="processing-title" className="rounded-[24px] border border-[rgba(76,58,48,0.15)] bg-[#fffaf4] p-6 sm:p-8">
        <h2 id="processing-title" className="display-section-title">Processing status</h2>
        <p className="mt-4 font-bold">{intakeAutomationsEnabled() ? "Automatic processing is enabled" : "Automatic processing is waiting to be enabled"}</p>
        <p className="mt-3 leading-7">{pending >= 100 ? "At least 100" : pending} {pending === 1 ? "form is" : "forms are"} waiting for a connection or another delivery attempt. New forms are processed after submission. Waiting forms are checked again every 15 minutes.</p>
        <form action="/api/client-intakes/process" method="post" className="mt-5"><button className="button-pill" type="submit">Retry waiting forms</button></form>
      </section>
    </div>
  </PageShell>;
}
