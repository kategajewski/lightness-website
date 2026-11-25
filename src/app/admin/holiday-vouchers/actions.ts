"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { APPROVED_HOLIDAY_RULES, HOLIDAY_CAMPAIGN } from "@/lib/holiday-gift-campaign";
import { parseGiftAmountCents } from "@/lib/holiday-gift-order";
import { deliverHolidayVoucher } from "@/lib/holiday-voucher-fulfillment";
import { getHolidayVoucher, redeemHolidayVoucher, restoreHolidayVoucherRedemption } from "@/lib/holiday-voucher-store";
import { getCurrentUserWithAccess } from "@/lib/member-access";
import { isAdminEmail } from "@/lib/site";

const adminPath = "/admin/holiday-vouchers";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function requireAdmin() {
  const { user } = await getCurrentUserWithAccess();
  if (!user?.email) redirect("/login?next=%2Fadmin%2Fholiday-vouchers");
  if (!isAdminEmail(user.email)) redirect("/account");
  return user.email;
}

function value(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

function returnUrl(form: FormData, notice: string) {
  const query = new URLSearchParams({ mode: value(form, "mode") === "test" ? "test" : "live", notice });
  const page = Number(value(form, "page"));
  if (Number.isSafeInteger(page) && page > 1) query.set("page", String(page));
  const id = value(form, "voucherId");
  return `${adminPath}?${query}${uuidPattern.test(id) ? `#voucher-${id}` : ""}`;
}

async function selectedVoucher(form: FormData) {
  const id = value(form, "voucherId");
  if (!uuidPattern.test(id)) return null;
  const voucher = await getHolidayVoucher(id);
  if (!voucher || voucher.campaign_id !== HOLIDAY_CAMPAIGN.id) return null;
  if (voucher.stripe_livemode !== (value(form, "mode") !== "test")) return null;
  return voucher;
}

export async function redeemHolidayVoucherAction(form: FormData) {
  const adminEmail = await requireAdmin();
  let notice = "redemption-failed";
  try {
    const voucher = await selectedVoucher(form);
    const amountCents = parseGiftAmountCents(value(form, "amount"));
    const requestId = value(form, "requestId");
    const bookingReference = value(form, "bookingReference").replace(/\s+/g, " ");
    const serviceId = value(form, "serviceId");
    const recipientName = value(form, "recipientName");
    const policy = APPROVED_HOLIDAY_RULES;
    if (
      !voucher || voucher.status !== "issued" || !policy || !amountCents || amountCents > voucher.face_value_cents
      || !uuidPattern.test(requestId) || !bookingReference || bookingReference.length > 160
      || recipientName.length > 160 || !policy.eligibleServiceIds.includes(serviceId)
      || value(form, "noOtherPromotion") !== "yes"
    ) {
      notice = "redemption-invalid";
    } else {
      await redeemHolidayVoucher({
        requestId, voucherId: voucher.id, amountCents, serviceId, serviceAt: null,
        bookingReference, redeemedBy: adminEmail, recipientName: recipientName || null,
        hasOtherPromotion: false,
      }, {
        allowedServiceIds: policy.eligibleServiceIds,
        allowPartialRedemptions: policy.allowPartialRedemptions,
        maxVouchersPerBooking: policy.maxVouchersPerBooking,
        serviceMustOccurDuringValidity: policy.serviceMustOccurDuringValidity,
      });
      revalidatePath(adminPath);
      notice = "redeemed";
    }
  } catch {
    // Customer data and provider/database responses stay out of the return URL.
  }
  redirect(returnUrl(form, notice));
}

export async function restoreHolidayVoucherCreditAction(form: FormData) {
  const adminEmail = await requireAdmin();
  let notice = "restoration-failed";
  try {
    const voucher = await selectedVoucher(form);
    const redemptionId = value(form, "redemptionId");
    const requestId = value(form, "requestId");
    const policyReference = value(form, "policyReference");
    if (
      !voucher || !uuidPattern.test(redemptionId) || !uuidPattern.test(requestId)
      || !voucher.holiday_voucher_redemptions.some((redemption) => redemption.id === redemptionId)
      || value(form, "policyEligible") !== "yes" || !policyReference || policyReference.length > 500
    ) {
      notice = "restoration-invalid";
    } else {
      await restoreHolidayVoucherRedemption({
        requestId, redemptionId, policyEligible: true, policyReference, restoredBy: adminEmail,
      });
      revalidatePath(adminPath);
      notice = "restored";
    }
  } catch {
    // Balance restoration is enforced atomically with the original expiration.
  }
  redirect(returnUrl(form, notice));
}

export async function retryHolidayVoucherEmailAction(form: FormData) {
  await requireAdmin();
  let notice = "email-failed";
  try {
    const voucher = await selectedVoucher(form);
    const emailStatus = voucher?.holiday_voucher_email_outbox?.status;
    if (!voucher || voucher.status !== "issued" || (emailStatus !== "pending" && emailStatus !== "failed")) {
      notice = "email-held";
    } else {
      const delivery = await deliverHolidayVoucher(voucher);
      revalidatePath(adminPath);
      notice = delivery.status === "review" || delivery.status === "held" ? "email-held" : "email-checked";
    }
  } catch {
    // The outbox keeps its delivery state for review or a safe later attempt.
  }
  redirect(returnUrl(form, notice));
}
