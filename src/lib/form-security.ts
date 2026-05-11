import { env, integrations } from "@/lib/env";

const minimumCompletionSeconds = 4;
const maximumCompletionHours = 24;

export function getFormValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export function isLikelyAutomatedSubmission(formData: FormData) {
  const honeypot = getFormValue(formData, "website");
  const startedAt = Number(getFormValue(formData, "startedAt"));
  const elapsedMs = Date.now() - startedAt;

  if (honeypot) {
    return true;
  }

  if (!Number.isFinite(startedAt) || startedAt <= 0) {
    return true;
  }

  return (
    elapsedMs < minimumCompletionSeconds * 1000 ||
    elapsedMs > maximumCompletionHours * 60 * 60 * 1000
  );
}

export async function hasValidTurnstileToken(
  formData: FormData,
  expectedAction: string,
) {
  if (!integrations.turnstile) {
    return true;
  }

  const token = getFormValue(formData, "cf-turnstile-response");

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: env.turnstileSecretKey,
          response: token,
        }),
      },
    );
    const result = (await response.json()) as {
      success?: boolean;
      action?: string;
      "error-codes"?: string[];
    };

    if (!result.success) {
      console.error("Turnstile form verification failed", {
        expectedAction,
        action: result.action,
        errorCodes: result["error-codes"],
      });
      return false;
    }

    return !result.action || result.action === expectedAction;
  } catch (error) {
    console.error("Turnstile form verification errored", error);
    return false;
  }
}
