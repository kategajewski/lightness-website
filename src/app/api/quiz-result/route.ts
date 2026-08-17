import { NextResponse } from "next/server";
import { integrations } from "@/lib/env";
import { sendReikiQuizResultEmail } from "@/lib/email";
import {
  getFormValue,
  hasValidTurnstileToken,
  isLikelyAutomatedSubmission,
} from "@/lib/form-security";
import { syncEmailSignupToMailchimp } from "@/lib/mailchimp";
import {
  reikiQuizClosingReflections,
  reikiQuizResults,
  type ReikiQuizResultKey,
} from "@/lib/reiki-quiz-results";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isReikiQuizResultKey(value: string): value is ReikiQuizResultKey {
  return Object.prototype.hasOwnProperty.call(reikiQuizResults, value);
}

function getReflection(indexValue: string) {
  const index = Number(indexValue);

  if (!Number.isInteger(index) || index < 0) {
    return undefined;
  }

  return reikiQuizClosingReflections[index];
}

export async function POST(request: Request) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { message: "Please refresh the page and try again." },
      { status: 400 },
    );
  }

  if (isLikelyAutomatedSubmission(formData)) {
    return NextResponse.json({
      message: "Your result is on its way. Please check your inbox.",
    });
  }

  if (!(await hasValidTurnstileToken(formData, "quiz_result"))) {
    return NextResponse.json(
      { message: "Please confirm you are human and try again." },
      { status: 400 },
    );
  }

  const firstName = getFormValue(formData, "firstName");
  const email = getFormValue(formData, "email").toLowerCase();
  const resultKey = getFormValue(formData, "resultKey");
  const reflection = getReflection(getFormValue(formData, "reflectionIndex"));
  const wantsReikiUpdates = getFormValue(formData, "reikiUpdates") === "yes";

  if (
    !firstName ||
    firstName.length > 80 ||
    !email ||
    email.length > 254 ||
    !emailPattern.test(email) ||
    !isReikiQuizResultKey(resultKey)
  ) {
    return NextResponse.json(
      { message: "Please add your first name and a valid email address." },
      { status: 400 },
    );
  }

  if (!integrations.supabase || !integrations.emailDelivery) {
    return NextResponse.json(
      {
        message:
          "Result delivery is not available right now. Your result will remain here on the page.",
      },
      { status: 503 },
    );
  }

  const result = reikiQuizResults[resultKey];
  const message = [
    "Saved Reiki path quiz result.",
    "",
    `Result: ${result.title}`,
    `Reiki updates consent: ${wantsReikiUpdates ? "Yes" : "No"}`,
    ...(reflection ? ["", `Closing reflection: ${reflection}`] : []),
  ].join("\n");
  const supabase = createSupabaseAdminClient();
  const { error: storageError } = await supabase.from("contact_inquiries").insert({
    name: firstName,
    email,
    phone: null,
    inquiry_type: "reiki-quiz",
    message,
    source: "reiki_quiz",
    status: "new",
  });

  if (storageError) {
    console.error("Reiki quiz result storage failed", storageError);
    return NextResponse.json(
      {
        message:
          "Your result could not be saved right now. It will remain here on the page.",
      },
      { status: 500 },
    );
  }

  try {
    await sendReikiQuizResultEmail({
      firstName,
      email,
      result,
      reflection,
    });
  } catch (error) {
    console.error("Reiki quiz result email failed", error);
    return NextResponse.json(
      {
        message:
          "Your result was saved, but the email could not be sent. Please try again in a few minutes.",
      },
      { status: 502 },
    );
  }

  if (wantsReikiUpdates && integrations.mailchimp) {
    try {
      await syncEmailSignupToMailchimp({
        name: firstName,
        email,
        tags: ["Reiki trainings", "Reiki quiz"],
      });
    } catch (error) {
      console.error("Reiki quiz Mailchimp sync failed", error);
    }
  }

  return NextResponse.json({
    message: `Your ${result.title} result has been sent to ${email}.`,
  });
}
