const nodemailer = require('nodemailer');
const { getAppSetting } = require('./app-settings');

async function getSmtpConfig() {
  const host = String((await getAppSetting('smtp_host')) || process.env.BREVO_SMTP_HOST || '').trim();
  const port = Number((await getAppSetting('smtp_port')) || process.env.BREVO_SMTP_PORT || 587);
  const user = String((await getAppSetting('smtp_user')) || process.env.BREVO_SMTP_USER || '').trim();
  const pass = String((await getAppSetting('smtp_pass')) || process.env.BREVO_SMTP_PASS || '').trim();
  const fromEmail = String((await getAppSetting('smtp_from_email')) || process.env.BREVO_FROM_EMAIL || '').trim();
  const fromName = String((await getAppSetting('smtp_from_name')) || process.env.BREVO_FROM_NAME || 'JelloChat').trim();
  return { host, port, user, pass, fromEmail, fromName };
}

function buildTransport({ host, port, user, pass }) {
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

async function isMailerConfigured() {
  const config = await getSmtpConfig();
  return Boolean(config.host && config.user && config.pass && config.fromEmail);
}

async function sendMail({ to, subject, text, html }) {
  const config = await getSmtpConfig();
  const transporter = buildTransport(config);
  if (!transporter) {
    return { ok: false, message: 'SMTP is not configured.' };
  }
  if (!config.fromEmail) {
    return { ok: false, message: 'SMTP sender email is not configured.' };
  }

  await transporter.sendMail({
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to,
    subject,
    text,
    html
  });
  return { ok: true };
}

module.exports = { sendMail, isMailerConfigured };
