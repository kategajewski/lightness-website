import "server-only";
import { createHash } from "node:crypto";
import { env, integrations } from "@/lib/env";

export type IntakeNewsletterContact = {
  name: string;
  email: string;
  newsletterConsent: boolean;
};

const memberStatuses = ["subscribed", "unsubscribed", "cleaned", "pending", "transactional", "archived"] as const;
type MemberStatus = (typeof memberStatuses)[number];
export type IntakeMailchimpResult =
  | { outcome: "not-requested" }
  | { outcome: "not-configured" }
  | { outcome: "synced"; status: MemberStatus };

// Messages never include provider bodies, names, addresses, URLs or credentials.
export class IntakeMailchimpError extends Error {
  constructor(public readonly retryable: boolean) {
    super("The email update preference could not be synchronized.");
    this.name = "IntakeMailchimpError";
  }
}

export function intakeMailchimpConfigured() {
  return integrations.mailchimp;
}

function requestDetails() {
  const dataCenter = env.mailchimpApiKey.split("-").at(-1) ?? "";
  if (!/^[a-z]{2}\d+$/.test(dataCenter) || !/^[a-zA-Z0-9]+$/.test(env.mailchimpAudienceId)) {
    throw new IntakeMailchimpError(false);
  }
  return {
    base: `https://${dataCenter}.api.mailchimp.com/3.0/lists/${env.mailchimpAudienceId}`,
    headers: {
      Authorization: `Basic ${Buffer.from(`website:${env.mailchimpApiKey}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
  };
}

async function requestJson(url: string, init: RequestInit): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      throw new IntakeMailchimpError(response.status === 408 || response.status === 429 || response.status >= 500);
    }
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new IntakeMailchimpError(true);
    return data as Record<string, unknown>;
  } catch (error) {
    if (error instanceof IntakeMailchimpError) throw error;
    throw new IntakeMailchimpError(true);
  }
}

/**
 * Call only from a delivery job based on an already saved, signed record.
 * The caller owns durable job state and retries. No intake-specific tags or
 * answers are sent. The child's form supplies the guardian's name and email.
 */
export async function syncIntakeNewsletterToMailchimp(input: IntakeNewsletterContact): Promise<IntakeMailchimpResult> {
  if (input.newsletterConsent !== true) return { outcome: "not-requested" };
  if (!intakeMailchimpConfigured()) return { outcome: "not-configured" };

  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || name.length > 150) {
    throw new IntakeMailchimpError(false);
  }

  const { base, headers } = requestDetails();
  // Honor the audience's current confirmation preference. A failed or malformed
  // lookup must never silently bypass double opt-in.
  const audience = await requestJson(`${base}?fields=double_optin`, { headers });
  if (typeof audience.double_optin !== "boolean") throw new IntakeMailchimpError(true);

  const parts = name.split(/\s+/);
  const subscriberHash = createHash("md5").update(email).digest("hex");
  const member = await requestJson(`${base}/members/${subscriberHash}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({
      email_address: email,
      status_if_new: audience.double_optin ? "pending" : "subscribed",
      merge_fields: { FNAME: parts.shift() ?? "", LNAME: parts.join(" ") },
    }),
  });
  // Omitting `status` is deliberate: an existing unsubscribe, bounce, pending
  // confirmation or non-marketing contact must not be resubscribed by a retry.
  if (!memberStatuses.includes(member.status as MemberStatus)) throw new IntakeMailchimpError(true);
  return { outcome: "synced", status: member.status as MemberStatus };
}
