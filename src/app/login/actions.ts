"use server";

import { redirect } from "next/navigation";
import { sendPasswordRecoveryEmail } from "@/lib/email";
import { hasValidTurnstileToken } from "@/lib/form-security";
import {
  createPasswordRecoveryLink,
  markPasswordRecoveryEmailSent,
} from "@/lib/portal-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function signInAction(formData: FormData) {
  const email = getFormValue(formData, "email");
  const password = getFormValue(formData, "password");

  if (!email || !password) {
    redirect("/login?error=Please%20enter%20your%20email%20and%20password.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/account");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = getFormValue(formData, "email");

  if (!email) {
    redirect("/forgot-password?status=error&message=Please%20enter%20your%20email%20address.");
  }

  if (!(await hasValidTurnstileToken(formData, "password_recovery"))) {
    redirect(
      "/forgot-password?status=error&message=Please%20confirm%20you%20are%20human%20and%20try%20again.",
    );
  }

  try {
    const recovery = await createPasswordRecoveryLink(email);

    if (recovery.status === "ready") {
      await sendPasswordRecoveryEmail({
        email: email.toLowerCase(),
        recoveryUrl: recovery.setupUrl,
      });
      await markPasswordRecoveryEmailSent(
        recovery.userId,
        recovery.userMetadata,
      );
    }
  } catch (error) {
    console.error("Password recovery email failed", error);
  }

  redirect("/forgot-password?status=success");
}
