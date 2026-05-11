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

export async function submitMentorshipApplication(formData: FormData) {
  const name = getFormValue(formData, "name");
  const email = getFormValue(formData, "email");
  const phone = getFormValue(formData, "phone");
  const experienceLevel = getFormValue(formData, "experienceLevel");
  const focus = getFormValue(formData, "focus");
  const interest = getFormValue(formData, "interest");
  const currentSeason = getFormValue(formData, "currentSeason");
  const intentions = getFormValue(formData, "intentions");
  const startTiming = getFormValue(formData, "startTiming");
  const additionalNotes = getFormValue(formData, "additionalNotes");

  if (isLikelyAutomatedSubmission(formData)) {
    redirect("/mentorship-application?status=success");
  }

  if (!(await hasValidTurnstileToken(formData, "mentorship_application"))) {
    redirect(
      "/mentorship-application?status=error&message=Please%20confirm%20you%20are%20human%20and%20try%20again.",
    );
  }

  if (!name || !email || !interest || !intentions) {
    redirect(
      "/mentorship-application?status=error&message=Please%20complete%20the%20required%20fields.",
    );
  }

  const message = [
    "Embodied Healer Mentorship Application",
    "",
    `Experience Level: ${experienceLevel || "Not provided"}`,
    `Primary Focus: ${focus || "Not provided"}`,
    `What is calling you to this mentorship?: ${interest}`,
    "",
    `What season are you moving through right now?: ${currentSeason || "Not provided"}`,
    "",
    `Intentions for this path: ${intentions}`,
    "",
    `Preferred start timing: ${startTiming || "Not provided"}`,
    "",
    `Anything else Kate should know?: ${additionalNotes || "Not provided"}`,
  ].join("\n");

  if (!integrations.supabase) {
    redirect(
      "/mentorship-application?status=error&message=Application%20storage%20is%20not%20configured%20yet.",
    );
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("contact_inquiries").insert({
    name,
    email,
    phone: phone || null,
    inquiry_type: "mentorship_application",
    message,
    source: "website",
    status: "new",
  });

  if (error) {
    redirect(
      "/mentorship-application?status=error&message=The%20application%20form%20is%20built,%20but%20the%20contact%20table%20still%20needs%20to%20be%20created%20in%20Supabase.",
    );
  }

  if (integrations.emailForwarding) {
    try {
      await sendInquiryForwardEmail({
        name,
        email,
        phone: phone || null,
        inquiryType: "mentorship_application",
        message,
      });
    } catch (error) {
      console.error("Mentorship application email forwarding failed", error);
      redirect(
        "/mentorship-application?status=error&message=Your%20application%20was%20saved,%20but%20the%20email%20forwarding%20step%20failed.",
      );
    }
  }

  redirect("/mentorship-application?status=success");
}
