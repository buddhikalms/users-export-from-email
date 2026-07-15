import nodemailer from "nodemailer";

import { logApiEvent } from "@/lib/api-guard";

type MailAction = {
  label: string;
  href: string;
};

type MailSection = {
  title?: string;
  lines: string[];
};

type BrandedMail = {
  preheader: string;
  title: string;
  intro: string;
  sections?: MailSection[];
  action?: MailAction;
};

type SendMailInput = BrandedMail & {
  to: string | string[];
  subject: string;
  replyTo?: string;
};

type ContactNotificationInput = {
  name: string;
  email: string;
  company?: string;
  message: string;
};

type UserNotificationInput = {
  name: string;
  email: string;
};

type InvoiceNotificationInput = {
  name?: string | null;
  email: string;
  plan: string;
  status: string;
  subscriptionId?: string | null;
  nextBillingTime?: string | Date | null;
  amount?: string | null;
};

const supportEmail = process.env.SUPPORT_EMAIL || "support@omazync.com";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://omazync.com";

function getMailConfig() {
  const user = process.env.GMAIL_SMTP_USER || process.env.SMTP_USER;
  const pass = process.env.GMAIL_SMTP_APP_PASSWORD || process.env.SMTP_PASSWORD;
  const from = process.env.MAIL_FROM || (user ? `OMAZYNC <${user}>` : "");

  if (!user || !pass || !from) {
    return null;
  }

  return { user, pass, from };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(value?: string | Date | null) {
  if (!value) return "Not available";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function renderTemplate({ preheader, title, intro, sections = [], action }: BrandedMail) {
  const sectionHtml = sections
    .map((section) => {
      const lines = section.lines
        .map((line) => `<p style="margin:0 0 10px;color:#475569;font-size:15px;line-height:1.7;">${escapeHtml(line)}</p>`)
        .join("");
      return `
        <tr>
          <td style="padding:18px 0 0;">
            ${section.title ? `<h2 style="margin:0 0 10px;color:#0f172a;font-size:17px;line-height:1.4;">${escapeHtml(section.title)}</h2>` : ""}
            ${lines}
          </td>
        </tr>
      `;
    })
    .join("");

  const actionHtml = action
    ? `
      <tr>
        <td style="padding:24px 0 6px;">
          <a href="${escapeHtml(action.href)}" style="display:inline-block;border-radius:999px;background:#007fd4;color:#ffffff;font-size:15px;font-weight:700;line-height:1;padding:15px 22px;text-decoration:none;">
            ${escapeHtml(action.label)}
          </a>
        </td>
      </tr>
    `
    : "";

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;border-radius:24px;overflow:hidden;background:#ffffff;border:1px solid #dbe7f3;">
            <tr>
              <td style="background:#06162f;padding:28px 32px;">
                <div style="color:#ffffff;font-size:23px;font-weight:800;letter-spacing:0.02em;">OMAZYNC</div>
                <div style="margin-top:8px;color:#a5f3fc;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.16em;">Email Contact Automation</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0;color:#0f172a;font-size:30px;line-height:1.2;">${escapeHtml(title)}</h1>
                <p style="margin:16px 0 0;color:#334155;font-size:16px;line-height:1.7;">${escapeHtml(intro)}</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${sectionHtml}
                  ${actionHtml}
                </table>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #e2e8f0;padding:20px 32px;color:#64748b;font-size:13px;line-height:1.6;">
                Need help? Reply to this email or contact ${escapeHtml(supportEmail)}.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function renderText({ title, intro, sections = [], action }: BrandedMail) {
  return [
    title,
    "",
    intro,
    "",
    ...sections.flatMap((section) => [
      ...(section.title ? [section.title] : []),
      ...section.lines,
      "",
    ]),
    ...(action ? [`${action.label}: ${action.href}`, ""] : []),
    `Need help? Contact ${supportEmail}.`,
  ].join("\n");
}

export async function sendBrandedMail(input: SendMailInput) {
  const config = getMailConfig();
  if (!config) {
    logApiEvent("warn", "email.skipped", {
      reason: "SMTP is not configured.",
      subject: input.subject,
    });
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_SECURE || "true") !== "false",
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to: input.to,
    replyTo: input.replyTo || supportEmail,
    subject: input.subject,
    html: renderTemplate(input),
    text: renderText(input),
  });

  return { skipped: false };
}

export async function safelySendMail(input: SendMailInput) {
  try {
    return await sendBrandedMail(input);
  } catch (error) {
    logApiEvent("error", "email.failed", {
      subject: input.subject,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return { skipped: true };
  }
}

export async function sendContactNotifications(input: ContactNotificationInput) {
  const recipients = process.env.NOTIFICATION_EMAIL || supportEmail;

  await safelySendMail({
    to: recipients,
    replyTo: input.email,
    subject: `New OMAZYNC contact request from ${input.name}`,
    preheader: `${input.name} submitted the contact form.`,
    title: "New contact form message",
    intro: "A new visitor submitted the OMAZYNC contact form.",
    sections: [
      {
        title: "Lead details",
        lines: [
          `Name: ${input.name}`,
          `Email: ${input.email}`,
          `Company: ${input.company || "Not provided"}`,
        ],
      },
      {
        title: "Message",
        lines: [input.message],
      },
    ],
  });

  await safelySendMail({
    to: input.email,
    subject: "We received your OMAZYNC message",
    preheader: "Thanks for contacting OMAZYNC.",
    title: "Thanks for reaching out",
    intro: `Hi ${input.name}, thanks for contacting OMAZYNC. We received your message and will reply from ${supportEmail}.`,
    sections: [
      {
        title: "Your message",
        lines: [input.message],
      },
    ],
    action: {
      label: "Book a demo",
      href: `${appUrl}/book-demo`,
    },
  });
}

export async function sendRegistrationNotifications(input: UserNotificationInput) {
  await safelySendMail({
    to: input.email,
    subject: "Welcome to OMAZYNC",
    preheader: "Your OMAZYNC account is ready.",
    title: "Your account is ready",
    intro: `Hi ${input.name}, welcome to OMAZYNC. You can now connect your mailbox, scan selected folders, and turn inbox history into clean contact data.`,
    sections: [
      {
        title: "Next step",
        lines: ["Sign in, connect a mailbox, and choose the folders you want to scan."],
      },
    ],
    action: {
      label: "Open OMAZYNC",
      href: `${appUrl}/login`,
    },
  });

  await safelySendMail({
    to: process.env.NOTIFICATION_EMAIL || supportEmail,
    subject: `New OMAZYNC registration: ${input.email}`,
    preheader: "A new user registered for OMAZYNC.",
    title: "New user registration",
    intro: "A new account was created.",
    sections: [
      {
        title: "User details",
        lines: [`Name: ${input.name}`, `Email: ${input.email}`],
      },
    ],
  });
}

export async function sendInvoiceNotification(input: InvoiceNotificationInput) {
  await safelySendMail({
    to: input.email,
    subject: `OMAZYNC ${input.plan} subscription update`,
    preheader: "Your OMAZYNC billing status has been updated.",
    title: "Billing update",
    intro: `Hi ${input.name || "there"}, your OMAZYNC subscription is now ${input.status.toLowerCase()}.`,
    sections: [
      {
        title: "Invoice details",
        lines: [
          `Plan: ${input.plan}`,
          `Status: ${input.status}`,
          `Amount: ${input.amount || "Handled by PayPal"}`,
          `Subscription ID: ${input.subscriptionId || "Not available"}`,
          `Next billing date: ${formatDate(input.nextBillingTime)}`,
        ],
      },
    ],
    action: {
      label: "Manage billing",
      href: `${appUrl}/settings`,
    },
  });
}
