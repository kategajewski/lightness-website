function readOptionalEnv(key: string) {
  return process.env[key]?.trim() ?? "";
}

export const env = {
  siteUrl: readOptionalEnv("NEXT_PUBLIC_SITE_URL") || "http://localhost:3000",
  calendlyUrl: readOptionalEnv("NEXT_PUBLIC_CALENDLY_URL"),
  supabaseUrl: readOptionalEnv("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: readOptionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: readOptionalEnv("SUPABASE_SERVICE_ROLE_KEY"),
  contactForwardTo: readOptionalEnv("CONTACT_FORWARD_TO"),
  emailFrom: readOptionalEnv("EMAIL_FROM"),
  gmailAppPassword: readOptionalEnv("GMAIL_APP_PASSWORD"),
  stripeSecretKey: readOptionalEnv("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: readOptionalEnv("STRIPE_WEBHOOK_SECRET"),
  stripePublishableKey: readOptionalEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  stripePriceMembershipMonthly: readOptionalEnv(
    "STRIPE_PRICE_MEMBERSHIP_MONTHLY",
  ),
  stripePriceReikiRising: readOptionalEnv("STRIPE_PRICE_REIKI_RISING"),
  stripePriceSoundTraining: readOptionalEnv("STRIPE_PRICE_SOUND_TRAINING"),
  stripePriceGiftCertificate: readOptionalEnv("STRIPE_PRICE_GIFT_CERTIFICATE"),
};

export const integrations = {
  supabase:
    Boolean(env.supabaseUrl) &&
    Boolean(env.supabaseAnonKey) &&
    Boolean(env.supabaseServiceRoleKey),
  emailForwarding:
    Boolean(env.contactForwardTo) &&
    Boolean(env.emailFrom) &&
    Boolean(env.gmailAppPassword),
  stripe:
    Boolean(env.stripeSecretKey) && Boolean(env.stripePublishableKey),
};
