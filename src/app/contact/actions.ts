"use server";

import { redirect } from "next/navigation";
import { integrations } from "@/lib/env";
import { sendInquiryForwardEmail } from "@/lib/email";
import {
  getFormValue,
  hasValidTurnstileToken,
  isLikelyAutomatedSubmission,
} from "@/lib/form-security";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const customOrderFieldLabels = [
  ["orderStyle", "Preferred style"],
  ["rosePetalSource", "Rose petals"],
  ["rosePetalDetails", "Rose story or occasion"],
  ["intention", "Intention or devotion"],
  ["preferredColors", "Colors, metals, or accents"],
  ["quantity", "Quantity"],
  ["deliveryPreference", "Delivery preference"],
  ["shippingAddress", "Shipping address"],
] as const;

type CustomOrderDetail = {
  label: (typeof customOrderFieldLabels)[number][1];
  value: string;
};

function getRedirectPath(formData: FormData) {
  const redirectTo = getFormValue(formData, "redirectTo");

  if (!redirectTo || !redirectTo.startsWith("/") || redirectTo.startsWith("//")) {
    return "/contact";
  }

  return redirectTo;
}

function withStatus(path: string, status: "success" | "error", message?: string) {
  const params = new URLSearchParams({ status });

  if (message) {
    params.set("message", message);
  }

  return `${path}?${params.toString()}`;
}

function getCustomOrderDetails(formData: FormData, inquiryType: string) {
  if (inquiryType !== "rose-frequency") {
    return [];
  }

  return customOrderFieldLabels
    .map(([field, label]) => {
      const value = getFormValue(formData, field);

      return value ? { label, value } : null;
    })
    .filter((detail): detail is CustomOrderDetail => Boolean(detail));
}

function buildInquiryMessage(message: string, orderDetails: CustomOrderDetail[]) {
  if (orderDetails.length === 0) {
    return message;
  }

  return [
    "Divine Rose Frequency Custom Order",
    ...orderDetails.map((detail) => `${detail.label}: ${detail.value}`),
    "",
    "Message:",
    message,
  ].join("\n");
}

export async function submitContactInquiry(formData: FormData) {
  const redirectPath = getRedirectPath(formData);
  const name = getFormValue(formData, "name");
  const email = getFormValue(formData, "email");
  const phone = getFormValue(formData, "phone");
  const inquiryType = getFormValue(formData, "inquiryType") || "general";
  const message = getFormValue(formData, "message");
  const customOrderDetails = getCustomOrderDetails(formData, inquiryType);
  const inquiryMessage = buildInquiryMessage(message, customOrderDetails);

  if (isLikelyAutomatedSubmission(formData)) {
    redirect(withStatus(redirectPath, "success"));
  }

  if (!(await hasValidTurnstileToken(formData, "contact_inquiry"))) {
    redirect(
      withStatus(redirectPath, "error", "Please confirm you are human and try again."),
    );
  }

  if (!name || !email || !message) {
    redirect(withStatus(redirectPath, "error", "Please complete the required fields."));
  }

  if (!integrations.supabase) {
    redirect(withStatus(redirectPath, "error", "Contact form storage is not configured yet."));
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("contact_inquiries").insert({
    name,
    email,
    phone: phone || null,
    inquiry_type: inquiryType,
    message: inquiryMessage,
    source: "website",
    status: "new",
  });

  if (error) {
    redirect(
      withStatus(
        redirectPath,
        "error",
        "The form is built, but the contact table still needs to be created in Supabase.",
      ),
    );
  }

  if (integrations.emailForwarding) {
    try {
      await sendInquiryForwardEmail({
        name,
        email,
        phone: phone || null,
        inquiryType,
        message,
        customOrderDetails,
      });
    } catch (error) {
      console.error("Contact inquiry email forwarding failed", error);
      redirect(
        withStatus(
          redirectPath,
          "error",
          "Your message was saved, but the email forwarding step failed.",
        ),
      );
    }
  }

  redirect(withStatus(redirectPath, "success"));
}
