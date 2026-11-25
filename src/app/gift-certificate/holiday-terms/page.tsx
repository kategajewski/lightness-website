import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { HolidayGiftDisclosures } from "@/components/holiday-gift-promotion";
import { HOLIDAY_CAMPAIGN, HOLIDAY_PRIVATE_SERVICES, formatHolidayMoney } from "@/lib/holiday-gift-campaign";

export const metadata = { title: "Holiday Gift Certificate Terms | The Lightness of Being" };

export default function HolidayGiftTermsPage() {
  return <PageShell eyebrow="Holiday gift certificate terms" title={HOLIDAY_CAMPAIGN.name} description="Give a little. Get a little.">
    <section className="max-w-[52rem] space-y-6">
      <p>Terms and conditions apply to gift certificates and gift cards. These terms explain the separate complimentary promotional voucher issued for qualifying purchases from launch through December 15, 2026 at 11:59 PM Eastern Time.</p>
      <div className="overflow-x-auto"><table className="w-full text-left"><caption className="mb-3 text-left font-semibold">One bonus based on the highest transaction tier reached</caption><thead><tr><th scope="col" className="p-3">Purchase total</th><th scope="col" className="p-3">Complimentary voucher</th></tr></thead><tbody>{HOLIDAY_CAMPAIGN.tiers.map((tier) => <tr key={tier.purchaseCents} className="border-t border-[var(--color-button-line)]"><td className="p-3">{formatHolidayMoney(tier.purchaseCents)} or more</td><td className="p-3">{formatHolidayMoney(tier.bonusCents)}</td></tr>)}</tbody></table></div>
      <HolidayGiftDisclosures expanded />
      <h2 className="display-card-title">Eligible private healing services</h2>
      <ul className="list-disc space-y-2 pl-5">{HOLIDAY_PRIVATE_SERVICES.map((service) => <li key={service.id}>{service.name}</li>)}</ul>
      <p>Promotional vouchers do not apply to group events, training, mentorship programs or purchases of gift certificates. Contact Kate before booking to apply your voucher code and arrange any remaining balance. The voucher code is separate from any Calendly booking coupon.</p>
      <p>Paid gift certificates retain their full purchased value and existing lawful terms. There is no campaign expiration on the paid value. No activation, service or inactivity fees apply. A remaining paid gift certificate balance of less than $5 may be redeemed for cash upon request under New York law.</p>
      <Link href="/gift-certificate#gift-amounts" className="button-pill">Choose a Gift Certificate</Link>
    </section>
  </PageShell>;
}
