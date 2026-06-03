import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a notification email to a list of recipients.
 * @param {string[]} emails
 * @param {{ title: string, message: string, type: string, priority: string, senderName: string }} notification
 */
export async function sendNotificationEmails(emails, notification) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP not configured — skipping email send.");
    return;
  }
  if (!emails.length) return;

  const priorityLabel = notification.priority?.toUpperCase() || "LOW";
  const typeEmoji = { info: "ℹ️", success: "✅", warning: "⚠️", error: "🚨" }[notification.type] || "ℹ️";

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
      <div style="background:#4f46e5;padding:20px 24px">
        <h2 style="color:#fff;margin:0;font-size:18px">${typeEmoji} ${notification.title}</h2>
        <span style="color:#c7d2fe;font-size:12px">Priority: ${priorityLabel}</span>
      </div>
      <div style="padding:24px">
        <p style="color:#374151;font-size:15px;line-height:1.6;margin:0 0 16px">${notification.message}</p>
        <p style="color:#9ca3af;font-size:12px;margin:0">Sent by <strong>${notification.senderName}</strong> via ChronoCampus</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"ChronoCampus" <${process.env.SMTP_USER}>`,
    bcc: emails,          // BCC so recipients don't see each other
    subject: `[ChronoCampus] ${notification.title}`,
    html,
  });
}
