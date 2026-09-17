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

const inquiryPath = "/reiki-mentorship/inquire";

function withStatus(status: "success" | "error", message?: string) {
  const params = new URLSearchParams({ status });

  if (message) {
    params.set("message", message);
  }

  return `${inquiryPath}?${params.toString()}`;
}

export async function submitHealersEmergenceInquiry(formData: FormData) {
  const name = getFormValue(formData, "name");
  const email = getFormValue(formData, "email");
  const phone = getFormValue(formData, "phone");
  const containerInterest = getFormValue(formData, "containerInterest");
  const reikiExperience = getFormValue(formData, "reikiExperience");
  const supportAreas = formData
    .getAll("supportAreas")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const supportDetails = getFormValue(formData, "supportDetails");
  const businessStage = getFormValue(formData, "businessStage");
  const currentChallenge = getFormValue(formData, "currentChallenge");
  const desiredFeeling = getFormValue(formData, "desiredFeeling");
  const desiredOutcome = getFormValue(formData, "desiredOutcome");
  const startTiming = getFormValue(formData, "startTiming");
  const additionalNotes = getFormValue(formData, "additionalNotes");

  if (isLikelyAutomatedSubmission(formData)) {
    redirect(withStatus("success"));
  }

  if (!(await hasValidTurnstileToken(formData, "reiki_mentorship_inquiry"))) {
    redirect(withStatus("error", "Please confirm you are human and try again."));
  }

  if (
    !name ||
    !email ||
    !containerInterest ||
    !reikiExperience ||
    supportAreas.length === 0 ||
    !supportDetails ||
    !businessStage ||
    !desiredFeeling ||
    !startTiming
  ) {
    redirect(withStatus("error", "Please complete the required fields."));
  }

  const message = [
    "The Healer's Emergence Inquiry",
    "",
    `Container interest: ${containerInterest}`,
    "",
    "Reiki training and experience:",
    reikiExperience,
    "",
    `Areas of support: ${supportAreas.join(", ")}`,
    "",
    "Support they are seeking:",
    supportDetails,
    "",
    `Current business stage: ${businessStage}`,
    "",
    "What feels most challenging right now:",
    currentChallenge || "Not provided",
    "",
    "How they want to feel at the end of the mentorship:",
    desiredFeeling,
    "",
    "What they would love to create or move forward:",
    desiredOutcome || "Not provided",
    "",
    `Preferred start timing: ${startTiming}`,
    "",
    "Anything else Kate should know:",
    additionalNotes || "Not provided",
  ].join("\n");

  if (!integrations.supabase) {
    redirect(withStatus("error", "Inquiry storage is not configured yet."));
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("contact_inquiries").insert({
    name,
    email,
    phone: phone || null,
    inquiry_type: "healers_emergence_inquiry",
    message,
    source: "website",
    status: "new",
  });

  if (error) {
    redirect(
      withStatus(
        "error",
        "Your inquiry could not be saved right now. Please try again.",
      ),
    );
  }

  if (integrations.emailForwarding) {
    try {
      await sendInquiryForwardEmail({
        name,
        email,
        phone: phone || null,
        inquiryType: "healers_emergence_inquiry",
        message,
      });
    } catch (error) {
      console.error("Healer's Emergence inquiry forwarding failed", error);
      redirect(
        withStatus(
          "error",
          "Your inquiry was saved, but the email forwarding step failed.",
        ),
      );
    }
  }

  redirect(withStatus("success"));
}
