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

function buildPortalSetupUrl(hashedToken: string, verificationType: string) {
  const setupUrl = new URL("/portal-setup", env.siteUrl);

  setupUrl.searchParams.set("token", hashedToken);
  setupUrl.searchParams.set("type", verificationType);

  return setupUrl.toString();
}

function isAlreadyRegisteredError(message: string) {
  const normalized = message.toLowerCase();

  return (
    normalized.includes("already registered") ||
    normalized.includes("already exists") ||
    normalized.includes("user already")
  );
}

async function ensurePortalUser(email: string, offerSlug: string, accessSlug: string) {
  const supabase = createSupabaseAdminClient();
  const password = `Portal-${crypto.randomUUID()}-${crypto.randomUUID()}`;
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      source: "stripe_checkout",
      offerSlug,
      accessSlug,
    },
  });

  if (error && !isAlreadyRegisteredError(error.message)) {
    throw error;
  }
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
    await ensurePortalUser(email, offer.slug, offer.accessSlug);
    await ensureMemberAccess(email, offer.accessSlug);

    const setupUrl = await createPasswordSetupLink(email);

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
