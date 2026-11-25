import Link from "next/link";
import { HOLIDAY_CAMPAIGN } from "@/lib/holiday-gift-campaign";
import { CourseReleaseRefresh } from "@/components/course-release-refresh";

export function HolidayGiftBanner() {
  return (
    <section aria-labelledby="holiday-gift-title" className="border-b border-[var(--color-button-line)] bg-[var(--color-beige)] px-5 py-7 sm:px-8">
      <CourseReleaseRefresh nextReleaseAt={new Date().getTime() < Date.parse(HOLIDAY_CAMPAIGN.purchaseEndsAt) ? Date.parse(HOLIDAY_CAMPAIGN.purchaseEndsAt) : null} serverNow={new Date().getTime()} />
      <div className="mx-auto flex max-w-[1180px] flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-[46rem]">
          <h2 id="holiday-gift-title" className="display-card-title">{HOLIDAY_CAMPAIGN.name}</h2>
          <p className="mt-2 font-semibold">{HOLIDAY_CAMPAIGN.tagline}</p>
          <p className="mt-2 text-[var(--color-brown)]">Receive up to $100 in complimentary healing credit when you purchase a gift certificate now through December 15th.</p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-brown)]">Terms and conditions apply to gift certificates and gift cards. Offer ends December 15, 2026 at 11:59 PM Eastern. Separate complimentary promotional vouchers are valid January 1 through March 31, 2027 toward private healing services. Transferable. Cannot be combined with other promotions.</p>
        </div>
        <Link href="/gift-certificate#gift-amounts" className="button-pill shrink-0 self-start lg:self-center">Shop Holiday Gift Certificates</Link>
      </div>
    </section>
  );
}

export function HolidayGiftDisclosures({ expanded = false }: { expanded?: boolean } = {}) {
  return (
    <div id="holiday-gift-terms" className="mt-5 space-y-3 rounded-[20px] border border-[var(--color-button-line)] bg-[var(--color-ivory)] p-5 text-sm leading-relaxed text-[var(--color-brown)]">
      <CourseReleaseRefresh nextReleaseAt={new Date().getTime() < Date.parse(HOLIDAY_CAMPAIGN.purchaseEndsAt) ? Date.parse(HOLIDAY_CAMPAIGN.purchaseEndsAt) : null} serverNow={new Date().getTime()} />
      <p className="font-semibold">Terms and conditions apply to gift certificates and gift cards.</p>
      <p>Pay the full face value of your gift certificate. Your complimentary promotional voucher is issued at no additional charge and emailed separately to you after successful payment. Initiate payment by December 15, 2026 at 11:59 PM Eastern Time. Bank payments initiated by the deadline qualify if settlement finishes later. Opening a checkout alone does not qualify.</p>
      <p><strong>Complimentary promotional voucher: valid January 1 through March 31, 2027. Expires March 31, 2027 at 11:59 PM Eastern Time.</strong> Redeemable toward private healing services. Transferable. Cannot be combined with other promotions.</p>
      <details open={expanded} className="space-y-3"><summary className="cursor-pointer py-2 font-semibold underline underline-offset-4">Purchase, redemption and refund details</summary>
      <p>One bonus per transaction, based on the highest qualifying purchase tier reached by the transaction total. Custom amounts qualify. A $140 purchase receives a $15 voucher. The maximum bonus is $100 per transaction.</p>
      <p>Use promotional credit over multiple sessions or combine holiday vouchers with each other and with paid gift certificates. Redeem during the validity period for an eligible appointment, including a later appointment. Contact Kate with your voucher code to apply your credit.</p>
      <p>A full purchase refund voids its voucher. Partial refunds recalculate the bonus from the amount retained. Previously used credit is flagged for review if it exceeds the revised bonus. Credit from a canceled appointment is restored only when the existing cancellation policy allows it. The March 31 expiration remains in place.</p>
      <p>Your original paid gift certificate retains its full purchased value and existing terms. The promotional voucher dates and restrictions apply only to the separate complimentary voucher.</p>
      </details>
      <p><strong>Gift card scam warning:</strong> never use a gift certificate to pay a debt or government agency. Keep your receipt and <a href="https://reportfraud.ftc.gov/" className="font-semibold underline underline-offset-4">report suspected fraud to the FTC</a>.</p>
      <p><Link href="/gift-certificate/holiday-terms" className="font-semibold underline underline-offset-4">Read the holiday voucher terms</Link></p>
    </div>
  );
}
