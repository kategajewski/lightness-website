import Stripe from "stripe";
import { env } from "@/lib/env";

export const stripe = env.stripeSecretKey
  ? new Stripe(env.stripeSecretKey, {
      apiVersion: "2026-02-25.clover",
    })
  : null;
