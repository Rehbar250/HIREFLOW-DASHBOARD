import nodemailer from "nodemailer";

export function fillTemplate(
  text: string,
  vars: { name?: string; role?: string; company?: string }
): string {
  return (text || "")
    .replaceAll("{{name}}", vars.name || "")
    .replaceAll("{{role}}", vars.role || "")
    .replaceAll("{{company}}", vars.company || "");
}

export async function sendEmail(opts: { to: string; subject: string; body: string }) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    // Dev fallback: no SMTP configured — log instead of failing.
    console.log(`[email:dev] to=${opts.to} subject="${opts.subject}"`);
    return { delivered: false, reason: "SMTP not configured — logged to server console." };
  }
  const transport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await transport.sendMail({
    from: process.env.EMAIL_FROM || "talent@example.com",
    to: opts.to,
    subject: opts.subject,
    text: opts.body,
  });
  return { delivered: true };
}
