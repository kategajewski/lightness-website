import { NextResponse } from "next/server";
import { env, integrations } from "@/lib/env";
import { getOfferBySlug } from "@/lib/offers";

export async function POST(request: Request) {
  const formData = await request.formData();
  const slug = String(formData.get("slug") ?? "");
  const optionKey = String(formData.get("optionKey") ?? "");
  const offer = getOfferBySlug(slug);

  if (!offer) {
    return NextResponse.redirect(`${env.siteUrl}/courses`, { status: 303 });
  }

  const selectedOption = offer.purchaseOptions?.find(
    (option) => option.key === optionKey,
  );
  const selectedPriceId = selectedOption?.stripePriceId || offer.stripePriceId;
  const checkoutMode =
    selectedOption?.mode ||
    (offer.format === "subscription" ? "subscription" : "payment");

  if (!integrations.stripe || !selectedPriceId || !env.stripeSecretKey) {
    return NextResponse.redirect(`${env.siteUrl}/checkout/${offer.slug}`, {
      status: 303,
    });
  }

  const body = new URLSearchParams({
    mode: checkoutMode,
    "line_items[0][price]": selectedPriceId,
    "line_items[0][quantity]": "1",
    "metadata[purchaseType]": "offer",
    "metadata[offerSlug]": offer.slug,
    "metadata[optionKey]": selectedOption?.key ?? "",
    success_url: `${env.siteUrl}/checkout/success?type=offer&slug=${encodeURIComponent(
      offer.slug,
    )}`,
    cancel_url: `${env.siteUrl}/checkout/cancel?type=offer&slug=${encodeURIComponent(
      offer.slug,
    )}`,
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    return NextResponse.redirect(`${env.siteUrl}/checkout/${offer.slug}`, {
      status: 303,
    });
  }

  const session = (await response.json()) as { url?: string };

  return NextResponse.redirect(
    session.url ?? `${env.siteUrl}/checkout/${offer.slug}`,
    { status: 303 },
  );
}
