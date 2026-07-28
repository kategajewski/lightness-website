import nodemailer from "nodemailer";
import { env, integrations } from "@/lib/env";
import {
  createGiftCertificateCode,
  createGiftCertificatePdf,
} from "@/lib/gift-certificates";
import { getOfferBySlug } from "@/lib/offers";
import type { PortalProvisioningResult } from "@/lib/portal-access";
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

export function canSendPurchaseOwnerNotification() {
  return Boolean(getOwnerNotificationRecipients().length) && canSendWebsiteEmail();
}

function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.gmailAuthUser || env.emailFrom,
      pass: env.gmailAppPassword,
    },
  });
}

function canSendGmailEmail() {
  return (
    Boolean(env.gmailAuthUser || env.emailFrom) &&
    Boolean(env.gmailAppPassword)
  );
}

function canSendWebsiteEmail() {
  return (
    Boolean(env.emailFrom) &&
    (Boolean(env.resendApiKey) || canSendGmailEmail())
  );
}

function getOwnerNotificationRecipients() {
  const configuredRecipients = env.contactForwardTo
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

  return Array.from(new Set([...configuredRecipients, ...site.adminEmails]));
}

async function sendWebsiteEmail(input: WebsiteEmailInput) {
  if (env.resendApiKey) {
    try {
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
    } catch (error) {
      if (!canSendGmailEmail()) {
        throw error;
      }

      console.error("Resend email failed; falling back to Gmail", error);
    }
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
  customOrderDetails?: {
    label: string;
    value: string;
  }[];
};

export async function sendInquiryForwardEmail(input: InquiryEmailInput) {
  if (!integrations.emailForwarding) {
    return { skipped: true };
  }

  const isCustomRoseOrder = input.inquiryType === "rose-frequency";
  const inquiryLabel = isCustomRoseOrder
    ? "Divine Rose Frequency custom order"
    : input.inquiryType || "general";
  const customOrderLines = input.customOrderDetails?.length
    ? [
        "",
        "Custom Order Details:",
        ...input.customOrderDetails.map(
          (detail) => `${detail.label}: ${detail.value}`,
        ),
      ]
    : [];
  const customOrderHtml = input.customOrderDetails?.length
    ? `
      <div style="margin-top: 24px;">
        <strong>Custom order details:</strong>
        <table style="border-collapse: collapse; margin-top: 10px; width: 100%;">
          <tbody>
            ${input.customOrderDetails
              .map(
                (detail) => `
                  <tr>
                    <td style="border-top: 1px solid #eadfd5; padding: 8px 12px 8px 0; font-weight: bold; vertical-align: top;">${escapeHtml(detail.label)}</td>
                    <td style="border-top: 1px solid #eadfd5; padding: 8px 0; vertical-align: top; white-space: pre-line;">${escapeHtml(detail.value)}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `
    : "";
  const subject = isCustomRoseOrder
    ? `New custom rosary order: ${input.name}`
    : `New website inquiry: ${input.name}`;
  const text = [
    "A new inquiry was submitted on bethelightness.com.",
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone || "Not provided"}`,
    `Inquiry Type: ${inquiryLabel}`,
    ...customOrderLines,
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
      <p><strong>Inquiry Type:</strong> ${escapeHtml(inquiryLabel)}</p>
      ${customOrderHtml}
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
  "rise-into-light": {
    title: "Rise into Light",
    intro:
      "Your place is confirmed. I'm so glad you'll be joining Rise into Light for this summer solstice yoga and sound journey.",
    detailLines: [
      "Date: Sunday, June 21, 2026",
      "Time: 8:00 AM",
      "Length: 75 minutes",
      "Location: The Lightness Grounds, corner of Gillette Avenue and Academy Street, Bayport, NY",
      "Refund policy: All purchases are final and non-refundable.",
    ],
    reminderLines: [
      "Please bring a yoga mat, blanket, water, and anything that helps you feel comfortable outdoors.",
      "There is no rain date for this event. All purchases are final and non-refundable.",
    ],
    href: `${env.siteUrl}${site.links.riseIntoLight}`,
    hrefLabel: "View event details",
  },
  "golden-hour-summer-solstice-sound-journey": {
    title: "Golden Hour: A Summer Solstice Sound Journey",
    intro:
      "Your place is confirmed. I’m so glad you’ll be joining this golden-hour summer solstice sound journey.",
    detailLines: [
      "Date: Wednesday, June 24, 2026",
      "Time: 7:30 PM",
      "Location: The Lightness Grounds, Bayport, NY",
      "Rain date: Thursday, June 25, 2026 at 7:30 PM",
      "Day-of tickets: $35 if space is still available",
    ],
    reminderLines: [
      "Please dress in layers and bring a yoga mat, blanket, or anything else that helps you feel cozy, settled, and supported.",
      "This is a fully outdoor gathering and there are no bathroom facilities on site.",
      "If weather shifts the event, tickets move to the rain date and remain non-refundable.",
    ],
    href: `${env.siteUrl}${site.links.sacredSoundsUnderTheSky}`,
    hrefLabel: "View event details",
  },
  "golden-hour-july-28-2026": {
    title: "Golden Hour: An Outdoor Sound Journey",
    intro:
      "Your place is confirmed. I'm so glad you'll be joining this golden-hour outdoor sound journey.",
    detailLines: [
      "Date: Wednesday, July 29, 2026",
      "Time: 7:30 PM",
      "Location: The Lightness Grounds, Bayport, NY",
      "Rescheduled from: Tuesday, July 28, 2026",
      "Day-of tickets: $35 if space is still available",
    ],
    reminderLines: [
      "Please dress in layers and bring a yoga mat, blanket, or anything else that helps you feel cozy, settled, and supported.",
      "This is a fully outdoor gathering and there are no bathroom facilities on site.",
      "This event has moved to Wednesday because of weather. Tickets are non-refundable.",
    ],
    href: `${env.siteUrl}${site.links.goldenHourJuly}`,
    hrefLabel: "View event details",
  },
  "golden-hour-august-25-2026": {
    title: "Golden Hour: An Outdoor Sound Journey",
    intro:
      "Your place is confirmed. I'm so glad you'll be joining this golden-hour outdoor sound journey.",
    detailLines: [
      "Date: Tuesday, August 25, 2026",
      "Time: 7:30 PM",
      "Location: The Lightness Grounds, Bayport, NY",
      "Rain date: Thursday, August 27, 2026 at 7:30 PM",
      "Day-of tickets: $35 if space is still available",
    ],
    reminderLines: [
      "Please dress in layers and bring a yoga mat, blanket, or anything else that helps you feel cozy, settled, and supported.",
      "This is a fully outdoor gathering and there are no bathroom facilities on site.",
      "If weather shifts the event, tickets move to the rain date and remain non-refundable.",
    ],
    href: `${env.siteUrl}/golden-hour-august-25`,
    hrefLabel: "View event details",
  },
  "reiki-share-july-1-2026": {
    title: "Reiki Share",
    intro:
      "Your place is confirmed. I’m so glad you’ll be joining Reiki Share.",
    detailLines: [
      "Date: Wednesday, July 1, 2026",
      "Time: 7:00-9:00 PM",
      "Location: The Lightness of Being, 98 Medford Ave, Patchogue, NY 11772",
      "This gathering is for Reiki practitioners only.",
      "Space is limited to 7 people.",
    ],
    reminderLines: [
      "We will gather to form community, talk all things Reiki, and share practice with one another.",
      "Please come as you are, ready to connect, practice, and receive.",
      "All purchases are final and non-refundable.",
    ],
    href: `${env.siteUrl}${site.links.reikiShareJuly}`,
    hrefLabel: "View event details",
  },
  "reiki-share-august-6-2026": {
    title: "Reiki Share",
    intro:
      "Your place is confirmed. I'm so glad you'll be joining Reiki Share.",
    detailLines: [
      "Date: Thursday, August 6, 2026",
      "Time: 7:00-9:00 PM",
      "Location: The Lightness of Being, 98 Medford Ave, Patchogue, NY 11772",
      "This gathering is for Reiki practitioners only.",
      "Space is limited to 7 people.",
    ],
    reminderLines: [
      "We will gather to form community, talk all things Reiki, and share practice with one another.",
      "Please come as you are, ready to connect, practice, and receive.",
      "All purchases are final and non-refundable.",
    ],
    href: `${env.siteUrl}${site.links.reikiShare}`,
    hrefLabel: "View event details",
  },
  "the-weekend-reset-july-11-2026": {
    title: "The Weekend Reset",
    intro:
      "Your place is confirmed. I'm so glad you'll be joining The Weekend Reset for this gentle morning of yoga and sound healing.",
    detailLines: [
      "Date: Saturday, July 11, 2026",
      "Time: 8:00-9:15 AM",
      "Length: 75 minutes",
      "Location: The Lightness Grounds, corner of Gillette Avenue and Academy Street, Bayport, NY",
      "Rain date: Sunday, July 12, 2026",
    ],
    reminderLines: [
      "Please bring a yoga mat, blanket, water, and anything that helps you feel comfortable outdoors.",
      "If rain moves the gathering, tickets move to the Sunday, July 12, 2026 rain date and remain non-refundable.",
    ],
    href: `${env.siteUrl}${site.links.theWeekendReset}`,
    hrefLabel: "View event details",
  },
  "flow-field-august-16-2026": {
    title: "Flow Field",
    intro:
      "Your place is confirmed. I'm so glad you'll be joining Flow Field with Kate Gajewski and Kelly Fitzsimons.",
    detailLines: [
      "Date: Thursday, August 20, 2026",
      "Time: 6:30-8:00 PM",
      "Length: 90 minutes",
      "Location: The Lightness Grounds, corner of Gillette Avenue and Academy Street, Bayport, NY",
      "Exchange: $45",
    ],
    reminderLines: [
      "Please bring a yoga mat, blanket or towel, water, and layers for the sound healing portion.",
      "If rain cancels the gathering, tickets will be refunded and everyone will be alerted by email the night before.",
      "Otherwise, tickets are non-refundable, but they may be transferred to someone else.",
    ],
    href: `${env.siteUrl}${site.links.flowField}`,
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
  portalAccess?: PortalProvisioningResult,
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
          portalAccess,
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
  const siteUrl = env.siteUrl.replace(/\/$/, "");
  const logoUrl = `${siteUrl}/homepage-images/hand-logo.png`;
  const detailHtml = emailContent.detailLines
    .map(
      (line) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid rgba(76,58,48,0.08);">
            <p style="margin: 0; color: #4c3a30; font-family: 'Lato', Arial, sans-serif; font-size: 15px; line-height: 1.55; font-weight: 600;">${escapeHtml(line)}</p>
          </td>
        </tr>
      `,
    )
    .join("");
  const reminderHtml = emailContent.reminderLines
    .map(
      (line) => `
        <li style="margin: 0 0 12px; padding-left: 2px; color: #6f625a; font-family: 'Lato', Arial, sans-serif; font-size: 15px; line-height: 1.65;">
          ${escapeHtml(line)}
        </li>
      `,
    )
    .join("");

  const html = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Lato:wght@300;400;700&display=swap');
    </style>
    <div style="margin: 0; padding: 32px 16px; background: #f6eee5;">
      <div style="max-width: 680px; margin: 0 auto; font-family: 'Lato', Arial, sans-serif; color: #3e342e;">
        <div style="text-align: center; padding: 8px 0 22px;">
          <img src="${escapeHtml(logoUrl)}" alt="The Lightness of Being" width="64" height="64" style="display: inline-block; width: 64px; height: 64px; border-radius: 999px; object-fit: cover; opacity: 0.95;" />
          <p style="margin: 12px 0 0; color: #7b6c62; font-family: 'Lato', Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;">
            The Lightness of Being
          </p>
        </div>

        <div style="overflow: hidden; border: 1px solid rgba(76,58,48,0.1); border-radius: 28px; background: #fffaf4; box-shadow: 0 20px 60px rgba(59,41,31,0.08);">
          <div style="padding: 34px 34px 26px; background: linear-gradient(135deg, #fffaf4 0%, #f2e3d5 100%); border-bottom: 1px solid rgba(76,58,48,0.08);">
            <p style="margin: 0 0 10px; color: #7b6c62; font-family: 'Lato', Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;">
              ${escapeHtml(emailContent.subject)}
            </p>
            <h1 style="margin: 0; color: #342923; font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; font-size: 36px; line-height: 1.08; font-weight: 300;">
              Hi ${escapeHtml(customerName)},
            </h1>
            <p style="margin: 18px 0 0; color: #5f524a; font-family: 'Lato', Arial, sans-serif; font-size: 16px; line-height: 1.7;">
              ${escapeHtml(emailContent.intro)}
            </p>
          </div>

          <div style="padding: 28px 34px 10px;">
            <div style="padding: 22px 22px 12px; border-radius: 22px; background: #fff4eb; border: 1px solid rgba(76,58,48,0.08);">
              <p style="margin: 0 0 8px; color: #7b6c62; font-family: 'Lato', Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;">
                Details
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                <tbody>${detailHtml}</tbody>
              </table>
            </div>
          </div>

          <div style="padding: 18px 34px 4px;">
            <p style="margin: 0 0 14px; color: #7b6c62; font-family: 'Lato', Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;">
              Next Steps
            </p>
            <ul style="margin: 0; padding-left: 20px;">
              ${reminderHtml}
            </ul>
          </div>

          <div style="padding: 22px 34px 28px; text-align: center;">
            <a href="${escapeHtml(emailContent.href)}" style="display: inline-block; border-radius: 999px; background: #4c3a30; color: #fffaf4; font-family: 'Lato', Arial, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-decoration: none; text-transform: uppercase; padding: 15px 24px;">
              ${escapeHtml(emailContent.hrefLabel)}
            </a>
            <p style="margin: 18px auto 0; max-width: 420px; color: #7b6c62; font-family: 'Lato', Arial, sans-serif; font-size: 14px; line-height: 1.65;">
              ${
                giftCertificate
                  ? "Your printable gift certificate PDF is attached to this email."
                  : "A Stripe receipt should also arrive separately at this email address."
              }
            </p>
          </div>

          <div style="padding: 24px 34px 30px; background: #f8eee4; border-top: 1px solid rgba(76,58,48,0.08);">
            <p style="margin: 0; color: #5f524a; font-family: 'Cormorant Garamond', Georgia, 'Times New Roman', serif; font-size: 22px; line-height: 1.35; font-style: italic;">
              With love,<br />
              Kate
            </p>
            <p style="margin: 8px 0 0; color: #7b6c62; font-family: 'Lato', Arial, sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;">
              The Lightness of Being
            </p>
          </div>
        </div>
      </div>
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
  const recipients = getOwnerNotificationRecipients();

  if (!recipients.length || !canSendWebsiteEmail()) {
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
    to: recipients.join(", "),
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
  portalAccess?: PortalProvisioningResult,
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
        "The recipient can redeem it through bethelightness.com using the certificate code.",
      ],
      href: `${env.siteUrl}${site.links.giftCertificate}`,
      hrefLabel: "View gift certificate details",
    };
  }

  if (offer?.slug === "reiki-rising") {
    const setupHref =
      portalAccess?.setupUrl ??
      `${env.siteUrl.replace(/\/$/, "")}/login?mode=forgot-password`;

    return {
      subject: "Welcome to Reiki Rising Fall 2026",
      intro:
        "Your Reiki Rising enrollment has been received. I'm so grateful for your trust and so excited to welcome you into this Fall 2026 cohort.",
      detailLines: [
        ...detailLines,
        "Program dates: September 27 - December 5, 2026",
        "Weekly modules: Released on Sundays",
        "Live calls: Wednesdays at 7:00 PM ET",
        "Telegram support: Open through Saturday, December 5, 2026",
        option ? `Selected option: ${option.label}` : null,
      ].filter(Boolean) as string[],
      reminderLines: [
        portalAccess?.setupUrl
          ? "Your Reiki Rising student portal access has been created using the email address you enrolled with. Begin by selecting Set Your Portal Password below."
          : "Your Reiki Rising student portal access is connected to the email address you enrolled with. Select Open Portal Login below and use Forgot Password if you still need to create your password.",
        "Once your password is created, you'll be able to enter the Fall 2026 portal. Your welcome materials, weekly modules, live-call links, replays, placement information, and make-up-call details will be added there as the cohort approaches.",
        "Please purchase the Reiki Level 1 & 2 textbook here: https://www.reiki.org/store/books/reiki-healing-touch",
        "The bookstore automatically selects the digital edition, so please choose whether you would like the digital book, printed book, or both before completing your purchase.",
        "You may also want to choose a special notebook or journal for reflections, practice notes, and questions throughout your Reiki Rising journey.",
        "You'll receive another email closer to the start date with preparation guidance, the Telegram community link, and everything you need for your first week.",
      ],
      href: setupHref,
      hrefLabel: portalAccess?.setupUrl
        ? "Set Your Portal Password"
        : "Open Portal Login",
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
