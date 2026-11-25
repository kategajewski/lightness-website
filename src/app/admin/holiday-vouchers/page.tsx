import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { APPROVED_HOLIDAY_RULES, HOLIDAY_CAMPAIGN, HOLIDAY_PRIVATE_SERVICES } from "@/lib/holiday-gift-campaign";
import { listHolidayVouchers, type HolidayVoucherWithHistory } from "@/lib/holiday-voucher-store";
import { getCurrentUserWithAccess } from "@/lib/member-access";
import { isAdminEmail } from "@/lib/site";
import { redeemHolidayVoucherAction, restoreHolidayVoucherCreditAction, retryHolidayVoucherEmailAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Holiday promotional vouchers",
  robots: { index: false, follow: false },
};

const pageSize = 25;
const cardClass = "rounded-[26px] border border-[var(--color-button-line)] bg-[var(--color-ivory)] p-6 sm:p-8";
const inputClass = "mt-2 block min-h-11 w-full rounded-xl border border-[var(--color-button-line)] bg-[var(--color-bg)] px-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brown)]";
const notices: Record<string, string> = {
  redeemed: "The redemption was recorded and the voucher balance was updated.",
  "redemption-invalid": "Check the amount, private service and booking reference. Confirm that no other promotion applies. The voucher must have enough available credit.",
  "redemption-failed": "The redemption could not be recorded. Check the voucher dates and latest balance before trying again.",
  "email-checked": "The voucher email was checked for safe delivery. Its latest delivery status appears below.",
  "email-held": "This voucher email is already sent, in progress or held for review. No additional email was requested.",
  "email-failed": "The voucher email could not be delivered. Its delivery history has been kept for a safe retry or review.",
  restored: "The canceled booking credit was restored with the original expiration date.",
  "restoration-invalid": "Check the redemption and confirm that the existing cancellation policy allows restoring this credit.",
  "restoration-failed": "The credit could not be restored. Check whether it was already restored or the original voucher has expired.",
};

function money(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

function date(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York",
  }).format(new Date(value));
}

function voucherState(voucher: HolidayVoucherWithHistory, now: number) {
  if (voucher.status === "refund_review" || voucher.refund_review_required) return "Refund review required";
  if (voucher.status === "voided") return "Voided";
  if (now >= Date.parse(voucher.expires_at)) return "Expired";
  if (voucher.balance_cents === 0) return voucher.entitlement_cents === 0 ? "No promotional credit remaining" : "Fully redeemed";
  if (now < Date.parse(voucher.valid_from)) return "Valid beginning January 1";
  if (voucher.balance_cents < voucher.entitlement_cents) return "Partially redeemed";
  return voucher.entitlement_cents < voucher.face_value_cents ? "Available after refund adjustment" : "Available";
}

function FormContext({ voucherId, mode, page }: { voucherId: string; mode: string; page: number }) {
  return <>
    <input type="hidden" name="voucherId" value={voucherId} />
    <input type="hidden" name="mode" value={mode} />
    <input type="hidden" name="page" value={page} />
  </>;
}

export default async function HolidayVouchersPage({ searchParams }: {
  searchParams: Promise<{ mode?: string; page?: string; notice?: string }>;
}) {
  const { user } = await getCurrentUserWithAccess();
  if (!user?.email) redirect("/login?next=%2Fadmin%2Fholiday-vouchers");
  if (!isAdminEmail(user.email)) redirect("/account");
  const params = await searchParams;
  const mode = params.mode === "test" ? "test" : "live";
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage >= 1 ? Math.min(requestedPage, 100000) : 1;
  const now = new Date().getTime();
  let vouchers: HolidayVoucherWithHistory[] = [];
  let count = 0;
  let unavailable = false;
  try {
    const result = await listHolidayVouchers({ campaignId: HOLIDAY_CAMPAIGN.id, livemode: mode === "live", limit: pageSize, offset: (page - 1) * pageSize });
    vouchers = result.vouchers;
    count = result.count;
  } catch {
    unavailable = true;
  }
  const notice = notices[params.notice ?? ""];
  const isError = params.notice?.includes("failed") || params.notice?.includes("invalid");
  return <PageShell eyebrow="Private admin" title="Holiday promotional vouchers" description="Issued vouchers, purchaser details and available healing credit for A Little Light Goes a Long Way.">
    <div className="flex flex-wrap items-center gap-3">
      <Link href="/admin" className="button-pill button-pill-secondary">Back to admin</Link>
      <nav aria-label="Voucher payment mode" className="flex flex-wrap gap-3">
        <Link href="/admin/holiday-vouchers?mode=live" className="button-pill" aria-current={mode === "live" ? "page" : undefined}>Live purchases</Link>
        <Link href="/admin/holiday-vouchers?mode=test" className="button-pill button-pill-secondary" aria-current={mode === "test" ? "page" : undefined}>Test purchases</Link>
      </nav>
    </div>
    <p className="text-sm text-[var(--color-muted)]">Signed in as {user.email}. Showing {mode} purchases only. All dates are Eastern Time.</p>
    {notice && <p role={isError ? "alert" : "status"} className={`${cardClass} font-semibold`}>{notice}</p>}
    <section className={cardClass} aria-labelledby="holiday-ledger-title">
      <h2 id="holiday-ledger-title" className="display-card-title">Complimentary credit, tracked separately</h2>
      <p className="mt-3">Voucher redemption opens January 1, 2027 and ends March 31, 2027 at 11:59 PM Eastern. Later appointments are allowed when credit is redeemed within that period.</p>
      <p className="mt-3">Partial use is allowed. Paid gift certificates and other holiday vouchers may be used for the same appointment. Other promotions cannot be combined.</p>
      <p className="mt-3 text-[var(--color-muted)]">Refunds may reduce available credit or require your review. Paid gift certificate balances and terms remain separate.</p>
    </section>
    {unavailable ? <p role="alert" className={cardClass}>Promotional vouchers could not be loaded right now. Please try again later.</p> : <>
      <p className="font-semibold">{count} {mode} voucher{count === 1 ? "" : "s"}{count > 0 ? `. Showing ${(page - 1) * pageSize + 1} through ${Math.min(page * pageSize, count)}.` : "."}</p>
      {vouchers.length === 0 && <section className={cardClass}><h2 className="display-card-title">No vouchers on this page</h2><p className="mt-3">Qualifying completed gift certificate purchases will appear here after their complimentary voucher is issued.</p></section>}
      {vouchers.map((voucher) => {
        const redeemable = voucher.status === "issued" && !voucher.refund_review_required && voucher.balance_cents > 0 && now >= Date.parse(voucher.valid_from) && now < Date.parse(voucher.expires_at);
        const outbox = voucher.holiday_voucher_email_outbox;
        const paymentBase = `https://dashboard.stripe.com/${voucher.stripe_livemode ? "" : "test/"}`;
        return <article key={voucher.id} id={`voucher-${voucher.id}`} className={cardClass}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><h2 className="display-card-title break-all">{voucher.code}</h2><p className="mt-2 font-semibold">{voucherState(voucher, now)}</p></div>
            <div className="text-right"><p className="text-sm text-[var(--color-muted)]">Available to redeem now</p><p className="font-display text-4xl tabular-nums">{money(redeemable ? voucher.balance_cents : 0)}</p></div>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div><dt className="text-sm font-semibold">Purchaser</dt><dd className="mt-1 break-words">{voucher.purchaser_name || "Name not provided"}<br />{voucher.purchaser_email}</dd></div>
            <div><dt className="text-sm font-semibold">Paid purchase</dt><dd className="mt-1">{money(voucher.purchased_amount_cents)}<br /><span className="break-all text-sm">Paid certificate: {voucher.paid_certificate_code}</span></dd></div>
            <div><dt className="text-sm font-semibold">Original promotional value</dt><dd className="mt-1">{money(voucher.face_value_cents)}</dd></div>
            <div><dt className="text-sm font-semibold">Current promotional entitlement</dt><dd className="mt-1">{money(voucher.entitlement_cents)}</dd></div>
            <div><dt className="text-sm font-semibold">Recorded promotional balance</dt><dd className="mt-1">{money(voucher.balance_cents)}</dd></div>
            <div><dt className="text-sm font-semibold">Paid amount refunded</dt><dd className="mt-1">{money(voucher.amount_refunded_cents)}</dd></div>
            <div><dt className="text-sm font-semibold">Issued</dt><dd className="mt-1">{date(voucher.issued_at)}</dd></div>
            <div><dt className="text-sm font-semibold">Valid from</dt><dd className="mt-1">{date(voucher.valid_from)}</dd></div>
            <div><dt className="text-sm font-semibold">Last redemption</dt><dd className="mt-1">{date(new Date(Date.parse(voucher.expires_at) - 1).toISOString())} Eastern</dd></div>
          </dl>
          {voucher.status_reason && <p role={voucher.status === "refund_review" ? "alert" : undefined} className="mt-5 rounded-xl border border-[var(--color-button-line)] p-4">{voucher.status_reason}</p>}
          {voucher.refund_review_required && <p role="alert" className="mt-4 rounded-xl border border-[var(--color-button-line)] p-4">Promotional credit already used exceeds the entitlement remaining after a refund. Review the associated transaction before adjusting the customer’s refund.</p>}
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
            <a href={`${paymentBase}payments/${encodeURIComponent(voucher.payment_intent_id)}`} target="_blank" rel="noreferrer" className="underline underline-offset-4">View payment in Stripe</a>
            <a href={`${paymentBase}checkout/sessions/${encodeURIComponent(voucher.checkout_session_id)}`} target="_blank" rel="noreferrer" className="underline underline-offset-4">View checkout transaction</a>
          </div>
          <section className="mt-6 border-t border-[var(--color-button-line)] pt-5" aria-labelledby={`delivery-${voucher.id}`}>
            <h3 id={`delivery-${voucher.id}`} className="font-semibold">Voucher email</h3>
            <p className="mt-2 capitalize">{outbox?.status || "Not queued"}{outbox?.sent_at ? `: ${date(outbox.sent_at)}` : ""}</p>
            {outbox && <p className="mt-1 text-sm text-[var(--color-muted)]">{outbox.attempts} delivery attempt{outbox.attempts === 1 ? "" : "s"}{outbox.provider_message_id ? `. Provider reference: ${outbox.provider_message_id}` : ""}</p>}
            {outbox?.status === "review" && <p role="alert" className="mt-3">Check the provider delivery record before taking further action. Automatic retries are held to prevent duplicate email.</p>}
            {voucher.status === "issued" && (outbox?.status === "pending" || outbox?.status === "failed") && <form action={retryHolidayVoucherEmailAction} className="mt-4"><FormContext voucherId={voucher.id} mode={mode} page={page} /><button type="submit" className="button-pill button-pill-secondary">Retry safe email delivery</button></form>}
          </section>
          <details className="mt-6 rounded-xl border border-[var(--color-button-line)] p-4">
            <summary className="min-h-6 cursor-pointer font-semibold">Redemption history ({voucher.holiday_voucher_redemptions.length})</summary>
            {voucher.holiday_voucher_redemptions.length === 0 ? <p className="mt-3 text-sm">No redemptions recorded.</p> : <ul className="mt-4 space-y-4">{voucher.holiday_voucher_redemptions.map((redemption) => {
              const reversal = voucher.holiday_voucher_redemption_reversals.find((entry) => entry.redemption_id === redemption.id);
              return <li key={redemption.id} className="border-t border-[var(--color-button-line)] pt-4 first:border-t-0 first:pt-0">
              <p className="font-semibold">{money(redemption.amount_cents)} toward {HOLIDAY_PRIVATE_SERVICES.find((service) => service.id === redemption.service_id)?.name || redemption.service_id}</p>
              <p className="mt-1 break-words text-sm">Booking: {redemption.booking_reference}{redemption.recipient_name ? `. Recipient: ${redemption.recipient_name}` : ""}</p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{date(redemption.redeemed_at)}. Recorded by {redemption.redeemed_by}.</p>
              {reversal ? <p className="mt-2 text-sm">Canceled booking credit restored: {money(reversal.restored_amount_cents)} on {date(reversal.created_at)}. {reversal.policy_reference}</p> : now < Date.parse(voucher.expires_at) && <details className="mt-3 rounded-xl border border-[var(--color-button-line)] p-4"><summary className="cursor-pointer text-sm font-semibold">Restore eligible canceled booking credit</summary><form action={restoreHolidayVoucherCreditAction} className="mt-4 space-y-4">
                <FormContext voucherId={voucher.id} mode={mode} page={page} /><input type="hidden" name="requestId" value={randomUUID()} /><input type="hidden" name="redemptionId" value={redemption.id} />
                <label className="block text-sm font-semibold">Cancellation reference or reason<input name="policyReference" type="text" maxLength={500} required className={inputClass} /></label>
                <label className="flex items-start gap-3 text-sm"><input name="policyEligible" type="checkbox" value="yes" required className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-brown)]" /><span>I confirm that the existing cancellation policy allows this restoration. Restored credit keeps its original March 31, 2027 expiration.</span></label>
                <button type="submit" className="button-pill button-pill-secondary">Restore eligible credit</button>
              </form></details>}
            </li>; })}</ul>}
          </details>
          {voucher.holiday_voucher_refund_adjustments.length > 0 && <details className="mt-4 rounded-xl border border-[var(--color-button-line)] p-4"><summary className="cursor-pointer font-semibold">Refund adjustments ({voucher.holiday_voucher_refund_adjustments.length})</summary><ul className="mt-4 space-y-3">{voucher.holiday_voucher_refund_adjustments.map((adjustment) => <li key={adjustment.event_id} className="text-sm">{date(adjustment.created_at)}. Total refunded: {money(adjustment.cumulative_refunded_cents)}. Promotional entitlement: {money(adjustment.entitlement_cents)}.</li>)}</ul></details>}
          {redeemable && APPROVED_HOLIDAY_RULES && <details className="mt-4 rounded-xl border border-[var(--color-button-line)] p-4">
            <summary className="min-h-6 cursor-pointer font-semibold">Record a redemption</summary>
            <form action={redeemHolidayVoucherAction} className="mt-5 grid gap-4 sm:grid-cols-2">
              <FormContext voucherId={voucher.id} mode={mode} page={page} /><input type="hidden" name="requestId" value={randomUUID()} />
              <label className="block text-sm font-semibold">Amount to apply (USD)<input name="amount" type="number" min="0.01" max={(voucher.balance_cents / 100).toFixed(2)} step="0.01" required className={inputClass} /></label>
              <label className="block text-sm font-semibold">Private healing service<select name="serviceId" required className={inputClass} defaultValue=""><option value="" disabled>Choose a service</option>{HOLIDAY_PRIVATE_SERVICES.filter((service) => APPROVED_HOLIDAY_RULES!.eligibleServiceIds.includes(service.id)).map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
              <label className="block text-sm font-semibold">Booking or transaction reference<input name="bookingReference" type="text" maxLength={160} required className={inputClass} /></label>
              <label className="block text-sm font-semibold">Recipient name (optional)<input name="recipientName" type="text" maxLength={160} className={inputClass} /></label>
              <label className="flex items-start gap-3 text-sm sm:col-span-2"><input name="noOtherPromotion" type="checkbox" value="yes" required className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-brown)]" /><span>I confirm that no other promotion applies to this appointment. Paid gift certificates and other holiday vouchers are allowed.</span></label>
              <div className="sm:col-span-2"><button type="submit" className="button-pill">Apply voucher credit</button></div>
            </form>
          </details>}
        </article>;
      })}
      <nav aria-label="Voucher pages" className="flex flex-wrap items-center justify-between gap-4">
        {page > 1 ? <Link href={`${"/admin/holiday-vouchers"}?mode=${mode}&page=${page - 1}`} className="button-pill button-pill-secondary">Previous page</Link> : <span />}
        <span className="text-sm">Page {page} of {Math.max(1, Math.ceil(count / pageSize))}</span>
        {page * pageSize < count ? <Link href={`${"/admin/holiday-vouchers"}?mode=${mode}&page=${page + 1}`} className="button-pill button-pill-secondary">Next page</Link> : <span />}
      </nav>
    </>}
  </PageShell>;
}
