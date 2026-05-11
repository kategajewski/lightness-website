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
  gmailAuthUser: readOptionalEnv("GMAIL_AUTH_USER"),
  gmailAppPassword: readOptionalEnv("GMAIL_APP_PASSWORD"),
  resendApiKey: readOptionalEnv("RESEND_API_KEY"),
  mailchimpApiKey: readOptionalEnv("MAILCHIMP_API_KEY"),
  mailchimpAudienceId: readOptionalEnv("MAILCHIMP_AUDIENCE_ID"),
  turnstileSiteKey: readOptionalEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY"),
  turnstileSecretKey: readOptionalEnv("TURNSTILE_SECRET_KEY"),
  stripeSecretKey: readOptionalEnv("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: readOptionalEnv("STRIPE_WEBHOOK_SECRET"),
  stripePublishableKey: readOptionalEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  stripePriceMembershipMonthly: readOptionalEnv(
    "STRIPE_PRICE_MEMBERSHIP_MONTHLY",
  ),
  stripePriceReikiRising: readOptionalEnv("STRIPE_PRICE_REIKI_RISING"),
  stripePriceSoundTraining: readOptionalEnv("STRIPE_PRICE_SOUND_TRAINING"),
  stripePriceSoundTrainingFull: readOptionalEnv(
    "STRIPE_PRICE_SOUND_TRAINING_FULL",
  ),
  stripePriceSoundTrainingPlan: readOptionalEnv(
    "STRIPE_PRICE_SOUND_TRAINING_PLAN",
  ),
  stripePriceGiftCertificate: readOptionalEnv("STRIPE_PRICE_GIFT_CERTIFICATE"),
  stripePriceGiftCertificate50: readOptionalEnv(
    "STRIPE_PRICE_GIFT_CERTIFICATE_50",
  ),
  stripePriceGiftCertificate100: readOptionalEnv(
    "STRIPE_PRICE_GIFT_CERTIFICATE_100",
  ),
  stripePriceGiftCertificate140: readOptionalEnv(
    "STRIPE_PRICE_GIFT_CERTIFICATE_140",
  ),
  stripePriceGiftCertificate250: readOptionalEnv(
    "STRIPE_PRICE_GIFT_CERTIFICATE_250",
  ),
  stripePriceGiftCertificate500: readOptionalEnv(
    "STRIPE_PRICE_GIFT_CERTIFICATE_500",
  ),
};

export const integrations = {
  supabase:
    Boolean(env.supabaseUrl) &&
    Boolean(env.supabaseAnonKey) &&
    Boolean(env.supabaseServiceRoleKey),
  emailDelivery:
    Boolean(env.emailFrom) &&
    (Boolean(env.resendApiKey) ||
      (Boolean(env.gmailAuthUser || env.emailFrom) &&
        Boolean(env.gmailAppPassword))),
  emailForwarding:
    Boolean(env.contactForwardTo) &&
    Boolean(env.emailFrom) &&
    (Boolean(env.resendApiKey) ||
      (Boolean(env.gmailAuthUser || env.emailFrom) &&
        Boolean(env.gmailAppPassword))),
  stripe:
    Boolean(env.stripeSecretKey) && Boolean(env.stripePublishableKey),
  mailchimp:
    Boolean(env.mailchimpApiKey) && Boolean(env.mailchimpAudienceId),
  turnstile:
    Boolean(env.turnstileSiteKey) && Boolean(env.turnstileSecretKey),
};
