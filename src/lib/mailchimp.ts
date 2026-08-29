import { createHash } from "crypto";
import { env, integrations } from "@/lib/env";

type MailchimpSignupInput = {
  name: string;
  email: string;
  tags: string[];
  managedTags?: string[];
};

function getDataCenter(apiKey: string) {
  return apiKey.split("-").at(-1) ?? "";
}

function getSubscriberHash(email: string) {
  return createHash("md5").update(email.toLowerCase()).digest("hex");
}

function getFirstAndLastName(name: string) {
  const parts = name.trim().split(/\s+/);
  const firstName = parts.shift() ?? "";
  const lastName = parts.join(" ");

  return { firstName, lastName };
}

async function sendMailchimpRequest(path: string, init: RequestInit) {
  const dataCenter = getDataCenter(env.mailchimpApiKey);

  if (!dataCenter) {
    throw new Error("Mailchimp API key is missing its data center suffix.");
  }

  const response = await fetch(
    `https://${dataCenter}.api.mailchimp.com/3.0${path}`,
    {
      ...init,
      headers: {
        Authorization: `Basic ${Buffer.from(
          `website:${env.mailchimpApiKey}`,
        ).toString("base64")}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Mailchimp request failed: ${response.status} ${detail}`);
  }

  return response;
}

export async function syncEmailSignupToMailchimp(input: MailchimpSignupInput) {
  if (!integrations.mailchimp) {
    return { skipped: true };
  }

  const email = input.email.trim().toLowerCase();
  const subscriberHash = getSubscriberHash(email);
  const { firstName, lastName } = getFirstAndLastName(input.name);

  await sendMailchimpRequest(
    `/lists/${env.mailchimpAudienceId}/members/${subscriberHash}`,
    {
      method: "PUT",
      body: JSON.stringify({
        email_address: email,
        status_if_new: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      }),
    },
  );

  const selectedTags = new Set(input.tags);
  const managedTags = new Set(input.managedTags ?? []);
  const tagUpdates = [
    ...Array.from(managedTags, (name) => ({
      name,
      status: selectedTags.has(name) ? "active" : "inactive",
    })),
    ...input.tags
      .filter((name) => !managedTags.has(name))
      .map((name) => ({ name, status: "active" })),
  ];

  if (tagUpdates.length > 0) {
    await sendMailchimpRequest(
      `/lists/${env.mailchimpAudienceId}/members/${subscriberHash}/tags`,
      {
        method: "POST",
        body: JSON.stringify({
          tags: tagUpdates,
        }),
      },
    );
  }

  return { synced: true };
}
