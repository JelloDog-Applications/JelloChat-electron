const nodemailer = require('nodemailer');

function createTransport() {
  const host = String(process.env.BREVO_SMTP_HOST || '').trim();
  const port = Number(process.env.BREVO_SMTP_PORT || 587);
  const user = String(process.env.BREVO_SMTP_USER || '').trim();
  const pass = String(process.env.BREVO_SMTP_PASS || '').trim();

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
}

async function sendMail({ to, subject, text, html }) {
  const transporter = createTransport();
  if (!transporter) {
    return { ok: false, message: 'Brevo SMTP is not configured.' };
  }

  const fromEmail = String(process.env.BREVO_FROM_EMAIL || '').trim();
  const fromName = String(process.env.BREVO_FROM_NAME || 'JelloChat').trim();
  if (!fromEmail) {
    return { ok: false, message: 'BREVO_FROM_EMAIL is not configured.' };
  }

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text,
    html
  });
  return { ok: true };
}

module.exports = { sendMail };
