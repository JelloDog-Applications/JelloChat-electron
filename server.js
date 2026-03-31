const http = require('http');
const path = require('path');
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');
const fs = require('fs');
const db = require('./db');
const { sendMail } = require('./mailer');

const WEB_PORT = Number(process.env.WEB_PORT || 3000);
const IP_REPUTATION_BLOCK_THRESHOLD = Number(process.env.IP_REPUTATION_BLOCK_THRESHOLD || 8);
const IP_REPUTATION_BLOCK_MINUTES = Number(process.env.IP_REPUTATION_BLOCK_MINUTES || 30);
const IP_REPUTATION_DECAY_HOURS = Number(process.env.IP_REPUTATION_DECAY_HOURS || 6);

const app = express();
app.use(express.json());

function readPolicyMarkdown(filename) {
  const filePath = path.join(__dirname, filename);
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (_error) {
    return null;
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inlineMarkdownToHtml(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function renderMarkdownPage(title, markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const htmlParts = [];
  let listItems = [];

  function flushList() {
    if (!listItems.length) {
      return;
    }
    htmlParts.push(`<ul>${listItems.join('')}</ul>`);
    listItems = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    if (trimmed.startsWith('# ')) {
      flushList();
      htmlParts.push(`<h1>${inlineMarkdownToHtml(trimmed.slice(2))}</h1>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      htmlParts.push(`<h2>${inlineMarkdownToHtml(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('- ')) {
      listItems.push(`<li>${inlineMarkdownToHtml(trimmed.slice(2))}</li>`);
      continue;
    }

    flushList();
    htmlParts.push(`<p>${inlineMarkdownToHtml(trimmed)}</p>`);
  }

  flushList();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      body { font-family: Arial, sans-serif; background: #0f172a; color: #e5e7eb; margin: 0; }
      main { width: min(92vw, 820px); margin: 40px auto; background: #111827; border: 1px solid #334155; border-radius: 16px; padding: 28px; }
      h1, h2 { color: #f8fafc; }
      h1 { margin-top: 0; font-size: 2rem; }
      h2 { margin-top: 1.6rem; font-size: 1.2rem; }
      p, li { line-height: 1.65; color: #cbd5e1; }
      ul { padding-left: 1.5rem; }
      a { color: #7dd3fc; }
      code { background: #1e293b; color: #e2e8f0; padding: 0.1rem 0.35rem; border-radius: 6px; }
      .nav { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
      .nav a { text-decoration: none; background: #1e293b; border: 1px solid #334155; padding: 10px 14px; border-radius: 10px; color: #e2e8f0; }
    </style>
  </head>
  <body>
    <main>
      <nav class="nav">
        <a href="${buildPublicUrl('/')}">Back to JelloChat</a>
        <a href="${buildPublicUrl('/privacy-policy')}">Privacy Policy</a>
        <a href="${buildPublicUrl('/terms-of-service')}">Terms of Service</a>
      </nav>
      ${htmlParts.join('\n')}
    </main>
  </body>
</html>`;
}

app.get('/api/legal/privacy-policy', (_req, res) => {
  const text = readPolicyMarkdown('PRIVACY_POLICY.md');
  if (!text) {
    res.status(500).json({ ok: false, message: 'Privacy Policy file not found.' });
    return;
  }
  res.json({ ok: true, text });
});

app.get('/api/legal/terms-of-service', (_req, res) => {
  const text = readPolicyMarkdown('TERMS_OF_SERVICE.md');
  if (!text) {
    res.status(500).json({ ok: false, message: 'Terms of Service file not found.' });
    return;
  }
  res.json({ ok: true, text });
});

const authTokens = new Map();
const wsClients = new Map();
const pendingPasskeyRegistrations = new Map();
const pendingPasskeyLogins = new Map();

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function buildPublicUrl(pathname) {
  const base = String(process.env.APP_PUBLIC_URL || `http://localhost:${WEB_PORT}`).trim().replace(/\/+$/, '');
  return `${base}${pathname}`;
}

function buildInviteUrl(code) {
  return buildPublicUrl(`/invite/${encodeURIComponent(String(code || '').trim().toUpperCase())}`);
}

function normalizeInviteCode(input) {
  const value = String(input || '').trim();
  if (!value) {
    return '';
  }

  const inviteMatch = value.match(/\/invite\/([^/?#]+)/i);
  if (inviteMatch?.[1]) {
    return decodeURIComponent(inviteMatch[1]).trim().toUpperCase();
  }

  const queryMatch = value.match(/[?&]invite=([^&#]+)/i);
  if (queryMatch?.[1]) {
    return decodeURIComponent(queryMatch[1]).trim().toUpperCase();
  }

  return value.toUpperCase();
}

function toBase64Url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value) {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, 'base64');
}

function getRequestOrigin(req) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const protocol = forwardedProto || (req.secure ? 'https' : 'http');
  const host = String(req.headers.host || '').trim();
  if (!host) {
    return new URL(buildPublicUrl('/')).origin;
  }
  return `${protocol}://${host}`;
}

function getPasskeyOrigin(req) {
  return getRequestOrigin(req);
}

function getPasskeyRpId(req) {
  return new URL(getRequestOrigin(req)).hostname;
}

function cleanupChallengeStore(store) {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (!record || record.expiresAt <= now) {
      store.delete(key);
    }
  }
}

function createPasskeyChallenge(store, key, extra = {}) {
  cleanupChallengeStore(store);
  const challenge = toBase64Url(crypto.randomBytes(32));
  store.set(String(key), {
    challenge,
    expiresAt: Date.now() + 5 * 60 * 1000,
    ...extra
  });
  return challenge;
}

function consumePasskeyChallenge(store, key, expectedChallenge) {
  cleanupChallengeStore(store);
  const record = store.get(String(key));
  if (!record) {
    return null;
  }
  if (record.challenge !== expectedChallenge) {
    return null;
  }
  store.delete(String(key));
  return record;
}

function parseAuthenticatorData(buffer) {
  const input = Buffer.from(buffer || []);
  if (input.length < 37) {
    throw new Error('Authenticator data is too short.');
  }

  const flags = input[32];
  const signCount = input.readUInt32BE(33);
  const result = {
    rpIdHash: input.subarray(0, 32),
    flags,
    signCount
  };

  if (flags & 0x40) {
    let offset = 37;
    if (input.length < offset + 18) {
      throw new Error('Authenticator attestation data is incomplete.');
    }
    result.aaguid = input.subarray(offset, offset + 16);
    offset += 16;
    const credentialIdLength = input.readUInt16BE(offset);
    offset += 2;
    if (input.length < offset + credentialIdLength) {
      throw new Error('Credential ID is incomplete.');
    }
    result.credentialId = input.subarray(offset, offset + credentialIdLength);
  }

  return result;
}

function verifyPasskeyClientData(clientDataJSON, expectedType, expectedChallenge, expectedOrigin) {
  const parsed = JSON.parse(Buffer.from(clientDataJSON).toString('utf8'));
  if (parsed.type !== expectedType) {
    throw new Error('Unexpected WebAuthn operation type.');
  }
  if (parsed.challenge !== expectedChallenge) {
    throw new Error('Passkey challenge did not match.');
  }
  if (parsed.origin !== expectedOrigin) {
    throw new Error('Passkey origin did not match this app.');
  }
  return parsed;
}

function assertRpIdHash(authenticatorData, expectedRpId) {
  const parsed = parseAuthenticatorData(authenticatorData);
  const expectedHash = crypto.createHash('sha256').update(expectedRpId).digest();
  if (!crypto.timingSafeEqual(parsed.rpIdHash, expectedHash)) {
    throw new Error('Passkey RP ID hash did not match.');
  }
  if (!(parsed.flags & 0x01)) {
    throw new Error('Passkey user presence check failed.');
  }
  return parsed;
}

function serializePasskey(row) {
  return {
    id: row.id,
    label: row.label || 'Passkey',
    created_at: row.created_at,
    last_used_at: row.last_used_at,
    transports: Array.isArray(row.transports) ? row.transports : []
  };
}

function buildAndroidDownloadUrl() {
  const configured = String(process.env.APP_ANDROID_DOWNLOAD_URL || 'https://play.google.com/store/apps/details?id=com.jellochat.app&hl=en_US').trim();
  if (configured) {
    return configured;
  }
  return buildPublicUrl('/download/android');
}

function isAndroidRequest(req) {
  const userAgent = String(req.get('user-agent') || '').toLowerCase();
  return userAgent.includes('android');
}

function isAndroidAppWebViewRequest(req) {
  const userAgent = String(req.get('user-agent') || '').toLowerCase();
  return userAgent.includes('jellochatandroidapp');
}

function shouldRedirectAndroidToDownload(req) {
  if (req.method !== 'GET' || !isAndroidRequest(req) || isAndroidAppWebViewRequest(req)) {
    return false;
  }

  const pathname = String(req.path || '');
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth-link') ||
    pathname.startsWith('/download/android') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-email')
  ) {
    return false;
  }

  return pathname === '/' || pathname === '/index.html';
}

app.use((req, res, next) => {
  if (!shouldRedirectAndroidToDownload(req)) {
    next();
    return;
  }

  res.redirect(buildAndroidDownloadUrl());
});

app.use(express.static(path.join(__dirname, 'src')));

function buildAuthWebUrl(mode, rawToken) {
  if (mode === 'verify') {
    return buildPublicUrl(`/api/auth/verify-email?token=${encodeURIComponent(rawToken)}`);
  }
  return buildPublicUrl(`/reset-password?token=${encodeURIComponent(rawToken)}`);
}

function buildAuthAppUrl(mode, rawToken) {
  return `jellochat://auth/${mode === 'verify' ? 'verify-email' : 'reset-password'}?token=${encodeURIComponent(rawToken)}`;
}

function buildAuthEmailUrl(mode, rawToken) {
  return buildPublicUrl(`/auth-link?mode=${encodeURIComponent(mode)}&token=${encodeURIComponent(rawToken)}`);
}

async function sendVerificationEmail(email, username, rawToken) {
  const verifyUrl = buildAuthEmailUrl('verify', rawToken);
  return sendMail({
    to: email,
    subject: 'Verify your JelloChat email',
    text: `Hi ${username},\n\nVerify your email:\n${verifyUrl}\n\nThis link will open the app if it is installed, or fall back to the website. It expires in 24 hours.`,
    html: `<p>Hi ${username},</p><p>Verify your email:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>This link will open the app if it is installed, or fall back to the website. It expires in 24 hours.</p>`
  });
}

async function sendPasswordResetEmail(email, username, rawToken) {
  const resetUrl = buildAuthEmailUrl('reset', rawToken);
  return sendMail({
    to: email,
    subject: 'Reset your JelloChat password',
    text: `Hi ${username},\n\nReset your password:\n${resetUrl}\n\nThis link will open the app if it is installed, or fall back to the website. It expires in 1 hour.`,
    html: `<p>Hi ${username},</p><p>Reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link will open the app if it is installed, or fall back to the website. It expires in 1 hour.</p>`
  });
}

async function sendTerminationEmail(email, username, reason) {
  const supportUrl = buildPublicUrl('/terms-of-service');
  const detail = String(reason || 'Your account was terminated for Terms of Service violations.').trim();
  return sendMail({
    to: email,
    subject: 'Your JelloChat account has been terminated',
    text: `Hi ${username},\n\nYour JelloChat account has been terminated.\n\nReason: ${detail}\n\nFor more information, review our Terms of Service: ${supportUrl}`,
    html: `<p>Hi ${username},</p><p>Your JelloChat account has been terminated.</p><p><strong>Reason:</strong> ${detail}</p><p>For more information, review our <a href="${supportUrl}">Terms of Service</a>.</p>`
  });
}

app.get('/auth-link', (req, res) => {
  const mode = String(req.query?.mode || '').trim().toLowerCase();
  const token = String(req.query?.token || '').trim();

  if (!token || !['verify', 'reset'].includes(mode)) {
    res.status(400).type('text/plain').send('Invalid auth link.');
    return;
  }

  const appUrl = buildAuthAppUrl(mode, token);
  const webUrl = buildAuthWebUrl(mode, token);
  const title = mode === 'verify' ? 'Verify your email' : 'Reset your password';
  const actionLabel = mode === 'verify' ? 'Open verification' : 'Open password reset';
  const allowAutoFallback = mode !== 'verify';

  res.type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; background: #0f172a; color: #e5e7eb; margin: 0; min-height: 100vh; display: grid; place-items: center; }
      main { width: min(92vw, 480px); background: #111827; border: 1px solid #334155; border-radius: 16px; padding: 24px; }
      h1 { margin-top: 0; font-size: 1.5rem; }
      p { line-height: 1.5; color: #cbd5e1; }
      a { display: block; text-align: center; margin-top: 12px; padding: 12px 16px; border-radius: 10px; text-decoration: none; font-weight: 600; }
      .primary { background: #22c55e; color: #052e16; }
      .secondary { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>Trying to open JelloChat in the app now. If the app does not open, continue on the website.</p>
      <a class="primary" href="${appUrl}">${actionLabel} in app</a>
      <a class="secondary" href="${webUrl}">Continue on website</a>
    </main>
    <script>
      const appUrl = ${JSON.stringify(appUrl)};
      const webUrl = ${JSON.stringify(webUrl)};
      let appOpened = false;
      const markHidden = () => { appOpened = true; };
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          markHidden();
        }
      });
      window.addEventListener('pagehide', markHidden);
      const allowAutoFallback = ${JSON.stringify(allowAutoFallback)};
      if (allowAutoFallback) {
        setTimeout(() => {
          if (!appOpened) {
            window.location.replace(webUrl);
          }
        }, 1400);
      }
      window.location.replace(appUrl);
    </script>
  </body>
</html>`);
});

app.get('/reset-password', (_req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.get('/verify-email', (_req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.get('/invite/:code', (_req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.get('/privacy-policy', (_req, res) => {
  const text = readPolicyMarkdown('PRIVACY_POLICY.md');
  if (!text) {
    res.status(500).type('text/plain').send('Privacy Policy file not found.');
    return;
  }
  res.type('html').send(renderMarkdownPage('JelloChat Privacy Policy', text));
});

app.get('/terms-of-service', (_req, res) => {
  const text = readPolicyMarkdown('TERMS_OF_SERVICE.md');
  if (!text) {
    res.status(500).type('text/plain').send('Terms of Service file not found.');
    return;
  }
  res.type('html').send(renderMarkdownPage('JelloChat Terms of Service', text));
});

app.get('/delete-account', (_req, res) => {
  const appUrl = buildPublicUrl('/');
  res.type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Delete Your JelloChat Account</title>
    <style>
      body { font-family: Arial, sans-serif; background: #0f172a; color: #e5e7eb; margin: 0; }
      main { width: min(92vw, 760px); margin: 40px auto; background: #111827; border: 1px solid #334155; border-radius: 16px; padding: 28px; }
      h1, h2 { color: #f8fafc; }
      p, li { line-height: 1.65; color: #cbd5e1; }
      ul, ol { padding-left: 1.5rem; }
      a { color: #7dd3fc; }
      .cta { display: inline-block; margin-top: 12px; text-decoration: none; background: #22c55e; color: #052e16; padding: 12px 16px; border-radius: 10px; font-weight: 700; }
      .note { margin-top: 20px; color: #94a3b8; }
    </style>
  </head>
  <body>
    <main>
      <h1>Delete Your JelloChat Account</h1>
      <p>You can delete your JelloChat account directly inside the app.</p>
      <h2>How to delete your account</h2>
      <ol>
        <li>Open JelloChat and sign in to your account.</li>
        <li>Open <strong>My Account</strong>.</li>
        <li>Select <strong>Delete Account</strong>.</li>
        <li>Enter your current password and confirm deletion.</li>
      </ol>
      <p>This permanently deletes your account and cannot be undone.</p>
      <a class="cta" href="${appUrl}">Open JelloChat</a>
      <p class="note">If you cannot access your account and need help, contact support through your published support channel and include the email tied to the account.</p>
    </main>
  </body>
</html>`);
});

app.get('/download/android', (req, res) => {
  const apkUrl = String(process.env.APP_ANDROID_DOWNLOAD_URL || '').trim();
  const continueUrl = buildPublicUrl('/');

  res.type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Get JelloChat for Android</title>
    <style>
      body { font-family: Arial, sans-serif; background: #0f172a; color: #e5e7eb; margin: 0; min-height: 100vh; display: grid; place-items: center; }
      main { width: min(92vw, 520px); background: #111827; border: 1px solid #334155; border-radius: 16px; padding: 24px; }
      h1 { margin-top: 0; font-size: 1.6rem; }
      p { line-height: 1.5; color: #cbd5e1; }
      a { display: block; text-align: center; margin-top: 12px; padding: 12px 16px; border-radius: 10px; text-decoration: none; font-weight: 600; }
      .primary { background: #22c55e; color: #052e16; }
      .secondary { background: #1e293b; color: #e2e8f0; border: 1px solid #334155; }
      .hint { font-size: 0.95rem; color: #94a3b8; margin-top: 16px; }
    </style>
  </head>
  <body>
    <main>
      <h1>Get the Android app</h1>
      <p>You are on an Android device, so JelloChat works best in the app.</p>
      ${apkUrl
        ? `<a class="primary" href="${apkUrl}">Download Android App</a>`
        : '<p class="hint">Set APP_ANDROID_DOWNLOAD_URL on the server to point this button at your APK or Play Store listing.</p>'}
      <a class="secondary" href="${continueUrl}">Continue to website</a>
    </main>
  </body>
</html>`);
});

async function issueEmailVerification(userId, email, username) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  await db.query(
    `UPDATE users
     SET email_verification_token_hash = $1,
         email_verification_expires_at = NOW() + INTERVAL '24 hours'
     WHERE id = $2`,
    [tokenHash, userId]
  );
  return sendVerificationEmail(email, username, rawToken);
}

async function issuePasswordReset(userId, email, username) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  await db.query(
    `UPDATE users
     SET password_reset_token_hash = $1,
         password_reset_expires_at = NOW() + INTERVAL '1 hour'
     WHERE id = $2`,
    [tokenHash, userId]
  );
  return sendPasswordResetEmail(email, username, rawToken);
}

function issueAuthToken(userId) {
  const token = crypto.randomBytes(24).toString('hex');
  authTokens.set(token, userId);
  return token;
}

function clearAuthTokensForUser(userId) {
  for (const [token, tokenUserId] of authTokens) {
    if (tokenUserId === userId) {
      authTokens.delete(token);
    }
  }
}

function disconnectRealtimeUser(userId, reason = 'Account access changed.') {
  for (const [ws, meta] of wsClients) {
    if (meta.userId === userId) {
      ws.close(4003, reason);
    }
  }
}

async function ensurePlatformAdminExists() {
  const existingAdmins = await db.query('SELECT id FROM users WHERE is_platform_admin = TRUE LIMIT 1');
  if (existingAdmins.rows.length > 0) {
    return;
  }

  const preferredEmail = String(process.env.PLATFORM_ADMIN_EMAIL || '').trim().toLowerCase();
  if (preferredEmail) {
    const preferred = await db.query('SELECT id FROM users WHERE LOWER(email) = $1 LIMIT 1', [preferredEmail]);
    if (preferred.rows.length > 0) {
      await db.query('UPDATE users SET is_platform_admin = TRUE WHERE id = $1', [preferred.rows[0].id]);
      return;
    }
  }

  const firstUser = await db.query('SELECT id FROM users ORDER BY id ASC LIMIT 1');
  if (firstUser.rows.length > 0) {
    await db.query('UPDATE users SET is_platform_admin = TRUE WHERE id = $1', [firstUser.rows[0].id]);
  }
}

async function getUserAdminState(userId) {
  const result = await db.query(
    'SELECT id, username, email, avatar_url, is_platform_admin, platform_banned_at, platform_ban_reason, account_standing, standing_reason, tos_violation_count, standing_updated_at FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

async function requirePlatformAdmin(userId) {
  const user = await getUserAdminState(userId);
  return Boolean(user?.is_platform_admin);
}

async function countPlatformAdmins() {
  const result = await db.query('SELECT COUNT(*)::int AS count FROM users WHERE is_platform_admin = TRUE');
  return result.rows[0]?.count || 0;
}

const authAttemptTracker = new Map();
const ipReputationTracker = new Map();

function normalizeIpAddress(ip) {
  return String(ip || '').replace(/^::ffff:/, '').trim() || 'unknown';
}

function getIpReputation(ip) {
  const key = normalizeIpAddress(ip);
  const now = Date.now();
  const current = ipReputationTracker.get(key) || {
    score: 0,
    blockedUntil: 0,
    lastUpdatedAt: now
  };
  const elapsedHours = Math.max(0, (now - current.lastUpdatedAt) / (1000 * 60 * 60));
  const decayedScore = Math.max(0, current.score - elapsedHours / Math.max(1, IP_REPUTATION_DECAY_HOURS));
  const next = {
    score: decayedScore,
    blockedUntil: current.blockedUntil,
    lastUpdatedAt: now
  };
  ipReputationTracker.set(key, next);
  return next;
}

function penalizeIp(ip, amount, reason = '') {
  const key = normalizeIpAddress(ip);
  const current = getIpReputation(key);
  const nextScore = current.score + Math.max(0, Number(amount || 0));
  const blockedUntil = nextScore >= IP_REPUTATION_BLOCK_THRESHOLD
    ? Date.now() + (IP_REPUTATION_BLOCK_MINUTES * 60 * 1000)
    : current.blockedUntil;
  ipReputationTracker.set(key, {
    score: nextScore,
    blockedUntil,
    lastUpdatedAt: Date.now(),
    lastReason: reason
  });
}

function rewardIp(ip, amount = 1) {
  const key = normalizeIpAddress(ip);
  const current = getIpReputation(key);
  ipReputationTracker.set(key, {
    score: Math.max(0, current.score - Math.max(0, Number(amount || 0))),
    blockedUntil: current.blockedUntil > Date.now() ? current.blockedUntil : 0,
    lastUpdatedAt: Date.now(),
    lastReason: current.lastReason || ''
  });
}

function isIpTemporarilyBlocked(ip) {
  const current = getIpReputation(ip);
  return current.blockedUntil > Date.now();
}

function trackAuthAttempts(bucketKey, limit, windowMs) {
  const now = Date.now();
  const state = authAttemptTracker.get(bucketKey) || [];
  const recent = state.filter((timestamp) => now - timestamp < windowMs);
  recent.push(now);
  authAttemptTracker.set(bucketKey, recent);
  return recent.length > limit;
}

function hasSuspiciousUsername(username) {
  const value = String(username || '').trim();
  if (/https?:\/\//i.test(value) || /discord\.gg|telegram|whatsapp|onlyfans/i.test(value)) {
    return true;
  }
  if (/(.)\1{4,}/i.test(value)) {
    return true;
  }
  return false;
}

function shouldBlockBotLikeAuth(payload, mode) {
  const trapValue = String(mode === 'register' ? payload?.website || '' : payload?.company || '').trim();
  if (trapValue) {
    return 'Suspicious automated activity was detected.';
  }
  const elapsedMs = Number(payload?.clientElapsedMs || 0);
  if (elapsedMs > 0 && elapsedMs < 1200) {
    return 'Please wait a moment and try again.';
  }
  if (mode === 'register' && hasSuspiciousUsername(payload?.username)) {
    return 'That username looks automated. Please choose a different username.';
  }
  return null;
}

function deriveStandingFromViolationCount(violationCount, platformBanned = false) {
  if (platformBanned || violationCount >= 5) {
    return 'banned';
  }
  if (violationCount >= 3) {
    return 'restricted';
  }
  if (violationCount >= 1) {
    return 'warning';
  }
  return 'good';
}

async function applyAutomaticStandingUpdate(userId, options = {}) {
  const increment = Math.max(0, Number(options.increment || 0));
  const reason = String(options.reason || '').trim().slice(0, 500) || null;
  const forceStanding = String(options.forceStanding || '').trim();
  const setPlatformBanned = Boolean(options.setPlatformBanned);
  const platformBanReason = String(options.platformBanReason || reason || '').trim().slice(0, 500) || null;
  const current = await getUserAdminState(userId);
  if (!current) {
    return null;
  }

  const nextViolationCount = Math.max(0, Number(current.tos_violation_count || 0) + increment);
  const nextPlatformBanned = Boolean(current.platform_banned_at) || setPlatformBanned;
  const nextStanding = forceStanding || deriveStandingFromViolationCount(nextViolationCount, nextPlatformBanned);
  const result = await db.query(
    `UPDATE users
     SET account_standing = $1,
         standing_reason = $2,
         tos_violation_count = $3,
         platform_banned_at = CASE WHEN $4 THEN COALESCE(platform_banned_at, NOW()) ELSE platform_banned_at END,
         platform_ban_reason = CASE WHEN $4 THEN $5 ELSE platform_ban_reason END,
         standing_updated_at = NOW()
     WHERE id = $6
     RETURNING id, username, email, avatar_url, is_platform_admin, platform_banned_at, platform_ban_reason, account_standing, standing_reason, tos_violation_count, standing_updated_at`,
    [nextStanding, reason, nextViolationCount, nextPlatformBanned, platformBanReason, userId]
  );
  const updated = result.rows[0] || null;
  if (!updated) {
    return null;
  }
  if (!current.platform_banned_at && updated.platform_banned_at) {
    clearAuthTokensForUser(userId);
    disconnectRealtimeUser(userId, 'Account banned from JelloChat.');
    sendTerminationEmail(updated.email, updated.username, updated.platform_ban_reason || updated.standing_reason || 'Your account was terminated for Terms of Service violations.').catch(() => {});
  }
  return updated;
}

async function autoTerminateBotAccount(userId, reason) {
  return applyAutomaticStandingUpdate(userId, {
    increment: 3,
    reason,
    forceStanding: 'banned',
    setPlatformBanned: true,
    platformBanReason: reason
  });
}

function checkMinimumAutoModerationContent(content) {
  const text = String(content || '').trim();
  const linkCount = (text.match(/(https?:\/\/|www\.|discord\.gg\/|discord\.com\/invite\/)/gi) || []).length;
  if (linkCount >= 3) {
    return 'Minimum automod blocked that message for link spam.';
  }
  if (/(.)\1{11,}/i.test(text)) {
    return 'Minimum automod blocked that message for excessive repeated characters.';
  }
  const letters = text.replace(/[^a-z]/gi, '');
  const uppercaseLetters = text.replace(/[^A-Z]/g, '');
  if (letters.length >= 14 && uppercaseLetters.length / letters.length >= 0.9) {
    return 'Minimum automod blocked that message for excessive caps.';
  }
  return null;
}

async function checkMinimumAutoModerationRecentActivity({ userId, content, channelId = null, partnerUserId = null }) {
  if (channelId) {
    const duplicate = await db.query(
      `SELECT 1
       FROM messages
       WHERE channel_id = $1
         AND user_id = $2
         AND content = $3
         AND created_at >= NOW() - INTERVAL '20 seconds'
       LIMIT 1`,
      [channelId, userId, content]
    );
    if (duplicate.rows.length > 0) {
      return 'Minimum automod blocked that duplicate message.';
    }

    const burst = await db.query(
      `SELECT COUNT(*)::int AS count
       FROM messages
       WHERE channel_id = $1
         AND user_id = $2
         AND created_at >= NOW() - INTERVAL '12 seconds'`,
      [channelId, userId]
    );
    if ((burst.rows[0]?.count || 0) >= 5) {
      return 'Minimum automod blocked that message for sending too quickly.';
    }
    return null;
  }

  if (partnerUserId) {
    const duplicate = await db.query(
      `SELECT 1
       FROM dm_messages
       WHERE sender_user_id = $1
         AND receiver_user_id = $2
         AND content = $3
         AND created_at >= NOW() - INTERVAL '20 seconds'
       LIMIT 1`,
      [userId, partnerUserId, content]
    );
    if (duplicate.rows.length > 0) {
      return 'Minimum automod blocked that duplicate message.';
    }

    const burst = await db.query(
      `SELECT COUNT(*)::int AS count
       FROM dm_messages
       WHERE sender_user_id = $1
         AND receiver_user_id = $2
         AND created_at >= NOW() - INTERVAL '12 seconds'`,
      [userId, partnerUserId]
    );
    if ((burst.rows[0]?.count || 0) >= 5) {
      return 'Minimum automod blocked that message for sending too quickly.';
    }
  }

  return null;
}

async function runMinimumAutoModeration(context) {
  const contentMessage = checkMinimumAutoModerationContent(context.content);
  if (contentMessage) {
    return contentMessage;
  }
  return checkMinimumAutoModerationRecentActivity(context);
}

function classifyServerAutoModerationViolation(content) {
  const text = String(content || '').trim();
  const linkCount = (text.match(/(https?:\/\/|www\.|discord\.gg\/|discord\.com\/invite\/)/gi) || []).length;
  if (linkCount >= 5) {
    return {
      rule: 'link_spam',
      shouldBan: true,
      message: 'Automod banned this user for severe link spam.'
    };
  }
  if (/(.)\1{17,}/i.test(text)) {
    return {
      rule: 'character_spam',
      shouldBan: true,
      message: 'Automod banned this user for severe repeated-character spam.'
    };
  }
  return null;
}

async function recordServerAutoModerationEvent(serverId, userId, rule, content) {
  const preview = String(content || '').slice(0, 240);
  await db.query(
    'INSERT INTO server_automod_events (server_id, user_id, rule, content_preview) VALUES ($1, $2, $3, $4)',
    [serverId, userId, rule, preview]
  );
  const recent = await db.query(
    `SELECT COUNT(*)::int AS count
     FROM server_automod_events
     WHERE server_id = $1
       AND user_id = $2
       AND created_at >= NOW() - INTERVAL '30 minutes'`,
    [serverId, userId]
  );
  return recent.rows[0]?.count || 0;
}

async function enforceServerAutoBan(serverId, userId, reason) {
  const existingBan = await db.query('SELECT 1 FROM server_bans WHERE server_id = $1 AND user_id = $2', [serverId, userId]);
  const serverOwner = await db.query('SELECT owner_user_id FROM servers WHERE id = $1', [serverId]);
  const bannedByUserId = serverOwner.rows[0]?.owner_user_id || userId;
  if (existingBan.rows.length === 0) {
    await db.query(
      `INSERT INTO server_bans (server_id, user_id, banned_by_user_id, reason)
       VALUES ($1, $2, $3, $4)`,
      [serverId, userId, bannedByUserId, reason]
    );
  }
  await db.query('DELETE FROM server_member_roles WHERE server_id = $1 AND user_id = $2', [serverId, userId]);
  await db.query('DELETE FROM server_members WHERE server_id = $1 AND user_id = $2', [serverId, userId]);
  await broadcastToServerMembers(serverId, { type: 'server-membership-changed', serverId });
  await broadcastPresenceForUser(userId);
}

async function handleServerAutoModeration(serverId, channelId, userId, content) {
  const severeViolation = classifyServerAutoModerationViolation(content);
  if (severeViolation) {
    if (!(await isServerOwner(userId, serverId))) {
      await recordServerAutoModerationEvent(serverId, userId, severeViolation.rule, content);
      await applyAutomaticStandingUpdate(userId, {
        increment: 2,
        reason: severeViolation.message,
        forceStanding: 'restricted'
      });
      await enforceServerAutoBan(serverId, userId, severeViolation.message);
      return { blocked: true, banned: true, message: severeViolation.message };
    }
    return { blocked: true, banned: false, message: 'Automod blocked that message, but server owners are not auto-banned.' };
  }

  const minimumMessage = await runMinimumAutoModeration({ userId, channelId, content });
  if (!minimumMessage) {
    return null;
  }

  const recentViolations = await recordServerAutoModerationEvent(serverId, userId, 'minimum_automod', content);
  await applyAutomaticStandingUpdate(userId, {
    increment: 1,
    reason: minimumMessage
  });
  if (recentViolations >= 3 && !(await isServerOwner(userId, serverId))) {
    const reason = 'Automod banned this user after repeated moderation violations.';
    await applyAutomaticStandingUpdate(userId, {
      increment: 1,
      reason,
      forceStanding: 'restricted'
    });
    await enforceServerAutoBan(serverId, userId, reason);
    return { blocked: true, banned: true, message: reason };
  }

  return { blocked: true, banned: false, message: minimumMessage };
}

function generateInviteCode() {
  return crypto
    .randomBytes(5)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 8)
    .toUpperCase();
}

function baseUsername(input) {
  const raw = String(input || '').trim().replace(/\s+/g, ' ');
  return raw.replace(/#\d{4}$/i, '');
}

function hasDiscriminator(username) {
  return /#\d{4}$/i.test(String(username || '').trim());
}

async function usernameExists(username, excludeUserId = null) {
  if (excludeUserId) {
    const result = await db.query('SELECT 1 FROM users WHERE LOWER(username) = LOWER($1) AND id <> $2 LIMIT 1', [
      username,
      excludeUserId
    ]);
    return result.rows.length > 0;
  }

  const result = await db.query('SELECT 1 FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1', [username]);
  return result.rows.length > 0;
}

function randomDiscriminator() {
  return String(Math.floor(Math.random() * 10_000)).padStart(4, '0');
}

async function allocateUniqueUsername(requestedUsername, excludeUserId = null) {
  const requested = String(requestedUsername || '').trim();
  if (hasDiscriminator(requested)) {
    const normalized = requested.slice(0, 50);
    const taken = await usernameExists(normalized, excludeUserId);
    if (!taken) {
      return { username: normalized, changed: false };
    }
  }

  const base = baseUsername(requested);
  if (base.length < 2) {
    throw new Error('Username must be at least 2 characters.');
  }
  const withTagBase = base.slice(0, 45);
  for (let i = 0; i < 30; i += 1) {
    const candidate = `${withTagBase}#${randomDiscriminator()}`;
    const taken = await usernameExists(candidate, excludeUserId);
    if (!taken) {
      return { username: candidate, changed: true };
    }
  }

  throw new Error('Could not allocate a unique username. Please try again.');
}

function normalizeDateOfBirthInput(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return null;
  }
  const parsed = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  const min = new Date('1900-01-01T00:00:00Z');
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  if (parsed < min || parsed > today) {
    return null;
  }
  return raw;
}

function isAtLeast13YearsOld(dateStr) {
  if (!dateStr) return false;
  const birth = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return false;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 13);
  return birth <= cutoff;
}

function getOnlineUserIds() {
  const ids = new Set();
  for (const [, meta] of wsClients) {
    ids.add(meta.userId);
  }
  return ids;
}

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const userId = token ? authTokens.get(token) : null;

  if (!userId) {
    res.status(401).json({ ok: false, message: 'Not authenticated.' });
    return;
  }

  try {
    const user = await getUserAdminState(userId);
    if (!user) {
      authTokens.delete(token);
      res.status(401).json({ ok: false, message: 'Session not found.' });
      return;
    }
    if (user.platform_banned_at) {
      clearAuthTokensForUser(userId);
      disconnectRealtimeUser(userId, 'Account banned from JelloChat.');
      res.status(403).json({ ok: false, message: 'This account has been banned from JelloChat.' });
      return;
    }
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to validate session: ${error.message}` });
    return;
  }

  req.userId = userId;
  req.authToken = token;
  next();
}

function sendWs(ws, payload) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(payload));
  }
}

function broadcastToUsers(userIds, payload) {
  const allowed = new Set(userIds);
  for (const [ws, meta] of wsClients) {
    if (allowed.has(meta.userId)) {
      sendWs(ws, payload);
    }
  }
}

function broadcastToChannel(channelId, payload) {
  for (const [ws, meta] of wsClients) {
    if (meta.subscriptions.has(channelId)) {
      sendWs(ws, payload);
    }
  }
}

async function broadcastToServerMembers(serverId, payload) {
  const result = await db.query('SELECT user_id FROM server_members WHERE server_id = $1', [serverId]);
  broadcastToUsers(result.rows.map((row) => row.user_id), payload);
}

async function broadcastPresenceForUser(userId) {
  const memberships = await db.query('SELECT server_id FROM server_members WHERE user_id = $1', [userId]);
  for (const row of memberships.rows) {
    await broadcastToServerMembers(row.server_id, { type: 'presence-changed', serverId: row.server_id });
  }
}

async function canAccessServer(userId, serverId) {
  const membership = await db.query(
    'SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2',
    [serverId, userId]
  );
  return membership.rows.length > 0;
}

async function canUsersDm(userAId, userBId) {
  if (!userAId || !userBId || userAId === userBId) {
    return false;
  }

  const friendship = await db.query(
    'SELECT 1 FROM friendships WHERE user_id = $1 AND friend_user_id = $2',
    [userAId, userBId]
  );
  if (friendship.rows.length > 0) {
    return true;
  }

  const sharedServer = await db.query(
    `SELECT 1
     FROM server_members a
     JOIN server_members b ON b.server_id = a.server_id
     WHERE a.user_id = $1 AND b.user_id = $2
     LIMIT 1`,
    [userAId, userBId]
  );
  return sharedServer.rows.length > 0;
}

function getDmCallRoomName(userAId, userBId) {
  const [firstId, secondId] = [Number(userAId), Number(userBId)].sort((a, b) => a - b);
  return `dm-call-${firstId}-${secondId}`;
}

function normalizeAvatarUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }
  if (raw.length > 500000) {
    throw new Error('Profile picture is too large.');
  }
  if (/^data:image\/(?:png|jpeg|jpg|gif|webp|svg\+xml);base64,[a-z0-9+/=]+$/i.test(raw)) {
    return raw;
  }
  try {
    const parsed = new URL(raw);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Profile picture URL must use http or https.');
    }
    return parsed.toString();
  } catch (_error) {
    throw new Error('Profile picture must be a valid image URL or data URL.');
  }
}

async function createVoiceToken({ identity, name, roomName }) {
  const apiKey = String(process.env.LIVEKIT_API_KEY || '').trim();
  const apiSecret = String(process.env.LIVEKIT_API_SECRET || '').trim();
  let livekitUrl = String(process.env.LIVEKIT_URL || '').trim();
  if (livekitUrl.startsWith('http://')) {
    livekitUrl = livekitUrl.replace(/^http:\/\//, 'ws://');
  } else if (livekitUrl.startsWith('https://')) {
    livekitUrl = livekitUrl.replace(/^https:\/\//, 'wss://');
  } else if (livekitUrl && !/^wss?:\/\//i.test(livekitUrl)) {
    livekitUrl = `wss://${livekitUrl}`;
  }
  if (!apiKey || !apiSecret || !livekitUrl) {
    throw new Error('LiveKit environment variables are not configured.');
  }

  const token = new AccessToken(apiKey, apiSecret, { identity, name, ttl: 60 * 60 });
  token.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });
  const jwt = await token.toJwt();
  let debug = null;
  if (String(process.env.VC_DEBUG || '').toLowerCase() === '1' || String(process.env.VC_DEBUG || '').toLowerCase() === 'true') {
    try {
      const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString('utf8'));
      debug = { iss: payload.iss, exp: payload.exp, sub: payload.sub, room: payload.video?.room || null };
    } catch (_error) {
      debug = null;
    }
  }
  return { token: jwt, livekitUrl, debug };
}

function getLivekitHostForServerApi(livekitUrl) {
  const parsed = new URL(livekitUrl);
  if (parsed.protocol === 'ws:') {
    parsed.protocol = 'http:';
  } else if (parsed.protocol === 'wss:') {
    parsed.protocol = 'https:';
  }
  return parsed.origin;
}

async function listVoiceParticipants(roomName) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL;
  if (!apiKey || !apiSecret || !livekitUrl) {
    throw new Error('LiveKit environment variables are not configured.');
  }

  const host = getLivekitHostForServerApi(livekitUrl);
  const roomService = new RoomServiceClient(host, apiKey, apiSecret);
  const participants = await roomService.listParticipants(roomName);
  return participants.map((participant) => ({
    identity: participant.identity,
    name: participant.name || participant.identity
  }));
}

async function isServerOwner(userId, serverId) {
  const result = await db.query('SELECT owner_user_id FROM servers WHERE id = $1', [serverId]);
  if (result.rows.length === 0) {
    return false;
  }
  return result.rows[0].owner_user_id === userId;
}

const SERVER_PERMISSION_KEYS = [
  'manage_server',
  'manage_roles',
  'manage_channels',
  'create_invites',
  'moderate_members'
];

function emptyServerPermissions() {
  return {
    manage_server: false,
    manage_roles: false,
    manage_channels: false,
    create_invites: false,
    moderate_members: false
  };
}

function normalizeServerPermissions(value) {
  const normalized = emptyServerPermissions();
  const raw = value && typeof value === 'object' ? value : {};
  for (const key of SERVER_PERMISSION_KEYS) {
    normalized[key] = Boolean(raw[key]);
  }
  return normalized;
}

function mergeServerPermissions(...permissionSets) {
  const merged = emptyServerPermissions();
  for (const set of permissionSets) {
    const normalized = normalizeServerPermissions(set);
    for (const key of SERVER_PERMISSION_KEYS) {
      merged[key] = merged[key] || normalized[key];
    }
  }
  return merged;
}

async function ensureServerRoles(serverId) {
  const roles = await db.query('SELECT id, name, is_default FROM server_roles WHERE server_id = $1', [serverId]);
  const hasDefaultRole = roles.rows.some((role) => role.is_default);
  if (!hasDefaultRole) {
    await db.query(
      `INSERT INTO server_roles (server_id, name, position, permissions, is_default)
       VALUES ($1, '@everyone', 0, '{}'::jsonb, TRUE)`,
      [serverId]
    );
  }

  const hasAdminRole = roles.rows.some((role) => String(role.name || '').toLowerCase() === 'admin');
  if (!hasAdminRole) {
    await db.query(
      `INSERT INTO server_roles (server_id, name, position, permissions, is_default)
       VALUES ($1, 'Admin', 100, $2::jsonb, FALSE)`,
      [serverId, JSON.stringify({
        manage_server: true,
        manage_roles: true,
        manage_channels: true,
        create_invites: true,
        moderate_members: true
      })]
    );
  }
}

async function getServerRoles(serverId) {
  await ensureServerRoles(serverId);
  const result = await db.query(
    `SELECT id, server_id, name, position, permissions, is_default
     FROM server_roles
     WHERE server_id = $1
     ORDER BY is_default DESC, position DESC, name ASC`,
    [serverId]
  );
  return result.rows.map((role) => ({
    ...role,
    permissions: normalizeServerPermissions(role.permissions)
  }));
}

async function getUserServerPermissions(userId, serverId) {
  if (await isServerOwner(userId, serverId)) {
    return {
      ...emptyServerPermissions(),
      manage_server: true,
      manage_roles: true,
      manage_channels: true,
      create_invites: true,
      moderate_members: true
    };
  }

  const roles = await getServerRoles(serverId);
  const assigned = await db.query(
    `SELECT r.permissions
     FROM server_member_roles smr
     JOIN server_roles r ON r.id = smr.role_id
     WHERE smr.server_id = $1 AND smr.user_id = $2`,
    [serverId, userId]
  );

  const permissionSets = [];
  const defaultRole = roles.find((role) => role.is_default);
  if (defaultRole) {
    permissionSets.push(defaultRole.permissions);
  }
  for (const row of assigned.rows) {
    permissionSets.push(row.permissions);
  }
  return mergeServerPermissions(...permissionSets);
}

async function getMessageAccess(userId, messageId) {
  const access = await db.query(
    `SELECT m.id, m.channel_id, m.user_id
     FROM messages m
     JOIN channels c ON c.id = m.channel_id
     JOIN server_members sm ON sm.server_id = c.server_id
     WHERE m.id = $1 AND sm.user_id = $2`,
    [messageId, userId]
  );
  return access.rows[0] || null;
}

app.post('/api/auth/register', async (req, res) => {
  const requestIp = normalizeIpAddress(req.ip);
  const requestedUsername = String(req.body?.username || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const dateOfBirth = normalizeDateOfBirthInput(req.body?.dateOfBirth);
  const botBlock = shouldBlockBotLikeAuth(req.body, 'register');

  if (isIpTemporarilyBlocked(requestIp)) {
    res.status(429).json({ ok: false, message: 'This IP has been temporarily blocked for suspicious activity. Please try again later.' });
    return;
  }

  if (!requestedUsername || !email || !password) {
    res.status(400).json({ ok: false, message: 'Username, email, and password are required.' });
    return;
  }
  if (botBlock) {
    penalizeIp(requestIp, 3, 'bot-like-register');
    res.status(400).json({ ok: false, message: botBlock });
    return;
  }
  if (trackAuthAttempts(`register:${req.ip}:${email}`, 4, 10 * 60 * 1000)) {
    penalizeIp(requestIp, 2, 'register-rate-limit');
    res.status(429).json({ ok: false, message: 'Too many signup attempts. Please try again later.' });
    return;
  }
  if (baseUsername(requestedUsername).length < 2 || baseUsername(requestedUsername).length > 50) {
    res.status(400).json({ ok: false, message: 'Username must be between 2 and 50 characters.' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ ok: false, message: 'Password must be at least 6 characters.' });
    return;
  }
  if (!dateOfBirth) {
    res.status(400).json({ ok: false, message: 'Valid date of birth is required.' });
    return;
  }
  if (!isAtLeast13YearsOld(dateOfBirth)) {
    res.status(400).json({ ok: false, message: 'You must be at least 13 years old to register.' });
    return;
  }

  try {
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      penalizeIp(requestIp, 1, 'duplicate-register');
      res.status(409).json({ ok: false, message: 'Email already in use.' });
      return;
    }

    const allocated = await allocateUniqueUsername(requestedUsername);
    const passwordHash = await bcrypt.hash(password, 10);
    const created = await db.query(
      'INSERT INTO users (username, email, password_hash, date_of_birth, email_verified) VALUES ($1, $2, $3, $4, FALSE) RETURNING id, username, email, avatar_url, date_of_birth',
      [allocated.username, email, passwordHash, dateOfBirth]
    );
    const user = created.rows[0];

    const defaultServer = await db.query('SELECT id, owner_user_id FROM servers WHERE name = $1 LIMIT 1', ['Jello HQ']);
    if (defaultServer.rows.length > 0) {
      if (!defaultServer.rows[0].owner_user_id) {
        await db.query('UPDATE servers SET owner_user_id = $1 WHERE id = $2', [user.id, defaultServer.rows[0].id]);
      }
      await db.query(
        'INSERT INTO server_members (user_id, server_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [user.id, defaultServer.rows[0].id]
      );
    }

    await ensurePlatformAdminExists();

    const mailResult = await issueEmailVerification(user.id, user.email, user.username);
    if (!mailResult.ok) {
      res.status(500).json({ ok: false, message: `Account created but verification email failed: ${mailResult.message}` });
      return;
    }

    rewardIp(requestIp, 1);

    res.json({
      ok: true,
      needsVerification: true,
      assignedUsername: user.username,
      message: allocated.changed
        ? `Account created. Username set to ${user.username}. Check your email to verify your account before logging in.`
        : 'Account created. Check your email to verify your account before logging in.'
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Registration failed: ${error.message}` });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const requestIp = normalizeIpAddress(req.ip);
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const botBlock = shouldBlockBotLikeAuth(req.body, 'login');
  const ipBlocked = isIpTemporarilyBlocked(requestIp);

  if (!email || !password) {
    res.status(400).json({ ok: false, message: 'Email and password are required.' });
    return;
  }
  if (botBlock) {
    penalizeIp(requestIp, 3, 'bot-like-login');
  }
  if (trackAuthAttempts(`login:${req.ip}:${email}`, 8, 10 * 60 * 1000)) {
    penalizeIp(requestIp, 2, 'login-rate-limit');
    res.status(429).json({ ok: false, message: 'Too many login attempts. Please try again later.' });
    return;
  }

  try {
    const result = await db.query('SELECT id, username, email, avatar_url, is_platform_admin, platform_banned_at, account_standing, standing_reason, tos_violation_count, password_hash, email_verified, date_of_birth FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      penalizeIp(requestIp, 1, 'login-miss');
      res.status(401).json({ ok: false, message: 'Invalid email or password.' });
      return;
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      penalizeIp(requestIp, 1, 'login-bad-password');
      res.status(401).json({ ok: false, message: 'Invalid email or password.' });
      return;
    }
    if (botBlock || ipBlocked) {
      const reason = botBlock || 'Automated bot activity was detected from this IP during login.';
      await autoTerminateBotAccount(user.id, reason);
      res.status(403).json({ ok: false, message: 'This account has been terminated for automated bot activity.' });
      return;
    }
    if (!user.email_verified) {
      res.status(403).json({
        ok: false,
        verificationRequired: true,
        message: 'Please verify your email before logging in.'
      });
      return;
    }
    if (user.platform_banned_at) {
      res.status(403).json({ ok: false, message: 'This account has been banned from JelloChat.' });
      return;
    }

    const realtimeToken = issueAuthToken(user.id);
    rewardIp(requestIp, 2);
    res.json({
      ok: true,
      user: { id: user.id, username: user.username, email: user.email, avatar_url: user.avatar_url, is_platform_admin: user.is_platform_admin, account_standing: user.account_standing, standing_reason: user.standing_reason, tos_violation_count: user.tos_violation_count, date_of_birth: user.date_of_birth },
      realtimeToken
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Login failed: ${error.message}` });
  }
});

app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  authTokens.delete(req.authToken);
  res.json({ ok: true });
});

app.get('/api/auth/session', authMiddleware, async (req, res) => {
  try {
    const userResult = await db.query('SELECT id, username, email, avatar_url, is_platform_admin, platform_banned_at, account_standing, standing_reason, tos_violation_count, date_of_birth FROM users WHERE id = $1', [req.userId]);
    if (userResult.rows.length === 0) {
      res.status(401).json({ ok: false, message: 'Session not found.' });
      return;
    }
    const user = userResult.rows[0];
    if (user.platform_banned_at) {
      clearAuthTokensForUser(user.id);
      disconnectRealtimeUser(user.id, 'Account banned from JelloChat.');
      res.status(403).json({ ok: false, message: 'This account has been banned from JelloChat.' });
      return;
    }
    const realtimeToken = issueAuthToken(user.id);
    res.json({ ok: true, user, realtimeToken });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to restore session: ${error.message}` });
  }
});

app.get('/api/auth/passkeys', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, label, transports, created_at, last_used_at
       FROM user_passkeys
       WHERE user_id = $1
       ORDER BY created_at ASC`,
      [req.userId]
    );
    res.json({ ok: true, supported: true, passkeys: result.rows.map(serializePasskey) });
  } catch (error) {
    res.status(500).json({ ok: false, supported: true, message: `Failed to load passkeys: ${error.message}` });
  }
});

app.post('/api/auth/passkeys/register/options', authMiddleware, async (req, res) => {
  try {
    const passkeyOrigin = getPasskeyOrigin(req);
    const passkeyRpId = getPasskeyRpId(req);
    const userResult = await db.query(
      'SELECT id, username, email, platform_banned_at FROM users WHERE id = $1',
      [req.userId]
    );
    if (userResult.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'User not found.' });
      return;
    }

    const user = userResult.rows[0];
    if (user.platform_banned_at) {
      res.status(403).json({ ok: false, message: 'This account has been banned from JelloChat.' });
      return;
    }

    const existing = await db.query(
      'SELECT credential_id FROM user_passkeys WHERE user_id = $1 ORDER BY id ASC',
      [req.userId]
    );
    const challenge = createPasskeyChallenge(pendingPasskeyRegistrations, req.userId, {
      origin: passkeyOrigin,
      rpId: passkeyRpId
    });
    res.json({
      ok: true,
      supported: true,
      options: {
        challenge,
        rp: {
          name: process.env.PASSKEY_RP_NAME || 'JelloChat',
          id: passkeyRpId
        },
        user: {
          id: toBase64Url(Buffer.from(String(user.id), 'utf8')),
          name: user.email,
          displayName: user.username
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 }
        ],
        timeout: 60000,
        attestation: 'none',
        authenticatorSelection: {
          residentKey: 'required',
          userVerification: 'preferred'
        },
        excludeCredentials: existing.rows.map((row) => ({
          type: 'public-key',
          id: row.credential_id
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, supported: true, message: `Failed to prepare passkey registration: ${error.message}` });
  }
});

app.post('/api/auth/passkeys/register/verify', authMiddleware, async (req, res) => {
  try {
    const credentialId = String(req.body?.rawId || '').trim();
    const response = req.body?.response || {};
    if (!credentialId || !response.clientDataJSON || !response.authenticatorData || !response.publicKey) {
      res.status(400).json({ ok: false, message: 'Passkey registration response is incomplete.' });
      return;
    }

    const clientDataJSON = fromBase64Url(response.clientDataJSON);
    const clientData = JSON.parse(clientDataJSON.toString('utf8'));
    const challengeRecord = consumePasskeyChallenge(pendingPasskeyRegistrations, req.userId, clientData.challenge);
    if (!challengeRecord) {
      res.status(400).json({ ok: false, message: 'Passkey registration expired. Try again.' });
      return;
    }

    verifyPasskeyClientData(clientDataJSON, 'webauthn.create', challengeRecord.challenge, challengeRecord.origin);
    const authenticatorData = fromBase64Url(response.authenticatorData);
    const parsedAuthData = assertRpIdHash(authenticatorData, challengeRecord.rpId);
    const rawCredentialId = fromBase64Url(credentialId);
    if (parsedAuthData.credentialId && !crypto.timingSafeEqual(parsedAuthData.credentialId, rawCredentialId)) {
      res.status(400).json({ ok: false, message: 'Passkey credential ID mismatch.' });
      return;
    }

    const existing = await db.query('SELECT id FROM user_passkeys WHERE credential_id = $1', [credentialId]);
    if (existing.rows.length > 0) {
      res.status(409).json({ ok: false, message: 'That passkey is already registered.' });
      return;
    }

    const countResult = await db.query('SELECT COUNT(*)::int AS count FROM user_passkeys WHERE user_id = $1', [req.userId]);
    const inserted = await db.query(
      `INSERT INTO user_passkeys (user_id, credential_id, public_key_spki, counter, transports, label)
       VALUES ($1, $2, $3, $4, $5::text[], $6)
       RETURNING id, label, transports, created_at, last_used_at`,
      [
        req.userId,
        credentialId,
        String(response.publicKey),
        parsedAuthData.signCount,
        Array.isArray(response.transports) ? response.transports.map((item) => String(item || '')) : [],
        `Passkey ${Number(countResult.rows[0]?.count || 0) + 1}`
      ]
    );

    res.json({ ok: true, supported: true, passkey: serializePasskey(inserted.rows[0]) });
  } catch (error) {
    res.status(500).json({ ok: false, supported: true, message: `Failed to save passkey: ${error.message}` });
  }
});

app.post('/api/auth/passkeys/login/options', async (req, res) => {
  try {
    const passkeyOrigin = getPasskeyOrigin(req);
    const passkeyRpId = getPasskeyRpId(req);
    const challenge = createPasskeyChallenge(pendingPasskeyLogins, crypto.randomUUID(), {
      origin: passkeyOrigin,
      rpId: passkeyRpId
    });
    res.json({
      ok: true,
      supported: true,
      options: {
        challenge,
        rpId: passkeyRpId,
        timeout: 60000,
        userVerification: 'preferred',
        allowCredentials: []
      }
    });
  } catch (error) {
    res.status(500).json({ ok: false, supported: true, message: `Failed to prepare passkey sign-in: ${error.message}` });
  }
});

app.post('/api/auth/passkeys/login/verify', async (req, res) => {
  try {
    const credentialId = String(req.body?.rawId || '').trim();
    const response = req.body?.response || {};
    if (!credentialId || !response.clientDataJSON || !response.authenticatorData || !response.signature) {
      res.status(400).json({ ok: false, message: 'Passkey sign-in response is incomplete.' });
      return;
    }

    const clientDataJSON = fromBase64Url(response.clientDataJSON);
    const clientData = JSON.parse(clientDataJSON.toString('utf8'));
    let challengeKey = null;
    let challengeRecord = null;
    for (const [key, record] of pendingPasskeyLogins.entries()) {
      if (record?.challenge === clientData.challenge) {
        challengeKey = key;
        challengeRecord = record;
        break;
      }
    }
    if (!challengeRecord || !consumePasskeyChallenge(pendingPasskeyLogins, challengeKey, clientData.challenge)) {
      res.status(400).json({ ok: false, message: 'Passkey sign-in expired. Try again.' });
      return;
    }

    verifyPasskeyClientData(clientDataJSON, 'webauthn.get', clientData.challenge, challengeRecord.origin);
    const authenticatorData = fromBase64Url(response.authenticatorData);
    const parsedAuthData = assertRpIdHash(authenticatorData, challengeRecord.rpId);
    const signature = fromBase64Url(response.signature);

    const credentialResult = await db.query(
      `SELECT p.id, p.user_id, p.public_key_spki, p.counter, u.username, u.email, u.avatar_url,
              u.is_platform_admin, u.platform_banned_at, u.account_standing, u.standing_reason,
              u.tos_violation_count, u.date_of_birth, u.email_verified
       FROM user_passkeys p
       JOIN users u ON u.id = p.user_id
       WHERE p.credential_id = $1`,
      [credentialId]
    );
    if (credentialResult.rows.length === 0) {
      res.status(401).json({ ok: false, message: 'Passkey not recognized.' });
      return;
    }

    const credential = credentialResult.rows[0];
    if (!credential.email_verified) {
      res.status(403).json({ ok: false, verificationRequired: true, message: 'Please verify your email before using passkeys.' });
      return;
    }
    if (credential.platform_banned_at) {
      res.status(403).json({ ok: false, message: 'This account has been banned from JelloChat.' });
      return;
    }

    const clientDataHash = crypto.createHash('sha256').update(clientDataJSON).digest();
    const signedPayload = Buffer.concat([authenticatorData, clientDataHash]);
    const isValid = crypto.verify(
      'sha256',
      signedPayload,
      {
        key: fromBase64Url(credential.public_key_spki),
        format: 'der',
        type: 'spki'
      },
      signature
    );
    if (!isValid) {
      res.status(401).json({ ok: false, message: 'Passkey signature verification failed.' });
      return;
    }

    await db.query(
      `UPDATE user_passkeys
       SET counter = GREATEST(counter, $2),
           last_used_at = NOW()
       WHERE id = $1`,
      [credential.id, parsedAuthData.signCount]
    );

    const realtimeToken = issueAuthToken(credential.user_id);
    res.json({
      ok: true,
      supported: true,
      user: {
        id: credential.user_id,
        username: credential.username,
        email: credential.email,
        avatar_url: credential.avatar_url,
        is_platform_admin: credential.is_platform_admin,
        account_standing: credential.account_standing,
        standing_reason: credential.standing_reason,
        tos_violation_count: credential.tos_violation_count,
        date_of_birth: credential.date_of_birth
      },
      realtimeToken
    });
  } catch (error) {
    res.status(500).json({ ok: false, supported: true, message: `Passkey sign-in failed: ${error.message}` });
  }
});

app.post('/api/auth/resend-verification', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) {
    res.status(400).json({ ok: false, message: 'Email is required.' });
    return;
  }

  try {
    const userResult = await db.query('SELECT id, username, email, email_verified FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      res.json({ ok: true, message: 'If this email exists, a verification email has been sent.' });
      return;
    }
    const user = userResult.rows[0];
    if (user.email_verified) {
      res.json({ ok: true, message: 'Email is already verified.' });
      return;
    }
    await issueEmailVerification(user.id, user.email, user.username);
    res.json({ ok: true, message: 'Verification email sent.' });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to resend verification: ${error.message}` });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  const token = String(req.body?.token || '').trim();
  if (!token) {
    res.status(400).json({ ok: false, message: 'Token is required.' });
    return;
  }

  try {
    const tokenHash = hashToken(token);
    const updated = await db.query(
      `UPDATE users
       SET email_verified = TRUE,
           email_verification_token_hash = NULL,
           email_verification_expires_at = NULL
       WHERE email_verification_token_hash = $1
         AND email_verification_expires_at > NOW()
       RETURNING id`,
      [tokenHash]
    );

    if (updated.rows.length === 0) {
      res.status(400).json({ ok: false, message: 'Verification token is invalid or expired.' });
      return;
    }

    res.json({ ok: true, message: 'Email verified successfully.' });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to verify email: ${error.message}` });
  }
});

app.get('/api/auth/verify-email', async (req, res) => {
  const token = String(req.query?.token || '').trim();
  if (!token) {
    res.redirect(buildPublicUrl('/verify-email?status=error&message=Missing%20verification%20token.'));
    return;
  }

  try {
    const tokenHash = hashToken(token);
    const updated = await db.query(
      `UPDATE users
       SET email_verified = TRUE,
           email_verification_token_hash = NULL,
           email_verification_expires_at = NULL
       WHERE email_verification_token_hash = $1
         AND email_verification_expires_at > NOW()
       RETURNING id`,
      [tokenHash]
    );

    if (updated.rows.length === 0) {
      res.redirect(buildPublicUrl('/verify-email?status=error&message=Verification%20token%20is%20invalid%20or%20expired.'));
      return;
    }

    res.redirect(buildPublicUrl('/verify-email?status=success&verified=1&message=Email%20verified%20successfully.%20You%20can%20log%20in%20now.'));
  } catch (error) {
    res.redirect(buildPublicUrl(`/verify-email?status=error&message=${encodeURIComponent(`Failed to verify email: ${error.message}`)}`));
  }
});

app.post('/api/auth/password-reset/request', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) {
    res.status(400).json({ ok: false, message: 'Email is required.' });
    return;
  }

  try {
    const userResult = await db.query('SELECT id, username, email FROM users WHERE email = $1', [email]);
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      await issuePasswordReset(user.id, user.email, user.username);
    }
    res.json({ ok: true, message: 'If this email exists, a password reset link has been sent.' });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to request password reset: ${error.message}` });
  }
});

app.post('/api/auth/password-reset/confirm', async (req, res) => {
  const token = String(req.body?.token || '').trim();
  const newPassword = String(req.body?.newPassword || '');
  if (!token || !newPassword) {
    res.status(400).json({ ok: false, message: 'Token and new password are required.' });
    return;
  }
  if (newPassword.length < 6) {
    res.status(400).json({ ok: false, message: 'Password must be at least 6 characters.' });
    return;
  }

  try {
    const tokenHash = hashToken(token);
    const result = await db.query(
      `SELECT id
       FROM users
       WHERE password_reset_token_hash = $1
         AND password_reset_expires_at > NOW()`,
      [tokenHash]
    );
    if (result.rows.length === 0) {
      res.status(400).json({ ok: false, message: 'Reset token is invalid or expired.' });
      return;
    }

    const userId = result.rows[0].id;
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.query(
      `UPDATE users
       SET password_hash = $1,
           password_reset_token_hash = NULL,
           password_reset_expires_at = NULL
       WHERE id = $2`,
      [passwordHash, userId]
    );
    clearAuthTokensForUser(userId);
    res.json({ ok: true, message: 'Password has been reset.' });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to reset password: ${error.message}` });
  }
});

app.post('/api/auth/account', authMiddleware, async (req, res) => {
  const requestedUsername = String(req.body?.username || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const requestedDateOfBirth = normalizeDateOfBirthInput(req.body?.dateOfBirth);
  const currentPassword = String(req.body?.currentPassword || '');
  const newPassword = String(req.body?.newPassword || '');

  if (!requestedUsername || !email) {
    res.status(400).json({ ok: false, message: 'Username and email are required.' });
    return;
  }
  if (baseUsername(requestedUsername).length < 2 || baseUsername(requestedUsername).length > 50) {
    res.status(400).json({ ok: false, message: 'Username must be between 2 and 50 characters.' });
    return;
  }
  if (!email.includes('@')) {
    res.status(400).json({ ok: false, message: 'Valid email is required.' });
    return;
  }
  if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
    res.status(400).json({ ok: false, message: 'Current and new password are required together.' });
    return;
  }
  if (newPassword && newPassword.length < 6) {
    res.status(400).json({ ok: false, message: 'New password must be at least 6 characters.' });
    return;
  }

  try {
    const avatarUrl = normalizeAvatarUrl(req.body?.avatarUrl);
    const existing = await db.query('SELECT id, username, email, avatar_url, password_hash, date_of_birth FROM users WHERE id = $1', [req.userId]);
    if (existing.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'User not found.' });
      return;
    }
    const user = existing.rows[0];

    if (email !== user.email) {
      const duplicate = await db.query('SELECT id FROM users WHERE email = $1 AND id <> $2', [email, req.userId]);
      if (duplicate.rows.length > 0) {
        res.status(409).json({ ok: false, message: 'Email already in use.' });
        return;
      }
    }

    let passwordHash = user.password_hash;
    if (newPassword) {
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) {
        res.status(401).json({ ok: false, message: 'Current password is incorrect.' });
        return;
      }
      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const nextDateOfBirth = requestedDateOfBirth || user.date_of_birth;
    if (!nextDateOfBirth) {
      res.status(400).json({ ok: false, message: 'Date of birth is required.' });
      return;
    }
    if (!isAtLeast13YearsOld(nextDateOfBirth)) {
      res.status(400).json({ ok: false, message: 'You must be at least 13 years old.' });
      return;
    }

    const allocated = await allocateUniqueUsername(requestedUsername, req.userId);
    const updated = await db.query(
      'UPDATE users SET username = $1, email = $2, avatar_url = $3, password_hash = $4, date_of_birth = $5 WHERE id = $6 RETURNING id, username, email, avatar_url, is_platform_admin, account_standing, standing_reason, tos_violation_count, date_of_birth',
      [allocated.username, email, avatarUrl, passwordHash, nextDateOfBirth, req.userId]
    );

    res.json({
      ok: true,
      user: updated.rows[0],
      message: allocated.changed ? `Username updated to ${updated.rows[0].username}.` : 'Account updated.'
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to update account: ${error.message}` });
  }
});

app.post('/api/auth/account/delete', authMiddleware, async (req, res) => {
  const currentPassword = String(req.body?.currentPassword || '');
  if (!currentPassword) {
    res.status(400).json({ ok: false, message: 'Current password is required.' });
    return;
  }

  try {
    const existing = await db.query('SELECT id, password_hash FROM users WHERE id = $1', [req.userId]);
    if (existing.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'User not found.' });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, existing.rows[0].password_hash);
    if (!valid) {
      res.status(401).json({ ok: false, message: 'Current password is incorrect.' });
      return;
    }

    await db.query('DELETE FROM users WHERE id = $1', [req.userId]);
    clearAuthTokensForUser(req.userId);
    disconnectRealtimeUser(req.userId, 'Account deleted.');
    authTokens.delete(req.authToken);
    await ensurePlatformAdminExists();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to delete account: ${error.message}` });
  }
});

app.delete('/api/auth/passkeys/:passkeyId', authMiddleware, async (req, res) => {
  const passkeyId = Number(req.params.passkeyId);
  if (!passkeyId) {
    res.status(400).json({ ok: false, message: 'Valid passkey id is required.' });
    return;
  }

  try {
    const removed = await db.query(
      'DELETE FROM user_passkeys WHERE id = $1 AND user_id = $2 RETURNING id',
      [passkeyId, req.userId]
    );
    if (removed.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Passkey not found.' });
      return;
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to remove passkey: ${error.message}` });
  }
});

app.get('/api/chat/servers', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.id, s.name, s.owner_user_id
       FROM servers s
       JOIN server_members sm ON sm.server_id = s.id
       WHERE sm.user_id = $1
       ORDER BY s.name`,
      [req.userId]
    );
    res.json({ ok: true, servers: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load servers: ${error.message}` });
  }
});

app.post('/api/chat/servers', authMiddleware, async (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (name.length < 2 || name.length > 80) {
    res.status(400).json({ ok: false, message: 'Server name must be between 2 and 80 characters.' });
    return;
  }

  try {
    const created = await db.query(
      'INSERT INTO servers (name, owner_user_id) VALUES ($1, $2) RETURNING id, name, owner_user_id',
      [name, req.userId]
    );
    const server = created.rows[0];
      await db.query(
        'INSERT INTO server_members (user_id, server_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [req.userId, server.id]
      );
      await ensureServerRoles(server.id);
      await db.query('INSERT INTO channels (server_id, type, name) VALUES ($1, $2, $3)', [server.id, 'text', 'general']);

    await broadcastToServerMembers(server.id, { type: 'server-created', server });
    res.json({ ok: true, server });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to create server: ${error.message}` });
  }
});

app.post('/api/chat/servers/:serverId/leave', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  if (!serverId) {
    res.status(400).json({ ok: false, message: 'Valid server id is required.' });
    return;
  }

  try {
    const membership = await db.query(
      'SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2',
      [serverId, req.userId]
    );
    if (membership.rows.length === 0) {
      res.status(400).json({ ok: false, message: 'You are not a member of this server.' });
      return;
    }

    const server = await db.query('SELECT owner_user_id FROM servers WHERE id = $1', [serverId]);
    if (server.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Server not found.' });
      return;
    }

    await db.query('DELETE FROM server_member_roles WHERE server_id = $1 AND user_id = $2', [serverId, req.userId]);
    await db.query('DELETE FROM server_members WHERE server_id = $1 AND user_id = $2', [serverId, req.userId]);

    if (server.rows[0].owner_user_id === req.userId) {
      const nextOwner = await db.query(
        `SELECT user_id
         FROM server_members
         WHERE server_id = $1
         ORDER BY joined_at ASC
         LIMIT 1`,
        [serverId]
      );
      const nextOwnerId = nextOwner.rows[0]?.user_id || null;
      await db.query('UPDATE servers SET owner_user_id = $1 WHERE id = $2', [nextOwnerId, serverId]);
    }

    await broadcastToServerMembers(serverId, { type: 'server-membership-changed', serverId });
    await broadcastPresenceForUser(req.userId);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to leave server: ${error.message}` });
  }
});

app.post('/api/chat/servers/:serverId/kick', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  const targetUserId = Number(req.body?.targetUserId);
  if (!serverId || !targetUserId) {
    res.status(400).json({ ok: false, message: 'Valid server and target user are required.' });
    return;
  }
  if (targetUserId === req.userId) {
    res.status(400).json({ ok: false, message: 'You cannot kick yourself.' });
    return;
  }

  try {
    const permissions = await getUserServerPermissions(req.userId, serverId);
    if (!permissions.moderate_members) {
      res.status(403).json({ ok: false, message: 'You do not have permission to kick members.' });
      return;
    }

    const targetMembership = await db.query(
      'SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2',
      [serverId, targetUserId]
    );
    if (targetMembership.rows.length === 0) {
      res.status(400).json({ ok: false, message: 'User is not in this server.' });
      return;
    }

    await db.query('DELETE FROM server_member_roles WHERE server_id = $1 AND user_id = $2', [serverId, targetUserId]);
    await db.query('DELETE FROM server_members WHERE server_id = $1 AND user_id = $2', [serverId, targetUserId]);
    await broadcastToServerMembers(serverId, { type: 'server-membership-changed', serverId });
    await broadcastPresenceForUser(targetUserId);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to kick member: ${error.message}` });
  }
});

app.post('/api/chat/servers/:serverId/ban', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  const targetUserId = Number(req.body?.targetUserId);
  const reason = String(req.body?.reason || '').trim();
  if (!serverId || !targetUserId) {
    res.status(400).json({ ok: false, message: 'Valid server and target user are required.' });
    return;
  }
  if (targetUserId === req.userId) {
    res.status(400).json({ ok: false, message: 'You cannot ban yourself.' });
    return;
  }

  try {
    const permissions = await getUserServerPermissions(req.userId, serverId);
    if (!permissions.moderate_members) {
      res.status(403).json({ ok: false, message: 'You do not have permission to ban members.' });
      return;
    }

    await db.query(
      `INSERT INTO server_bans (server_id, user_id, banned_by_user_id, reason)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (server_id, user_id)
       DO UPDATE SET banned_by_user_id = EXCLUDED.banned_by_user_id,
                     reason = EXCLUDED.reason,
                     created_at = NOW()`,
      [serverId, targetUserId, req.userId, reason || null]
    );
    await db.query('DELETE FROM server_member_roles WHERE server_id = $1 AND user_id = $2', [serverId, targetUserId]);
    await db.query('DELETE FROM server_members WHERE server_id = $1 AND user_id = $2', [serverId, targetUserId]);

    await broadcastToServerMembers(serverId, { type: 'server-membership-changed', serverId });
    await broadcastPresenceForUser(targetUserId);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to ban member: ${error.message}` });
  }
});

app.post('/api/chat/servers/:serverId/unban', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  const targetUserId = Number(req.body?.targetUserId || 0);
  const target = String(req.body?.target || '').trim().toLowerCase();
  if (!serverId || (!targetUserId && !target)) {
    res.status(400).json({ ok: false, message: 'Valid server and target user are required.' });
    return;
  }

  try {
    const permissions = await getUserServerPermissions(req.userId, serverId);
    if (!permissions.moderate_members) {
      res.status(403).json({ ok: false, message: 'You do not have permission to unban members.' });
      return;
    }

    let resolvedUserId = targetUserId;
    if (!resolvedUserId) {
      const user = await db.query(
        `SELECT id
         FROM users
         WHERE LOWER(username) = $1 OR LOWER(email) = $1
         LIMIT 1`,
        [target]
      );
      if (user.rows.length === 0) {
        res.status(404).json({ ok: false, message: 'User not found.' });
        return;
      }
      resolvedUserId = user.rows[0].id;
    }

    const deleted = await db.query(
      'DELETE FROM server_bans WHERE server_id = $1 AND user_id = $2 RETURNING user_id',
      [serverId, resolvedUserId]
    );
    if (deleted.rows.length === 0) {
      res.status(400).json({ ok: false, message: 'User is not banned in this server.' });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to unban member: ${error.message}` });
  }
});

app.get('/api/chat/servers/:serverId/bans', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  if (!serverId) {
    res.status(400).json({ ok: false, message: 'Valid server id is required.' });
    return;
  }

  try {
    const permissions = await getUserServerPermissions(req.userId, serverId);
    if (!permissions.moderate_members) {
      res.status(403).json({ ok: false, message: 'You do not have permission to view banned users.' });
      return;
    }

    const result = await db.query(
      `SELECT b.user_id, u.username, b.reason, b.created_at
         FROM server_bans b
         JOIN users u ON u.id = b.user_id
         WHERE b.server_id = $1
         ORDER BY b.created_at DESC`,
      [serverId]
    );
    res.json({ ok: true, bannedUsers: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load banned users: ${error.message}` });
  }
});

app.post('/api/chat/servers/:serverId/rename', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  const name = String(req.body?.name || '').trim();
  if (!serverId || name.length < 2 || name.length > 80) {
    res.status(400).json({ ok: false, message: 'Server name must be between 2 and 80 characters.' });
    return;
  }

  try {
    const permissions = await getUserServerPermissions(req.userId, serverId);
    if (!permissions.manage_server) {
      res.status(403).json({ ok: false, message: 'You do not have permission to rename the server.' });
      return;
    }

    const updated = await db.query(
      'UPDATE servers SET name = $1 WHERE id = $2 RETURNING id, name, owner_user_id',
      [name, serverId]
    );
    if (updated.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Server not found.' });
      return;
    }

    await broadcastToServerMembers(serverId, { type: 'server-updated', server: updated.rows[0] });
    res.json({ ok: true, server: updated.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to rename server: ${error.message}` });
  }
});

app.get('/api/chat/servers/:serverId/channels', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  if (!serverId) {
    res.status(400).json({ ok: false, message: 'Invalid server id.' });
    return;
  }

  try {
    const membership = await canAccessServer(req.userId, serverId);
    if (!membership) {
      res.status(403).json({ ok: false, message: 'Access denied.' });
      return;
    }

    const permissions = await getUserServerPermissions(req.userId, serverId);
    const channels = await db.query('SELECT id, type, name, server_id FROM channels WHERE server_id = $1 ORDER BY name', [
      serverId
    ]);
    res.json({
      ok: true,
      channels: channels.rows,
      canCreateChannels: permissions.manage_channels,
      permissions
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load channels: ${error.message}` });
  }
});

app.post('/api/chat/channels', authMiddleware, async (req, res) => {
  const serverId = Number(req.body?.serverId);
  const type = String(req.body?.type || 'text').trim().toLowerCase();
  const name = String(req.body?.name || '').trim().toLowerCase();

  if (!serverId || !['text', 'voice'].includes(type) || name.length < 1 || name.length > 80) {
    res.status(400).json({ ok: false, message: 'Valid server and channel name are required.' });
    return;
  }

  try {
    const server = await db.query('SELECT id FROM servers WHERE id = $1', [serverId]);
    if (server.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Server not found.' });
      return;
    }
    const permissions = await getUserServerPermissions(req.userId, serverId);
    if (!permissions.manage_channels) {
      res.status(403).json({ ok: false, message: 'You do not have permission to create channels.' });
      return;
    }

    const created = await db.query(
      'INSERT INTO channels (server_id, type, name) VALUES ($1, $2, $3) RETURNING id, type, name, server_id',
      [serverId, type, name]
    );
    const channel = created.rows[0];
    await broadcastToServerMembers(serverId, { type: 'channel-created', serverId, channel });
    res.json({ ok: true, channel });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to create channel: ${error.message}` });
  }
});

app.post('/api/vc/token', authMiddleware, async (req, res) => {
  const serverId = Number(req.body?.serverId);
  const channelId = Number(req.body?.channelId);
  if (!serverId || !channelId) {
    res.status(400).json({ ok: false, message: 'Valid server and channel are required.' });
    return;
  }

  try {
    const membership = await canAccessServer(req.userId, serverId);
    if (!membership) {
      res.status(403).json({ ok: false, message: 'Access denied.' });
      return;
    }

    const channel = await db.query(
      'SELECT id, server_id, type, name FROM channels WHERE id = $1 AND server_id = $2',
      [channelId, serverId]
    );
    if (channel.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Channel not found.' });
      return;
    }
    if (channel.rows[0].type !== 'voice') {
      res.status(400).json({ ok: false, message: 'This channel is not a voice channel.' });
      return;
    }

    const user = await db.query('SELECT username FROM users WHERE id = $1', [req.userId]);
    const roomName = `server-${serverId}-channel-${channelId}`;
    const voice = await createVoiceToken({
      identity: String(req.userId),
      name: user.rows[0]?.username || `user-${req.userId}`,
      roomName
    });

    res.json({
      ok: true,
      roomName,
      livekitUrl: voice.livekitUrl,
      token: voice.token,
      debug: voice.debug
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to create voice token: ${error.message}` });
  }
});

app.post('/api/vc/participants', authMiddleware, async (req, res) => {
  const serverId = Number(req.body?.serverId);
  const channelId = Number(req.body?.channelId);
  if (!serverId || !channelId) {
    res.status(400).json({ ok: false, message: 'Valid server and channel are required.' });
    return;
  }

  try {
    const membership = await canAccessServer(req.userId, serverId);
    if (!membership) {
      res.status(403).json({ ok: false, message: 'Access denied.' });
      return;
    }

    const channel = await db.query('SELECT id, type FROM channels WHERE id = $1 AND server_id = $2', [channelId, serverId]);
    if (channel.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Channel not found.' });
      return;
    }
    if (channel.rows[0].type !== 'voice') {
      res.status(400).json({ ok: false, message: 'This channel is not a voice channel.' });
      return;
    }

    const roomName = `server-${serverId}-channel-${channelId}`;
    const participants = await listVoiceParticipants(roomName);
    res.json({ ok: true, participants });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to fetch voice participants: ${error.message}` });
  }
});

app.post('/api/chat/servers/:serverId/invites', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  if (!serverId) {
    res.status(400).json({ ok: false, message: 'Valid server id is required.' });
    return;
  }

  try {
    const server = await db.query('SELECT id, name FROM servers WHERE id = $1', [serverId]);
    if (server.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Server not found.' });
      return;
    }
    const permissions = await getUserServerPermissions(req.userId, serverId);
    if (!permissions.create_invites) {
      res.status(403).json({ ok: false, message: 'You do not have permission to create invites.' });
      return;
    }

    let code = '';
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = generateInviteCode();
      const exists = await db.query('SELECT 1 FROM server_invites WHERE code = $1', [candidate]);
      if (exists.rows.length === 0) {
        code = candidate;
        break;
      }
    }

    if (!code) {
      res.status(500).json({ ok: false, message: 'Could not generate invite code. Try again.' });
      return;
    }

    await db.query(
      'INSERT INTO server_invites (server_id, code, created_by_user_id) VALUES ($1, $2, $3)',
      [serverId, code, req.userId]
    );

    res.json({ ok: true, invite: { code, serverId, serverName: server.rows[0].name, url: buildInviteUrl(code) } });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to create invite: ${error.message}` });
  }
});

app.post('/api/chat/invites/join', authMiddleware, async (req, res) => {
  const code = normalizeInviteCode(req.body?.code);
  if (!code) {
    res.status(400).json({ ok: false, message: 'Invite code is required.' });
    return;
  }

  try {
    const inviteResult = await db.query(
      `SELECT i.id, i.server_id, i.code, i.uses_count, i.max_uses, i.expires_at, i.is_active, s.name
       FROM server_invites i
       JOIN servers s ON s.id = i.server_id
       WHERE UPPER(i.code) = $1`,
      [code]
    );
    if (inviteResult.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Invalid invite code.' });
      return;
    }

    const invite = inviteResult.rows[0];
    if (!invite.is_active) {
      res.status(400).json({ ok: false, message: 'Invite is inactive.' });
      return;
    }
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      res.status(400).json({ ok: false, message: 'Invite has expired.' });
      return;
    }
    if (invite.max_uses && invite.uses_count >= invite.max_uses) {
      res.status(400).json({ ok: false, message: 'Invite has reached max uses.' });
      return;
    }

    const banned = await db.query(
      'SELECT 1 FROM server_bans WHERE server_id = $1 AND user_id = $2',
      [invite.server_id, req.userId]
    );
    if (banned.rows.length > 0) {
      res.status(403).json({ ok: false, message: 'You are banned from this server.' });
      return;
    }

    const existing = await db.query(
      'SELECT 1 FROM server_members WHERE user_id = $1 AND server_id = $2',
      [req.userId, invite.server_id]
    );
    if (existing.rows.length > 0) {
      res.json({ ok: true, alreadyMember: true, server: { id: invite.server_id, name: invite.name } });
      return;
    }

    await db.query(
      'INSERT INTO server_members (user_id, server_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.userId, invite.server_id]
    );
    await db.query('UPDATE server_invites SET uses_count = uses_count + 1 WHERE id = $1', [invite.id]);
    await broadcastToServerMembers(invite.server_id, { type: 'server-membership-changed', serverId: invite.server_id });
    await broadcastPresenceForUser(req.userId);

    res.json({ ok: true, server: { id: invite.server_id, name: invite.name } });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to join by invite: ${error.message}` });
  }
});

app.get('/api/chat/servers/:serverId/presence', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  if (!serverId) {
    res.status(400).json({ ok: false, message: 'Invalid server id.' });
    return;
  }

  try {
    const membership = await canAccessServer(req.userId, serverId);
    if (!membership) {
      res.status(403).json({ ok: false, message: 'Access denied.' });
      return;
    }

    const permissions = await getUserServerPermissions(req.userId, serverId);
    const members = await db.query(
      `SELECT u.id, u.username, u.avatar_url,
              COALESCE(
                ARRAY_AGG(r.name ORDER BY r.position DESC, r.name ASC) FILTER (WHERE r.id IS NOT NULL),
                '{}'::text[]
              ) AS role_names
       FROM server_members sm
       JOIN users u ON u.id = sm.user_id
       LEFT JOIN server_member_roles smr ON smr.server_id = sm.server_id AND smr.user_id = sm.user_id
       LEFT JOIN server_roles r ON r.id = smr.role_id
       WHERE sm.server_id = $1
         AND u.platform_banned_at IS NULL
       GROUP BY u.id, u.username, u.avatar_url
       ORDER BY u.username`,
      [serverId]
    );
    const onlineIds = getOnlineUserIds();
    const users = members.rows.map((row) => ({ ...row, online: onlineIds.has(row.id) }));
    res.json({ ok: true, users, permissions });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load server presence: ${error.message}` });
  }
});

app.get('/api/chat/servers/:serverId/roles', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  if (!serverId) {
    res.status(400).json({ ok: false, message: 'Valid server id is required.' });
    return;
  }
  try {
    const membership = await canAccessServer(req.userId, serverId);
    if (!membership) {
      res.status(403).json({ ok: false, message: 'Access denied.' });
      return;
    }
    const permissions = await getUserServerPermissions(req.userId, serverId);
    const roles = await getServerRoles(serverId);
    const members = await db.query(
      `SELECT u.id, u.username, u.avatar_url,
              COALESCE(ARRAY_AGG(smr.role_id ORDER BY smr.role_id) FILTER (WHERE smr.role_id IS NOT NULL), '{}'::int[]) AS role_ids
       FROM server_members sm
       JOIN users u ON u.id = sm.user_id
       LEFT JOIN server_member_roles smr ON smr.server_id = sm.server_id AND smr.user_id = sm.user_id
       WHERE sm.server_id = $1
       GROUP BY u.id, u.username, u.avatar_url
       ORDER BY u.username`,
      [serverId]
    );
    res.json({ ok: true, permissions, roles, members: members.rows });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load roles: ${error.message}` });
  }
});

app.post('/api/chat/servers/:serverId/roles', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  const name = String(req.body?.name || '').trim();
  if (!serverId || name.length < 2 || name.length > 80) {
    res.status(400).json({ ok: false, message: 'Role name must be between 2 and 80 characters.' });
    return;
  }
  try {
    const permissions = await getUserServerPermissions(req.userId, serverId);
    if (!permissions.manage_roles) {
      res.status(403).json({ ok: false, message: 'You do not have permission to manage roles.' });
      return;
    }
    const created = await db.query(
      `INSERT INTO server_roles (server_id, name, position, permissions, is_default)
       VALUES ($1, $2, 1, '{}'::jsonb, FALSE)
       RETURNING id, server_id, name, position, permissions, is_default`,
      [serverId, name]
    );
    res.json({ ok: true, role: { ...created.rows[0], permissions: normalizeServerPermissions(created.rows[0].permissions) } });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to create role: ${error.message}` });
  }
});

app.post('/api/chat/servers/:serverId/roles/:roleId', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  const roleId = Number(req.params.roleId);
  const name = String(req.body?.name || '').trim();
  const rolePermissions = normalizeServerPermissions(req.body?.permissions);
  if (!serverId || !roleId || name.length < 2 || name.length > 80) {
    res.status(400).json({ ok: false, message: 'Valid server, role, and role name are required.' });
    return;
  }
  try {
    const permissions = await getUserServerPermissions(req.userId, serverId);
    if (!permissions.manage_roles) {
      res.status(403).json({ ok: false, message: 'You do not have permission to manage roles.' });
      return;
    }
    const existing = await db.query('SELECT id, is_default FROM server_roles WHERE id = $1 AND server_id = $2', [roleId, serverId]);
    if (existing.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Role not found.' });
      return;
    }
    const nextName = existing.rows[0].is_default ? '@everyone' : name;
    const updated = await db.query(
      `UPDATE server_roles SET name = $1, permissions = $2::jsonb
       WHERE id = $3 AND server_id = $4
       RETURNING id, server_id, name, position, permissions, is_default`,
      [nextName, JSON.stringify(rolePermissions), roleId, serverId]
    );
    res.json({ ok: true, role: { ...updated.rows[0], permissions: normalizeServerPermissions(updated.rows[0].permissions) } });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to update role: ${error.message}` });
  }
});

app.delete('/api/chat/servers/:serverId/roles/:roleId', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  const roleId = Number(req.params.roleId);
  if (!serverId || !roleId) {
    res.status(400).json({ ok: false, message: 'Valid server and role are required.' });
    return;
  }
  try {
    const permissions = await getUserServerPermissions(req.userId, serverId);
    if (!permissions.manage_roles) {
      res.status(403).json({ ok: false, message: 'You do not have permission to manage roles.' });
      return;
    }
    const existing = await db.query('SELECT id, is_default FROM server_roles WHERE id = $1 AND server_id = $2', [roleId, serverId]);
    if (existing.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Role not found.' });
      return;
    }
    if (existing.rows[0].is_default) {
      res.status(400).json({ ok: false, message: 'The default role cannot be deleted.' });
      return;
    }
    await db.query('DELETE FROM server_roles WHERE id = $1 AND server_id = $2', [roleId, serverId]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to delete role: ${error.message}` });
  }
});

app.post('/api/chat/servers/:serverId/roles/:roleId/members', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  const roleId = Number(req.params.roleId);
  const targetUserId = Number(req.body?.targetUserId);
  const enabled = Boolean(req.body?.enabled);
  if (!serverId || !roleId || !targetUserId) {
    res.status(400).json({ ok: false, message: 'Valid server, role, and member are required.' });
    return;
  }
  try {
    const permissions = await getUserServerPermissions(req.userId, serverId);
    if (!permissions.manage_roles) {
      res.status(403).json({ ok: false, message: 'You do not have permission to manage roles.' });
      return;
    }
    if (await isServerOwner(targetUserId, serverId)) {
      res.status(400).json({ ok: false, message: 'You cannot modify the server owner roles.' });
      return;
    }
    const member = await db.query('SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2', [serverId, targetUserId]);
    if (member.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'User is not in this server.' });
      return;
    }
    const role = await db.query('SELECT id, is_default FROM server_roles WHERE id = $1 AND server_id = $2', [roleId, serverId]);
    if (role.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Role not found.' });
      return;
    }
    if (role.rows[0].is_default) {
      res.status(400).json({ ok: false, message: 'The default role is applied automatically.' });
      return;
    }
    if (enabled) {
      await db.query(
        'INSERT INTO server_member_roles (user_id, server_id, role_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [targetUserId, serverId, roleId]
      );
    } else {
      await db.query(
        'DELETE FROM server_member_roles WHERE user_id = $1 AND server_id = $2 AND role_id = $3',
        [targetUserId, serverId, roleId]
      );
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to update member role: ${error.message}` });
  }
});

app.post('/api/admin/users/search', authMiddleware, async (req, res) => {
  try {
    if (!(await requirePlatformAdmin(req.userId))) {
      res.status(403).json({ ok: false, message: 'Platform admin access required.' });
      return;
    }

    const query = String(req.body?.query || '').trim();
    const like = `%${query}%`;
    const result = await db.query(
      `SELECT id, username, email, avatar_url, is_platform_admin, platform_banned_at, platform_ban_reason, account_standing, standing_reason, tos_violation_count
       FROM users
       WHERE $1 = '%%'
          OR username ILIKE $1
          OR email ILIKE $1
       ORDER BY is_platform_admin DESC, username ASC
       LIMIT 100`,
      [like]
    );
    res.json({ ok: true, users: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load users: ${error.message}` });
  }
});

app.get('/api/admin/users/:userId', authMiddleware, async (req, res) => {
  const targetUserId = Number(req.params.userId);
  if (!targetUserId) {
    res.status(400).json({ ok: false, message: 'Valid user id is required.' });
    return;
  }

  try {
    if (!(await requirePlatformAdmin(req.userId))) {
      res.status(403).json({ ok: false, message: 'Platform admin access required.' });
      return;
    }

    const user = await getUserAdminState(targetUserId);
    if (!user) {
      res.status(404).json({ ok: false, message: 'User not found.' });
      return;
    }

    const memberships = await db.query(
      `SELECT s.id, s.name, sm.joined_at, (s.owner_user_id = sm.user_id) AS is_owner,
              COALESCE(
                ARRAY_AGG(r.name ORDER BY r.position DESC, r.name ASC) FILTER (WHERE r.id IS NOT NULL),
                '{}'::text[]
              ) AS role_names
       FROM server_members sm
       JOIN servers s ON s.id = sm.server_id
       LEFT JOIN server_member_roles smr ON smr.user_id = sm.user_id AND smr.server_id = sm.server_id
       LEFT JOIN server_roles r ON r.id = smr.role_id
       WHERE sm.user_id = $1
       GROUP BY s.id, s.name, sm.joined_at, s.owner_user_id, sm.user_id
       ORDER BY LOWER(s.name), s.id`,
      [targetUserId]
    );
    const reports = await db.query(
      `SELECT ur.id, ur.reason, ur.created_at, ur.server_id, ur.reporter_user_id,
              reporter.username AS reporter_username, s.name AS server_name
       FROM user_reports ur
       JOIN users reporter ON reporter.id = ur.reporter_user_id
       LEFT JOIN servers s ON s.id = ur.server_id
       WHERE ur.target_user_id = $1
       ORDER BY ur.created_at DESC
       LIMIT 50`,
      [targetUserId]
    );

    res.json({ ok: true, user, servers: memberships.rows, reports: reports.rows });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load user details: ${error.message}` });
  }
});

app.post('/api/reports/users', authMiddleware, async (req, res) => {
  const targetUserId = Number(req.body?.targetUserId);
  const serverId = req.body?.serverId ? Number(req.body.serverId) : null;
  const reason = String(req.body?.reason || '').trim();
  if (!targetUserId || reason.length < 5 || reason.length > 500) {
    res.status(400).json({ ok: false, message: 'Report reason must be between 5 and 500 characters.' });
    return;
  }
  if (targetUserId === req.userId) {
    res.status(400).json({ ok: false, message: 'You cannot report yourself.' });
    return;
  }

  try {
    const target = await db.query('SELECT id FROM users WHERE id = $1', [targetUserId]);
    if (target.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'User not found.' });
      return;
    }
    if (serverId) {
      const access = await db.query('SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2', [serverId, req.userId]);
      if (access.rows.length === 0) {
        res.status(403).json({ ok: false, message: 'You can only attach reports to servers you are in.' });
        return;
      }
    }

    await db.query(
      'INSERT INTO user_reports (reporter_user_id, target_user_id, server_id, reason) VALUES ($1, $2, $3, $4)',
      [req.userId, targetUserId, serverId, reason]
    );
    const reportVolume = await db.query(
      `SELECT COUNT(*)::int AS count
       FROM user_reports
       WHERE target_user_id = $1
         AND created_at >= NOW() - INTERVAL '30 days'`,
      [targetUserId]
    );
    if ((reportVolume.rows[0]?.count || 0) >= 3) {
      await applyAutomaticStandingUpdate(targetUserId, {
        increment: 1,
        reason: 'Multiple user reports were received for this account.'
      });
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to submit report: ${error.message}` });
  }
});

app.get('/api/admin/servers/:serverId', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  if (!serverId) {
    res.status(400).json({ ok: false, message: 'Valid server id is required.' });
    return;
  }

  try {
    if (!(await requirePlatformAdmin(req.userId))) {
      res.status(403).json({ ok: false, message: 'Platform admin access required.' });
      return;
    }

    const server = await db.query('SELECT id, name, owner_user_id, created_at FROM servers WHERE id = $1', [serverId]);
    if (server.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Server not found.' });
      return;
    }

    const channels = await db.query(
      `SELECT id, name, type, created_at
       FROM channels
       WHERE server_id = $1
       ORDER BY type DESC, LOWER(name), id`,
      [serverId]
    );
    const members = await db.query(
      `SELECT u.id, u.username, u.avatar_url, u.platform_banned_at, sm.joined_at,
              (s.owner_user_id = u.id) AS is_owner,
              COALESCE(
                ARRAY_AGG(r.name ORDER BY r.position DESC, r.name ASC) FILTER (WHERE r.id IS NOT NULL),
                '{}'::text[]
              ) AS role_names
       FROM server_members sm
       JOIN servers s ON s.id = sm.server_id
       JOIN users u ON u.id = sm.user_id
       LEFT JOIN server_member_roles smr ON smr.user_id = sm.user_id AND smr.server_id = sm.server_id
       LEFT JOIN server_roles r ON r.id = smr.role_id
       WHERE sm.server_id = $1
       GROUP BY u.id, u.username, u.avatar_url, u.platform_banned_at, sm.joined_at, s.owner_user_id
       ORDER BY LOWER(u.username), u.id`,
      [serverId]
    );

    res.json({ ok: true, server: server.rows[0], channels: channels.rows, members: members.rows });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load server view: ${error.message}` });
  }
});

app.post('/api/admin/users/:userId', authMiddleware, async (req, res) => {
  const targetUserId = Number(req.params.userId);
  if (!targetUserId) {
    res.status(400).json({ ok: false, message: 'Valid user id is required.' });
    return;
  }

  try {
    if (!(await requirePlatformAdmin(req.userId))) {
      res.status(403).json({ ok: false, message: 'Platform admin access required.' });
      return;
    }

    const target = await getUserAdminState(targetUserId);
    if (!target) {
      res.status(404).json({ ok: false, message: 'User not found.' });
      return;
    }
    if (target.id === req.userId) {
      res.status(400).json({ ok: false, message: 'You cannot change your own platform admin status here.' });
      return;
    }

    let nextAdmin = target.is_platform_admin;
    if (typeof req.body?.isPlatformAdmin === 'boolean') {
      nextAdmin = req.body.isPlatformAdmin;
    }

    let nextBanned = Boolean(target.platform_banned_at);
    if (typeof req.body?.platformBanned === 'boolean') {
      nextBanned = req.body.platformBanned;
    }
    const allowedStandings = new Set(['good', 'warning', 'restricted', 'banned']);
    let nextStanding = allowedStandings.has(String(req.body?.accountStanding || '').trim())
      ? String(req.body.accountStanding).trim()
      : (target.account_standing || 'good');
    let nextStandingReason = typeof req.body?.standingReason === 'string'
      ? String(req.body.standingReason || '').trim().slice(0, 500) || null
      : (target.standing_reason || null);
    let nextViolationCount = Number(target.tos_violation_count || 0);
    if (req.body?.resetViolations) {
      nextViolationCount = 0;
    }
    if (req.body?.incrementViolations) {
      nextViolationCount += 1;
    }

    if (target.is_platform_admin && (!nextAdmin || nextBanned)) {
      const adminCount = await countPlatformAdmins();
      if (adminCount <= 1) {
        res.status(400).json({ ok: false, message: 'JelloChat must always keep at least one platform admin.' });
        return;
      }
    }

    const nextBanReason = nextBanned ? String(req.body?.platformBanReason || '').trim().slice(0, 500) || null : null;
    if (nextBanned) {
      nextStanding = 'banned';
      if (!nextStandingReason) {
        nextStandingReason = nextBanReason || 'Account terminated for Terms of Service violations.';
      }
    }
    const updated = await db.query(
      `UPDATE users
       SET is_platform_admin = $1,
           platform_banned_at = CASE WHEN $2 THEN NOW() ELSE NULL END,
           platform_ban_reason = $3,
           account_standing = $4,
           standing_reason = $5,
           tos_violation_count = $6,
           standing_updated_at = NOW()
       WHERE id = $7
       RETURNING id, username, email, avatar_url, is_platform_admin, platform_banned_at, platform_ban_reason, account_standing, standing_reason, tos_violation_count, standing_updated_at`,
      [nextAdmin, nextBanned, nextBanReason, nextStanding, nextStandingReason, nextViolationCount, targetUserId]
    );

    if (nextBanned) {
      clearAuthTokensForUser(targetUserId);
      disconnectRealtimeUser(targetUserId, 'Account banned from JelloChat.');
    }
    if (!target.platform_banned_at && nextBanned) {
      sendTerminationEmail(updated.rows[0].email, updated.rows[0].username, nextBanReason || nextStandingReason || 'Your account was terminated for Terms of Service violations.').catch(() => {});
    }

    res.json({ ok: true, user: updated.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to update user: ${error.message}` });
  }
});

app.delete('/api/admin/servers/:serverId', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  if (!serverId) {
    res.status(400).json({ ok: false, message: 'Valid server id is required.' });
    return;
  }

  try {
    if (!(await requirePlatformAdmin(req.userId))) {
      res.status(403).json({ ok: false, message: 'Platform admin access required.' });
      return;
    }

    const server = await db.query('SELECT id, name FROM servers WHERE id = $1', [serverId]);
    if (server.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Server not found.' });
      return;
    }

    const memberIds = await db.query('SELECT user_id FROM server_members WHERE server_id = $1', [serverId]);
    await db.query('DELETE FROM servers WHERE id = $1', [serverId]);
    broadcastToUsers(memberIds.rows.map((row) => row.user_id), { type: 'server-membership-changed', serverId });
    res.json({ ok: true, serverName: server.rows[0].name });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to delete server: ${error.message}` });
  }
});

app.delete('/api/admin/users/:userId', authMiddleware, async (req, res) => {
  const targetUserId = Number(req.params.userId);
  if (!targetUserId) {
    res.status(400).json({ ok: false, message: 'Valid user id is required.' });
    return;
  }

  try {
    if (!(await requirePlatformAdmin(req.userId))) {
      res.status(403).json({ ok: false, message: 'Platform admin access required.' });
      return;
    }
    if (targetUserId === req.userId) {
      res.status(400).json({ ok: false, message: 'You cannot delete your own account from the admin panel.' });
      return;
    }

    const target = await getUserAdminState(targetUserId);
    if (!target) {
      res.status(404).json({ ok: false, message: 'User not found.' });
      return;
    }
    if (target.is_platform_admin) {
      const adminCount = await countPlatformAdmins();
      if (adminCount <= 1) {
        res.status(400).json({ ok: false, message: 'JelloChat must always keep at least one platform admin.' });
        return;
      }
    }

    await db.query('DELETE FROM users WHERE id = $1', [targetUserId]);
    clearAuthTokensForUser(targetUserId);
    disconnectRealtimeUser(targetUserId, 'Account deleted.');
    await ensurePlatformAdminExists();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to delete user: ${error.message}` });
  }
});

app.get('/api/friends', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.username, u.avatar_url
       FROM friendships f
       JOIN users u ON u.id = f.friend_user_id
       WHERE f.user_id = $1
       ORDER BY u.username`,
      [req.userId]
    );
    const onlineIds = getOnlineUserIds();
    const friends = result.rows.map((row) => ({ ...row, online: onlineIds.has(row.id) }));
    res.json({ ok: true, friends });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load friends: ${error.message}` });
  }
});

app.get('/api/dm/:partnerUserId/messages', authMiddleware, async (req, res) => {
  const partnerUserId = Number(req.params.partnerUserId);
  if (!partnerUserId) {
    res.status(400).json({ ok: false, message: 'Valid partner user id is required.' });
    return;
  }

  try {
    const allowed = await canUsersDm(req.userId, partnerUserId);
    if (!allowed) {
      res.status(403).json({ ok: false, message: 'You can only DM friends or users in a shared server.' });
      return;
    }

    const partner = await db.query('SELECT id, username, avatar_url FROM users WHERE id = $1', [partnerUserId]);
    if (partner.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'User not found.' });
      return;
    }

    const messages = await db.query(
      `SELECT m.id, m.sender_user_id AS user_id, m.receiver_user_id, m.content, m.created_at, u.username, u.avatar_url
       FROM dm_messages m
       JOIN users u ON u.id = m.sender_user_id
       WHERE (m.sender_user_id = $1 AND m.receiver_user_id = $2)
          OR (m.sender_user_id = $2 AND m.receiver_user_id = $1)
       ORDER BY m.created_at ASC
       LIMIT 300`,
      [req.userId, partnerUserId]
    );

    res.json({ ok: true, messages: messages.rows, currentUserId: req.userId, partner: partner.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load DM messages: ${error.message}` });
  }
});

app.post('/api/dm/:partnerUserId/messages', authMiddleware, async (req, res) => {
  const partnerUserId = Number(req.params.partnerUserId);
  const content = String(req.body?.content || '').trim();
  if (!partnerUserId || !content) {
    res.status(400).json({ ok: false, message: 'Partner and content are required.' });
    return;
  }

  try {
    const allowed = await canUsersDm(req.userId, partnerUserId);
    if (!allowed) {
      res.status(403).json({ ok: false, message: 'You can only DM friends or users in a shared server.' });
      return;
    }

    const moderationMessage = await runMinimumAutoModeration({
      userId: req.userId,
      partnerUserId,
      content
    });
    if (moderationMessage) {
      res.status(400).json({ ok: false, message: moderationMessage });
      return;
    }

    const inserted = await db.query(
      `INSERT INTO dm_messages (sender_user_id, receiver_user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, sender_user_id, receiver_user_id, content, created_at`,
      [req.userId, partnerUserId, content]
    );
    const me = await db.query('SELECT username, avatar_url FROM users WHERE id = $1', [req.userId]);
    const message = {
      id: inserted.rows[0].id,
      user_id: inserted.rows[0].sender_user_id,
      receiver_user_id: inserted.rows[0].receiver_user_id,
      content: inserted.rows[0].content,
      created_at: inserted.rows[0].created_at,
      username: me.rows[0]?.username || 'Unknown',
      avatar_url: me.rows[0]?.avatar_url || ''
    };

    broadcastToUsers([req.userId, partnerUserId], {
      type: 'dm-message-created',
      fromUserId: req.userId
    });
    res.json({ ok: true, message });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to send DM: ${error.message}` });
  }
});

app.get('/api/friends/requests', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT fr.id, fr.sender_user_id, u.username, u.avatar_url, fr.created_at
       FROM friend_requests fr
       JOIN users u ON u.id = fr.sender_user_id
       WHERE fr.receiver_user_id = $1 AND fr.status = 'pending'
       ORDER BY fr.created_at DESC`,
      [req.userId]
    );
    res.json({ ok: true, requests: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load friend requests: ${error.message}` });
  }
});

app.post('/api/friends/requests', authMiddleware, async (req, res) => {
  const target = String(req.body?.target || '').trim().toLowerCase();
  if (!target) {
    res.status(400).json({ ok: false, message: 'Username or email is required.' });
    return;
  }

  try {
    const targetUser = await db.query(
      `SELECT id, username
       FROM users
       WHERE LOWER(username) = $1 OR LOWER(email) = $1
       LIMIT 1`,
      [target]
    );
    if (targetUser.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'User not found.' });
      return;
    }

    const receiverId = targetUser.rows[0].id;
    if (receiverId === req.userId) {
      res.status(400).json({ ok: false, message: 'You cannot add yourself.' });
      return;
    }

    const alreadyFriends = await db.query(
      'SELECT 1 FROM friendships WHERE user_id = $1 AND friend_user_id = $2',
      [req.userId, receiverId]
    );
    if (alreadyFriends.rows.length > 0) {
      res.status(400).json({ ok: false, message: 'You are already friends.' });
      return;
    }

    const existingRequest = await db.query(
      `SELECT 1
       FROM friend_requests
       WHERE status = 'pending'
         AND ((sender_user_id = $1 AND receiver_user_id = $2)
           OR (sender_user_id = $2 AND receiver_user_id = $1))`,
      [req.userId, receiverId]
    );
    if (existingRequest.rows.length > 0) {
      res.status(400).json({ ok: false, message: 'A pending request already exists.' });
      return;
    }

    await db.query(
      'INSERT INTO friend_requests (sender_user_id, receiver_user_id, status) VALUES ($1, $2, $3)',
      [req.userId, receiverId, 'pending']
    );
    broadcastToUsers([receiverId], { type: 'friend-requests-changed' });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to send friend request: ${error.message}` });
  }
});

app.post('/api/friends/requests/:requestId/respond', authMiddleware, async (req, res) => {
  const requestId = Number(req.params.requestId);
  const action = String(req.body?.action || '').toLowerCase();
  if (!requestId || !['accept', 'reject'].includes(action)) {
    res.status(400).json({ ok: false, message: 'Valid request id and action are required.' });
    return;
  }

  try {
    const request = await db.query(
      `SELECT id, sender_user_id, receiver_user_id, status
       FROM friend_requests
       WHERE id = $1`,
      [requestId]
    );
    if (request.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Request not found.' });
      return;
    }

    const row = request.rows[0];
    if (row.receiver_user_id !== req.userId) {
      res.status(403).json({ ok: false, message: 'Access denied.' });
      return;
    }
    if (row.status !== 'pending') {
      res.status(400).json({ ok: false, message: 'Request already handled.' });
      return;
    }

    if (action === 'accept') {
      await db.query(
        'INSERT INTO friendships (user_id, friend_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [row.sender_user_id, row.receiver_user_id]
      );
      await db.query(
        'INSERT INTO friendships (user_id, friend_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [row.receiver_user_id, row.sender_user_id]
      );
      await db.query(
        "UPDATE friend_requests SET status = 'accepted', responded_at = NOW() WHERE id = $1",
        [requestId]
      );
      broadcastToUsers([row.sender_user_id, row.receiver_user_id], { type: 'friends-changed' });
    } else {
      await db.query(
        "UPDATE friend_requests SET status = 'rejected', responded_at = NOW() WHERE id = $1",
        [requestId]
      );
      broadcastToUsers([row.sender_user_id], { type: 'friend-requests-changed' });
    }

    broadcastToUsers([row.receiver_user_id], { type: 'friend-requests-changed' });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to respond to friend request: ${error.message}` });
  }
});

app.post('/api/dm/:partnerUserId/call/start', authMiddleware, async (req, res) => {
  const partnerUserId = Number(req.params.partnerUserId);
  if (!partnerUserId) {
    res.status(400).json({ ok: false, message: 'Valid partner user id is required.' });
    return;
  }

  try {
    const canDm = await canUsersDm(req.userId, partnerUserId);
    if (!canDm) {
      res.status(403).json({ ok: false, message: 'You can only call friends or users in a shared server.' });
      return;
    }

    const users = await db.query(
      'SELECT id, username FROM users WHERE id = ANY($1::int[])',
      [[req.userId, partnerUserId]]
    );
    if (users.rows.length < 2) {
      res.status(404).json({ ok: false, message: 'User not found.' });
      return;
    }

    const me = users.rows.find((user) => user.id === req.userId);
    const partner = users.rows.find((user) => user.id === partnerUserId);
    const roomName = getDmCallRoomName(req.userId, partnerUserId);
    const voice = await createVoiceToken({
      identity: String(req.userId),
      name: me?.username || `user-${req.userId}`,
      roomName
    });

    broadcastToUsers([partnerUserId], {
      type: 'dm-call-started',
      fromUserId: req.userId,
      fromUsername: me?.username || 'Unknown',
      partnerUserId,
      roomName
    });

    res.json({
      ok: true,
      roomName,
      livekitUrl: voice.livekitUrl,
      token: voice.token,
      debug: voice.debug,
      partner: partner || null
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to start personal call: ${error.message}` });
  }
});

app.post('/api/dm/:partnerUserId/call/join', authMiddleware, async (req, res) => {
  const partnerUserId = Number(req.params.partnerUserId);
  if (!partnerUserId) {
    res.status(400).json({ ok: false, message: 'Valid partner user id is required.' });
    return;
  }

  try {
    const canDm = await canUsersDm(req.userId, partnerUserId);
    if (!canDm) {
      res.status(403).json({ ok: false, message: 'You can only call friends or users in a shared server.' });
      return;
    }

    const users = await db.query(
      'SELECT id, username FROM users WHERE id = ANY($1::int[])',
      [[req.userId, partnerUserId]]
    );
    if (users.rows.length < 2) {
      res.status(404).json({ ok: false, message: 'User not found.' });
      return;
    }

    const me = users.rows.find((user) => user.id === req.userId);
    const partner = users.rows.find((user) => user.id === partnerUserId);
    const roomName = getDmCallRoomName(req.userId, partnerUserId);
    const voice = await createVoiceToken({
      identity: String(req.userId),
      name: me?.username || `user-${req.userId}`,
      roomName
    });

    res.json({
      ok: true,
      roomName,
      livekitUrl: voice.livekitUrl,
      token: voice.token,
      debug: voice.debug,
      partner: partner || null
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to join personal call: ${error.message}` });
  }
});

app.get('/api/chat/channels/:channelId/messages', authMiddleware, async (req, res) => {
  const channelId = Number(req.params.channelId);
  if (!channelId) {
    res.status(400).json({ ok: false, message: 'Invalid channel id.' });
    return;
  }

  try {
    const access = await db.query(
      `SELECT c.server_id
       FROM channels c
       JOIN server_members sm ON sm.server_id = c.server_id
       WHERE c.id = $1 AND sm.user_id = $2`,
      [channelId, req.userId]
    );
    if (access.rows.length === 0) {
      res.status(403).json({ ok: false, message: 'Access denied.' });
      return;
    }

    const messages = await db.query(
      `SELECT m.id, m.channel_id, m.user_id, m.content, m.created_at, u.username, u.avatar_url
       FROM messages m
       JOIN users u ON u.id = m.user_id
       WHERE m.channel_id = $1
       ORDER BY m.created_at ASC
       LIMIT 200`,
      [channelId]
    );
    res.json({ ok: true, messages: messages.rows, currentUserId: req.userId });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load messages: ${error.message}` });
  }
});

app.post('/api/chat/messages', authMiddleware, async (req, res) => {
  const channelId = Number(req.body?.channelId);
  const content = String(req.body?.content || '').trim();
  if (!channelId || !content) {
    res.status(400).json({ ok: false, message: 'Channel and message content are required.' });
    return;
  }

  try {
    const access = await db.query(
      `SELECT c.server_id
       FROM channels c
       JOIN server_members sm ON sm.server_id = c.server_id
       WHERE c.id = $1 AND sm.user_id = $2`,
      [channelId, req.userId]
    );
    if (access.rows.length === 0) {
      res.status(403).json({ ok: false, message: 'Access denied.' });
      return;
    }

    const moderationResult = await handleServerAutoModeration(access.rows[0].server_id, channelId, req.userId, content);
    if (moderationResult?.blocked) {
      res.status(400).json({ ok: false, message: moderationResult.message });
      return;
    }

    const inserted = await db.query(
      `INSERT INTO messages (channel_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, channel_id, user_id, content, created_at`,
      [channelId, req.userId, content]
    );
    const user = await db.query('SELECT username, avatar_url FROM users WHERE id = $1', [req.userId]);
    const message = { ...inserted.rows[0], username: user.rows[0]?.username || 'Unknown', avatar_url: user.rows[0]?.avatar_url || '' };
    broadcastToChannel(channelId, { type: 'message-created', channelId, message });
    res.json({ ok: true, message });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to send message: ${error.message}` });
  }
});

app.patch('/api/chat/messages/:messageId', authMiddleware, async (req, res) => {
  const messageId = Number(req.params.messageId);
  const content = String(req.body?.content || '').trim();
  if (!messageId || !content) {
    res.status(400).json({ ok: false, message: 'Message id and content are required.' });
    return;
  }

  try {
    const access = await getMessageAccess(req.userId, messageId);
    if (!access) {
      res.status(403).json({ ok: false, message: 'Access denied.' });
      return;
    }
    if (access.user_id !== req.userId) {
      res.status(403).json({ ok: false, message: 'You can only edit your own messages.' });
      return;
    }

    const updated = await db.query(
      'UPDATE messages SET content = $1 WHERE id = $2 RETURNING id, channel_id, user_id, content, created_at',
      [content, messageId]
    );
    const user = await db.query('SELECT username, avatar_url FROM users WHERE id = $1', [req.userId]);
    const message = { ...updated.rows[0], username: user.rows[0]?.username || 'Unknown', avatar_url: user.rows[0]?.avatar_url || '' };

    broadcastToChannel(message.channel_id, { type: 'message-updated', channelId: message.channel_id, message });
    res.json({ ok: true, message });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to update message: ${error.message}` });
  }
});

app.delete('/api/chat/messages/:messageId', authMiddleware, async (req, res) => {
  const messageId = Number(req.params.messageId);
  if (!messageId) {
    res.status(400).json({ ok: false, message: 'Message id is required.' });
    return;
  }

  try {
    const access = await getMessageAccess(req.userId, messageId);
    if (!access) {
      res.status(403).json({ ok: false, message: 'Access denied.' });
      return;
    }
    if (access.user_id !== req.userId) {
      res.status(403).json({ ok: false, message: 'You can only delete your own messages.' });
      return;
    }

    await db.query('DELETE FROM messages WHERE id = $1', [messageId]);
    broadcastToChannel(access.channel_id, { type: 'message-deleted', channelId: access.channel_id, messageId });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to delete message: ${error.message}` });
  }
});

app.get('/api/realtime/config', authMiddleware, async (req, res) => {
  const protocol = req.secure ? 'wss' : 'ws';
  res.json({ ok: true, wsUrl: `${protocol}://${req.headers.host}/ws` });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

async function start() {
  await db.connect();
  await ensurePlatformAdminExists();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws, request) => {
    const url = new URL(request.url || '/', `http://${request.headers.host}`);
    const token = url.searchParams.get('token');
    const userId = token ? authTokens.get(token) : null;

    if (!userId) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    const user = await getUserAdminState(userId).catch(() => null);
    if (!user || user.platform_banned_at) {
      clearAuthTokensForUser(userId);
      ws.close(4003, 'Account banned from JelloChat.');
      return;
    }

    wsClients.set(ws, { userId, subscriptions: new Set() });
    sendWs(ws, { type: 'connected' });
    broadcastPresenceForUser(userId).catch(() => {});

    ws.on('message', async (buffer) => {
      try {
        const message = JSON.parse(String(buffer));
        const meta = wsClients.get(ws);
        if (!meta) {
          return;
        }

        if (message.type === 'subscribe') {
          const channelId = Number(message.channelId);
          if (!channelId) {
            return;
          }

          const access = await db.query(
            `SELECT 1
             FROM channels c
             JOIN server_members sm ON sm.server_id = c.server_id
             WHERE c.id = $1 AND sm.user_id = $2`,
            [channelId, userId]
          );
          if (access.rows.length > 0) {
            meta.subscriptions.add(channelId);
            sendWs(ws, { type: 'subscribed', channelId });
          }
        }

        if (message.type === 'unsubscribe') {
          const channelId = Number(message.channelId);
          if (!channelId) {
            return;
          }
          meta.subscriptions.delete(channelId);
          sendWs(ws, { type: 'unsubscribed', channelId });
        }
      } catch (error) {
        sendWs(ws, { type: 'error', message: `Invalid realtime payload: ${error.message}` });
      }
    });

    ws.on('close', () => {
      const meta = wsClients.get(ws);
      wsClients.delete(ws);
      if (meta?.userId) {
        broadcastPresenceForUser(meta.userId).catch(() => {});
      }
    });
  });

  server.listen(WEB_PORT, '0.0.0.0', () => {
    console.log(`JelloChat web server listening on http://0.0.0.0:${WEB_PORT}`);
  });

  process.on('SIGINT', async () => {
    for (const ws of wsClients.keys()) {
      ws.close();
    }
    wss.close();
    server.close();
    await db.close();
    process.exit(0);
  });
}

start().catch((error) => {
  console.error('Web server startup failed:', error);
  process.exit(1);
});
