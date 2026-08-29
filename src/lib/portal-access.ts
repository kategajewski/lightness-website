import "server-only";
import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env, integrations } from "@/lib/env";
import { getOfferBySlug } from "@/lib/offers";

export type PortalProvisioningResult = {
  accessSlug?: string;
  portalHref?: string;
  setupUrl?: string;
  status:
    | "not_applicable"
    | "skipped"
    | "provisioned"
    | "provisioned_without_setup_link"
    | "failed";
};

type MemberAccessLookupRow = {
  id?: string;
};

function getSetupRedirectUrl() {
  return `${env.siteUrl.replace(/\/$/, "")}/auth/callback?next=/create-password`;
}

function buildPortalSetupUrl(
  hashedToken: string,
  verificationType: string,
  next = "/create-password",
) {
  const setupUrl = new URL("/portal-setup", env.siteUrl);

  setupUrl.searchParams.set("token", hashedToken);
  setupUrl.searchParams.set("type", verificationType);
  setupUrl.searchParams.set("next", next);

  return setupUrl.toString();
}

const passwordRecoveryCooldownMs = 5 * 60 * 1000;

export async function createPasswordRecoveryLink(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const supabase = createSupabaseAdminClient();
  const { data: usersData, error: usersError } =
    await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (usersError) {
    throw usersError;
  }

  const user = usersData.users.find(
    (candidate) =>
      candidate.email?.trim().toLowerCase() === normalizedEmail,
  );

  if (!user) {
    return { status: "not_found" as const };
  }

  const lastSentAt = Number(
    user.user_metadata?.passwordRecoveryEmailSentAt ?? 0,
  );

  if (
    Number.isFinite(lastSentAt) &&
    lastSentAt > 0 &&
    Date.now() - lastSentAt < passwordRecoveryCooldownMs
  ) {
    return { status: "rate_limited" as const };
  }

  const redirectTo = `${env.siteUrl.replace(/\/$/, "")}/auth/callback?next=/reset-password`;
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: normalizedEmail,
    options: { redirectTo },
  });

  if (error) {
    throw error;
  }

  const properties = data.properties as
    | {
        hashed_token?: string;
        verification_type?: string;
      }
    | undefined;

  if (!properties?.hashed_token || !properties.verification_type) {
    throw new Error("A secure password recovery link could not be created.");
  }

  return {
    status: "ready" as const,
    setupUrl: buildPortalSetupUrl(
      properties.hashed_token,
      properties.verification_type,
      "/reset-password",
    ),
    userId: user.id,
    userMetadata: user.user_metadata ?? {},
  };
}

export async function markPasswordRecoveryEmailSent(
  userId: string,
  userMetadata: Record<string, unknown>,
) {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...userMetadata,
      passwordRecoveryEmailSentAt: Date.now(),
    },
  });

  if (error) {
    throw error;
  }
}

async function ensurePortalUser(email: string, offerSlug: string, accessSlug: string) {
  const supabase = createSupabaseAdminClient();
  const { data: usersData, error: usersError } =
    await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (usersError) {
    throw usersError;
  }

  if (
    usersData.users.some(
      (user) => user.email?.trim().toLowerCase() === email.toLowerCase(),
    )
  ) {
    return undefined;
  }

  const password = `Portal-${crypto.randomUUID()}-${crypto.randomUUID()}`;
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      data: {
        source: "stripe_checkout",
        offerSlug,
        accessSlug,
      },
      redirectTo: getSetupRedirectUrl(),
    },
  });

  if (error) {
    throw error;
  }

  const properties = data.properties as
    | {
        hashed_token?: string;
        verification_type?: string;
      }
    | undefined;

  if (!properties?.hashed_token || !properties.verification_type) {
    return undefined;
  }

  return buildPortalSetupUrl(
    properties.hashed_token,
    properties.verification_type,
  );
}

async function ensureMemberAccess(email: string, accessSlug: string) {
  const supabase = createSupabaseAdminClient();
  const { data: existing, error: lookupError } = await supabase
    .from("member_access")
    .select("id")
    .eq("email", email)
    .eq("offer_slug", accessSlug)
    .maybeSingle<MemberAccessLookupRow>();

  if (lookupError) {
    throw lookupError;
  }

  if (existing?.id) {
    const { error } = await supabase
      .from("member_access")
      .update({ access_status: "active" })
      .eq("id", existing.id);

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await supabase.from("member_access").insert({
    email,
    offer_slug: accessSlug,
    access_status: "active",
  });

  if (error) {
    throw error;
  }
}

async function createPasswordSetupLink(email: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email,
    options: {
      redirectTo: getSetupRedirectUrl(),
    },
  });

  if (error) {
    throw error;
  }

  const properties = data.properties as
    | {
        hashed_token?: string;
        verification_type?: string;
      }
    | undefined;

  if (!properties?.hashed_token || !properties.verification_type) {
    return undefined;
  }

  return buildPortalSetupUrl(
    properties.hashed_token,
    properties.verification_type,
  );
}

export async function provisionOfferPortalAccessFromSession(
  session: Stripe.Checkout.Session,
): Promise<PortalProvisioningResult> {
  const metadata = session.metadata ?? {};

  if (metadata.purchaseType !== "offer" || !metadata.offerSlug) {
    return { status: "not_applicable" };
  }

  const offer = getOfferBySlug(metadata.offerSlug);

  if (!offer?.accessSlug) {
    return { status: "not_applicable" };
  }

  const email = session.customer_details?.email?.trim().toLowerCase();
  const portalHref = offer.portalHref
    ? `${env.siteUrl.replace(/\/$/, "")}${offer.portalHref}`
    : `${env.siteUrl.replace(/\/$/, "")}/account`;

  if (!email || !integrations.supabase) {
    return {
      accessSlug: offer.accessSlug,
      portalHref,
      status: "skipped",
    };
  }

  try {
    const newUserSetupUrl = await ensurePortalUser(
      email,
      offer.slug,
      offer.accessSlug,
    );
    await ensureMemberAccess(email, offer.accessSlug);

    const setupUrl = newUserSetupUrl ?? (await createPasswordSetupLink(email));

    return {
      accessSlug: offer.accessSlug,
      portalHref,
      setupUrl,
      status: setupUrl ? "provisioned" : "provisioned_without_setup_link",
    };
  } catch (error) {
    console.error("Portal access provisioning failed", error);

    return {
      accessSlug: offer.accessSlug,
      portalHref,
      status: "failed",
    };
  }
}
