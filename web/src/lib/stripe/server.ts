import "server-only";
import { env } from "@/lib/env";

export async function getStripe() {
  if (!env.stripeSecretKey) {
    return null;
  }

  const { default: Stripe } = await import("stripe");

  return new Stripe(env.stripeSecretKey, {
    apiVersion: "2026-02-25.clover",
  });
}
