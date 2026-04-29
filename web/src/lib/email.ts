import nodemailer from "nodemailer";
import { env, integrations } from "@/lib/env";

function createTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.emailFrom,
      pass: env.gmailAppPassword,
    },
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

  const transporter = createTransport();

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

  await transporter.sendMail({
    from: env.emailFrom,
    to: env.contactForwardTo,
    replyTo: input.email,
    subject,
    text,
    html,
  });

  return { skipped: false };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
