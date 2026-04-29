import { NextResponse } from "next/server";
import { env, integrations } from "@/lib/env";
import { getOfferBySlug } from "@/lib/offers";
import { stripe } from "@/lib/stripe/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const slug = String(formData.get("slug") ?? "");
  const optionKey = String(formData.get("optionKey") ?? "");
  const offer = getOfferBySlug(slug);

  if (!offer) {
    return NextResponse.redirect(`${env.siteUrl}/courses`);
  }

  const selectedOption = offer.purchaseOptions?.find(
    (option) => option.key === optionKey,
  );
  const selectedPriceId = selectedOption?.stripePriceId || offer.stripePriceId;
  const checkoutMode =
    selectedOption?.mode ||
    (offer.format === "subscription" ? "subscription" : "payment");

  if (!integrations.stripe || !selectedPriceId || !stripe) {
    return NextResponse.redirect(`${env.siteUrl}/checkout/${offer.slug}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: checkoutMode,
    line_items: [
      {
        price: selectedPriceId,
        quantity: 1,
      },
    ],
    success_url: `${env.siteUrl}/checkout/success`,
    cancel_url: `${env.siteUrl}/checkout/cancel`,
  });

  return NextResponse.redirect(session.url ?? `${env.siteUrl}/checkout/${offer.slug}`);
}
