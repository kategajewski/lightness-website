import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get("token");
  const type = requestUrl.searchParams.get("type") ?? "recovery";
  const next = requestUrl.searchParams.get("next") ?? "/create-password";

  if (!token || !env.supabaseUrl) {
    return NextResponse.redirect(
      new URL(
        "/login?error=Portal%20setup%20link%20is%20missing%20or%20expired.",
        requestUrl.origin,
      ),
    );
  }

  const callbackUrl = new URL("/auth/callback", requestUrl.origin);
  callbackUrl.searchParams.set("next", next);

  const verifyUrl = new URL("/auth/v1/verify", env.supabaseUrl);
  verifyUrl.searchParams.set("token", token);
  verifyUrl.searchParams.set("type", type);
  verifyUrl.searchParams.set("redirect_to", callbackUrl.toString());

  return NextResponse.redirect(verifyUrl);
}
