import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type VerificationType =
  | "signup"
  | "recovery"
  | "invite"
  | "magiclink"
  | "email_change"
  | "email";

const allowedVerificationTypes = new Set<VerificationType>([
  "signup",
  "recovery",
  "invite",
  "magiclink",
  "email_change",
  "email",
]);

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = String(formData.get("token") ?? "").trim();
  const requestedType = String(formData.get("type") ?? "recovery").trim();
  const requestedNext = String(
    formData.get("next") ?? "/create-password",
  ).trim();
  const type = allowedVerificationTypes.has(
    requestedType as VerificationType,
  )
    ? (requestedType as VerificationType)
    : "recovery";
  const next =
    requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/create-password";

  if (!token) {
    return NextResponse.redirect(
      new URL("/portal-setup?status=expired", request.url),
      303,
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type,
    });

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url), 303);
    }

    console.error("Portal setup verification failed", error);
  } catch (error) {
    console.error("Portal setup verification could not start", error);
  }

  return NextResponse.redirect(
    new URL("/portal-setup?status=expired", request.url),
    303,
  );
}
