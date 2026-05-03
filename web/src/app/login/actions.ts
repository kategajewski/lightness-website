"use server";

import { redirect } from "next/navigation";
import { env, integrations } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getAuthErrorMessage(error: { message?: string }) {
  const message = error.message?.trim();

  if (message && message !== "{}") {
    return message;
  }

  return "Supabase could not send the reset email. Please check the email sender settings and try again.";
}

function getSignInErrorMessage(error: { message?: string }) {
  const message = error.message?.trim();

  if (message && message !== "{}") {
    return message;
  }

  return "Member login could not complete. Please try again.";
}

export async function signInAction(formData: FormData) {
  const email = getFormValue(formData, "email");
  const password = getFormValue(formData, "password");

  if (!email || !password) {
    redirect("/login?error=Please%20enter%20your%20email%20and%20password.");
  }

  if (!integrations.supabase) {
    redirect("/login?error=Member%20login%20is%20not%20configured%20on%20this%20deployment%20yet.");
  }

  let error: { message?: string } | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    error = result.error;
  } catch {
    redirect("/login?error=Member%20login%20could%20not%20connect%20to%20Supabase.%20Please%20check%20the%20deployment%20settings.");
  }

  if (error) {
    redirect(`/login?error=${encodeURIComponent(getSignInErrorMessage(error))}`);
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

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    redirect(
      `/forgot-password?status=error&message=${encodeURIComponent(getAuthErrorMessage(error))}`,
    );
  }

  redirect("/forgot-password?status=success");
}
