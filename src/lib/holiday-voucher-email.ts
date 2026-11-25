import "server-only";
import { createHash } from "node:crypto";
import { env } from "@/lib/env";
import {
  buildHolidayVoucherEmail,
  createHolidayVoucherPdf,
  type HolidayVoucherDocumentInput,
} from "@/lib/holiday-voucher-document";

export type HolidayVoucherEmailInput = HolidayVoucherDocumentInput & {
  voucherId: string;
  purchaserEmail: string;
};

export function canSendHolidayVoucherEmail() {
  return Boolean(env.emailFrom && env.resendApiKey);
}

/**
 * The caller must claim the voucher's persistent email outbox row before sending,
 * store the provider ID after success and stop automatic retries before Resend's
 * 24-hour idempotency window expires. Do not fall back to another provider after
 * an ambiguous outcome: it could deliver a second email.
 */
export async function sendHolidayVoucherEmail(input: HolidayVoucherEmailInput) {
  if (!canSendHolidayVoucherEmail()) {
    throw new Error("Promotional voucher email requires the configured Resend sender.");
  }
  if (!input.voucherId.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.purchaserEmail)) {
    throw new Error("A voucher ID and valid purchaser email are required.");
  }
  const message = buildHolidayVoucherEmail(input);
  const attachment = await createHolidayVoucherPdf(input);
  const idempotencyKey = `holiday-voucher-2026/${createHash("sha256").update(input.voucherId).digest("hex")}`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      from: env.emailFrom,
      to: input.purchaserEmail,
      ...message,
      attachments: [{ filename: attachment.filename, content: attachment.pdf.toString("base64") }],
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    // Avoid logging provider response bodies that may contain recipient data.
    throw new Error(`Promotional voucher email delivery failed (${response.status}).`);
  }
  const body: unknown = await response.json();
  const providerId = body && typeof body === "object" && "id" in body ? body.id : undefined;
  if (typeof providerId !== "string" || !providerId) {
    throw new Error("Promotional voucher email provider did not return a delivery reference.");
  }
  return { providerId, idempotencyKey };
}
