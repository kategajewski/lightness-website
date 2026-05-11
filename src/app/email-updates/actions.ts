"use server";

import { redirect } from "next/navigation";
import { sendInquiryForwardEmail } from "@/lib/email";
import {
  getFormValue,
  hasValidTurnstileToken,
  isLikelyAutomatedSubmission,
} from "@/lib/form-security";
import { integrations } from "@/lib/env";
import { syncEmailSignupToMailchimp } from "@/lib/mailchimp";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const preferenceLabels: Record<string, string> = {
  events: "Monthly events",
  yoga: "Yoga classes",
  reiki: "Reiki trainings",
  sound: "Sound healing and sound training",
  ceremonies: "Private sessions and ceremonies",
  membership: "Membership and Reiki Rising updates",
  online_programs: "Online programs",
};

export async function submitEmailSignup(formData: FormData) {
  const name = getFormValue(formData, "name");
  const email = getFormValue(formData, "email");
  const consent = getFormValue(formData, "consent");
  const preferences = formData
    .getAll("preferences")
    .map((value) => String(value))
    .filter((value) => value in preferenceLabels);

  if (isLikelyAutomatedSubmission(formData)) {
    redirect("/email-updates?status=success");
  }

  if (!(await hasValidTurnstileToken(formData, "email_signup"))) {
    redirect(
      "/email-updates?status=error&message=Please%20confirm%20you%20are%20human%20and%20try%20again.",
    );
  }

  if (!name || !email || consent !== "yes") {
    redirect(
      "/email-updates?status=error&message=Please%20add%20your%20name%2C%20email%2C%20and%20email%20permission.",
    );
  }

  if (preferences.length === 0) {
    redirect(
      "/email-updates?status=error&message=Please%20choose%20at%20least%20one%20type%20of%20update.",
    );
  }

  if (!integrations.supabase) {
    redirect(
      "/email-updates?status=error&message=Email%20signup%20storage%20is%20not%20configured%20yet.",
    );
  }

  const preferenceText = preferences.map((value) => preferenceLabels[value]);
  const message = [
    "Email list signup with explicit permission.",
    "",
    "Requested updates:",
    ...preferenceText.map((label) => `- ${label}`),
    "",
    "Consent: Yes, this person asked to receive email updates from The Lightness of Being.",
  ].join("\n");

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("contact_inquiries").insert({
    name,
    email,
    phone: null,
    inquiry_type: "email_updates",
    message,
    source: "email_signup",
    status: "new",
  });

  if (error) {
    redirect(
      "/email-updates?status=error&message=The%20signup%20form%20is%20built%2C%20but%20the%20contact%20table%20still%20needs%20to%20be%20created%20in%20Supabase.",
    );
  }

  if (integrations.emailForwarding) {
    try {
      await sendInquiryForwardEmail({
        name,
        email,
        phone: null,
        inquiryType: "email_updates",
        message,
      });
    } catch (error) {
      console.error("Email signup forwarding failed", error);
      redirect(
        "/email-updates?status=error&message=Your%20signup%20was%20saved%2C%20but%20the%20email%20forwarding%20step%20failed.",
      );
    }
  }

  if (integrations.mailchimp) {
    try {
      await syncEmailSignupToMailchimp({
        name,
        email,
        tags: preferenceText,
      });
    } catch (error) {
      console.error("Mailchimp email signup sync failed", error);
      redirect(
        "/email-updates?status=error&message=Your%20signup%20was%20saved%2C%20but%20the%20Mailchimp%20sync%20failed.",
      );
    }
  }

  redirect("/email-updates?status=success");
}
