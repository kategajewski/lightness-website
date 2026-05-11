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

export async function submitContactInquiry(formData: FormData) {
  const name = getFormValue(formData, "name");
  const email = getFormValue(formData, "email");
  const phone = getFormValue(formData, "phone");
  const inquiryType = getFormValue(formData, "inquiryType");
  const message = getFormValue(formData, "message");

  if (isLikelyAutomatedSubmission(formData)) {
    redirect("/contact?status=success");
  }

  if (!(await hasValidTurnstileToken(formData, "contact_inquiry"))) {
    redirect(
      "/contact?status=error&message=Please%20confirm%20you%20are%20human%20and%20try%20again.",
    );
  }

  if (!name || !email || !message) {
    redirect("/contact?status=error&message=Please%20complete%20the%20required%20fields.");
  }

  if (!integrations.supabase) {
    redirect("/contact?status=error&message=Contact%20form%20storage%20is%20not%20configured%20yet.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("contact_inquiries").insert({
    name,
    email,
    phone: phone || null,
    inquiry_type: inquiryType || "general",
    message,
    source: "website",
    status: "new",
  });

  if (error) {
    redirect(
      "/contact?status=error&message=The%20form%20is%20built,%20but%20the%20contact%20table%20still%20needs%20to%20be%20created%20in%20Supabase.",
    );
  }

  if (integrations.emailForwarding) {
    try {
      await sendInquiryForwardEmail({
        name,
        email,
        phone: phone || null,
        inquiryType: inquiryType || "general",
        message,
      });
    } catch (error) {
      console.error("Contact inquiry email forwarding failed", error);
      redirect(
        "/contact?status=error&message=Your%20message%20was%20saved,%20but%20the%20email%20forwarding%20step%20failed.",
      );
    }
  }

  redirect("/contact?status=success");
}
