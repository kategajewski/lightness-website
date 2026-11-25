/** Stripe accepts an eight-digit USD charge amount. This is a processor limit. */
export const MAX_GIFT_ORDER_CENTS = 99_999_999;
/** Stripe's minimum charge applies to the transaction total, not each certificate. */
export const MIN_GIFT_ORDER_CENTS = 50;
/** Keep the generated PDF attachments within transactional email capacity. */
export const MAX_GIFT_CERTIFICATES_PER_ORDER = 100;

export type GiftCertificateOrder = {
  optionKey: string;
  unitAmountCents: number;
  quantity: number;
  totalAmountCents: number;
  isCustom: boolean;
};

type GiftOption = { key: string; amountCents?: number };

const existingGiftAmounts: Record<string, number> = {
  "gift-50": 5000,
  "gift-100": 10000,
  "gift-140": 14000,
  "gift-150": 15000,
  "gift-250": 25000,
  "gift-500": 50000,
};

/** Convert decimal dollars without float rounding, exponent notation or truncation. */
export function parseGiftAmountCents(value: string) {
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value.trim());
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return Number.isSafeInteger(cents) && cents > 0 && cents <= MAX_GIFT_ORDER_CENTS
    ? cents
    : null;
}

export function parseGiftQuantity(value: string) {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const quantity = Number(value);
  return Number.isSafeInteger(quantity) && quantity <= MAX_GIFT_CERTIFICATES_PER_ORDER
    ? quantity
    : null;
}

export function parseHolidayGiftOrder(
  input: { optionKey: string; customAmount?: string; quantity?: string },
  settings: { campaignActive: boolean; options: readonly GiftOption[] },
): GiftCertificateOrder | null {
  const quantity = parseGiftQuantity(input.quantity ?? "1");
  const isCustom = input.optionKey === "gift-custom";
  if (!quantity || (!settings.campaignActive && (isCustom || quantity !== 1))) return null;
  const option = settings.options.find((item) => item.key === input.optionKey);
  if (!isCustom && (!option || input.customAmount?.trim())) return null;
  const unitAmountCents = isCustom
    ? parseGiftAmountCents(input.customAmount ?? "")
    : option?.amountCents ?? existingGiftAmounts[input.optionKey];
  if (!unitAmountCents || !Number.isSafeInteger(unitAmountCents) || unitAmountCents <= 0) return null;
  const totalAmountCents = unitAmountCents * quantity;
  if (!Number.isSafeInteger(totalAmountCents) || totalAmountCents < MIN_GIFT_ORDER_CENTS || totalAmountCents > MAX_GIFT_ORDER_CENTS) return null;
  return { optionKey: input.optionKey, unitAmountCents, quantity, totalAmountCents, isCustom };
}

/** Read the server-authored purchase snapshot, never the current campaign settings. */
export function giftOrderFromMetadata(
  metadata: Record<string, string | undefined>,
  paidAmountCents?: number | null,
) {
  const fields = [metadata.giftUnitAmountCents, metadata.giftQuantity, metadata.giftTotalAmountCents];
  if (fields.every((value) => value === undefined)) return null;
  if (fields.some((value) => value === undefined || !/^\d+$/.test(value))) {
    throw new Error("Gift certificate purchase metadata is incomplete.");
  }
  const unitAmountCents = Number(metadata.giftUnitAmountCents);
  const quantity = parseGiftQuantity(metadata.giftQuantity!);
  const totalAmountCents = Number(metadata.giftTotalAmountCents);
  if (
    !quantity || !Number.isSafeInteger(unitAmountCents) || unitAmountCents <= 0
    || !Number.isSafeInteger(totalAmountCents) || totalAmountCents < MIN_GIFT_ORDER_CENTS || totalAmountCents > MAX_GIFT_ORDER_CENTS
    || unitAmountCents * quantity !== totalAmountCents || paidAmountCents !== totalAmountCents
  ) throw new Error("Gift certificate purchase value does not match payment.");
  return { unitAmountCents, quantity, totalAmountCents };
}
