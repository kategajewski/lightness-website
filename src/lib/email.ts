import nodemailer from "nodemailer";
import { env, integrations } from "@/lib/env";
import {
  createGiftCertificateCode,
  createGiftCertificatePdf,
} from "@/lib/gift-certificates";
import { getOfferBySlug } from "@/lib/offers";
import { site } from "@/lib/site";

type StripeCheckoutSession = {
  amount_total?: number | null;
  created?: number | null;
  currency?: string | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
  } | null;
  id?: string | null;
  metadata?: Record<string, string | undefined> | null;
  payment_intent?: string | { id?: string | null } | null;
};

type WebsiteEmailInput = {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
  attachments?: WebsiteEmailAttachment[];
};

type WebsiteEmailAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.gmailAuthUser || env.emailFrom,
      pass: env.gmailAppPassword,
    },
  });
}

async function sendWebsiteEmail(input: WebsiteEmailInput) {
  if (env.resendApiKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: input.from,
        to: input.to,
        reply_to: input.replyTo,
        subject: input.subject,
        text: input.text,
        html: input.html,
        attachments: input.attachments?.map((attachment) => ({
          filename: attachment.filename,
          content: attachment.content.toString("base64"),
        })),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend email failed: ${response.status} ${errorText}`);
    }

    return;
  }

  const transporter = createTransport();

  await transporter.sendMail({
    from: input.from,
    to: input.to,
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.text,
    html: input.html,
    attachments: input.attachments,
  });
}

type InquiryEmailInput = {
  name: string;
  email: string;
  phone?: string | null;
  inquiryType: string;
  message: string;
};

export async function sendInquiryForwardEmail(input: InquiryEmailInput) {
  if (!integrations.emailForwarding) {
    return { skipped: true };
  }

  const subject = `New website inquiry: ${input.name}`;
  const text = [
    "A new inquiry was submitted on bethelightness.com.",
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone || "Not provided"}`,
    `Inquiry Type: ${input.inquiryType || "general"}`,
    "",
    "Message:",
    input.message,
  ].join("\n");

  const html = `
    <div style="font-family: Georgia, serif; color: #3e342e; line-height: 1.6;">
      <h2 style="margin-bottom: 16px;">New website inquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(input.phone || "Not provided")}</p>
      <p><strong>Inquiry Type:</strong> ${escapeHtml(input.inquiryType || "general")}</p>
      <div style="margin-top: 24px;">
        <strong>Message:</strong>
        <p style="white-space: pre-line;">${escapeHtml(input.message)}</p>
      </div>
    </div>
  `;

  await sendWebsiteEmail({
    from: env.emailFrom,
    to: env.contactForwardTo,
    replyTo: input.email,
    subject,
    text,
    html,
  });

  return { skipped: false };
}

const eventEmailContent = {
  "sacred-sounds-under-the-sky": {
    title: "Sacred Sounds Under the Sky",
    intro:
      "Your ticket is confirmed. I’m so glad you’ll be joining this outdoor sound bath experience.",
    detailLines: [
      "Date: Saturday, May 23, 2026",
      "Time: 11:00 AM-12:00 PM",
      "Location: The Lightness Grounds, Bayport, NY",
      "Rain date: Sunday, May 24, 2026",
      "Weather updates: shared by 9:00 AM if the rain date is needed",
    ],
    reminderLines: [
      "Please dress in layers and bring a yoga mat, blanket, or anything else that helps you feel cozy and supported.",
      "This is a fully outdoor gathering and there are no bathroom facilities on site.",
    ],
    href: `${env.siteUrl}${site.links.sacredSoundsUnderTheSky}`,
    hrefLabel: "View event details",
  },
  "soothing-sunday-may-17-2026": {
    title: "Soothing Sunday - May 17, 2026",
    intro:
      "Your ticket is confirmed. I’m looking forward to sharing this gentle community gathering with you.",
    detailLines: [
      "Date: Sunday, May 17, 2026",
      "Location: Lindenhurst Village Square Gazebo",
      "Weather plan: outdoors if weather allows, otherwise indoors at Island Kava in Lindenhurst",
    ],
    reminderLines: [
      "You do not need any previous experience to come.",
      "Please dress comfortably, in layers and bring a yoga mat and blanket.",
    ],
    href: `${env.siteUrl}/soothing-sunday`,
    hrefLabel: "View Soothing Sunday details",
  },
  "soothing-sunday-june-14-2026": {
    title: "Soothing Sunday - June 14, 2026",
    intro:
      "Your ticket is confirmed. I’m looking forward to sharing this gentle community gathering with you.",
    detailLines: [
      "Date: Sunday, June 14, 2026",
      "Location: Lindenhurst Village Square Gazebo",
      "Weather plan: outdoors if weather allows, otherwise indoors at Island Kava in Lindenhurst",
    ],
    reminderLines: [
      "You do not need any previous experience to come.",
      "Please dress comfortably, in layers and bring a yoga mat and blanket.",
    ],
    href: `${env.siteUrl}/soothing-sunday`,
    hrefLabel: "View Soothing Sunday details",
  },
} as const;

export async function sendPurchaseConfirmationEmail(
  session: StripeCheckoutSession,
) {
  if (!integrations.emailDelivery) {
    return { skipped: true };
  }

  const email = session.customer_details?.email?.trim();

  if (!email) {
    return { skipped: true };
  }

  const metadata = session.metadata ?? {};
  const purchaseType = metadata.purchaseType;
  const amountLabel = formatAmount(session.amount_total, session.currency);
  const customerName = session.customer_details?.name?.trim() || "there";
  const giftCertificate =
    purchaseType === "offer" && metadata.offerSlug === "gift-certificate"
      ? await createGiftCertificatePdf({
          amountLabel: getGiftCertificateAmountLabel(
            metadata.optionKey,
            amountLabel,
          ),
          buyerName: session.customer_details?.name,
          purchasedAt: session.created,
          sessionId: session.id,
        })
      : null;

  const emailContent =
    purchaseType === "event"
      ? getEventPurchaseEmailContent(metadata.eventSlug, amountLabel)
      : getOfferPurchaseEmailContent(
          metadata.offerSlug,
          metadata.optionKey,
          amountLabel,
          giftCertificate?.certificateCode,
        );

  const text = [
    `Hi ${customerName},`,
    "",
    emailContent.intro,
    "",
    ...emailContent.detailLines,
    "",
    ...emailContent.reminderLines,
    "",
    `${emailContent.hrefLabel}: ${emailContent.href}`,
    "",
    giftCertificate
      ? "Your printable gift certificate PDF is attached to this email."
      : "A Stripe receipt should also arrive separately at this email address.",
    "",
    "With love,",
    "Kate",
    "The Lightness of Being",
  ].join("\n");

  const html = `
    <div style="font-family: Georgia, serif; color: #3e342e; line-height: 1.7; max-width: 680px; margin: 0 auto;">
      <p>Hi ${escapeHtml(customerName)},</p>
      <p>${escapeHtml(emailContent.intro)}</p>
      <div style="margin: 20px 0;">
        ${emailContent.detailLines
          .map((line) => `<p style="margin: 0 0 8px;"><strong>${escapeHtml(line)}</strong></p>`)
          .join("")}
      </div>
      <div style="margin: 20px 0;">
        ${emailContent.reminderLines
          .map((line) => `<p style="margin: 0 0 12px;">${escapeHtml(line)}</p>`)
          .join("")}
      </div>
      <p>
        <a href="${escapeHtml(emailContent.href)}" style="color: #5d5148; font-weight: bold;">
          ${escapeHtml(emailContent.hrefLabel)}
        </a>
      </p>
      <p>${
        giftCertificate
          ? "Your printable gift certificate PDF is attached to this email."
          : "A Stripe receipt should also arrive separately at this email address."
      }</p>
      <p style="margin-top: 28px;">With love,<br />Kate<br />The Lightness of Being</p>
    </div>
  `;

  await sendWebsiteEmail({
    from: env.emailFrom,
    to: email,
    subject: emailContent.subject,
    text,
    html,
    attachments: giftCertificate
      ? [
          {
            filename: giftCertificate.filename,
            content: giftCertificate.pdf,
            contentType: "application/pdf",
          },
        ]
      : undefined,
  });

  return { skipped: false };
}

export async function sendPurchaseOwnerNotificationEmail(
  session: StripeCheckoutSession,
) {
  if (!integrations.emailForwarding) {
    return { skipped: true };
  }

  const metadata = session.metadata ?? {};
  const amountLabel = formatAmount(session.amount_total, session.currency);
  const purchase = getOwnerPurchaseSummary(
    metadata.purchaseType,
    metadata.eventSlug,
    metadata.offerSlug,
    metadata.optionKey,
  );
  const customerName = session.customer_details?.name?.trim() || "Not provided";
  const customerEmail =
    session.customer_details?.email?.trim() || "Not provided";
  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  const purchasedAt = session.created
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "America/New_York",
      }).format(new Date(session.created * 1000))
    : "Not provided";
  const giftCertificateCode =
    metadata.purchaseType === "offer" && metadata.offerSlug === "gift-certificate"
      ? createGiftCertificateCode(session.id)
      : "";

  const lines = [
    "A new website checkout purchase was completed.",
    "",
    `Purchase: ${purchase}`,
    `Amount: ${amountLabel || "Not provided"}`,
    `Customer: ${customerName}`,
    `Customer email: ${customerEmail}`,
    `Purchased at: ${purchasedAt}`,
    giftCertificateCode ? `Gift certificate code: ${giftCertificateCode}` : null,
    `Stripe session: ${session.id || "Not provided"}`,
    `Payment intent: ${paymentIntent || "Not provided"}`,
  ].filter(Boolean) as string[];

  const text = lines.join("\n");
  const html = `
    <div style="font-family: Georgia, serif; color: #3e342e; line-height: 1.6;">
      <h2 style="margin-bottom: 16px;">New website purchase</h2>
      <p>A new checkout purchase was completed.</p>
      <p><strong>Purchase:</strong> ${escapeHtml(purchase)}</p>
      <p><strong>Amount:</strong> ${escapeHtml(amountLabel || "Not provided")}</p>
      <p><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
      <p><strong>Customer email:</strong> ${escapeHtml(customerEmail)}</p>
      <p><strong>Purchased at:</strong> ${escapeHtml(purchasedAt)}</p>
      ${
        giftCertificateCode
          ? `<p><strong>Gift certificate code:</strong> ${escapeHtml(giftCertificateCode)}</p>`
          : ""
      }
      <p><strong>Stripe session:</strong> ${escapeHtml(session.id || "Not provided")}</p>
      <p><strong>Payment intent:</strong> ${escapeHtml(paymentIntent || "Not provided")}</p>
    </div>
  `;

  await sendWebsiteEmail({
    from: env.emailFrom,
    to: env.contactForwardTo,
    replyTo:
      customerEmail === "Not provided" ? undefined : session.customer_details?.email ?? undefined,
    subject: `New website purchase: ${purchase}`,
    text,
    html,
  });

  return { skipped: false };
}

function getEventPurchaseEmailContent(
  eventSlug: string | undefined,
  amountLabel: string,
) {
  const event =
    eventSlug && eventEmailContent[eventSlug as keyof typeof eventEmailContent];

  if (event) {
    return {
      subject: `You're confirmed for ${event.title}`,
      intro: event.intro,
      detailLines: amountLabel
        ? [`Payment received: ${amountLabel}`, ...event.detailLines]
        : event.detailLines,
      reminderLines: event.reminderLines,
      href: event.href,
      hrefLabel: event.hrefLabel,
    };
  }

  return {
    subject: "Your event purchase is confirmed",
    intro:
      "Your purchase has been received, and your spot is confirmed.",
    detailLines: amountLabel ? [`Payment received: ${amountLabel}`] : [],
    reminderLines: [
      "If you have any questions before the event, you are always welcome to reach out.",
    ],
    href: `${env.siteUrl}${site.links.events}`,
    hrefLabel: "Browse events",
  };
}

function getOfferPurchaseEmailContent(
  offerSlug: string | undefined,
  optionKey: string | undefined,
  amountLabel: string,
  giftCertificateCode?: string,
) {
  const offer = offerSlug ? getOfferBySlug(offerSlug) : undefined;
  const option = offer?.purchaseOptions?.find((item) => item.key === optionKey);
  const title = option?.label || offer?.name || "your purchase";
  const detailLines = [amountLabel ? `Payment received: ${amountLabel}` : null]
    .filter(Boolean) as string[];

  if (offer?.slug === "monthly-membership") {
    return {
      subject: "Your Monthly Membership is confirmed",
      intro:
        "Your Monthly Rest & Reset Membership has been received. Thank you for saying yes to this rhythm of ongoing support.",
      detailLines,
      reminderLines: [
        "A Stripe receipt should arrive separately, and your membership access flow can be connected next through the site.",
        "If you need anything in the meantime, you are always welcome to reach out.",
      ],
      href: `${env.siteUrl}${site.links.membership}`,
      hrefLabel: "View membership details",
    };
  }

  if (offer?.slug === "sound-training") {
    return {
      subject: "Your Sound Practitioner Training purchase is confirmed",
      intro:
        "Your place in Sound Practitioner Training has been received. I'm so glad you'll be part of this experience.",
      detailLines,
      reminderLines: [
        option
          ? `Your selected option: ${option.label}.`
          : "Your training purchase has been recorded successfully.",
        "More training details and next steps can be shared with you directly as the event gets closer.",
      ],
      href: `${env.siteUrl}${site.links.soundTraining}`,
      hrefLabel: "View training details",
    };
  }

  if (offer?.slug === "gift-certificate") {
    return {
      subject: "Your gift certificate purchase is confirmed",
      intro:
        "Your gift certificate purchase has been received. Thank you for offering such a thoughtful kind of support.",
      detailLines: [
        ...detailLines,
        option ? `Gift amount: ${option.priceLabel}` : null,
        giftCertificateCode ? `Certificate code: ${giftCertificateCode}` : null,
      ].filter(Boolean) as string[],
      reminderLines: [
        "Your printable gift certificate PDF is attached to this email.",
        "The recipient can redeem it by contacting Kate and sharing the certificate code.",
      ],
      href: `${env.siteUrl}${site.links.giftCertificate}`,
      hrefLabel: "View gift certificate details",
    };
  }

  if (offer?.slug === "reiki-rising") {
    return {
      subject: "Your Reiki Rising purchase is confirmed",
      intro:
        "Your Reiki Rising purchase has been received. Thank you for joining this training path.",
      detailLines,
      reminderLines: [
        "A Stripe receipt should arrive separately, and additional next-step details can be shared directly with you.",
      ],
      href: `${env.siteUrl}${site.links.reikiTraining}`,
      hrefLabel: "View Reiki Rising details",
    };
  }

  return {
    subject: `Your purchase is confirmed`,
    intro: `Your payment for ${title} has been received.`,
    detailLines,
    reminderLines: [
      "A Stripe receipt should also arrive separately at this email address.",
    ],
    href: `${env.siteUrl}${site.links.courses}`,
    hrefLabel: "Browse offers",
  };
}

function getOwnerPurchaseSummary(
  purchaseType: string | undefined,
  eventSlug: string | undefined,
  offerSlug: string | undefined,
  optionKey: string | undefined,
) {
  if (purchaseType === "event") {
    const event = eventSlug
      ? eventEmailContent[eventSlug as keyof typeof eventEmailContent]
      : undefined;

    return event?.title || "Event ticket";
  }

  const offer = offerSlug ? getOfferBySlug(offerSlug) : undefined;
  const option = offer?.purchaseOptions?.find((item) => item.key === optionKey);

  if (offer?.slug === "sound-training") {
    return offer.name;
  }

  return option?.label || offer?.name || "Website purchase";
}

function formatAmount(amountTotal?: number | null, currency?: string | null) {
  if (amountTotal == null || !currency) {
    return "";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amountTotal / 100);
}

function getGiftCertificateAmountLabel(
  optionKey: string | undefined,
  fallbackAmountLabel: string,
) {
  const offer = getOfferBySlug("gift-certificate");
  const option = offer?.purchaseOptions?.find((item) => item.key === optionKey);

  return option?.priceLabel || fallbackAmountLabel || "Gift Certificate";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
