import { NextResponse } from "next/server";
import { env, integrations } from "@/lib/env";
import { getOfferBySlug, isPurchaseOptionAvailable } from "@/lib/offers";
import { REIKI_RISING_AGREEMENT_VERSION } from "@/lib/reiki-rising-agreement";

export async function POST(request: Request) {
  const origin = env.siteUrl.replace(/\/$/, "");
  const formData = await request.formData();
  const slug = String(formData.get("slug") ?? "");
  const optionKey = String(formData.get("optionKey") ?? "");
  const agreementFullName = String(
    formData.get("agreementFullName") ?? "",
  )
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 160);
  const agreementAccepted = formData.get("agreementAccepted") === "yes";
  const mediaReleaseAccepted =
    formData.get("mediaReleaseAccepted") === "yes";
  const offer = getOfferBySlug(slug);

  if (!offer) {
    return NextResponse.redirect(`${origin}/courses`, { status: 303 });
  }

  const selectedOption = offer.purchaseOptions?.find(
    (option) =>
      option.key === optionKey && isPurchaseOptionAvailable(option),
  );

  if (offer.purchaseOptions?.length && !selectedOption) {
    const redirectPath =
      offer.slug === "reiki-rising"
        ? `${origin}/checkout/${offer.slug}?agreement=required`
        : `${origin}/checkout/${offer.slug}`;

    return NextResponse.redirect(redirectPath, {
      status: 303,
    });
  }

  const requiresEnrollmentAgreement = offer.slug === "reiki-rising";

  if (
    requiresEnrollmentAgreement &&
    (!agreementAccepted || agreementFullName.length < 2)
  ) {
    return NextResponse.redirect(
      `${origin}/checkout/${offer.slug}?agreement=required`,
      { status: 303 },
    );
  }

  const selectedPriceId = selectedOption?.stripePriceId || offer.stripePriceId;
  const selectedAmountCents = selectedOption?.amountCents;
  const checkoutMode =
    selectedOption?.mode ||
    (offer.format === "subscription" ? "subscription" : "payment");
  const canCreateInlinePrice = Boolean(selectedAmountCents);

  if (
    !integrations.stripe ||
    (!selectedPriceId && !canCreateInlinePrice) ||
    !env.stripeSecretKey
  ) {
    return NextResponse.redirect(`${origin}/checkout/${offer.slug}`, {
      status: 303,
    });
  }

  const body = new URLSearchParams({
    mode: checkoutMode,
    "line_items[0][quantity]": "1",
    "metadata[purchaseType]": "offer",
    "metadata[offerSlug]": offer.slug,
    "metadata[optionKey]": selectedOption?.key ?? "",
    success_url: `${origin}/checkout/success?type=offer&slug=${encodeURIComponent(
      offer.slug,
    )}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel?type=offer&slug=${encodeURIComponent(
      offer.slug,
    )}`,
  });

  if (requiresEnrollmentAgreement) {
    const acceptedAt = new Date().toISOString();

    body.set("metadata[agreementAccepted]", "true");
    body.set(
      "metadata[agreementVersion]",
      REIKI_RISING_AGREEMENT_VERSION,
    );
    body.set("metadata[agreementAcceptedAt]", acceptedAt);
    body.set("metadata[agreementFullName]", agreementFullName);
    body.set(
      "metadata[mediaReleaseAccepted]",
      mediaReleaseAccepted ? "true" : "false",
    );

    if (checkoutMode === "subscription") {
      body.set("subscription_data[metadata][agreementAccepted]", "true");
      body.set(
        "subscription_data[metadata][agreementVersion]",
        REIKI_RISING_AGREEMENT_VERSION,
      );
      body.set(
        "subscription_data[metadata][agreementAcceptedAt]",
        acceptedAt,
      );
      body.set(
        "subscription_data[metadata][agreementFullName]",
        agreementFullName,
      );
      body.set(
        "subscription_data[metadata][mediaReleaseAccepted]",
        mediaReleaseAccepted ? "true" : "false",
      );
    } else {
      body.set("payment_intent_data[metadata][agreementAccepted]", "true");
      body.set(
        "payment_intent_data[metadata][agreementVersion]",
        REIKI_RISING_AGREEMENT_VERSION,
      );
      body.set(
        "payment_intent_data[metadata][agreementAcceptedAt]",
        acceptedAt,
      );
      body.set(
        "payment_intent_data[metadata][agreementFullName]",
        agreementFullName,
      );
      body.set(
        "payment_intent_data[metadata][mediaReleaseAccepted]",
        mediaReleaseAccepted ? "true" : "false",
      );
    }
  }

  if (selectedOption?.installmentCount) {
    body.set(
      "metadata[installmentCount]",
      String(selectedOption.installmentCount),
    );
    body.set("metadata[fixedInstallmentPlan]", "true");
    body.set("subscription_data[metadata][purchaseType]", "offer");
    body.set("subscription_data[metadata][offerSlug]", offer.slug);
    body.set(
      "subscription_data[metadata][optionKey]",
      selectedOption.key,
    );
    body.set(
      "subscription_data[metadata][installmentCount]",
      String(selectedOption.installmentCount),
    );
    body.set(
      "subscription_data[metadata][fixedInstallmentPlan]",
      "true",
    );
  }

  if (selectedPriceId) {
    body.set("line_items[0][price]", selectedPriceId);
  } else if (selectedAmountCents) {
    body.set("line_items[0][price_data][currency]", "usd");
    body.set(
      "line_items[0][price_data][unit_amount]",
      String(selectedAmountCents),
    );
    body.set(
      "line_items[0][price_data][product_data][name]",
      selectedOption?.label || offer.name,
    );

    if (checkoutMode === "subscription") {
      body.set(
        "line_items[0][price_data][recurring][interval]",
        "month",
      );
      body.set(
        "line_items[0][price_data][product_data][description]",
        `${selectedOption?.installmentCount} monthly payments. Billing ends automatically after the final payment.`,
      );
    }
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    return NextResponse.redirect(`${origin}/checkout/${offer.slug}`, {
      status: 303,
    });
  }

  const session = (await response.json()) as { url?: string };

  return NextResponse.redirect(
    session.url ?? `${origin}/checkout/${offer.slug}`,
    { status: 303 },
  );
}
