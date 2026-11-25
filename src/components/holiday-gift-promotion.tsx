import Link from "next/link";
import { HOLIDAY_CAMPAIGN } from "@/lib/holiday-gift-campaign";
import { CourseReleaseRefresh } from "@/components/course-release-refresh";
import styles from "./holiday-gift-banner.module.css";

export function HolidayGiftBanner() {
  return (
    <section aria-labelledby="holiday-gift-title" className={styles.banner}>
      <CourseReleaseRefresh nextReleaseAt={new Date().getTime() < Date.parse(HOLIDAY_CAMPAIGN.purchaseEndsAt) ? Date.parse(HOLIDAY_CAMPAIGN.purchaseEndsAt) : null} serverNow={new Date().getTime()} />
      <svg aria-hidden="true" className={styles.stars} viewBox="0 0 180 150" fill="none">
        <path d="M107 15c0 33-9 44-33 48 24 4 33 15 33 48 0-33 9-44 33-48-24-4-33-15-33-48Z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M40 83c0 15-4 20-15 22 11 2 15 7 15 22 0-15 4-20 15-22-11-2-15-7-15-22Z" fill="currentColor" />
        <path d="M153 101c0 11-3 15-11 17 8 2 11 6 11 17 0-11 3-15 11-17-8-2-11-6-11-17Z" fill="currentColor" />
        <circle cx="45" cy="31" r="2" fill="currentColor" />
        <circle cx="160" cy="38" r="1.5" fill="currentColor" />
      </svg>
      <div className={styles.content}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Holiday Gift Certificates</p>
          <h2 id="holiday-gift-title" className={`display-section-title ${styles.title}`}>{HOLIDAY_CAMPAIGN.name}</h2>
          <p className={styles.tagline}>{HOLIDAY_CAMPAIGN.tagline}</p>
          <p className={styles.description}>Receive <strong>up to $100 in complimentary healing credit</strong> when you purchase a gift certificate now through December 15th.</p>
        </div>
        <Link href="/gift-certificate#gift-amounts" className={styles.button}>Shop Holiday Gift Certificates <span aria-hidden="true">→</span></Link>
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
