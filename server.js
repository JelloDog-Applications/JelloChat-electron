const http = require('http');
const path = require('path');
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const multer = require('multer');
const { WebSocketServer } = require('ws');
const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');
const fs = require('fs');
const db = require('./db');
const { sendMail } = require('./mailer');

const WEB_PORT = Number(process.env.WEB_PORT || 3000);
const AUTH_SESSION_DAYS = Math.max(1, Number(process.env.AUTH_SESSION_DAYS || 30));
const ATTACHMENTS_DIR = path.resolve(__dirname, process.env.ATTACHMENTS_DIR || 'uploads/attachments');
const ATTACHMENT_MAX_MB = Math.max(1, Number(process.env.ATTACHMENT_MAX_MB || 10));
const ATTACHMENT_HARD_MAX_BYTES = Math.max(1024, Number(process.env.ATTACHMENT_HARD_MAX_MB || 1024)) * 1024 * 1024;
const ATTACHMENT_EXPIRE_DAYS = Math.max(1, Number(process.env.ATTACHMENT_EXPIRE_DAYS || 30));
const ATTACHMENT_MAX_UPLOADS_PER_DAY = Math.max(1, Number(process.env.ATTACHMENT_MAX_UPLOADS_PER_DAY || 50));
const ATTACHMENT_STORAGE_QUOTA_MB = Math.max(0, Number(process.env.ATTACHMENT_STORAGE_QUOTA_MB || 0));
const DEFAULT_CLEANUP_EMPTY_SERVER_DAYS = Math.max(0, Number(process.env.CLEANUP_EMPTY_SERVER_DAYS || 7));
const DEFAULT_CLEANUP_BANNED_USER_DAYS = Math.max(0, Number(process.env.CLEANUP_BANNED_USER_DAYS || 30));
const DEFAULT_CLEANUP_INTERVAL_MINUTES = Math.max(5, Number(process.env.CLEANUP_INTERVAL_MINUTES || 60));
const ATTACHMENT_ENCRYPTION_KEY = crypto
  .createHash('sha256')
  .update(String(process.env.ATTACHMENT_ENCRYPTION_KEY || process.env.AUTH_SECRET || 'jellochat-dev-attachment-key'))
  .digest();
const IP_REPUTATION_BLOCK_THRESHOLD = Number(process.env.IP_REPUTATION_BLOCK_THRESHOLD || 8);
const IP_REPUTATION_BLOCK_MINUTES = Number(process.env.IP_REPUTATION_BLOCK_MINUTES || 30);
const IP_REPUTATION_DECAY_HOURS = Number(process.env.IP_REPUTATION_DECAY_HOURS || 6);
const CURRENT_TOS_VERSION = '2026-05-20-protections';
const CURRENT_PRIVACY_VERSION = '2026-05-20-protections';

const app = express();
app.disable('x-powered-by');

const DEFAULT_ALLOWED_APP_ORIGINS = [
  'https://localhost',
  'http://localhost',
  'http://127.0.0.1',
  'https://127.0.0.1',
  'capacitor://localhost',
  'ionic://localhost'
];

function getAllowedCorsOrigins() {
  const configured = String(process.env.APP_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const publicUrl = String(process.env.APP_PUBLIC_URL || '').trim();
  if (publicUrl) {
    try {
      configured.push(new URL(publicUrl).origin);
    } catch (_error) {
    }
  }
  return new Set([...DEFAULT_ALLOWED_APP_ORIGINS, ...configured]);
}

function isAllowedLoopbackOrigin(origin) {
  try {
    const parsed = new URL(origin);
    const hostname = parsed.hostname.toLowerCase();
    return ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname)
      && ['http:', 'https:'].includes(parsed.protocol);
  } catch (_error) {
    return false;
  }
}

function isAllowedCorsOrigin(origin) {
  return getAllowedCorsOrigins().has(origin) || isAllowedLoopbackOrigin(origin);
}

app.use((req, res, next) => {
  const origin = String(req.headers.origin || '');
  if (origin && isAllowedCorsOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json({ limit: '64kb' }));
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});

fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });

const BLOCKED_ATTACHMENT_EXTENSIONS = new Set([
  '.apk',
  '.app',
  '.bat',
  '.bin',
  '.cmd',
  '.com',
  '.cpl',
  '.dll',
  '.dmg',
  '.exe',
  '.gadget',
  '.hta',
  '.htm',
  '.html',
  '.jar',
  '.js',
  '.jse',
  '.lnk',
  '.msi',
  '.msp',
  '.pif',
  '.ps1',
  '.py',
  '.rb',
  '.scr',
  '.sh',
  '.svg',
  '.sys',
  '.vb',
  '.vbe',
  '.vbs',
  '.wsf'
]);

function isBlockedAttachmentName(filename) {
  const ext = path.extname(String(filename || '')).toLowerCase();
  return BLOCKED_ATTACHMENT_EXTENSIONS.has(ext);
}

const attachmentStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, ATTACHMENTS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase().replace(/[^a-z0-9.]/g, '');
    cb(null, `${crypto.randomUUID()}${ext}`);
  }
});

const attachmentUpload = multer({
  storage: attachmentStorage,
  limits: { fileSize: ATTACHMENT_HARD_MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (isBlockedAttachmentName(file.originalname)) {
      cb(new Error('That file type is not allowed.'));
      return;
    }
    cb(null, true);
  }
});

function uploadMessageAttachment(req, res, next) {
  attachmentUpload.single('attachment')(req, res, (error) => {
    if (!error) {
      next();
      return;
    }
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({ ok: false, message: 'Attachment is larger than the configured server hard limit.' });
      return;
    }
    res.status(400).json({ ok: false, message: error.message || 'Failed to upload attachment.' });
  });
}

function removeUploadedFile(file) {
  if (!file?.path) {
    return;
  }
  fs.promises.unlink(file.path).catch(() => {});
}

async function encryptAttachmentFile(filePath) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ATTACHMENT_ENCRYPTION_KEY, iv);
  const plaintext = await fs.promises.readFile(filePath);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  await fs.promises.writeFile(filePath, encrypted);
  return {
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64')
  };
}

async function readAttachmentFile(attachment) {
  const filePath = path.join(ATTACHMENTS_DIR, attachment.stored_filename);
  const data = await fs.promises.readFile(filePath);
  if (!attachment.encryption_iv || !attachment.encryption_auth_tag) {
    return data;
  }
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    ATTACHMENT_ENCRYPTION_KEY,
    Buffer.from(attachment.encryption_iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(attachment.encryption_auth_tag, 'base64'));
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

function getAttachmentExpiresAt(expireDays = ATTACHMENT_EXPIRE_DAYS) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expireDays);
  return expiresAt;
}

function readPolicyMarkdown(filename) {
  const candidates = [
    path.join(__dirname, 'docs', filename),
    path.join(__dirname, filename)
  ];
  for (const filePath of candidates) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (_error) {
      // Try the next known location.
    }
  }
  return null;
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

app.get('/api/public/stats', async (_req, res) => {
  try {
    const result = await db.query(
      `SELECT COUNT(*)::int AS registered_users
       FROM users
       WHERE platform_banned_at IS NULL`
    );
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json({ ok: true, registeredUsers: result.rows[0]?.registered_users || 0 });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load public stats: ${error.message}` });
  }
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

function buildAssetUrl(pathname) {
  return buildPublicUrl(`/assets/${String(pathname || '').replace(/^\/+/, '')}`);
}

function renderEmbedLandingPage(options = {}) {
  const title = String(options.title || 'JelloChat').trim();
  const description = String(options.description || 'Chat, servers, friends, direct messages, voice, and screen sharing.').trim();
  const canonicalUrl = String(options.url || buildPublicUrl('/')).trim();
  const imageUrl = String(options.imageUrl || buildAssetUrl('app-icon-1024.png')).trim();
  const redirectUrl = String(options.redirectUrl || canonicalUrl).trim();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:site_name" content="JelloChat" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta name="theme-color" content="#57d7a4" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    <style>
      body { margin: 0; font-family: Arial, sans-serif; background: #111827; color: #f8fafc; display: grid; min-height: 100vh; place-items: center; }
      main { width: min(92vw, 520px); background: #1f2937; border: 1px solid #44506a; border-radius: 14px; padding: 24px; }
      h1 { margin: 0 0 10px; }
      p { color: #cbd5e1; line-height: 1.5; }
      a { display: inline-flex; margin-top: 12px; border-radius: 8px; padding: 10px 14px; background: #57d7a4; color: #0c1a16; font-weight: 700; text-decoration: none; }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
      <a href="${escapeHtml(redirectUrl)}">Open JelloChat</a>
    </main>
    <script>
      const bot = /discordbot|twitterbot|facebookexternalhit|slackbot|embedly|telegrambot|whatsapp/i.test(navigator.userAgent || '');
      if (!bot) {
        window.location.replace(${JSON.stringify(redirectUrl)});
      }
    </script>
  </body>
</html>`;
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

function getReleaseDownloadBaseUrl() {
  return String(
    process.env.APP_RELEASE_DOWNLOAD_BASE_URL
    || 'https://github.com/JelloDog-Applications/JelloChat-electron/releases/latest/download'
  ).trim().replace(/\/+$/, '');
}

function buildReleaseAssetUrl(filename) {
  return `${getReleaseDownloadBaseUrl()}/${encodeURIComponent(filename)}`;
}

function buildDownloadUrls() {
  return {
    android: String(process.env.APP_ANDROID_DOWNLOAD_URL || buildReleaseAssetUrl('JelloDogChat-fdroid-signed.apk')).trim(),
    windows: String(process.env.APP_WINDOWS_DOWNLOAD_URL || buildReleaseAssetUrl('JelloDogChat-windows-setup.exe')).trim(),
    flatpak: String(process.env.APP_FLATPAK_DOWNLOAD_URL || buildReleaseAssetUrl('JelloDogChat.flatpak')).trim(),
    source: 'https://github.com/JelloDog-Applications/JelloChat-electron'
  };
}

function buildAndroidDownloadUrl() {
  return buildDownloadUrls().android || buildPublicUrl('/download/android');
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
    pathname.startsWith('/download') ||
    pathname.startsWith('/ban-appeal') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/verify-email')
  ) {
    return false;
  }

  return pathname === '/' || pathname === '/index.html';
}

app.use((req, res, next) => {
  next();
});

app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  etag: false,
  lastModified: false,
  maxAge: '1h'
}));

app.use((req, res, next) => {
  const pathname = String(req.path || '');
  if (req.method === 'GET' && (
    pathname === '/'
    || pathname === '/index.html'
    || pathname === '/app'
    || pathname === '/ban-appeal'
    || pathname === '/manifest.webmanifest'
    || pathname === '/service-worker.js'
    || pathname === '/home.js'
    || /\.(?:css|js)$/i.test(pathname)
  )) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'src'), {
  etag: false,
  lastModified: false,
  index: false
}));

function buildAuthWebUrl(mode, rawToken) {
  if (mode === 'verify') {
    return buildPublicUrl(`/api/auth/verify-email?token=${encodeURIComponent(rawToken)}`);
  }
  return buildPublicUrl(`/reset-password?token=${encodeURIComponent(rawToken)}`);
}

function buildAuthAppUrl(mode, rawToken) {
  return `jellodogchat://auth/${mode === 'verify' ? 'verify-email' : 'reset-password'}?token=${encodeURIComponent(rawToken)}`;
}

function buildAuthEmailUrl(mode, rawToken) {
  return buildPublicUrl(`/auth-link?mode=${encodeURIComponent(mode)}&token=${encodeURIComponent(rawToken)}`);
}

function buildBanAppealUrl(email) {
  const query = new URLSearchParams();
  if (email) {
    query.set('email', email);
  }
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return buildPublicUrl(`/ban-appeal${suffix}`);
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

async function sendTerminationEmail(email, username, reason, options = {}) {
  const supportUrl = buildPublicUrl('/terms-of-service');
  const appealUrl = options.appealUrl || buildBanAppealUrl(email);
  const detail = String(reason || 'Your account was terminated for Terms of Service violations.').trim();
  const cleanupDays = Number(options.bannedUserCleanupDays || 0);
  const deletionText = cleanupDays > 0
    ? `\n\nYou have ${cleanupDays} day(s) from the ban date to submit an appeal before this account is deleted.`
    : '';
  const deletionHtml = cleanupDays > 0
    ? `<p>You have ${cleanupDays} day(s) from the ban date to submit an appeal before this account is deleted.</p>`
    : '';
  return sendMail({
    to: email,
    subject: 'Your JelloChat account has been terminated',
    text: `Hi ${username},\n\nYour JelloChat account has been terminated.\n\nReason: ${detail}${deletionText}\n\nSubmit a ban appeal: ${appealUrl}\n\nFor more information, review our Terms of Service: ${supportUrl}`,
    html: `<p>Hi ${escapeHtml(username)},</p><p>Your JelloChat account has been terminated.</p><p><strong>Reason:</strong> ${escapeHtml(detail)}</p>${deletionHtml}<p>Submit a ban appeal: <a href="${escapeHtml(appealUrl)}">${escapeHtml(appealUrl)}</a></p><p>For more information, review our <a href="${escapeHtml(supportUrl)}">Terms of Service</a>.</p>`
  });
}

async function sendBanDeletionReminderEmail(email, username, daysRemaining) {
  const appealUrl = buildBanAppealUrl(email);
  const remaining = Math.max(0, Number(daysRemaining || 0));
  const remainingText = remaining === 1 ? '1 day' : `${remaining} days`;
  return sendMail({
    to: email,
    subject: 'Your JelloDog Chat account will be deleted soon',
    text: `Hi ${username},\n\nYour banned JelloDog Chat account is scheduled for deletion in about ${remainingText}.\n\nIf you believe this ban should be reviewed, submit a ban appeal here: ${appealUrl}\n\nAfter the account is deleted, the account data cannot be restored.`,
    html: `<p>Hi ${escapeHtml(username)},</p><p>Your banned JelloDog Chat account is scheduled for deletion in about ${escapeHtml(remainingText)}.</p><p>If you believe this ban should be reviewed, submit a ban appeal here: <a href="${escapeHtml(appealUrl)}">${escapeHtml(appealUrl)}</a></p><p>After the account is deleted, the account data cannot be restored.</p>`
  });
}

async function sendBannedAccountDeletedEmail(email, username) {
  const supportUrl = buildPublicUrl('/terms-of-service');
  return sendMail({
    to: email,
    subject: 'Your JelloDog Chat account was deleted',
    text: `Hi ${username},\n\nYour banned JelloDog Chat account has been deleted after the ban retention period ended.\n\nFor more information, review our Terms of Service: ${supportUrl}`,
    html: `<p>Hi ${escapeHtml(username)},</p><p>Your banned JelloDog Chat account has been deleted after the ban retention period ended.</p><p>For more information, review our <a href="${escapeHtml(supportUrl)}">Terms of Service</a>.</p>`
  });
}

async function sendBanAppealStatusEmail(email, username, status, reviewNote) {
  const normalizedStatus = String(status || '').toLowerCase();
  const label = normalizedStatus === 'dismissed' ? 'declined' : normalizedStatus;
  const note = String(reviewNote || '').trim();
  const signinUrl = buildPublicUrl('/');
  const approved = normalizedStatus === 'approved';
  const statusText = approved
    ? 'Your ban appeal was approved. Your account has been unbanned and you can sign in again.'
    : normalizedStatus === 'dismissed'
      ? 'Your ban appeal was declined. Your account remains banned.'
      : 'Your ban appeal was reviewed by the admin team.';
  const noteText = note ? `\n\nAdmin note: ${note}` : '';
  const noteHtml = note ? `<p><strong>Admin note:</strong> ${escapeHtml(note)}</p>` : '';

  return sendMail({
    to: email,
    subject: `Your JelloChat ban appeal was ${label}`,
    text: `Hi ${username},\n\n${statusText}${noteText}${approved ? `\n\nSign in here: ${signinUrl}` : ''}`,
    html: `<p>Hi ${escapeHtml(username)},</p><p>${escapeHtml(statusText)}</p>${noteHtml}${approved ? `<p>Sign in here: <a href="${escapeHtml(signinUrl)}">${escapeHtml(signinUrl)}</a></p>` : ''}`
  });
}

async function sendTermsUpdatedEmail(email, username) {
  const termsUrl = buildPublicUrl('/terms-of-service');
  return sendMail({
    to: email,
    subject: 'JelloChat Terms of Service updated',
    text: `Hi ${username},\n\nWe updated the JelloChat Terms of Service.\n\nThe update now makes clear that bot accounts, automated signups, scripted abuse, spam, and rule-evasion accounts are not allowed and may be terminated.\n\nReview the updated Terms here: ${termsUrl}`,
    html: `<p>Hi ${escapeHtml(username)},</p><p>We updated the JelloChat Terms of Service.</p><p>The update now makes clear that bot accounts, automated signups, scripted abuse, spam, and rule-evasion accounts are not allowed and may be terminated.</p><p>Review the updated Terms here: <a href="${termsUrl}">${termsUrl}</a></p>`
  });
}

async function sendPrivacyUpdatedEmail(email, username) {
  const privacyUrl = buildPublicUrl('/privacy-policy');
  return sendMail({
    to: email,
    subject: 'JelloChat Privacy Policy updated',
    text: `Hi ${username},\n\nWe updated the JelloChat Privacy Policy.\n\nReview the updated Privacy Policy here: ${privacyUrl}`,
    html: `<p>Hi ${escapeHtml(username)},</p><p>We updated the JelloChat Privacy Policy.</p><p>Review the updated Privacy Policy here: <a href="${privacyUrl}">${privacyUrl}</a></p>`
  });
}

async function maybeNotifyTermsUpdate(user) {
  if (!user?.id || user.tos_notified_version === CURRENT_TOS_VERSION) {
    return null;
  }

  await db.query('UPDATE users SET tos_notified_version = $1 WHERE id = $2', [CURRENT_TOS_VERSION, user.id]);

  return {
    version: CURRENT_TOS_VERSION,
    title: 'Terms of Service updated',
    message: 'JelloChat updated the Terms of Service. Bot accounts, automated signups, scripted abuse, spam, and rule-evasion accounts may be terminated.'
  };
}

async function maybeNotifyPrivacyUpdate(user) {
  if (!user?.id || user.privacy_notified_version === CURRENT_PRIVACY_VERSION) {
    return null;
  }

  await db.query('UPDATE users SET privacy_notified_version = $1 WHERE id = $2', [CURRENT_PRIVACY_VERSION, user.id]);

  return {
    version: CURRENT_PRIVACY_VERSION,
    title: 'Privacy Policy updated',
    message: 'JelloChat updated the Privacy Policy. Please review the latest privacy details when you have a moment.'
  };
}

async function sendTermsUpdateEmailsOnStartup() {
  const result = await db.query(
    `SELECT id, username, email
     FROM users
     WHERE email_verified = TRUE
       AND platform_banned_at IS NULL
       AND COALESCE(tos_email_notified_version, '') <> $1
     ORDER BY id ASC`,
    [CURRENT_TOS_VERSION]
  );

  if (result.rows.length === 0) {
    return;
  }

  console.log(`Sending Terms update email to ${result.rows.length} JelloChat user(s).`);
  for (const user of result.rows) {
    try {
      const mailResult = await sendTermsUpdatedEmail(user.email, user.username);
      if (!mailResult?.ok) {
        console.warn(`Terms update email skipped for user ${user.id}: ${mailResult?.message || 'unknown mail error'}`);
        continue;
      }
      await db.query('UPDATE users SET tos_email_notified_version = $1 WHERE id = $2', [CURRENT_TOS_VERSION, user.id]);
    } catch (error) {
      console.warn(`Terms update email failed for user ${user.id}: ${error.message}`);
    }
  }
}

async function sendPrivacyUpdateEmailsOnStartup() {
  const result = await db.query(
    `SELECT id, username, email
     FROM users
     WHERE email_verified = TRUE
       AND platform_banned_at IS NULL
       AND COALESCE(privacy_email_notified_version, '') <> $1
     ORDER BY id ASC`,
    [CURRENT_PRIVACY_VERSION]
  );

  if (result.rows.length === 0) {
    return;
  }

  console.log(`Sending Privacy Policy update email to ${result.rows.length} JelloChat user(s).`);
  for (const user of result.rows) {
    try {
      const mailResult = await sendPrivacyUpdatedEmail(user.email, user.username);
      if (!mailResult?.ok) {
        console.warn(`Privacy Policy update email skipped for user ${user.id}: ${mailResult?.message || 'unknown mail error'}`);
        continue;
      }
      await db.query('UPDATE users SET privacy_email_notified_version = $1 WHERE id = $2', [CURRENT_PRIVACY_VERSION, user.id]);
    } catch (error) {
      console.warn(`Privacy Policy update email failed for user ${user.id}: ${error.message}`);
    }
  }
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

app.get('/ban-appeal', (_req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.get(['/', '/index.html'], (_req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'home.html'));
});

app.get('/app', (_req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.get('/invite/:code', async (req, res) => {
  const code = normalizeInviteCode(req.params.code);
  const canonicalUrl = buildInviteUrl(code);
  const redirectUrl = buildPublicUrl(`/app?invite=${encodeURIComponent(code)}`);

  try {
    const invite = await db.query(
      `SELECT i.code, i.is_active, i.expires_at, i.max_uses, i.uses_count, s.name AS server_name
       FROM server_invites i
       JOIN servers s ON s.id = i.server_id
       WHERE i.code = $1
       LIMIT 1`,
      [code]
    );
    const row = invite.rows[0] || null;
    const isExpired = row?.expires_at && new Date(row.expires_at) < new Date();
    const isFull = row?.max_uses && row.uses_count >= row.max_uses;
    const valid = Boolean(row && row.is_active && !isExpired && !isFull);
    const serverName = row?.server_name || 'a JelloChat server';

    res.type('html').send(renderEmbedLandingPage({
      title: valid ? `Join ${serverName} on JelloChat` : 'JelloChat invite',
      description: valid
        ? `You were invited to join ${serverName}. Open JelloChat to accept the invite.`
        : 'This JelloChat invite may be expired or unavailable.',
      url: canonicalUrl,
      redirectUrl,
      imageUrl: buildAssetUrl('app-icon-1024.png')
    }));
  } catch (_error) {
    res.type('html').send(renderEmbedLandingPage({
      title: 'JelloChat invite',
      description: 'Open JelloChat to view this invite.',
      url: canonicalUrl,
      redirectUrl,
      imageUrl: buildAssetUrl('app-icon-1024.png')
    }));
  }
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

app.get('/api/public/downloads', (_req, res) => {
  res.json({
    ok: true,
    downloads: buildDownloadUrls()
  });
});

function detectDownloadPlatform(req) {
  const userAgent = String(req.get('user-agent') || '').toLowerCase();
  if (userAgent.includes('android')) {
    return 'android';
  }
  if (userAgent.includes('windows')) {
    return 'windows';
  }
  if (userAgent.includes('linux') || userAgent.includes('x11')) {
    return 'flatpak';
  }
  return 'source';
}

function resolveDownloadUrl(platform) {
  const downloads = buildDownloadUrls();
  const key = String(platform || '').trim().toLowerCase();
  if (key === 'android') {
    return downloads.android;
  }
  if (key === 'windows') {
    return downloads.windows;
  }
  if (key === 'linux' || key === 'flatpak') {
    return downloads.flatpak;
  }
  return downloads.source;
}

app.get('/download', (req, res) => {
  const platform = detectDownloadPlatform(req);
  res.redirect(resolveDownloadUrl(platform));
});

app.get('/download/:platform', (req, res) => {
  const platform = String(req.params.platform || '').trim().toLowerCase();
  const downloadUrl = resolveDownloadUrl(platform);
  const continueUrl = buildPublicUrl('/');
  const titles = {
    android: 'Get JelloDog Chat for Android',
    windows: 'Get JelloDog Chat for Windows',
    flatpak: 'Get JelloDog Chat for Linux',
    linux: 'Get JelloDog Chat for Linux'
  };
  const labels = {
    android: 'Download Android APK',
    windows: 'Download Windows Installer',
    flatpak: 'Download Flatpak',
    linux: 'Download Flatpak'
  };
  const title = titles[platform] || 'Get JelloDog Chat';
  const label = labels[platform] || 'Download JelloDog Chat';

  res.type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
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
      <h1>${escapeHtml(title)}</h1>
      <p>Choose the installer for this device, or continue to the website.</p>
      ${downloadUrl
        ? `<a class="primary" href="${escapeHtml(downloadUrl)}">${escapeHtml(label)}</a>`
        : '<p class="hint">Set the matching APP_*_DOWNLOAD_URL environment variable on the server.</p>'}
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

async function issueAuthToken(userId) {
  const token = crypto.randomBytes(24).toString('hex');
  const tokenHash = hashToken(token);
  await db.query(
    `INSERT INTO auth_sessions (token_hash, user_id, expires_at)
     VALUES ($1, $2, NOW() + ($3 * INTERVAL '1 day'))`,
    [tokenHash, userId, AUTH_SESSION_DAYS]
  );
  authTokens.set(token, userId);
  return token;
}

async function resolveAuthToken(token) {
  if (!token) {
    return null;
  }

  const cachedUserId = authTokens.get(token);
  const tokenHash = hashToken(token);
  const result = await db.query(
    `UPDATE auth_sessions
     SET last_used_at = NOW()
     WHERE token_hash = $1
       AND expires_at > NOW()
     RETURNING user_id`,
    [tokenHash]
  );

  if (result.rows.length === 0) {
    authTokens.delete(token);
    await db.query('DELETE FROM auth_sessions WHERE token_hash = $1', [tokenHash]);
    return null;
  }

  const userId = result.rows[0].user_id;
  if (cachedUserId !== userId) {
    authTokens.set(token, userId);
  }
  return userId;
}

async function deleteAuthToken(token) {
  if (!token) {
    return;
  }
  authTokens.delete(token);
  await db.query('DELETE FROM auth_sessions WHERE token_hash = $1', [hashToken(token)]);
}

async function clearAuthTokensForUser(userId) {
  for (const [token, tokenUserId] of authTokens) {
    if (tokenUserId === userId) {
      authTokens.delete(token);
    }
  }
  await db.query('DELETE FROM auth_sessions WHERE user_id = $1', [userId]);
}

function disconnectRealtimeUser(userId, reason = 'Account access changed.') {
  for (const [ws, meta] of wsClients) {
    if (meta.userId === userId) {
      sendWs(ws, {
        type: 'account-access-revoked',
        title: 'Account Access Revoked',
        message: reason
      });
      setTimeout(() => {
        if (ws.readyState === 1) {
          ws.close(4003, reason);
        }
      }, 100);
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

function addBannedAccountCleanupInfo(user, settings) {
  if (!user) {
    return user;
  }
  const cleanupDays = Math.max(0, Number(settings?.bannedUserCleanupDays || 0));
  const bannedAt = user.platform_banned_at ? new Date(user.platform_banned_at) : null;
  if (!bannedAt || Number.isNaN(bannedAt.getTime())) {
    return {
      ...user,
      banned_cleanup_days: cleanupDays,
      banned_delete_at: null,
      banned_delete_days_remaining: null
    };
  }
  if (cleanupDays <= 0) {
    return {
      ...user,
      banned_cleanup_days: cleanupDays,
      banned_delete_at: null,
      banned_delete_days_remaining: null
    };
  }
  const deleteAt = new Date(bannedAt.getTime() + cleanupDays * 24 * 60 * 60 * 1000);
  const remainingMs = deleteAt.getTime() - Date.now();
  return {
    ...user,
    banned_cleanup_days: cleanupDays,
    banned_delete_at: deleteAt.toISOString(),
    banned_delete_days_remaining: Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)))
  };
}

function addBannedAccountCleanupInfoToUsers(users, settings) {
  return (users || []).map((user) => addBannedAccountCleanupInfo(user, settings));
}

function addEmptyServerCleanupInfo(server, settings) {
  if (!server) {
    return server;
  }
  const cleanupDays = Math.max(0, Number(settings?.emptyServerCleanupDays || 0));
  const emptySince = server.empty_since ? new Date(server.empty_since) : null;
  if (!emptySince || Number.isNaN(emptySince.getTime())) {
    return {
      ...server,
      empty_cleanup_days: cleanupDays,
      empty_delete_at: null,
      empty_delete_days_remaining: null
    };
  }
  if (cleanupDays <= 0) {
    return {
      ...server,
      empty_cleanup_days: cleanupDays,
      empty_delete_at: null,
      empty_delete_days_remaining: null
    };
  }
  const deleteAt = new Date(emptySince.getTime() + cleanupDays * 24 * 60 * 60 * 1000);
  const remainingMs = deleteAt.getTime() - Date.now();
  return {
    ...server,
    empty_cleanup_days: cleanupDays,
    empty_delete_at: deleteAt.toISOString(),
    empty_delete_days_remaining: Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)))
  };
}

function addEmptyServerCleanupInfoToServers(servers, settings) {
  return (servers || []).map((server) => addEmptyServerCleanupInfo(server, settings));
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

function getAutomatedRequestSignal(req) {
  const userAgent = String(req?.headers?.['user-agent'] || '').trim();
  const acceptLanguage = String(req?.headers?.['accept-language'] || '').trim();
  const contentType = String(req?.headers?.['content-type'] || '').toLowerCase();

  if (!userAgent) {
    return 'Missing browser identity.';
  }
  if (/(curl|wget|python-requests|aiohttp|httpclient|okhttp|postman|insomnia|scrapy|spider|crawler|bot\b|headless|phantomjs|selenium|puppeteer|playwright)/i.test(userAgent)) {
    return 'Automated client signature.';
  }
  if (req?.method === 'POST' && !contentType.includes('application/json')) {
    return 'Unexpected request format.';
  }
  if (!acceptLanguage && !/JelloDogChatAndroidApp|JelloChatAndroidApp/i.test(userAgent)) {
    return 'Missing browser language signal.';
  }
  return null;
}

function shouldBlockBotLikeAuth(payload, mode, req = null) {
  const requestSignal = req ? getAutomatedRequestSignal(req) : null;
  if (requestSignal) {
    return 'Suspicious automated activity was detected.';
  }
  const trapValue = String(mode === 'register' ? payload?.website || '' : payload?.company || '').trim();
  if (trapValue) {
    return 'Suspicious automated activity was detected.';
  }
  const clientSignal = payload?.clientSignal || {};
  const timezone = String(clientSignal.timezone || '').trim();
  const viewport = clientSignal.viewport || {};
  const viewportWidth = Number(viewport.width || 0);
  const viewportHeight = Number(viewport.height || 0);
  if (mode === 'register' && (!timezone || viewportWidth <= 0 || viewportHeight <= 0)) {
    return 'Suspicious automated activity was detected.';
  }
  const elapsedMs = Number(payload?.clientElapsedMs || 0);
  if (mode === 'register' && (!Number.isFinite(elapsedMs) || elapsedMs <= 0)) {
    return 'Please use the JelloChat app form to create an account.';
  }
  if (mode === 'register' && elapsedMs > 0 && elapsedMs < 1200) {
    return 'Please wait a moment and try again.';
  }
  if (mode === 'register' && elapsedMs > 30 * 60 * 1000) {
    return 'This form expired. Please refresh and try again.';
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
    await clearAuthTokensForUser(userId);
    disconnectRealtimeUser(userId, 'Account banned from JelloChat.');
    const settings = await getCleanupSettings();
    sendTerminationEmail(updated.email, updated.username, updated.platform_ban_reason || updated.standing_reason || 'Your account was terminated for Terms of Service violations.', {
      bannedUserCleanupDays: settings.bannedUserCleanupDays
    }).catch(() => {});
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
    await recordServerAutoModerationEvent(serverId, userId, severeViolation.rule, content);
    await autoTerminateBotAccount(userId, `Account terminated for automated bot spam: ${severeViolation.rule}.`);
    return { blocked: true, banned: true, terminated: true, message: 'This account has been terminated for automated bot activity.' };
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
  if (recentViolations >= 3) {
    const reason = 'Account terminated for repeated automated moderation violations.';
    await autoTerminateBotAccount(userId, reason);
    return { blocked: true, banned: true, terminated: true, message: 'This account has been terminated for automated bot activity.' };
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
  let userId = null;

  try {
    userId = await resolveAuthToken(token);
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to validate session: ${error.message}` });
    return;
  }

  if (!userId) {
    res.status(401).json({ ok: false, message: 'Not authenticated.' });
    return;
  }

  try {
    const user = await getUserAdminState(userId);
    if (!user) {
      await deleteAuthToken(token);
      res.status(401).json({ ok: false, message: 'Session not found.' });
      return;
    }
    if (user.platform_banned_at) {
      await clearAuthTokensForUser(userId);
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

function sanitizeUserFacingMessage(row) {
  const isBanned = Boolean(row?.author_platform_banned_at || row?.platform_banned_at);
  return {
    ...row,
    username: isBanned ? 'Banned User' : (row.username || 'Unknown'),
    avatar_url: isBanned ? '' : (row.avatar_url || '')
  };
}

function sanitizeAttachment(row) {
  if (!row?.id) {
    return null;
  }
  return {
    id: row.id,
    original_filename: row.original_filename,
    mime_type: row.mime_type || 'application/octet-stream',
    file_size: Number(row.file_size || 0),
    expires_at: row.expires_at || null,
    url: `/api/attachments/${row.id}`
  };
}

async function saveMessageAttachment({ file, uploaderUserId, messageId = null, dmMessageId = null }) {
  if (!file) {
    return null;
  }
  const storageSettings = await getStoragePolicySettings();
  const maxBytes = storageSettings.maxUploadMb * 1024 * 1024;
  if (file.size > maxBytes) {
    removeUploadedFile(file);
    throw new Error(`Attachments must be ${storageSettings.maxUploadMb} MB or smaller.`);
  }
  const uploadCount = await db.query(
    `SELECT COUNT(*)::int AS count
     FROM message_attachments
     WHERE uploader_user_id = $1
       AND created_at >= NOW() - INTERVAL '1 day'`,
    [uploaderUserId]
  );
  if ((uploadCount.rows[0]?.count || 0) >= storageSettings.maxUploadsPerDay) {
    removeUploadedFile(file);
    throw new Error(`You can upload up to ${storageSettings.maxUploadsPerDay} attachments per day.`);
  }

  if (storageSettings.storageQuotaMb > 0) {
    const usage = await db.query(
      `SELECT COALESCE(SUM(file_size), 0)::bigint AS active_bytes
       FROM message_attachments
       WHERE expires_at IS NULL OR expires_at > NOW()`
    );
    const quotaBytes = storageSettings.storageQuotaMb * 1024 * 1024;
    if (Number(usage.rows[0]?.active_bytes || 0) + file.size > quotaBytes) {
      removeUploadedFile(file);
      throw new Error('Attachment storage quota is full.');
    }
  }

  const encrypted = await encryptAttachmentFile(file.path);
  const result = await db.query(
    `INSERT INTO message_attachments (
       message_id,
       dm_message_id,
       uploader_user_id,
       original_filename,
       stored_filename,
       mime_type,
       file_size,
       encryption_iv,
       encryption_auth_tag,
       expires_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id, original_filename, mime_type, file_size, expires_at`,
    [
      messageId,
      dmMessageId,
      uploaderUserId,
      file.originalname || 'attachment',
      file.filename,
      file.mimetype || 'application/octet-stream',
      file.size,
      encrypted.iv,
      encrypted.authTag,
      getAttachmentExpiresAt(storageSettings.expireDays)
    ]
  );
  return sanitizeAttachment(result.rows[0]);
}

async function deleteAttachmentsForMessage(messageId) {
  const attachments = await db.query('SELECT stored_filename FROM message_attachments WHERE message_id = $1', [messageId]);
  await db.query('DELETE FROM message_attachments WHERE message_id = $1', [messageId]);
  for (const attachment of attachments.rows) {
    const filePath = path.join(ATTACHMENTS_DIR, attachment.stored_filename);
    await fs.promises.unlink(filePath).catch(() => {});
  }
}

async function deleteAttachmentFilesForServer(serverId) {
  const attachments = await db.query(
    `SELECT a.stored_filename
     FROM message_attachments a
     JOIN messages m ON m.id = a.message_id
     JOIN channels c ON c.id = m.channel_id
     WHERE c.server_id = $1`,
    [serverId]
  );
  for (const attachment of attachments.rows) {
    await fs.promises.unlink(path.join(ATTACHMENTS_DIR, attachment.stored_filename)).catch(() => {});
  }
}

async function deleteAttachmentFilesForUser(userId) {
  const attachments = await db.query(
    `SELECT DISTINCT a.stored_filename
     FROM message_attachments a
     LEFT JOIN messages m ON m.id = a.message_id
     LEFT JOIN dm_messages dm ON dm.id = a.dm_message_id
     WHERE a.uploader_user_id = $1
        OR m.user_id = $1
        OR dm.sender_user_id = $1
        OR dm.receiver_user_id = $1`,
    [userId]
  );
  for (const attachment of attachments.rows) {
    await fs.promises.unlink(path.join(ATTACHMENTS_DIR, attachment.stored_filename)).catch(() => {});
  }
}

async function cleanupExpiredAttachments() {
  const expired = await db.query(
    `DELETE FROM message_attachments
     WHERE expires_at IS NOT NULL
       AND expires_at <= NOW()
     RETURNING stored_filename`
  );
  for (const attachment of expired.rows) {
    fs.promises.unlink(path.join(ATTACHMENTS_DIR, attachment.stored_filename)).catch(() => {});
  }
  if (expired.rows.length > 0) {
    console.log(`Removed ${expired.rows.length} expired attachment(s).`);
  }
}

function parseSettingNumber(value, fallback, min) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }
  return Math.max(min, Math.floor(number));
}

async function getCleanupSettings() {
  const result = await db.query(
    `SELECT key, value
     FROM app_settings
     WHERE key IN ('cleanup_empty_server_days', 'cleanup_banned_user_days', 'cleanup_interval_minutes')`
  );
  const values = Object.fromEntries(result.rows.map((row) => [row.key, row.value]));
  return {
    emptyServerCleanupDays: parseSettingNumber(values.cleanup_empty_server_days, DEFAULT_CLEANUP_EMPTY_SERVER_DAYS, 0),
    bannedUserCleanupDays: parseSettingNumber(values.cleanup_banned_user_days, DEFAULT_CLEANUP_BANNED_USER_DAYS, 0),
    cleanupIntervalMinutes: parseSettingNumber(values.cleanup_interval_minutes, DEFAULT_CLEANUP_INTERVAL_MINUTES, 5)
  };
}

async function updateCleanupSettings(settings) {
  const next = {
    attachment_max_mb: parseSettingNumber(settings.maxUploadMb, ATTACHMENT_MAX_MB, 1),
    attachment_expire_days: parseSettingNumber(settings.expireDays, ATTACHMENT_EXPIRE_DAYS, 1),
    attachment_max_uploads_per_day: parseSettingNumber(settings.maxUploadsPerDay, ATTACHMENT_MAX_UPLOADS_PER_DAY, 1),
    attachment_storage_quota_mb: parseSettingNumber(settings.storageQuotaMb, ATTACHMENT_STORAGE_QUOTA_MB, 0),
    cleanup_empty_server_days: parseSettingNumber(settings.emptyServerCleanupDays, DEFAULT_CLEANUP_EMPTY_SERVER_DAYS, 0),
    cleanup_banned_user_days: parseSettingNumber(settings.bannedUserCleanupDays, DEFAULT_CLEANUP_BANNED_USER_DAYS, 0),
    cleanup_interval_minutes: parseSettingNumber(settings.cleanupIntervalMinutes, DEFAULT_CLEANUP_INTERVAL_MINUTES, 5)
  };
  for (const [key, value] of Object.entries(next)) {
    await db.query(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key)
       DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [key, String(value)]
    );
  }
  return getCleanupSettings();
}

async function getStoragePolicySettings() {
  const result = await db.query(
    `SELECT key, value
     FROM app_settings
     WHERE key IN (
       'attachment_max_mb',
       'attachment_expire_days',
       'attachment_max_uploads_per_day',
       'attachment_storage_quota_mb',
       'cleanup_empty_server_days',
       'cleanup_banned_user_days',
       'cleanup_interval_minutes'
     )`
  );
  const values = Object.fromEntries(result.rows.map((row) => [row.key, row.value]));
  return {
    maxUploadMb: parseSettingNumber(values.attachment_max_mb, ATTACHMENT_MAX_MB, 1),
    expireDays: parseSettingNumber(values.attachment_expire_days, ATTACHMENT_EXPIRE_DAYS, 1),
    maxUploadsPerDay: parseSettingNumber(values.attachment_max_uploads_per_day, ATTACHMENT_MAX_UPLOADS_PER_DAY, 1),
    storageQuotaMb: parseSettingNumber(values.attachment_storage_quota_mb, ATTACHMENT_STORAGE_QUOTA_MB, 0),
    emptyServerCleanupDays: parseSettingNumber(values.cleanup_empty_server_days, DEFAULT_CLEANUP_EMPTY_SERVER_DAYS, 0),
    bannedUserCleanupDays: parseSettingNumber(values.cleanup_banned_user_days, DEFAULT_CLEANUP_BANNED_USER_DAYS, 0),
    cleanupIntervalMinutes: parseSettingNumber(values.cleanup_interval_minutes, DEFAULT_CLEANUP_INTERVAL_MINUTES, 5)
  };
}

function getBanDeletionMessage(settings) {
  if (!settings?.bannedUserCleanupDays || settings.bannedUserCleanupDays <= 0) {
    return 'This account has been banned from JelloChat.';
  }
  return `This account has been banned from JelloChat. You have ${settings.bannedUserCleanupDays} day(s) to submit an appeal before the account is deleted.`;
}

async function refreshEmptyServerMarkers() {
  await db.query(
    `UPDATE servers s
     SET empty_since = NOW()
     WHERE empty_since IS NULL
       AND NOT EXISTS (
         SELECT 1 FROM server_members sm WHERE sm.server_id = s.id
       )`
  );
  await db.query(
    `UPDATE servers s
     SET empty_since = NULL
     WHERE empty_since IS NOT NULL
       AND EXISTS (
         SELECT 1 FROM server_members sm WHERE sm.server_id = s.id
       )`
  );
}

async function cleanupEmptyServers() {
  const settings = await getCleanupSettings();
  await refreshEmptyServerMarkers();
  if (settings.emptyServerCleanupDays <= 0) {
    return;
  }
  const expired = await db.query(
    `SELECT id, name
     FROM servers
     WHERE empty_since IS NOT NULL
       AND empty_since <= NOW() - ($1::int * INTERVAL '1 day')`,
    [settings.emptyServerCleanupDays]
  );
  for (const server of expired.rows) {
    await deleteAttachmentFilesForServer(server.id);
    await db.query('DELETE FROM servers WHERE id = $1', [server.id]);
    console.log(`Deleted empty server "${server.name}" after ${settings.emptyServerCleanupDays} day(s).`);
  }
}

async function cleanupBannedUsers() {
  const settings = await getCleanupSettings();
  if (settings.bannedUserCleanupDays <= 0) {
    return;
  }
  const reminderWindowDays = Math.min(7, settings.bannedUserCleanupDays);
  const reminders = await db.query(
    `SELECT id, username, email, platform_banned_at
     FROM users
     WHERE platform_banned_at IS NOT NULL
       AND is_platform_admin = FALSE
       AND email IS NOT NULL
       AND ban_deletion_reminder_sent_at IS NULL
       AND platform_banned_at <= NOW() - (($1::int - $2::int) * INTERVAL '1 day')
       AND platform_banned_at > NOW() - ($1::int * INTERVAL '1 day')`,
    [settings.bannedUserCleanupDays, reminderWindowDays]
  );
  for (const user of reminders.rows) {
    const deleteAt = new Date(new Date(user.platform_banned_at).getTime() + settings.bannedUserCleanupDays * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.max(1, Math.ceil((deleteAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
    try {
      const mailResult = await sendBanDeletionReminderEmail(user.email, user.username, daysRemaining);
      if (mailResult?.ok) {
        await db.query('UPDATE users SET ban_deletion_reminder_sent_at = NOW() WHERE id = $1', [user.id]);
      }
    } catch (error) {
      console.warn(`Ban deletion reminder failed for user ${user.id}: ${error.message}`);
    }
  }
  const expired = await db.query(
    `SELECT id, username, email
     FROM users
     WHERE platform_banned_at IS NOT NULL
       AND is_platform_admin = FALSE
       AND platform_banned_at <= NOW() - ($1::int * INTERVAL '1 day')`,
    [settings.bannedUserCleanupDays]
  );
  for (const user of expired.rows) {
    if (user.email) {
      await sendBannedAccountDeletedEmail(user.email, user.username).catch((error) => {
        console.warn(`Banned account deletion email failed for user ${user.id}: ${error.message}`);
      });
    }
    await deleteAttachmentFilesForUser(user.id);
    await db.query('DELETE FROM users WHERE id = $1', [user.id]);
    await clearAuthTokensForUser(user.id);
    disconnectRealtimeUser(user.id, 'Account deleted after ban retention period.');
    console.log(`Deleted banned user "${user.username}" after ${settings.bannedUserCleanupDays} day(s).`);
  }
  if (expired.rows.length > 0) {
    await ensurePlatformAdminExists();
  }
}

async function runCleanupJobs() {
  await cleanupExpiredAttachments();
  await cleanupEmptyServers();
  await cleanupBannedUsers();
}

async function scheduleCleanupJobs() {
  const settings = await getCleanupSettings().catch(() => ({
    cleanupIntervalMinutes: DEFAULT_CLEANUP_INTERVAL_MINUTES
  }));
  setTimeout(async () => {
    try {
      await runCleanupJobs();
    } catch (error) {
      console.warn(`Cleanup job failed: ${error.message}`);
    }
    scheduleCleanupJobs().catch((error) => {
      console.warn(`Cleanup scheduler failed: ${error.message}`);
    });
  }, settings.cleanupIntervalMinutes * 60 * 1000).unref();
}

async function getAttachmentStorageOverview() {
  const storageSettings = await getStoragePolicySettings();
  const stats = await db.query(
    `SELECT
       COUNT(*)::int AS total_attachments,
       COALESCE(SUM(file_size), 0)::bigint AS total_bytes,
       COUNT(*) FILTER (WHERE expires_at IS NULL OR expires_at > NOW())::int AS active_attachments,
       COALESCE(SUM(file_size) FILTER (WHERE expires_at IS NULL OR expires_at > NOW()), 0)::bigint AS active_bytes,
       COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at <= NOW())::int AS expired_attachments,
       COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at > NOW() AND expires_at <= NOW() + INTERVAL '7 days')::int AS expiring_soon,
       COUNT(*) FILTER (WHERE encryption_iv IS NULL OR encryption_auth_tag IS NULL)::int AS legacy_unencrypted,
       MIN(created_at) AS oldest_attachment_at,
       MAX(created_at) AS newest_attachment_at
      FROM message_attachments`
  );
  const bannedAccountStats = storageSettings.bannedUserCleanupDays > 0
    ? await db.query(
      `SELECT
         COUNT(*) FILTER (
           WHERE platform_banned_at IS NOT NULL
             AND is_platform_admin = FALSE
         )::int AS banned_accounts_retained,
         COUNT(*) FILTER (
           WHERE platform_banned_at IS NOT NULL
             AND is_platform_admin = FALSE
             AND platform_banned_at <= NOW() - ($1::int * INTERVAL '1 day')
         )::int AS banned_accounts_waiting_delete
       FROM users`,
      [storageSettings.bannedUserCleanupDays]
    )
    : await db.query(
      `SELECT
         COUNT(*) FILTER (
           WHERE platform_banned_at IS NOT NULL
             AND is_platform_admin = FALSE
         )::int AS banned_accounts_retained,
         0::int AS banned_accounts_waiting_delete
      FROM users`
    );
  const emptyServerStats = storageSettings.emptyServerCleanupDays > 0
    ? await db.query(
      `SELECT
         COUNT(*) FILTER (
           WHERE empty_since IS NOT NULL
         )::int AS empty_servers_retained,
         COUNT(*) FILTER (
           WHERE empty_since IS NOT NULL
             AND empty_since <= NOW() - ($1::int * INTERVAL '1 day')
         )::int AS empty_servers_waiting_delete
       FROM servers`,
      [storageSettings.emptyServerCleanupDays]
    )
    : await db.query(
      `SELECT
         COUNT(*) FILTER (
           WHERE empty_since IS NOT NULL
         )::int AS empty_servers_retained,
         0::int AS empty_servers_waiting_delete
       FROM servers`
    );
  const combinedStats = {
    ...(stats.rows[0] || {}),
    ...(bannedAccountStats.rows[0] || {}),
    ...(emptyServerStats.rows[0] || {})
  };
  return {
    config: {
      attachmentsDir: ATTACHMENTS_DIR,
      maxUploadMb: storageSettings.maxUploadMb,
      expireDays: storageSettings.expireDays,
      maxUploadsPerDay: storageSettings.maxUploadsPerDay,
      storageQuotaMb: storageSettings.storageQuotaMb,
      encryptionEnabled: true,
      encryptionKeyConfigured: Boolean(process.env.ATTACHMENT_ENCRYPTION_KEY),
      cleanupIntervalMinutes: storageSettings.cleanupIntervalMinutes,
      emptyServerCleanupDays: storageSettings.emptyServerCleanupDays,
      bannedUserCleanupDays: storageSettings.bannedUserCleanupDays,
      blockedExtensions: Array.from(BLOCKED_ATTACHMENT_EXTENSIONS).sort()
    },
    stats: combinedStats
  };
}

function normalizeAttachmentRow(row) {
  const {
    attachment_id,
    attachment_original_filename,
    attachment_mime_type,
    attachment_file_size,
    attachment_expires_at,
    ...messageRow
  } = row;
  const message = sanitizeUserFacingMessage(messageRow);
  message.attachment = sanitizeAttachment({
    id: attachment_id,
    original_filename: attachment_original_filename,
    mime_type: attachment_mime_type,
    file_size: attachment_file_size,
    expires_at: attachment_expires_at
  });
  return message;
}

app.post('/api/auth/register', async (req, res) => {
  const requestIp = normalizeIpAddress(req.ip);
  const requestedUsername = String(req.body?.username || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const dateOfBirth = normalizeDateOfBirthInput(req.body?.dateOfBirth);
  const botBlock = shouldBlockBotLikeAuth(req.body, 'register', req);

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
      'INSERT INTO users (username, email, password_hash, date_of_birth, email_verified, tos_notified_version, tos_email_notified_version, privacy_notified_version, privacy_email_notified_version) VALUES ($1, $2, $3, $4, FALSE, $5, $5, $6, $6) RETURNING id, username, email, avatar_url, date_of_birth',
      [allocated.username, email, passwordHash, dateOfBirth, CURRENT_TOS_VERSION, CURRENT_PRIVACY_VERSION]
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
  const botBlock = shouldBlockBotLikeAuth(req.body, 'login', req);
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
    const result = await db.query('SELECT id, username, email, avatar_url, is_platform_admin, platform_banned_at, account_standing, standing_reason, tos_violation_count, tos_notified_version, privacy_notified_version, password_hash, email_verified, date_of_birth FROM users WHERE email = $1', [email]);
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
      const settings = await getCleanupSettings();
      res.status(403).json({
        ok: false,
        banned: true,
        email,
        message: getBanDeletionMessage(settings),
        bannedUserCleanupDays: settings.bannedUserCleanupDays
      });
      return;
    }

    const realtimeToken = await issueAuthToken(user.id);
    const tosNotice = await maybeNotifyTermsUpdate(user);
    const privacyNotice = await maybeNotifyPrivacyUpdate(user);
    rewardIp(requestIp, 2);
    res.json({
      ok: true,
      user: { id: user.id, username: user.username, email: user.email, avatar_url: user.avatar_url, is_platform_admin: user.is_platform_admin, account_standing: user.account_standing, standing_reason: user.standing_reason, tos_violation_count: user.tos_violation_count, date_of_birth: user.date_of_birth },
      realtimeToken,
      tosNotice,
      privacyNotice
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Login failed: ${error.message}` });
  }
});

app.post('/api/appeals/ban', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const reason = String(req.body?.reason || '').trim();
  if (!email || !password || reason.length < 20 || reason.length > 2000) {
    res.status(400).json({ ok: false, message: 'Appeal must include your email, password, and 20-2000 characters of explanation.' });
    return;
  }

  try {
    const result = await db.query('SELECT id, password_hash, platform_banned_at FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0 || !(await bcrypt.compare(password, result.rows[0].password_hash))) {
      res.status(401).json({ ok: false, message: 'Email or password is incorrect.' });
      return;
    }
    const user = result.rows[0];
    if (!user.platform_banned_at) {
      res.status(400).json({ ok: false, message: 'This account is not currently banned.' });
      return;
    }
    const existing = await db.query(
      `SELECT id FROM ban_appeals
       WHERE user_id = $1 AND status = 'open'
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );
    if (existing.rows.length > 0) {
      res.status(400).json({ ok: false, message: 'You already have an open ban appeal.' });
      return;
    }
    await db.query('INSERT INTO ban_appeals (user_id, reason) VALUES ($1, $2)', [user.id, reason]);
    res.json({ ok: true, message: 'Your ban appeal was submitted.' });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to submit ban appeal: ${error.message}` });
  }
});

app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  try {
    await deleteAuthToken(req.authToken);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Logout failed: ${error.message}` });
  }
});

app.get('/api/auth/session', authMiddleware, async (req, res) => {
  try {
    const userResult = await db.query('SELECT id, username, email, avatar_url, is_platform_admin, platform_banned_at, account_standing, standing_reason, tos_violation_count, tos_notified_version, privacy_notified_version, date_of_birth FROM users WHERE id = $1', [req.userId]);
    if (userResult.rows.length === 0) {
      res.status(401).json({ ok: false, message: 'Session not found.' });
      return;
    }
    const user = userResult.rows[0];
    if (user.platform_banned_at) {
      await clearAuthTokensForUser(user.id);
      disconnectRealtimeUser(user.id, 'Account banned from JelloChat.');
      const settings = await getCleanupSettings();
      res.status(403).json({
        ok: false,
        banned: true,
        message: getBanDeletionMessage(settings),
        bannedUserCleanupDays: settings.bannedUserCleanupDays
      });
      return;
    }
    const realtimeToken = await issueAuthToken(user.id);
    const tosNotice = await maybeNotifyTermsUpdate(user);
    const privacyNotice = await maybeNotifyPrivacyUpdate(user);
    delete user.tos_notified_version;
    delete user.privacy_notified_version;
    res.json({ ok: true, user, realtimeToken, tosNotice, privacyNotice });
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
              u.tos_violation_count, u.tos_notified_version, u.privacy_notified_version, u.date_of_birth, u.email_verified
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

    const realtimeToken = await issueAuthToken(credential.user_id);
    const tosNotice = await maybeNotifyTermsUpdate({
      id: credential.user_id,
      username: credential.username,
      email: credential.email,
      tos_notified_version: credential.tos_notified_version
    });
    const privacyNotice = await maybeNotifyPrivacyUpdate({
      id: credential.user_id,
      username: credential.username,
      email: credential.email,
      privacy_notified_version: credential.privacy_notified_version
    });
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
      realtimeToken,
      tosNotice,
      privacyNotice
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
    await clearAuthTokensForUser(userId);
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
    await clearAuthTokensForUser(req.userId);
    disconnectRealtimeUser(req.userId, 'Account deleted.');
    await deleteAuthToken(req.authToken);
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

    broadcastToUsers([targetUserId], {
      type: 'server-banned',
      serverId,
      title: 'Removed From Server',
      message: reason ? `You were banned from this server. Reason: ${reason}` : 'You were banned from this server.'
    });
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
         AND u.platform_banned_at IS NULL
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
    const cleanupSettings = await getCleanupSettings();
    res.json({ ok: true, users: addBannedAccountCleanupInfoToUsers(result.rows, cleanupSettings) });
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

    const cleanupSettings = await getCleanupSettings();
    const rawUser = await getUserAdminState(targetUserId);
    const user = addBannedAccountCleanupInfo(rawUser, cleanupSettings);
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
      `SELECT ur.id, ur.reason, ur.status, ur.review_note, ur.reviewed_at, ur.created_at,
              ur.server_id, ur.reporter_user_id, ur.reviewed_by_user_id,
              reporter.username AS reporter_username,
              reviewer.username AS reviewed_by_username,
              s.name AS server_name
       FROM user_reports ur
       JOIN users reporter ON reporter.id = ur.reporter_user_id
       LEFT JOIN users reviewer ON reviewer.id = ur.reviewed_by_user_id
       LEFT JOIN servers s ON s.id = ur.server_id
       WHERE ur.target_user_id = $1
       ORDER BY ur.created_at DESC
       LIMIT 50`,
      [targetUserId]
    );
    const appeals = await db.query(
      `SELECT ba.id, ba.reason, ba.status, ba.review_note, ba.reviewed_at, ba.created_at,
              ba.reviewed_by_user_id,
              reviewer.username AS reviewed_by_username
       FROM ban_appeals ba
       LEFT JOIN users reviewer ON reviewer.id = ba.reviewed_by_user_id
       WHERE ba.user_id = $1
       ORDER BY (ba.status = 'open') DESC, ba.created_at DESC
       LIMIT 50`,
      [targetUserId]
    );

    res.json({ ok: true, user, servers: memberships.rows, reports: reports.rows, appeals: appeals.rows });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load user details: ${error.message}` });
  }
});

app.get('/api/admin/reports', authMiddleware, async (req, res) => {
  try {
    if (!(await requirePlatformAdmin(req.userId))) {
      res.status(403).json({ ok: false, message: 'Platform admin access required.' });
      return;
    }

    const allowedStatuses = new Set(['open', 'reviewed', 'dismissed', 'actioned', 'all']);
    const requestedStatus = String(req.query?.status || 'open').trim().toLowerCase();
    const status = allowedStatuses.has(requestedStatus) ? requestedStatus : 'open';
    const params = [];
    let whereSql = '';
    if (status !== 'all') {
      params.push(status);
      whereSql = 'WHERE ur.status = $1';
    }

    const reports = await db.query(
      `SELECT ur.id, ur.reason, ur.status, ur.review_note, ur.reviewed_at, ur.created_at,
              ur.server_id, ur.reporter_user_id, ur.target_user_id, ur.reviewed_by_user_id,
              reporter.username AS reporter_username,
              target.username AS target_username,
              target.email AS target_email,
              target.avatar_url AS target_avatar_url,
              target.platform_banned_at AS target_platform_banned_at,
              reviewer.username AS reviewed_by_username,
              s.name AS server_name
       FROM user_reports ur
       JOIN users reporter ON reporter.id = ur.reporter_user_id
       JOIN users target ON target.id = ur.target_user_id
       LEFT JOIN users reviewer ON reviewer.id = ur.reviewed_by_user_id
       LEFT JOIN servers s ON s.id = ur.server_id
       ${whereSql}
       ORDER BY (ur.status = 'open') DESC, ur.created_at DESC
       LIMIT 100`,
      params
    );

    res.json({ ok: true, reports: reports.rows });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load reports: ${error.message}` });
  }
});

app.post('/api/admin/reports/:reportId', authMiddleware, async (req, res) => {
  const reportId = Number(req.params.reportId);
  if (!reportId) {
    res.status(400).json({ ok: false, message: 'Report id is required.' });
    return;
  }

  try {
    if (!(await requirePlatformAdmin(req.userId))) {
      res.status(403).json({ ok: false, message: 'Platform admin access required.' });
      return;
    }

    const status = String(req.body?.status || '').trim().toLowerCase();
    if (!['open', 'reviewed', 'dismissed', 'actioned'].includes(status)) {
      res.status(400).json({ ok: false, message: 'Report status is invalid.' });
      return;
    }
    const note = String(req.body?.reviewNote || '').trim().slice(0, 500);
    const reviewedBy = status === 'open' ? null : req.userId;
    const reviewedAtSql = status === 'open' ? 'NULL' : 'NOW()';

    const updated = await db.query(
      `UPDATE user_reports
       SET status = $1,
           reviewed_by_user_id = $2,
           reviewed_at = ${reviewedAtSql},
           review_note = $3
       WHERE id = $4
       RETURNING id`,
      [status, reviewedBy, note || null, reportId]
    );
    if (updated.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Report not found.' });
      return;
    }

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to update report: ${error.message}` });
  }
});

app.get('/api/admin/storage', authMiddleware, async (req, res) => {
  try {
    if (!(await requirePlatformAdmin(req.userId))) {
      res.status(403).json({ ok: false, message: 'Platform admin access required.' });
      return;
    }
    const overview = await getAttachmentStorageOverview();
    res.json({ ok: true, ...overview });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load storage config: ${error.message}` });
  }
});

app.post('/api/admin/storage/cleanup', authMiddleware, async (req, res) => {
  try {
    if (!(await requirePlatformAdmin(req.userId))) {
      res.status(403).json({ ok: false, message: 'Platform admin access required.' });
      return;
    }
    const settings = await updateCleanupSettings({
      maxUploadMb: req.body?.maxUploadMb,
      expireDays: req.body?.expireDays,
      maxUploadsPerDay: req.body?.maxUploadsPerDay,
      storageQuotaMb: req.body?.storageQuotaMb,
      emptyServerCleanupDays: req.body?.emptyServerCleanupDays,
      bannedUserCleanupDays: req.body?.bannedUserCleanupDays,
      cleanupIntervalMinutes: req.body?.cleanupIntervalMinutes
    });
    res.json({ ok: true, config: settings });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to update cleanup settings: ${error.message}` });
  }
});

app.get('/api/admin/ban-appeals', authMiddleware, async (req, res) => {
  try {
    if (!(await requirePlatformAdmin(req.userId))) {
      res.status(403).json({ ok: false, message: 'Platform admin access required.' });
      return;
    }
    const status = String(req.query.status || 'open').toLowerCase();
    const allowed = new Set(['open', 'reviewed', 'dismissed', 'approved', 'all']);
    const selected = allowed.has(status) ? status : 'open';
    const appeals = await db.query(
      `SELECT ba.id, ba.user_id, ba.reason, ba.status, ba.review_note, ba.reviewed_at, ba.created_at,
              u.username, u.email, u.platform_banned_at, reviewer.username AS reviewed_by_username
       FROM ban_appeals ba
       JOIN users u ON u.id = ba.user_id
       LEFT JOIN users reviewer ON reviewer.id = ba.reviewed_by_user_id
       WHERE $1 = 'all' OR ba.status = $1
       ORDER BY (ba.status = 'open') DESC, ba.created_at DESC
       LIMIT 200`,
      [selected]
    );
    res.json({ ok: true, appeals: appeals.rows });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load ban appeals: ${error.message}` });
  }
});

app.post('/api/admin/ban-appeals/:appealId', authMiddleware, async (req, res) => {
  const appealId = Number(req.params.appealId);
  const status = String(req.body?.status || '').toLowerCase();
  const allowed = new Set(['reviewed', 'dismissed', 'approved']);
  if (!appealId || !allowed.has(status)) {
    res.status(400).json({ ok: false, message: 'Valid appeal and status are required.' });
    return;
  }
  try {
    if (!(await requirePlatformAdmin(req.userId))) {
      res.status(403).json({ ok: false, message: 'Platform admin access required.' });
      return;
    }
    const note = String(req.body?.reviewNote || '').trim().slice(0, 1000) || null;
    const updated = await db.query(
      `UPDATE ban_appeals
       SET status = $1,
           reviewed_by_user_id = $2,
           reviewed_at = NOW(),
           review_note = $3
       WHERE id = $4
       RETURNING user_id`,
      [status, req.userId, note, appealId]
    );
    if (updated.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Appeal not found.' });
      return;
    }
    if (status === 'approved') {
      await db.query(
        `UPDATE users
         SET platform_banned_at = NULL,
             platform_ban_reason = NULL,
             account_standing = 'good',
             standing_reason = NULL
         WHERE id = $1`,
        [updated.rows[0].user_id]
      );
    }
    const appealUser = await db.query('SELECT username, email FROM users WHERE id = $1', [updated.rows[0].user_id]);
    if (appealUser.rows[0]?.email) {
      sendBanAppealStatusEmail(appealUser.rows[0].email, appealUser.rows[0].username, status, note).catch(() => {});
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to update ban appeal: ${error.message}` });
  }
});

app.get('/api/admin/servers', authMiddleware, async (req, res) => {
  try {
    if (!(await requirePlatformAdmin(req.userId))) {
      res.status(403).json({ ok: false, message: 'Platform admin access required.' });
      return;
    }

    const query = String(req.query?.query || '').trim();
    const like = `%${query}%`;
    const servers = await db.query(
      `SELECT s.id,
              s.name,
              s.owner_user_id,
              s.created_at,
              s.empty_since,
              owner.username AS owner_username,
              COUNT(DISTINCT sm.user_id)::int AS member_count,
              COUNT(DISTINCT c.id)::int AS channel_count
       FROM servers s
       LEFT JOIN users owner ON owner.id = s.owner_user_id
       LEFT JOIN server_members sm ON sm.server_id = s.id
       LEFT JOIN channels c ON c.server_id = s.id
       WHERE $1 = '%%'
          OR s.name ILIKE $1
          OR owner.username ILIKE $1
          OR CAST(s.id AS TEXT) = $2
       GROUP BY s.id, s.name, s.owner_user_id, s.created_at, s.empty_since, owner.username
       ORDER BY LOWER(s.name), s.id
       LIMIT 100`,
      [like, query]
    );

    const cleanupSettings = await getCleanupSettings();
    res.json({ ok: true, servers: addEmptyServerCleanupInfoToServers(servers.rows, cleanupSettings) });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load servers: ${error.message}` });
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
    const messages = await db.query(
      `SELECT m.id, m.channel_id, c.name AS channel_name, m.user_id, m.content, m.created_at,
              u.username, u.avatar_url, u.platform_banned_at AS author_platform_banned_at,
              a.id AS attachment_id,
              a.original_filename AS attachment_original_filename,
              a.mime_type AS attachment_mime_type,
              a.file_size AS attachment_file_size,
              a.expires_at AS attachment_expires_at
       FROM messages m
       JOIN channels c ON c.id = m.channel_id
       JOIN users u ON u.id = m.user_id
       LEFT JOIN message_attachments a ON a.message_id = m.id AND (a.expires_at IS NULL OR a.expires_at > NOW())
       WHERE c.server_id = $1
       ORDER BY m.created_at DESC
       LIMIT 100`,
      [serverId]
    );

    res.json({
      ok: true,
      server: server.rows[0],
      channels: channels.rows,
      members: members.rows,
      messages: messages.rows.map(normalizeAttachmentRow).reverse()
    });
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
      await clearAuthTokensForUser(targetUserId);
      disconnectRealtimeUser(targetUserId, 'Account banned from JelloChat.');
    }
    if (!target.platform_banned_at && nextBanned) {
      const settings = await getCleanupSettings();
      sendTerminationEmail(updated.rows[0].email, updated.rows[0].username, nextBanReason || nextStandingReason || 'Your account was terminated for Terms of Service violations.', {
        bannedUserCleanupDays: settings.bannedUserCleanupDays
      }).catch(() => {});
    }

    const cleanupSettings = await getCleanupSettings();
    res.json({ ok: true, user: addBannedAccountCleanupInfo(updated.rows[0], cleanupSettings) });
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
    await deleteAttachmentFilesForServer(serverId);
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

    await deleteAttachmentFilesForUser(targetUserId);
    await db.query('DELETE FROM users WHERE id = $1', [targetUserId]);
    await clearAuthTokensForUser(targetUserId);
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
         AND u.platform_banned_at IS NULL
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

    const partner = await db.query(
      `SELECT id, username, avatar_url
       FROM users
       WHERE id = $1
         AND platform_banned_at IS NULL`,
      [partnerUserId]
    );
    if (partner.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'User not found.' });
      return;
    }

    const messages = await db.query(
      `SELECT m.id, m.sender_user_id AS user_id, m.receiver_user_id, m.content, m.created_at,
              u.username, u.avatar_url, u.platform_banned_at AS author_platform_banned_at,
              a.id AS attachment_id,
              a.original_filename AS attachment_original_filename,
              a.mime_type AS attachment_mime_type,
              a.file_size AS attachment_file_size,
              a.expires_at AS attachment_expires_at
       FROM dm_messages m
       JOIN users u ON u.id = m.sender_user_id
       LEFT JOIN message_attachments a ON a.dm_message_id = m.id AND (a.expires_at IS NULL OR a.expires_at > NOW())
       WHERE (m.sender_user_id = $1 AND m.receiver_user_id = $2)
          OR (m.sender_user_id = $2 AND m.receiver_user_id = $1)
       ORDER BY m.created_at ASC
       LIMIT 300`,
      [req.userId, partnerUserId]
    );

    res.json({ ok: true, messages: messages.rows.map(normalizeAttachmentRow), currentUserId: req.userId, partner: partner.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load DM messages: ${error.message}` });
  }
});

app.post('/api/dm/:partnerUserId/messages', authMiddleware, uploadMessageAttachment, async (req, res) => {
  const partnerUserId = Number(req.params.partnerUserId);
  const content = String(req.body?.content || '').trim();
  if (!partnerUserId || (!content && !req.file)) {
    removeUploadedFile(req.file);
    res.status(400).json({ ok: false, message: 'Partner and message content or an attachment are required.' });
    return;
  }

  try {
    const allowed = await canUsersDm(req.userId, partnerUserId);
    if (!allowed) {
      removeUploadedFile(req.file);
      res.status(403).json({ ok: false, message: 'You can only DM friends or users in a shared server.' });
      return;
    }

    const moderationMessage = content ? await runMinimumAutoModeration({
      userId: req.userId,
      partnerUserId,
      content
    }) : null;
    if (moderationMessage) {
      const severeViolation = classifyServerAutoModerationViolation(content);
      if (severeViolation) {
        removeUploadedFile(req.file);
        await autoTerminateBotAccount(req.userId, `Account terminated for automated bot spam in DMs: ${severeViolation.rule}.`);
        res.status(403).json({ ok: false, message: 'This account has been terminated for automated bot activity.' });
        return;
      }
      removeUploadedFile(req.file);
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
    const attachment = await saveMessageAttachment({ file: req.file, uploaderUserId: req.userId, dmMessageId: inserted.rows[0].id });
    const message = {
      id: inserted.rows[0].id,
      user_id: inserted.rows[0].sender_user_id,
      receiver_user_id: inserted.rows[0].receiver_user_id,
      content: inserted.rows[0].content,
      created_at: inserted.rows[0].created_at,
      username: me.rows[0]?.username || 'Unknown',
      avatar_url: me.rows[0]?.avatar_url || '',
      attachment
    };

    broadcastToUsers([req.userId, partnerUserId], {
      type: 'dm-message-created',
      fromUserId: req.userId
    });
    res.json({ ok: true, message });
  } catch (error) {
    removeUploadedFile(req.file);
    res.status(500).json({ ok: false, message: `Failed to send DM: ${error.message}` });
  }
});

app.get('/api/friends/requests', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT fr.id, fr.sender_user_id, u.username, u.avatar_url, fr.created_at
       FROM friend_requests fr
       JOIN users u ON u.id = fr.sender_user_id
       WHERE fr.receiver_user_id = $1
         AND fr.status = 'pending'
         AND u.platform_banned_at IS NULL
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
      `SELECT m.id, m.channel_id, m.user_id, m.content, m.created_at,
              u.username, u.avatar_url, u.platform_banned_at AS author_platform_banned_at,
              a.id AS attachment_id,
              a.original_filename AS attachment_original_filename,
              a.mime_type AS attachment_mime_type,
              a.file_size AS attachment_file_size,
              a.expires_at AS attachment_expires_at
       FROM messages m
       JOIN users u ON u.id = m.user_id
       LEFT JOIN message_attachments a ON a.message_id = m.id AND (a.expires_at IS NULL OR a.expires_at > NOW())
       WHERE m.channel_id = $1
       ORDER BY m.created_at ASC
       LIMIT 200`,
      [channelId]
    );
    res.json({ ok: true, messages: messages.rows.map(normalizeAttachmentRow), currentUserId: req.userId });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load messages: ${error.message}` });
  }
});

app.post('/api/chat/messages', authMiddleware, uploadMessageAttachment, async (req, res) => {
  const channelId = Number(req.body?.channelId);
  const content = String(req.body?.content || '').trim();
  if (!channelId || (!content && !req.file)) {
    removeUploadedFile(req.file);
    res.status(400).json({ ok: false, message: 'Channel and message content or an attachment are required.' });
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
      removeUploadedFile(req.file);
      res.status(403).json({ ok: false, message: 'Access denied.' });
      return;
    }

    const moderationResult = content ? await handleServerAutoModeration(access.rows[0].server_id, channelId, req.userId, content) : null;
    if (moderationResult?.blocked) {
      removeUploadedFile(req.file);
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
    const attachment = await saveMessageAttachment({ file: req.file, uploaderUserId: req.userId, messageId: inserted.rows[0].id });
    const message = { ...inserted.rows[0], username: user.rows[0]?.username || 'Unknown', avatar_url: user.rows[0]?.avatar_url || '', attachment };
    broadcastToChannel(channelId, { type: 'message-created', channelId, message });
    res.json({ ok: true, message });
  } catch (error) {
    removeUploadedFile(req.file);
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

    await deleteAttachmentsForMessage(messageId);
    await db.query('DELETE FROM messages WHERE id = $1', [messageId]);
    broadcastToChannel(access.channel_id, { type: 'message-deleted', channelId: access.channel_id, messageId });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to delete message: ${error.message}` });
  }
});

app.get('/api/attachments/:attachmentId', authMiddleware, async (req, res) => {
  const attachmentId = Number(req.params.attachmentId);
  if (!attachmentId) {
    res.status(400).json({ ok: false, message: 'Attachment id is required.' });
    return;
  }

  try {
    const result = await db.query(
      `SELECT a.id,
              a.original_filename,
              a.stored_filename,
              a.mime_type,
              a.encryption_iv,
              a.encryption_auth_tag,
              m.channel_id,
              dm.sender_user_id,
              dm.receiver_user_id
       FROM message_attachments a
       LEFT JOIN messages m ON m.id = a.message_id
       LEFT JOIN channels c ON c.id = m.channel_id
       LEFT JOIN server_members sm ON sm.server_id = c.server_id AND sm.user_id = $2
       LEFT JOIN dm_messages dm ON dm.id = a.dm_message_id
       WHERE a.id = $1
         AND (a.expires_at IS NULL OR a.expires_at > NOW())
         AND (
           sm.user_id IS NOT NULL
           OR dm.sender_user_id = $2
           OR dm.receiver_user_id = $2
         )
       LIMIT 1`,
      [attachmentId, req.userId]
    );
    const attachment = result.rows[0];
    if (!attachment) {
      res.status(404).json({ ok: false, message: 'Attachment not found.' });
      return;
    }

    const safeFilename = String(attachment.original_filename || 'attachment').replace(/[\r\n"]/g, '');
    res.setHeader('Content-Type', attachment.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    const data = await readAttachmentFile(attachment);
    res.send(data);
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to download attachment: ${error.message}` });
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
  await runCleanupJobs();
  await scheduleCleanupJobs();
  await ensurePlatformAdminExists();
  sendTermsUpdateEmailsOnStartup().catch((error) => {
    console.warn(`Terms update email job failed: ${error.message}`);
  });
  sendPrivacyUpdateEmailsOnStartup().catch((error) => {
    console.warn(`Privacy Policy update email job failed: ${error.message}`);
  });
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws, request) => {
    const url = new URL(request.url || '/', `http://${request.headers.host}`);
    const token = url.searchParams.get('token');
    const userId = await resolveAuthToken(token).catch(() => null);

    if (!userId) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    const user = await getUserAdminState(userId).catch(() => null);
    if (!user || user.platform_banned_at) {
      await clearAuthTokensForUser(userId);
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
