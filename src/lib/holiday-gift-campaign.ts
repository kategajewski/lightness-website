/** All boundaries are instants in America/New_York, including the March DST change. */
export const HOLIDAY_CAMPAIGN = {
  id: "a-little-light-2026",
  name: "A Little Light Goes a Long Way",
  tagline: "Give a little. Get a little.",
  purchaseEndsAt: "2026-12-16T05:00:00.000Z",
  validFrom: "2027-01-01T05:00:00.000Z",
  expiresAt: "2027-04-01T04:00:00.000Z",
  tiers: [
    { optionKey: "gift-50", purchaseCents: 5000, bonusCents: 500 },
    { optionKey: "gift-100", purchaseCents: 10000, bonusCents: 1500 },
    { optionKey: "gift-150", purchaseCents: 15000, bonusCents: 2500 },
    { optionKey: "gift-250", purchaseCents: 25000, bonusCents: 5000 },
    { optionKey: "gift-500", purchaseCents: 50000, bonusCents: 10000 },
  ],
} as const;

export type HolidayCampaignRules = {
  customAmounts: "listed-only" | "highest-tier" | "disabled";
  multipleCertificates: "one-per-checkout" | "per-certificate" | "transaction-total";
  gift140: "no-bonus" | "bonus-15" | "hidden";
  refunds: "void-review-used" | "deduct-used" | "keep-valid";
  allowPartialRedemptions: boolean;
  maxVouchersPerBooking: number | null;
  serviceMustOccurDuringValidity: boolean;
  eligibleServiceIds: readonly string[];
  allowPaidGiftCertificates: boolean;
  cancellationRestoration: "existing-policy-original-expiry";
  partialRefunds: "recalculate";
};

export const HOLIDAY_PRIVATE_SERVICES = [
  { id: "rest-receive", name: "Rest & Receive (60-minute Reiki)" },
  { id: "sacred-reset", name: "Return to Self: Sacred Reset" },
  { id: "children-energy", name: "Gentle Energy Support for Children" },
  { id: "hypnotherapy", name: "The Inner Journey (hypnotherapy)" },
  { id: "private-sound", name: "Private Sound Immersion" },
  { id: "personalized-guidance", name: "Personalized Guidance" },
] as const;

// Explicit business rules approved by Kate on November 24, 2026.
export const APPROVED_HOLIDAY_RULES: HolidayCampaignRules | null = {
  customAmounts: "highest-tier",
  multipleCertificates: "transaction-total",
  gift140: "bonus-15",
  refunds: "void-review-used",
  allowPartialRedemptions: true,
  maxVouchersPerBooking: null,
  serviceMustOccurDuringValidity: false,
  eligibleServiceIds: HOLIDAY_PRIVATE_SERVICES.map((service) => service.id),
  allowPaidGiftCertificates: true,
  cancellationRestoration: "existing-policy-original-expiry",
  partialRefunds: "recalculate",
};

export type HolidayCampaignSettings = {
  enabled: boolean;
  launchedAt: string;
  rules: HolidayCampaignRules | null;
};

export function getHolidayCampaignSettings(): HolidayCampaignSettings {
  return {
    enabled: process.env.HOLIDAY_GIFT_CAMPAIGN_ENABLED === "true",
    launchedAt: process.env.HOLIDAY_GIFT_CAMPAIGN_LAUNCHED_AT || "",
    rules: APPROVED_HOLIDAY_RULES,
  };
}

export function isHolidayCampaignActive(
  now: Date = new Date(),
  settings: HolidayCampaignSettings = getHolidayCampaignSettings(),
) {
  const launch = Date.parse(settings.launchedAt);
  return settings.enabled && settings.rules !== null && Number.isFinite(launch)
    && now.getTime() >= launch
    && now.getTime() < Date.parse(HOLIDAY_CAMPAIGN.purchaseEndsAt);
}

export function holidayBonusForOption(optionKey: string, rules = APPROVED_HOLIDAY_RULES) {
  if (optionKey === "gift-140" && rules?.gift140 === "bonus-15") return 1500;
  return HOLIDAY_CAMPAIGN.tiers.find((tier) => tier.optionKey === optionKey)?.bonusCents ?? 0;
}

export function holidayBonusForTotal(totalCents: number) {
  if (!Number.isSafeInteger(totalCents) || totalCents <= 0) return 0;
  return [...HOLIDAY_CAMPAIGN.tiers].reverse().find((tier) => totalCents >= tier.purchaseCents)?.bonusCents ?? 0;
}

export function formatHolidayMoney(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function isHolidayVoucherDateValid(now: Date) {
  return now.getTime() >= Date.parse(HOLIDAY_CAMPAIGN.validFrom)
    && now.getTime() < Date.parse(HOLIDAY_CAMPAIGN.expiresAt);
}

export function addHolidayCheckoutMetadata(
  body: URLSearchParams,
  option: { key: string; amountCents?: number; purchaseCents?: number; quantity?: number },
  now = new Date(),
  settings = getHolidayCampaignSettings(),
) {
  if (!isHolidayCampaignActive(now, settings)) return false;
  const quantity = option.quantity ?? 1;
  const purchaseCents = option.purchaseCents ?? (option.amountCents ?? 0) * quantity;
  const bonus = holidayBonusForTotal(purchaseCents);
  if (!bonus || !option.amountCents || !Number.isSafeInteger(quantity) || quantity < 1 || purchaseCents !== option.amountCents * quantity) return false;
  body.set("metadata[holidayCampaignId]", HOLIDAY_CAMPAIGN.id);
  body.set("metadata[holidayBonusCents]", String(bonus));
  body.set("metadata[holidayPurchaseCents]", String(purchaseCents));
  body.set("metadata[holidayLaunchAt]", settings.launchedAt);
  body.set("metadata[giftUnitAmountCents]", String(option.amountCents));
  body.set("metadata[giftQuantity]", String(quantity));
  body.set("metadata[giftTotalAmountCents]", String(purchaseCents));
  body.set("custom_text[submit][message]", `Terms and conditions apply to gift certificates and gift cards. Pay ${formatHolidayMoney(purchaseCents)} for ${quantity === 1 ? "your paid certificate" : `${quantity} paid certificates`}. Your separate ${formatHolidayMoney(bonus)} complimentary promotional voucher is valid January 1 through March 31, 2027 and expires March 31, 2027 at 11:59 PM Eastern. Private healing services only. Transferable. Partial redemption is allowed. Paid gift certificates and other holiday vouchers may be used together. Cannot be combined with other promotions. Payment must succeed by December 15, 2026 at 11:59 PM Eastern.`);
  // Charge the disclosed full face value rather than trusting an external price mapping.
  body.delete("line_items[0][price]");
  body.set("line_items[0][price_data][currency]", "usd");
  body.set("line_items[0][price_data][unit_amount]", String(option.amountCents));
  body.set("line_items[0][price_data][product_data][name]", `${formatHolidayMoney(option.amountCents)} Gift Certificate`);
  return true;
}

type HolidayPaidSession = {
  id: string;
  status: string | null;
  payment_status: string;
  currency: string | null;
  amount_total: number | null;
  amount_subtotal: number | null;
  payment_intent: string | { id: string } | null;
  metadata: Record<string, string> | null;
  total_details?: { amount_discount: number } | null;
};

/** Use the signed successful-payment event time, never browser/session creation time. */
export function qualifyHolidayPurchase(
  session: HolidayPaidSession,
  paidAtSeconds: number,
  settings = getHolidayCampaignSettings(),
) {
  const metadata = session.metadata ?? {};
  if (metadata.holidayCampaignId !== HOLIDAY_CAMPAIGN.id) return null;
  if (!isHolidayCampaignActive(new Date(paidAtSeconds * 1000), settings)) return null;
  if (metadata.holidayLaunchAt !== settings.launchedAt) return null;
  if (metadata.purchaseType !== "offer" || metadata.offerSlug !== "gift-certificate") return null;
  if (session.status !== "complete" || session.payment_status !== "paid" || session.currency !== "usd" || !session.payment_intent) return null;
  const unitAmountCents = Number(metadata.giftUnitAmountCents);
  const quantity = Number(metadata.giftQuantity);
  const purchaseCents = Number(metadata.giftTotalAmountCents);
  const tier = HOLIDAY_CAMPAIGN.tiers.find((item) => item.optionKey === metadata.optionKey);
  const expectedUnit = tier?.purchaseCents ?? (metadata.optionKey === "gift-140" ? 14000 : metadata.optionKey === "gift-custom" ? unitAmountCents : 0);
  if (!Number.isSafeInteger(unitAmountCents) || unitAmountCents <= 0 || !Number.isSafeInteger(quantity) || quantity < 1 || !Number.isSafeInteger(purchaseCents) || purchaseCents !== unitAmountCents * quantity || expectedUnit !== unitAmountCents) return null;
  const bonusCents = holidayBonusForTotal(purchaseCents);
  if (!purchaseCents || !bonusCents || session.amount_total !== purchaseCents || session.amount_subtotal !== purchaseCents || (session.total_details?.amount_discount ?? 0) !== 0) return null;
  if (metadata.holidayPurchaseCents !== String(purchaseCents) || metadata.holidayBonusCents !== String(bonusCents)) return null;
  return { purchaseCents, bonusCents, paidAt: new Date(paidAtSeconds * 1000).toISOString() };
}
