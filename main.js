const { app, BrowserWindow, desktopCapturer, ipcMain, screen: electronScreen, session } = require('electron');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');
const fs = require('fs');
const db = require('./db');
const { sendMail } = require('./mailer');

const WS_PORT = Number(process.env.WS_PORT || 3131);
const DEFAULT_PUBLIC_URL = 'https://chat.jellodog.com';
const CURRENT_TOS_VERSION = '2026-05-20-protections';
const CURRENT_PRIVACY_VERSION = '2026-05-20-protections';

app.commandLine.appendSwitch(
  'disable-features',
  [
    'AllowWgcScreenCapturer',
    'AllowWgcWindowCapturer',
    'AllowWgcScreenZeroHz',
    'AllowWgcZeroHz'
  ].join(',')
);

let mainWindow;
let currentUserId = null;
const authTokens = new Map();
const wsClients = new Map();
let realtimeServer;

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function buildPublicUrl(pathname) {
  const base = String(process.env.APP_PUBLIC_URL || DEFAULT_PUBLIC_URL).trim().replace(/\/+$/, '');
  return `${base}${pathname}`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

function isPackagedCloudClientMode() {
  const base = String(process.env.APP_PUBLIC_URL || DEFAULT_PUBLIC_URL).trim().replace(/\/+$/, '');
  return app.isPackaged && /^https?:\/\//i.test(base) && !/localhost|127\.0\.0\.1/i.test(base);
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

function createWindow() {
  const packagedCloudClientMode = isPackagedCloudClientMode();
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 1000,
    minHeight: 650,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      additionalArguments: packagedCloudClientMode ? ['--jellochat-cloud-client=1'] : []
    }
  });
  mainWindow.setMenu(null);
  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
}

function configureDisplayCapture() {
  const defaultSession = session.defaultSession;
  if (!defaultSession || typeof defaultSession.setDisplayMediaRequestHandler !== 'function') {
    return;
  }
  defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 0, height: 0 }
      });
      callback({
        video: sources[0] || null,
        audio: false
      });
    } catch (_error) {
      callback({
        video: null,
        audio: false
      });
    }
  }, { useSystemPicker: true });
}

ipcMain.handle('screen:getSources', async () => {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 320, height: 180 }
    });
    const displaysById = new Map(
      electronScreen.getAllDisplays().map((display) => [String(display.id), display])
    );
    return {
      ok: true,
      sources: sources.map((source) => {
        const display = displaysById.get(String(source.display_id || ''));
        return {
          id: source.id,
          name: source.name,
          displayId: source.display_id || '',
          width: display?.size?.width || display?.bounds?.width || 0,
          height: display?.size?.height || display?.bounds?.height || 0,
          scaleFactor: display?.scaleFactor || 1,
          thumbnail: source.thumbnail?.toDataURL?.() || ''
        };
      })
    };
  } catch (error) {
    return { ok: false, message: `Failed to get screen sources: ${error.message}` };
  }
});

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

async function requirePlatformAdmin(userId) {
  const user = await getUserAdminState(userId);
  return Boolean(user?.is_platform_admin);
}

async function countPlatformAdmins() {
  const result = await db.query('SELECT COUNT(*)::int AS count FROM users WHERE is_platform_admin = TRUE');
  return result.rows[0]?.count || 0;
}

const authAttemptTracker = new Map();

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
    clearAuthTokensForUser(userId);
    disconnectRealtimeUser(userId, 'Account banned from JelloChat.');
    sendTerminationEmail(updated.email, updated.username, updated.platform_ban_reason || updated.standing_reason || 'Your account was terminated for Terms of Service violations.').catch(() => {});
  }
  return updated;
}

async function autoTerminateBotAccount(userId, reason) {
  const updated = await applyAutomaticStandingUpdate(userId, {
    increment: 3,
    reason,
    forceStanding: 'banned',
    setPlatformBanned: true,
    platformBanReason: reason
  });
  if (updated && currentUserId === userId) {
    currentUserId = null;
  }
  return updated;
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

function getOnlineUserIds() {
  const ids = new Set();
  for (const [, meta] of wsClients) {
    ids.add(meta.userId);
  }
  return ids;
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

function sendWs(ws, payload) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(payload));
  }
}

function broadcastToUsers(userIds, payload) {
  const allowedUserIds = new Set(userIds);
  for (const [ws, meta] of wsClients) {
    if (allowedUserIds.has(meta.userId)) {
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
  const memberIds = result.rows.map((row) => row.user_id);
  broadcastToUsers(memberIds, payload);
}

async function broadcastPresenceForUser(userId) {
  const memberships = await db.query('SELECT server_id FROM server_members WHERE user_id = $1', [userId]);
  for (const row of memberships.rows) {
    await broadcastToServerMembers(row.server_id, { type: 'presence-changed', serverId: row.server_id });
  }
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

function setupRealtimeServer() {
  realtimeServer = new WebSocketServer({ port: WS_PORT });

  realtimeServer.on('connection', (ws, request) => {
    const requestUrl = new URL(request.url || '/', `ws://127.0.0.1:${WS_PORT}`);
    const token = requestUrl.searchParams.get('token');
    const tokenUserId = token ? authTokens.get(token) : null;

    if (!tokenUserId) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    wsClients.set(ws, { userId: tokenUserId, subscriptions: new Set() });
    sendWs(ws, { type: 'connected' });
    broadcastPresenceForUser(tokenUserId).catch(() => {});

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

          const membership = await db.query(
            `SELECT 1
             FROM channels c
             JOIN server_members sm ON sm.server_id = c.server_id
             WHERE c.id = $1 AND sm.user_id = $2`,
            [channelId, meta.userId]
          );

          if (membership.rows.length > 0) {
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
}

ipcMain.handle('realtime:getConfig', async () => {
  return { ok: true, port: WS_PORT };
});

ipcMain.handle('auth:register', async (_event, payload) => {
  const requestedUsername = String(payload?.username || '').trim();
  const email = String(payload?.email || '').trim().toLowerCase();
  const password = String(payload?.password || '');
  const dateOfBirth = normalizeDateOfBirthInput(payload?.dateOfBirth);
  const botBlock = shouldBlockBotLikeAuth(payload, 'register');

  if (!requestedUsername || !email || !password) {
    return { ok: false, message: 'Username, email, and password are required.' };
  }
  if (botBlock) {
    return { ok: false, message: botBlock };
  }
  if (trackAuthAttempts(`register:${email}`, 4, 10 * 60 * 1000)) {
    return { ok: false, message: 'Too many signup attempts. Please try again later.' };
  }
  if (baseUsername(requestedUsername).length < 2 || baseUsername(requestedUsername).length > 50) {
    return { ok: false, message: 'Username must be between 2 and 50 characters.' };
  }

  if (password.length < 6) {
    return { ok: false, message: 'Password must be at least 6 characters.' };
  }
  if (!dateOfBirth) {
    return { ok: false, message: 'Valid date of birth is required.' };
  }
  if (!isAtLeast13YearsOld(dateOfBirth)) {
    return { ok: false, message: 'You must be at least 13 years old to register.' };
  }

  try {
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return { ok: false, message: 'Email already in use.' };
    }

    const allocated = await allocateUniqueUsername(requestedUsername);
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, date_of_birth, email_verified, tos_notified_version, tos_email_notified_version, privacy_notified_version, privacy_email_notified_version) VALUES ($1, $2, $3, $4, FALSE, $5, $5, $6, $6) RETURNING id, username, email, avatar_url, date_of_birth',
      [allocated.username, email, passwordHash, dateOfBirth, CURRENT_TOS_VERSION, CURRENT_PRIVACY_VERSION]
    );

    const newUser = result.rows[0];
    const defaultServer = await db.query('SELECT id, owner_user_id FROM servers WHERE name = $1 LIMIT 1', ['Jello HQ']);
    if (defaultServer.rows.length > 0) {
      if (!defaultServer.rows[0].owner_user_id) {
        await db.query('UPDATE servers SET owner_user_id = $1 WHERE id = $2', [newUser.id, defaultServer.rows[0].id]);
      }
      await db.query(
        'INSERT INTO server_members (user_id, server_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [newUser.id, defaultServer.rows[0].id]
      );
    }

    await ensurePlatformAdminExists();

    const mailResult = await issueEmailVerification(newUser.id, newUser.email, newUser.username);
    if (!mailResult.ok) {
      return { ok: false, message: `Account created but verification email failed: ${mailResult.message}` };
    }

    return {
      ok: true,
      needsVerification: true,
      assignedUsername: newUser.username,
      message: allocated.changed
        ? `Account created. Username set to ${newUser.username}. Check your email to verify your account before logging in.`
        : 'Account created. Check your email to verify your account before logging in.'
    };
  } catch (error) {
    return { ok: false, message: `Registration failed: ${error.message}` };
  }
});

ipcMain.handle('auth:login', async (_event, payload) => {
  const email = String(payload?.email || '').trim().toLowerCase();
  const password = String(payload?.password || '');
  const botBlock = shouldBlockBotLikeAuth(payload, 'login');

  if (!email || !password) {
    return { ok: false, message: 'Email and password are required.' };
  }
  if (trackAuthAttempts(`login:${email}`, 8, 10 * 60 * 1000)) {
    return { ok: false, message: 'Too many login attempts. Please try again later.' };
  }

  try {
    const result = await db.query('SELECT id, username, email, avatar_url, is_platform_admin, platform_banned_at, account_standing, standing_reason, tos_violation_count, tos_notified_version, privacy_notified_version, password_hash, email_verified, date_of_birth FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return { ok: false, message: 'Invalid email or password.' };
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return { ok: false, message: 'Invalid email or password.' };
    }
    if (botBlock) {
      await autoTerminateBotAccount(user.id, botBlock);
      return { ok: false, message: 'This account has been terminated for automated bot activity.' };
    }
    if (!user.email_verified) {
      return {
        ok: false,
        verificationRequired: true,
        message: 'Please verify your email before logging in.'
      };
    }
    if (user.platform_banned_at) {
      return { ok: false, message: 'This account has been banned from JelloChat.' };
    }

    currentUserId = user.id;
    const realtimeToken = issueAuthToken(user.id);
    const tosNotice = await maybeNotifyTermsUpdate(user);
    const privacyNotice = await maybeNotifyPrivacyUpdate(user);
    return {
      ok: true,
      user: { id: user.id, username: user.username, email: user.email, avatar_url: user.avatar_url, is_platform_admin: user.is_platform_admin, account_standing: user.account_standing, standing_reason: user.standing_reason, tos_violation_count: user.tos_violation_count, date_of_birth: user.date_of_birth },
      realtimeToken,
      tosNotice,
      privacyNotice
    };
  } catch (error) {
    return { ok: false, message: `Login failed: ${error.message}` };
  }
});

ipcMain.handle('auth:logout', async () => {
  if (currentUserId) {
    clearAuthTokensForUser(currentUserId);
  }
  currentUserId = null;
  return { ok: true };
});

ipcMain.handle('auth:getSession', async () => {
  if (!currentUserId) {
    return { ok: false, message: 'No active session.' };
  }

  try {
    const result = await db.query('SELECT id, username, email, avatar_url, is_platform_admin, platform_banned_at, account_standing, standing_reason, tos_violation_count, tos_notified_version, privacy_notified_version, date_of_birth FROM users WHERE id = $1', [currentUserId]);
    if (result.rows.length === 0) {
      currentUserId = null;
      return { ok: false, message: 'Session not found.' };
    }
    const user = result.rows[0];
    if (user.platform_banned_at) {
      clearAuthTokensForUser(user.id);
      currentUserId = null;
      return { ok: false, message: 'This account has been banned from JelloChat.' };
    }
    const realtimeToken = issueAuthToken(user.id);
    const tosNotice = await maybeNotifyTermsUpdate(user);
    const privacyNotice = await maybeNotifyPrivacyUpdate(user);
    delete user.tos_notified_version;
    delete user.privacy_notified_version;
    return { ok: true, user, realtimeToken, tosNotice, privacyNotice };
  } catch (error) {
    return { ok: false, message: `Failed to restore session: ${error.message}` };
  }
});

ipcMain.handle('auth:getPasskeys', async () => ({ ok: true, supported: false, passkeys: [] }));
ipcMain.handle('auth:beginPasskeyRegistration', async () => ({ ok: false, supported: false, message: 'Passkeys are available in the web app on a secure origin.' }));
ipcMain.handle('auth:finishPasskeyRegistration', async () => ({ ok: false, supported: false, message: 'Passkeys are available in the web app on a secure origin.' }));
ipcMain.handle('auth:beginPasskeyLogin', async () => ({ ok: false, supported: false, message: 'Passkeys are available in the web app on a secure origin.' }));
ipcMain.handle('auth:finishPasskeyLogin', async () => ({ ok: false, supported: false, message: 'Passkeys are available in the web app on a secure origin.' }));
ipcMain.handle('auth:deletePasskey', async () => ({ ok: false, supported: false, message: 'Passkeys are available in the web app on a secure origin.' }));

ipcMain.handle('auth:resendVerification', async (_event, payload) => {
  const email = String(payload?.email || '').trim().toLowerCase();
  if (!email) {
    return { ok: false, message: 'Email is required.' };
  }

  try {
    const userResult = await db.query('SELECT id, username, email, email_verified FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return { ok: true, message: 'If this email exists, a verification email has been sent.' };
    }
    const user = userResult.rows[0];
    if (user.email_verified) {
      return { ok: true, message: 'Email is already verified.' };
    }
    await issueEmailVerification(user.id, user.email, user.username);
    return { ok: true, message: 'Verification email sent.' };
  } catch (error) {
    return { ok: false, message: `Failed to resend verification: ${error.message}` };
  }
});

ipcMain.handle('auth:verifyEmail', async (_event, payload) => {
  const token = String(payload?.token || '').trim();
  if (!token) {
    return { ok: false, message: 'Token is required.' };
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
      return { ok: false, message: 'Verification token is invalid or expired.' };
    }
    return { ok: true, message: 'Email verified successfully.' };
  } catch (error) {
    return { ok: false, message: `Failed to verify email: ${error.message}` };
  }
});

ipcMain.handle('auth:requestPasswordReset', async (_event, payload) => {
  const email = String(payload?.email || '').trim().toLowerCase();
  if (!email) {
    return { ok: false, message: 'Email is required.' };
  }

  try {
    const userResult = await db.query('SELECT id, username, email FROM users WHERE email = $1', [email]);
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      await issuePasswordReset(user.id, user.email, user.username);
    }
    return { ok: true, message: 'If this email exists, a password reset link has been sent.' };
  } catch (error) {
    return { ok: false, message: `Failed to request password reset: ${error.message}` };
  }
});

ipcMain.handle('auth:confirmPasswordReset', async (_event, payload) => {
  const token = String(payload?.token || '').trim();
  const newPassword = String(payload?.newPassword || '');
  if (!token || !newPassword) {
    return { ok: false, message: 'Token and new password are required.' };
  }
  if (newPassword.length < 6) {
    return { ok: false, message: 'Password must be at least 6 characters.' };
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
      return { ok: false, message: 'Reset token is invalid or expired.' };
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
    return { ok: true, message: 'Password has been reset.' };
  } catch (error) {
    return { ok: false, message: `Failed to reset password: ${error.message}` };
  }
});

ipcMain.handle('auth:updateAccount', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const requestedUsername = String(payload?.username || '').trim();
  const email = String(payload?.email || '').trim().toLowerCase();
  const requestedDateOfBirth = normalizeDateOfBirthInput(payload?.dateOfBirth);
  const currentPassword = String(payload?.currentPassword || '');
  const newPassword = String(payload?.newPassword || '');

  if (!requestedUsername || !email) {
    return { ok: false, message: 'Username and email are required.' };
  }
  if (baseUsername(requestedUsername).length < 2 || baseUsername(requestedUsername).length > 50) {
    return { ok: false, message: 'Username must be between 2 and 50 characters.' };
  }
  if (!email.includes('@')) {
    return { ok: false, message: 'Valid email is required.' };
  }
  if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
    return { ok: false, message: 'Current and new password are required together.' };
  }
  if (newPassword && newPassword.length < 6) {
    return { ok: false, message: 'New password must be at least 6 characters.' };
  }

  try {
    const avatarUrl = normalizeAvatarUrl(payload?.avatarUrl);
    const existing = await db.query('SELECT id, username, email, avatar_url, password_hash, date_of_birth FROM users WHERE id = $1', [currentUserId]);
    if (existing.rows.length === 0) {
      return { ok: false, message: 'User not found.' };
    }
    const user = existing.rows[0];

    if (email !== user.email) {
      const duplicate = await db.query('SELECT id FROM users WHERE email = $1 AND id <> $2', [email, currentUserId]);
      if (duplicate.rows.length > 0) {
        return { ok: false, message: 'Email already in use.' };
      }
    }

    let passwordHash = user.password_hash;
    if (newPassword) {
      const valid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!valid) {
        return { ok: false, message: 'Current password is incorrect.' };
      }
      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const nextDateOfBirth = requestedDateOfBirth || user.date_of_birth;
    if (!nextDateOfBirth) {
      return { ok: false, message: 'Date of birth is required.' };
    }
    if (!isAtLeast13YearsOld(nextDateOfBirth)) {
      return { ok: false, message: 'You must be at least 13 years old.' };
    }

    const allocated = await allocateUniqueUsername(requestedUsername, currentUserId);
    const updated = await db.query(
      'UPDATE users SET username = $1, email = $2, avatar_url = $3, password_hash = $4, date_of_birth = $5 WHERE id = $6 RETURNING id, username, email, avatar_url, is_platform_admin, account_standing, standing_reason, tos_violation_count, date_of_birth',
      [allocated.username, email, avatarUrl, passwordHash, nextDateOfBirth, currentUserId]
    );

    return {
      ok: true,
      user: updated.rows[0],
      message: allocated.changed ? `Username updated to ${updated.rows[0].username}.` : 'Account updated.'
    };
  } catch (error) {
    return { ok: false, message: `Failed to update account: ${error.message}` };
  }
});

ipcMain.handle('auth:deleteAccount', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const currentPassword = String(payload?.currentPassword || '');
  if (!currentPassword) {
    return { ok: false, message: 'Current password is required.' };
  }

  try {
    const existing = await db.query('SELECT id, password_hash FROM users WHERE id = $1', [currentUserId]);
    if (existing.rows.length === 0) {
      return { ok: false, message: 'User not found.' };
    }

    const valid = await bcrypt.compare(currentPassword, existing.rows[0].password_hash);
    if (!valid) {
      return { ok: false, message: 'Current password is incorrect.' };
    }

    const deletedUserId = currentUserId;
    await db.query('DELETE FROM users WHERE id = $1', [deletedUserId]);
    clearAuthTokensForUser(deletedUserId);
    disconnectRealtimeUser(deletedUserId, 'Account deleted.');
    currentUserId = null;
    await ensurePlatformAdminExists();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to delete account: ${error.message}` };
  }
});

function readPolicyMarkdown(filename) {
  const filePath = path.join(__dirname, filename);
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (_error) {
    return null;
  }
}

ipcMain.handle('legal:getPrivacyPolicy', async () => {
  const text = readPolicyMarkdown('PRIVACY_POLICY.md');
  if (!text) {
    return { ok: false, message: 'Privacy Policy file not found.' };
  }
  return { ok: true, text };
});

ipcMain.handle('legal:getTermsOfService', async () => {
  const text = readPolicyMarkdown('TERMS_OF_SERVICE.md');
  if (!text) {
    return { ok: false, message: 'Terms of Service file not found.' };
  }
  return { ok: true, text };
});

ipcMain.handle('chat:getServers', async () => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  try {
    const result = await db.query(
      `SELECT s.id, s.name, s.owner_user_id
       FROM servers s
       JOIN server_members sm ON sm.server_id = s.id
       WHERE sm.user_id = $1
       ORDER BY s.name`,
      [currentUserId]
    );
    return { ok: true, servers: result.rows };
  } catch (error) {
    return { ok: false, message: `Failed to load servers: ${error.message}` };
  }
});

ipcMain.handle('chat:createServer', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const name = String(payload?.name || '').trim();
  if (name.length < 2 || name.length > 80) {
    return { ok: false, message: 'Server name must be between 2 and 80 characters.' };
  }

  try {
    const createdServer = await db.query(
      'INSERT INTO servers (name, owner_user_id) VALUES ($1, $2) RETURNING id, name, owner_user_id',
      [name, currentUserId]
    );
    const server = createdServer.rows[0];

    await db.query(
      'INSERT INTO server_members (user_id, server_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [currentUserId, server.id]
    );
    await ensureServerRoles(server.id);
    await db.query('INSERT INTO channels (server_id, type, name) VALUES ($1, $2, $3)', [server.id, 'text', 'general']);

    await broadcastToServerMembers(server.id, { type: 'server-created', server });
    return { ok: true, server };
  } catch (error) {
    return { ok: false, message: `Failed to create server: ${error.message}` };
  }
});

ipcMain.handle('chat:leaveServer', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const serverId = Number(payload?.serverId);
  if (!serverId) {
    return { ok: false, message: 'Valid server id is required.' };
  }

  try {
    const membership = await db.query(
      'SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2',
      [serverId, currentUserId]
    );
    if (membership.rows.length === 0) {
      return { ok: false, message: 'You are not a member of this server.' };
    }

    const server = await db.query('SELECT owner_user_id FROM servers WHERE id = $1', [serverId]);
    if (server.rows.length === 0) {
      return { ok: false, message: 'Server not found.' };
    }

    await db.query('DELETE FROM server_member_roles WHERE server_id = $1 AND user_id = $2', [serverId, currentUserId]);
    await db.query('DELETE FROM server_members WHERE server_id = $1 AND user_id = $2', [serverId, currentUserId]);

    if (server.rows[0].owner_user_id === currentUserId) {
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
    await broadcastPresenceForUser(currentUserId);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to leave server: ${error.message}` };
  }
});

ipcMain.handle('chat:kickMember', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const serverId = Number(payload?.serverId);
  const targetUserId = Number(payload?.targetUserId);
  if (!serverId || !targetUserId) {
    return { ok: false, message: 'Valid server and target user are required.' };
  }
  if (targetUserId === currentUserId) {
    return { ok: false, message: 'You cannot kick yourself.' };
  }

  try {
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.moderate_members) {
      return { ok: false, message: 'You do not have permission to kick members.' };
    }

    const targetMembership = await db.query(
      'SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2',
      [serverId, targetUserId]
    );
    if (targetMembership.rows.length === 0) {
      return { ok: false, message: 'User is not in this server.' };
    }

    await db.query('DELETE FROM server_member_roles WHERE server_id = $1 AND user_id = $2', [serverId, targetUserId]);
    await db.query('DELETE FROM server_members WHERE server_id = $1 AND user_id = $2', [serverId, targetUserId]);
    await broadcastToServerMembers(serverId, { type: 'server-membership-changed', serverId });
    await broadcastPresenceForUser(targetUserId);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to kick member: ${error.message}` };
  }
});

ipcMain.handle('chat:banMember', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const serverId = Number(payload?.serverId);
  const targetUserId = Number(payload?.targetUserId);
  const reason = String(payload?.reason || '').trim();
  if (!serverId || !targetUserId) {
    return { ok: false, message: 'Valid server and target user are required.' };
  }
  if (targetUserId === currentUserId) {
    return { ok: false, message: 'You cannot ban yourself.' };
  }

  try {
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.moderate_members) {
      return { ok: false, message: 'You do not have permission to ban members.' };
    }

    await db.query(
      `INSERT INTO server_bans (server_id, user_id, banned_by_user_id, reason)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (server_id, user_id)
       DO UPDATE SET banned_by_user_id = EXCLUDED.banned_by_user_id,
                     reason = EXCLUDED.reason,
                     created_at = NOW()`,
      [serverId, targetUserId, currentUserId, reason || null]
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
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to ban member: ${error.message}` };
  }
});

ipcMain.handle('chat:unbanMember', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const serverId = Number(payload?.serverId);
  const targetUserId = Number(payload?.targetUserId || 0);
  const target = String(payload?.target || '').trim().toLowerCase();
  if (!serverId || (!targetUserId && !target)) {
    return { ok: false, message: 'Valid server and target user are required.' };
  }

  try {
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.moderate_members) {
      return { ok: false, message: 'You do not have permission to unban members.' };
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
        return { ok: false, message: 'User not found.' };
      }
      resolvedUserId = user.rows[0].id;
    }

    const deleted = await db.query(
      'DELETE FROM server_bans WHERE server_id = $1 AND user_id = $2 RETURNING user_id',
      [serverId, resolvedUserId]
    );
    if (deleted.rows.length === 0) {
      return { ok: false, message: 'User is not banned in this server.' };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to unban member: ${error.message}` };
  }
});

ipcMain.handle('chat:getBannedUsers', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const serverId = Number(payload?.serverId);
  if (!serverId) {
    return { ok: false, message: 'Valid server id is required.' };
  }

  try {
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.moderate_members) {
      return { ok: false, message: 'You do not have permission to view banned users.' };
    }

    const result = await db.query(
      `SELECT b.user_id, u.username, b.reason, b.created_at
         FROM server_bans b
         JOIN users u ON u.id = b.user_id
         WHERE b.server_id = $1
         ORDER BY b.created_at DESC`,
      [serverId]
    );
    return { ok: true, bannedUsers: result.rows };
  } catch (error) {
    return { ok: false, message: `Failed to load banned users: ${error.message}` };
  }
});

ipcMain.handle('chat:renameServer', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const serverId = Number(payload?.serverId);
  const name = String(payload?.name || '').trim();
  if (!serverId || name.length < 2 || name.length > 80) {
    return { ok: false, message: 'Server name must be between 2 and 80 characters.' };
  }

  try {
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.manage_server) {
      return { ok: false, message: 'You do not have permission to rename the server.' };
    }

    const updated = await db.query(
      'UPDATE servers SET name = $1 WHERE id = $2 RETURNING id, name, owner_user_id',
      [name, serverId]
    );
    if (updated.rows.length === 0) {
      return { ok: false, message: 'Server not found.' };
    }

    await broadcastToServerMembers(serverId, { type: 'server-updated', server: updated.rows[0] });
    return { ok: true, server: updated.rows[0] };
  } catch (error) {
    return { ok: false, message: `Failed to rename server: ${error.message}` };
  }
});

ipcMain.handle('chat:getChannels', async (_event, serverId) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  try {
    const membership = await db.query(
      'SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2',
      [serverId, currentUserId]
    );

    if (membership.rows.length === 0) {
      return { ok: false, message: 'Access denied.' };
    }

    const permissions = await getUserServerPermissions(currentUserId, serverId);
    const channels = await db.query(
      'SELECT id, type, name, server_id FROM channels WHERE server_id = $1 ORDER BY name',
      [serverId]
    );

    return {
      ok: true,
      channels: channels.rows,
      canCreateChannels: permissions.manage_channels,
      permissions
    };
  } catch (error) {
    return { ok: false, message: `Failed to load channels: ${error.message}` };
  }
});

ipcMain.handle('chat:createChannel', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const serverId = Number(payload?.serverId);
  const type = String(payload?.type || 'text').trim().toLowerCase();
  const name = String(payload?.name || '').trim().toLowerCase();
  if (!serverId || !['text', 'voice'].includes(type) || name.length < 1 || name.length > 80) {
    return { ok: false, message: 'Valid server and channel name are required.' };
  }

  try {
    const server = await db.query('SELECT id FROM servers WHERE id = $1', [serverId]);
    if (server.rows.length === 0) {
      return { ok: false, message: 'Server not found.' };
    }
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.manage_channels) {
      return { ok: false, message: 'You do not have permission to create channels.' };
    }

    const created = await db.query(
      'INSERT INTO channels (server_id, type, name) VALUES ($1, $2, $3) RETURNING id, type, name, server_id',
      [serverId, type, name]
    );
    const channel = created.rows[0];
    await broadcastToServerMembers(serverId, { type: 'channel-created', serverId, channel });
    return { ok: true, channel };
  } catch (error) {
    return { ok: false, message: `Failed to create channel: ${error.message}` };
  }
});

ipcMain.handle('vc:getToken', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const serverId = Number(payload?.serverId);
  const channelId = Number(payload?.channelId);
  if (!serverId || !channelId) {
    return { ok: false, message: 'Valid server and channel are required.' };
  }

  try {
    const membership = await db.query(
      'SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2',
      [serverId, currentUserId]
    );
    if (membership.rows.length === 0) {
      return { ok: false, message: 'Access denied.' };
    }

    const channel = await db.query(
      'SELECT id, server_id, type, name FROM channels WHERE id = $1 AND server_id = $2',
      [channelId, serverId]
    );
    if (channel.rows.length === 0) {
      return { ok: false, message: 'Channel not found.' };
    }
    if (channel.rows[0].type !== 'voice') {
      return { ok: false, message: 'This channel is not a voice channel.' };
    }

    const user = await db.query('SELECT username FROM users WHERE id = $1', [currentUserId]);
    const roomName = `server-${serverId}-channel-${channelId}`;
    const voice = await createVoiceToken({
      identity: String(currentUserId),
      name: user.rows[0]?.username || `user-${currentUserId}`,
      roomName
    });

    return {
      ok: true,
      roomName,
      livekitUrl: voice.livekitUrl,
      token: voice.token,
      debug: voice.debug
    };
  } catch (error) {
    return { ok: false, message: `Failed to create voice token: ${error.message}` };
  }
});

function sanitizeUserFacingMessage(row) {
  const isBanned = Boolean(row?.author_platform_banned_at || row?.platform_banned_at);
  return {
    ...row,
    username: isBanned ? 'Banned User' : (row.username || 'Unknown'),
    avatar_url: isBanned ? '' : (row.avatar_url || '')
  };
}

ipcMain.handle('vc:getParticipants', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const serverId = Number(payload?.serverId);
  const channelId = Number(payload?.channelId);
  if (!serverId || !channelId) {
    return { ok: false, message: 'Valid server and channel are required.' };
  }

  try {
    const membership = await db.query(
      'SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2',
      [serverId, currentUserId]
    );
    if (membership.rows.length === 0) {
      return { ok: false, message: 'Access denied.' };
    }

    const channel = await db.query(
      'SELECT id, type FROM channels WHERE id = $1 AND server_id = $2',
      [channelId, serverId]
    );
    if (channel.rows.length === 0) {
      return { ok: false, message: 'Channel not found.' };
    }
    if (channel.rows[0].type !== 'voice') {
      return { ok: false, message: 'This channel is not a voice channel.' };
    }

    const roomName = `server-${serverId}-channel-${channelId}`;
    const participants = await listVoiceParticipants(roomName);
    return { ok: true, participants };
  } catch (error) {
    return { ok: false, message: `Failed to fetch voice participants: ${error.message}` };
  }
});

ipcMain.handle('chat:createInvite', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const serverId = Number(payload?.serverId);
  if (!serverId) {
    return { ok: false, message: 'Valid server id is required.' };
  }

  try {
    const server = await db.query('SELECT id, name FROM servers WHERE id = $1', [serverId]);
    if (server.rows.length === 0) {
      return { ok: false, message: 'Server not found.' };
    }
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.create_invites) {
      return { ok: false, message: 'You do not have permission to create invites.' };
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
      return { ok: false, message: 'Could not generate invite code. Try again.' };
    }

    await db.query(
      'INSERT INTO server_invites (server_id, code, created_by_user_id) VALUES ($1, $2, $3)',
      [serverId, code, currentUserId]
    );

    return { ok: true, invite: { code, serverId, serverName: server.rows[0].name, url: buildInviteUrl(code) } };
  } catch (error) {
    return { ok: false, message: `Failed to create invite: ${error.message}` };
  }
});

ipcMain.handle('chat:joinByInvite', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const code = normalizeInviteCode(payload?.code);
  if (!code) {
    return { ok: false, message: 'Invite code is required.' };
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
      return { ok: false, message: 'Invalid invite code.' };
    }

    const invite = inviteResult.rows[0];
    if (!invite.is_active) {
      return { ok: false, message: 'Invite is inactive.' };
    }
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
      return { ok: false, message: 'Invite has expired.' };
    }
    if (invite.max_uses && invite.uses_count >= invite.max_uses) {
      return { ok: false, message: 'Invite has reached max uses.' };
    }

    const banned = await db.query(
      'SELECT 1 FROM server_bans WHERE server_id = $1 AND user_id = $2',
      [invite.server_id, currentUserId]
    );
    if (banned.rows.length > 0) {
      return { ok: false, message: 'You are banned from this server.' };
    }

    const existing = await db.query(
      'SELECT 1 FROM server_members WHERE user_id = $1 AND server_id = $2',
      [currentUserId, invite.server_id]
    );
    if (existing.rows.length > 0) {
      return {
        ok: true,
        alreadyMember: true,
        server: { id: invite.server_id, name: invite.name }
      };
    }

    await db.query(
      'INSERT INTO server_members (user_id, server_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [currentUserId, invite.server_id]
    );
    await db.query('UPDATE server_invites SET uses_count = uses_count + 1 WHERE id = $1', [invite.id]);
    await broadcastToServerMembers(invite.server_id, { type: 'server-membership-changed', serverId: invite.server_id });
    await broadcastPresenceForUser(currentUserId);

    return { ok: true, server: { id: invite.server_id, name: invite.name } };
  } catch (error) {
    return { ok: false, message: `Failed to join by invite: ${error.message}` };
  }
});

ipcMain.handle('chat:getServerPresence', async (_event, serverId) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  try {
    const membership = await db.query(
      'SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2',
      [serverId, currentUserId]
    );
    if (membership.rows.length === 0) {
      return { ok: false, message: 'Access denied.' };
    }

    const permissions = await getUserServerPermissions(currentUserId, serverId);
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
    return { ok: true, users, permissions };
  } catch (error) {
    return { ok: false, message: `Failed to load server presence: ${error.message}` };
  }
});

ipcMain.handle('roles:getState', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const serverId = Number(payload?.serverId);
  if (!serverId) {
    return { ok: false, message: 'Valid server id is required.' };
  }

  try {
    const membership = await db.query('SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2', [serverId, currentUserId]);
    if (membership.rows.length === 0) {
      return { ok: false, message: 'Access denied.' };
    }

    const permissions = await getUserServerPermissions(currentUserId, serverId);
    const roles = await getServerRoles(serverId);
    const members = await db.query(
      `SELECT u.id, u.username, u.avatar_url,
              COALESCE(
                ARRAY_AGG(smr.role_id ORDER BY smr.role_id) FILTER (WHERE smr.role_id IS NOT NULL),
                '{}'::int[]
              ) AS role_ids
       FROM server_members sm
       JOIN users u ON u.id = sm.user_id
       LEFT JOIN server_member_roles smr ON smr.server_id = sm.server_id AND smr.user_id = sm.user_id
       WHERE sm.server_id = $1
         AND u.platform_banned_at IS NULL
       GROUP BY u.id, u.username, u.avatar_url
       ORDER BY u.username`,
      [serverId]
    );

    return { ok: true, permissions, roles, members: members.rows };
  } catch (error) {
    return { ok: false, message: `Failed to load roles: ${error.message}` };
  }
});

ipcMain.handle('roles:create', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const serverId = Number(payload?.serverId);
  const name = String(payload?.name || '').trim();
  if (!serverId || name.length < 2 || name.length > 80) {
    return { ok: false, message: 'Role name must be between 2 and 80 characters.' };
  }

  try {
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.manage_roles) {
      return { ok: false, message: 'You do not have permission to manage roles.' };
    }
    const created = await db.query(
      `INSERT INTO server_roles (server_id, name, position, permissions, is_default)
       VALUES ($1, $2, 1, '{}'::jsonb, FALSE)
       RETURNING id, server_id, name, position, permissions, is_default`,
      [serverId, name]
    );
    return { ok: true, role: { ...created.rows[0], permissions: normalizeServerPermissions(created.rows[0].permissions) } };
  } catch (error) {
    return { ok: false, message: `Failed to create role: ${error.message}` };
  }
});

ipcMain.handle('roles:update', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const serverId = Number(payload?.serverId);
  const roleId = Number(payload?.roleId);
  const name = String(payload?.name || '').trim();
  const rolePermissions = normalizeServerPermissions(payload?.permissions);
  if (!serverId || !roleId || name.length < 2 || name.length > 80) {
    return { ok: false, message: 'Valid server, role, and role name are required.' };
  }

  try {
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.manage_roles) {
      return { ok: false, message: 'You do not have permission to manage roles.' };
    }
    const existing = await db.query(
      'SELECT id, is_default FROM server_roles WHERE id = $1 AND server_id = $2',
      [roleId, serverId]
    );
    if (existing.rows.length === 0) {
      return { ok: false, message: 'Role not found.' };
    }
    const nextName = existing.rows[0].is_default ? '@everyone' : name;
    const updated = await db.query(
      `UPDATE server_roles
       SET name = $1, permissions = $2::jsonb
       WHERE id = $3 AND server_id = $4
       RETURNING id, server_id, name, position, permissions, is_default`,
      [nextName, JSON.stringify(rolePermissions), roleId, serverId]
    );
    return { ok: true, role: { ...updated.rows[0], permissions: normalizeServerPermissions(updated.rows[0].permissions) } };
  } catch (error) {
    return { ok: false, message: `Failed to update role: ${error.message}` };
  }
});

ipcMain.handle('roles:delete', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const serverId = Number(payload?.serverId);
  const roleId = Number(payload?.roleId);
  if (!serverId || !roleId) {
    return { ok: false, message: 'Valid server and role are required.' };
  }

  try {
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.manage_roles) {
      return { ok: false, message: 'You do not have permission to manage roles.' };
    }
    const existing = await db.query(
      'SELECT id, is_default FROM server_roles WHERE id = $1 AND server_id = $2',
      [roleId, serverId]
    );
    if (existing.rows.length === 0) {
      return { ok: false, message: 'Role not found.' };
    }
    if (existing.rows[0].is_default) {
      return { ok: false, message: 'The default role cannot be deleted.' };
    }
    await db.query('DELETE FROM server_roles WHERE id = $1 AND server_id = $2', [roleId, serverId]);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to delete role: ${error.message}` };
  }
});

ipcMain.handle('roles:setMemberRole', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const serverId = Number(payload?.serverId);
  const roleId = Number(payload?.roleId);
  const targetUserId = Number(payload?.targetUserId);
  const enabled = Boolean(payload?.enabled);
  if (!serverId || !roleId || !targetUserId) {
    return { ok: false, message: 'Valid server, role, and member are required.' };
  }

  try {
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.manage_roles) {
      return { ok: false, message: 'You do not have permission to manage roles.' };
    }
    if (await isServerOwner(targetUserId, serverId)) {
      return { ok: false, message: 'You cannot modify the server owner roles.' };
    }
    const member = await db.query('SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2', [serverId, targetUserId]);
    if (member.rows.length === 0) {
      return { ok: false, message: 'User is not in this server.' };
    }
    const role = await db.query('SELECT id, is_default FROM server_roles WHERE id = $1 AND server_id = $2', [roleId, serverId]);
    if (role.rows.length === 0) {
      return { ok: false, message: 'Role not found.' };
    }
    if (role.rows[0].is_default) {
      return { ok: false, message: 'The default role is applied automatically.' };
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
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to update member role: ${error.message}` };
  }
});

ipcMain.handle('admin:listUsers', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  try {
    if (!(await requirePlatformAdmin(currentUserId))) {
      return { ok: false, message: 'Platform admin access required.' };
    }

    const query = String(payload?.query || '').trim();
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
    return { ok: true, users: result.rows };
  } catch (error) {
    return { ok: false, message: `Failed to load users: ${error.message}` };
  }
});

ipcMain.handle('admin:getUserDetails', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const targetUserId = Number(payload?.userId);
  if (!targetUserId) {
    return { ok: false, message: 'Valid user id is required.' };
  }

  try {
    if (!(await requirePlatformAdmin(currentUserId))) {
      return { ok: false, message: 'Platform admin access required.' };
    }

    const user = await getUserAdminState(targetUserId);
    if (!user) {
      return { ok: false, message: 'User not found.' };
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

    return { ok: true, user, servers: memberships.rows, reports: reports.rows };
  } catch (error) {
    return { ok: false, message: `Failed to load user details: ${error.message}` };
  }
});

ipcMain.handle('reports:createUserReport', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const targetUserId = Number(payload?.targetUserId);
  const serverId = payload?.serverId ? Number(payload.serverId) : null;
  const reason = String(payload?.reason || '').trim();
  if (!targetUserId || reason.length < 5 || reason.length > 500) {
    return { ok: false, message: 'Report reason must be between 5 and 500 characters.' };
  }
  if (targetUserId === currentUserId) {
    return { ok: false, message: 'You cannot report yourself.' };
  }

  try {
    const target = await db.query('SELECT id FROM users WHERE id = $1', [targetUserId]);
    if (target.rows.length === 0) {
      return { ok: false, message: 'User not found.' };
    }
    if (serverId) {
      const access = await db.query('SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2', [serverId, currentUserId]);
      if (access.rows.length === 0) {
        return { ok: false, message: 'You can only attach reports to servers you are in.' };
      }
    }

    await db.query(
      'INSERT INTO user_reports (reporter_user_id, target_user_id, server_id, reason) VALUES ($1, $2, $3, $4)',
      [currentUserId, targetUserId, serverId, reason]
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
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to submit report: ${error.message}` };
  }
});

ipcMain.handle('admin:getServerView', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const serverId = Number(payload?.serverId);
  if (!serverId) {
    return { ok: false, message: 'Valid server id is required.' };
  }

  try {
    if (!(await requirePlatformAdmin(currentUserId))) {
      return { ok: false, message: 'Platform admin access required.' };
    }

    const server = await db.query('SELECT id, name, owner_user_id, created_at FROM servers WHERE id = $1', [serverId]);
    if (server.rows.length === 0) {
      return { ok: false, message: 'Server not found.' };
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

    return { ok: true, server: server.rows[0], channels: channels.rows, members: members.rows };
  } catch (error) {
    return { ok: false, message: `Failed to load server view: ${error.message}` };
  }
});

ipcMain.handle('admin:updateUser', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const targetUserId = Number(payload?.userId);
  if (!targetUserId) {
    return { ok: false, message: 'Valid user id is required.' };
  }

  try {
    if (!(await requirePlatformAdmin(currentUserId))) {
      return { ok: false, message: 'Platform admin access required.' };
    }

    const target = await getUserAdminState(targetUserId);
    if (!target) {
      return { ok: false, message: 'User not found.' };
    }
    if (target.id === currentUserId) {
      return { ok: false, message: 'You cannot change your own platform admin status here.' };
    }

    let nextAdmin = target.is_platform_admin;
    if (typeof payload?.isPlatformAdmin === 'boolean') {
      nextAdmin = payload.isPlatformAdmin;
    }

    let nextBanned = Boolean(target.platform_banned_at);
    if (typeof payload?.platformBanned === 'boolean') {
      nextBanned = payload.platformBanned;
    }
    const allowedStandings = new Set(['good', 'warning', 'restricted', 'banned']);
    let nextStanding = allowedStandings.has(String(payload?.accountStanding || '').trim())
      ? String(payload.accountStanding).trim()
      : (target.account_standing || 'good');
    let nextStandingReason = typeof payload?.standingReason === 'string'
      ? String(payload.standingReason || '').trim().slice(0, 500) || null
      : (target.standing_reason || null);
    let nextViolationCount = Number(target.tos_violation_count || 0);
    if (payload?.resetViolations) {
      nextViolationCount = 0;
    }
    if (payload?.incrementViolations) {
      nextViolationCount += 1;
    }
    if (target.is_platform_admin && (!nextAdmin || nextBanned)) {
      const adminCount = await countPlatformAdmins();
      if (adminCount <= 1) {
        return { ok: false, message: 'JelloChat must always keep at least one platform admin.' };
      }
    }

    const nextBanReason = nextBanned ? String(payload?.platformBanReason || '').trim().slice(0, 500) || null : null;
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

    return { ok: true, user: updated.rows[0] };
  } catch (error) {
    return { ok: false, message: `Failed to update user: ${error.message}` };
  }
});

ipcMain.handle('admin:deleteServer', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const serverId = Number(payload?.serverId);
  if (!serverId) {
    return { ok: false, message: 'Valid server id is required.' };
  }

  try {
    if (!(await requirePlatformAdmin(currentUserId))) {
      return { ok: false, message: 'Platform admin access required.' };
    }

    const server = await db.query('SELECT id, name FROM servers WHERE id = $1', [serverId]);
    if (server.rows.length === 0) {
      return { ok: false, message: 'Server not found.' };
    }

    const memberIds = await db.query('SELECT user_id FROM server_members WHERE server_id = $1', [serverId]);
    await db.query('DELETE FROM servers WHERE id = $1', [serverId]);
    broadcastToUsers(memberIds.rows.map((row) => row.user_id), { type: 'server-membership-changed', serverId });
    return { ok: true, serverName: server.rows[0].name };
  } catch (error) {
    return { ok: false, message: `Failed to delete server: ${error.message}` };
  }
});

ipcMain.handle('admin:deleteUser', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const targetUserId = Number(payload?.userId);
  if (!targetUserId) {
    return { ok: false, message: 'Valid user id is required.' };
  }

  try {
    if (!(await requirePlatformAdmin(currentUserId))) {
      return { ok: false, message: 'Platform admin access required.' };
    }

    if (targetUserId === currentUserId) {
      return { ok: false, message: 'You cannot delete your own account from the admin panel.' };
    }

    const target = await getUserAdminState(targetUserId);
    if (!target) {
      return { ok: false, message: 'User not found.' };
    }
    if (target.is_platform_admin) {
      const adminCount = await countPlatformAdmins();
      if (adminCount <= 1) {
        return { ok: false, message: 'JelloChat must always keep at least one platform admin.' };
      }
    }

    await db.query('DELETE FROM users WHERE id = $1', [targetUserId]);
    clearAuthTokensForUser(targetUserId);
    disconnectRealtimeUser(targetUserId, 'Account deleted.');
    await ensurePlatformAdminExists();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to delete user: ${error.message}` };
  }
});

ipcMain.handle('friends:list', async () => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  try {
    const result = await db.query(
      `SELECT u.id, u.username, u.avatar_url
       FROM friendships f
       JOIN users u ON u.id = f.friend_user_id
       WHERE f.user_id = $1
         AND u.platform_banned_at IS NULL
       ORDER BY u.username`,
      [currentUserId]
    );
    const onlineIds = getOnlineUserIds();
    const friends = result.rows.map((row) => ({ ...row, online: onlineIds.has(row.id) }));
    return { ok: true, friends };
  } catch (error) {
    return { ok: false, message: `Failed to load friends: ${error.message}` };
  }
});

ipcMain.handle('friends:getRequests', async () => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  try {
    const result = await db.query(
      `SELECT fr.id, fr.sender_user_id, u.username, u.avatar_url, fr.created_at
       FROM friend_requests fr
       JOIN users u ON u.id = fr.sender_user_id
       WHERE fr.receiver_user_id = $1
         AND fr.status = 'pending'
         AND u.platform_banned_at IS NULL
       ORDER BY fr.created_at DESC`,
      [currentUserId]
    );
    return { ok: true, requests: result.rows };
  } catch (error) {
    return { ok: false, message: `Failed to load friend requests: ${error.message}` };
  }
});

ipcMain.handle('friends:sendRequest', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const target = String(payload?.target || '').trim().toLowerCase();
  if (!target) {
    return { ok: false, message: 'Username or email is required.' };
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
      return { ok: false, message: 'User not found.' };
    }

    const receiverId = targetUser.rows[0].id;
    if (receiverId === currentUserId) {
      return { ok: false, message: 'You cannot add yourself.' };
    }

    const alreadyFriends = await db.query(
      'SELECT 1 FROM friendships WHERE user_id = $1 AND friend_user_id = $2',
      [currentUserId, receiverId]
    );
    if (alreadyFriends.rows.length > 0) {
      return { ok: false, message: 'You are already friends.' };
    }

    const existingRequest = await db.query(
      `SELECT 1
       FROM friend_requests
       WHERE status = 'pending'
         AND ((sender_user_id = $1 AND receiver_user_id = $2)
           OR (sender_user_id = $2 AND receiver_user_id = $1))`,
      [currentUserId, receiverId]
    );
    if (existingRequest.rows.length > 0) {
      return { ok: false, message: 'A pending request already exists.' };
    }

    await db.query(
      'INSERT INTO friend_requests (sender_user_id, receiver_user_id, status) VALUES ($1, $2, $3)',
      [currentUserId, receiverId, 'pending']
    );
    broadcastToUsers([receiverId], { type: 'friend-requests-changed' });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to send friend request: ${error.message}` };
  }
});

ipcMain.handle('friends:respondRequest', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const requestId = Number(payload?.requestId);
  const action = String(payload?.action || '').toLowerCase();
  if (!requestId || !['accept', 'reject'].includes(action)) {
    return { ok: false, message: 'Valid request id and action are required.' };
  }

  try {
    const request = await db.query(
      `SELECT id, sender_user_id, receiver_user_id, status
       FROM friend_requests
       WHERE id = $1`,
      [requestId]
    );
    if (request.rows.length === 0) {
      return { ok: false, message: 'Request not found.' };
    }

    const row = request.rows[0];
    if (row.receiver_user_id !== currentUserId) {
      return { ok: false, message: 'Access denied.' };
    }
    if (row.status !== 'pending') {
      return { ok: false, message: 'Request already handled.' };
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
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to respond to friend request: ${error.message}` };
  }
});

ipcMain.handle('dm:getMessages', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const partnerUserId = Number(payload?.partnerUserId);
  if (!partnerUserId) {
    return { ok: false, message: 'Valid partner user id is required.' };
  }

  try {
    const canDm = await canUsersDm(currentUserId, partnerUserId);
    if (!canDm) {
      return { ok: false, message: 'You can only DM friends or users in a shared server.' };
    }

    const partner = await db.query(
      `SELECT id, username, avatar_url
       FROM users
       WHERE id = $1
         AND platform_banned_at IS NULL`,
      [partnerUserId]
    );
    if (partner.rows.length === 0) {
      return { ok: false, message: 'User not found.' };
    }

    const messages = await db.query(
      `SELECT m.id, m.sender_user_id AS user_id, m.receiver_user_id, m.content, m.created_at,
              u.username, u.avatar_url, u.platform_banned_at AS author_platform_banned_at
       FROM dm_messages m
       JOIN users u ON u.id = m.sender_user_id
       WHERE (m.sender_user_id = $1 AND m.receiver_user_id = $2)
          OR (m.sender_user_id = $2 AND m.receiver_user_id = $1)
       ORDER BY m.created_at ASC
       LIMIT 300`,
      [currentUserId, partnerUserId]
    );

    return { ok: true, messages: messages.rows.map(sanitizeUserFacingMessage), currentUserId, partner: partner.rows[0] };
  } catch (error) {
    return { ok: false, message: `Failed to load DM messages: ${error.message}` };
  }
});

ipcMain.handle('dm:sendMessage', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const partnerUserId = Number(payload?.partnerUserId);
  const content = String(payload?.content || '').trim();
  if (!partnerUserId || !content) {
    return { ok: false, message: 'Partner and content are required.' };
  }

  try {
    const canDm = await canUsersDm(currentUserId, partnerUserId);
    if (!canDm) {
      return { ok: false, message: 'You can only DM friends or users in a shared server.' };
    }

    const moderationMessage = await runMinimumAutoModeration({
      userId: currentUserId,
      partnerUserId,
      content
    });
    if (moderationMessage) {
      const severeViolation = classifyServerAutoModerationViolation(content);
      if (severeViolation) {
        await autoTerminateBotAccount(currentUserId, `Account terminated for automated bot spam in DMs: ${severeViolation.rule}.`);
        return { ok: false, message: 'This account has been terminated for automated bot activity.' };
      }
      return { ok: false, message: moderationMessage };
    }

    const inserted = await db.query(
      `INSERT INTO dm_messages (sender_user_id, receiver_user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, sender_user_id, receiver_user_id, content, created_at`,
      [currentUserId, partnerUserId, content]
    );
    const me = await db.query('SELECT username, avatar_url FROM users WHERE id = $1', [currentUserId]);
    const message = {
      id: inserted.rows[0].id,
      user_id: inserted.rows[0].sender_user_id,
      receiver_user_id: inserted.rows[0].receiver_user_id,
      content: inserted.rows[0].content,
      created_at: inserted.rows[0].created_at,
      username: me.rows[0]?.username || 'Unknown',
      avatar_url: me.rows[0]?.avatar_url || ''
    };

    broadcastToUsers([currentUserId, partnerUserId], {
      type: 'dm-message-created',
      partnerUserId: currentUserId === partnerUserId ? null : currentUserId,
      fromUserId: currentUserId
    });
    return { ok: true, message };
  } catch (error) {
    return { ok: false, message: `Failed to send DM: ${error.message}` };
  }
});

ipcMain.handle('dm:startCall', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const partnerUserId = Number(payload?.partnerUserId);
  if (!partnerUserId) {
    return { ok: false, message: 'Valid partner user id is required.' };
  }

  try {
    const canDm = await canUsersDm(currentUserId, partnerUserId);
    if (!canDm) {
      return { ok: false, message: 'You can only call friends or users in a shared server.' };
    }

    const users = await db.query(
      'SELECT id, username FROM users WHERE id = ANY($1::int[])',
      [[currentUserId, partnerUserId]]
    );
    if (users.rows.length < 2) {
      return { ok: false, message: 'User not found.' };
    }

    const me = users.rows.find((user) => user.id === currentUserId);
    const partner = users.rows.find((user) => user.id === partnerUserId);
    const roomName = getDmCallRoomName(currentUserId, partnerUserId);
    const voice = await createVoiceToken({
      identity: String(currentUserId),
      name: me?.username || `user-${currentUserId}`,
      roomName
    });

    broadcastToUsers([partnerUserId], {
      type: 'dm-call-started',
      fromUserId: currentUserId,
      fromUsername: me?.username || 'Unknown',
      partnerUserId,
      roomName
    });

    return {
      ok: true,
      roomName,
      livekitUrl: voice.livekitUrl,
      token: voice.token,
      debug: voice.debug,
      partner: partner || null
    };
  } catch (error) {
    return { ok: false, message: `Failed to start personal call: ${error.message}` };
  }
});

ipcMain.handle('dm:joinCall', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const partnerUserId = Number(payload?.partnerUserId);
  if (!partnerUserId) {
    return { ok: false, message: 'Valid partner user id is required.' };
  }

  try {
    const canDm = await canUsersDm(currentUserId, partnerUserId);
    if (!canDm) {
      return { ok: false, message: 'You can only call friends or users in a shared server.' };
    }

    const users = await db.query(
      'SELECT id, username FROM users WHERE id = ANY($1::int[])',
      [[currentUserId, partnerUserId]]
    );
    if (users.rows.length < 2) {
      return { ok: false, message: 'User not found.' };
    }

    const me = users.rows.find((user) => user.id === currentUserId);
    const partner = users.rows.find((user) => user.id === partnerUserId);
    const roomName = getDmCallRoomName(currentUserId, partnerUserId);
    const voice = await createVoiceToken({
      identity: String(currentUserId),
      name: me?.username || `user-${currentUserId}`,
      roomName
    });

    return {
      ok: true,
      roomName,
      livekitUrl: voice.livekitUrl,
      token: voice.token,
      debug: voice.debug,
      partner: partner || null
    };
  } catch (error) {
    return { ok: false, message: `Failed to join personal call: ${error.message}` };
  }
});

ipcMain.handle('chat:getMessages', async (_event, channelId) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  try {
    const access = await db.query(
      `SELECT c.server_id
       FROM channels c
       JOIN server_members sm ON sm.server_id = c.server_id
       WHERE c.id = $1 AND sm.user_id = $2`,
      [channelId, currentUserId]
    );

    if (access.rows.length === 0) {
      return { ok: false, message: 'Access denied.' };
    }

    const messages = await db.query(
      `SELECT m.id, m.channel_id, m.user_id, m.content, m.created_at,
              u.username, u.avatar_url, u.platform_banned_at AS author_platform_banned_at
       FROM messages m
       JOIN users u ON u.id = m.user_id
       WHERE m.channel_id = $1
       ORDER BY m.created_at ASC
       LIMIT 200`,
      [channelId]
    );

    return { ok: true, messages: messages.rows.map(sanitizeUserFacingMessage), currentUserId };
  } catch (error) {
    return { ok: false, message: `Failed to load messages: ${error.message}` };
  }
});

ipcMain.handle('chat:sendMessage', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const channelId = Number(payload?.channelId);
  const content = String(payload?.content || '').trim();

  if (!channelId || !content) {
    return { ok: false, message: 'Channel and message content are required.' };
  }

  try {
    const access = await db.query(
      `SELECT c.server_id
       FROM channels c
       JOIN server_members sm ON sm.server_id = c.server_id
       WHERE c.id = $1 AND sm.user_id = $2`,
      [channelId, currentUserId]
    );

    if (access.rows.length === 0) {
      return { ok: false, message: 'Access denied.' };
    }

    const moderationResult = await handleServerAutoModeration(access.rows[0].server_id, channelId, currentUserId, content);
    if (moderationResult?.blocked) {
      return { ok: false, message: moderationResult.message };
    }

    const inserted = await db.query(
      `INSERT INTO messages (channel_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, channel_id, user_id, content, created_at`,
      [channelId, currentUserId, content]
    );

    const user = await db.query('SELECT username, avatar_url FROM users WHERE id = $1', [currentUserId]);
    const message = {
      ...inserted.rows[0],
      username: user.rows[0]?.username || 'Unknown',
      avatar_url: user.rows[0]?.avatar_url || ''
    };

    broadcastToChannel(channelId, { type: 'message-created', channelId, message });
    return { ok: true, message };
  } catch (error) {
    return { ok: false, message: `Failed to send message: ${error.message}` };
  }
});

ipcMain.handle('chat:updateMessage', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const messageId = Number(payload?.messageId);
  const content = String(payload?.content || '').trim();
  if (!messageId || !content) {
    return { ok: false, message: 'Message id and content are required.' };
  }

  try {
    const access = await db.query(
      `SELECT m.id, m.channel_id, m.user_id
       FROM messages m
       JOIN channels c ON c.id = m.channel_id
       JOIN server_members sm ON sm.server_id = c.server_id
       WHERE m.id = $1 AND sm.user_id = $2`,
      [messageId, currentUserId]
    );
    if (access.rows.length === 0) {
      return { ok: false, message: 'Access denied.' };
    }

    if (access.rows[0].user_id !== currentUserId) {
      return { ok: false, message: 'You can only edit your own messages.' };
    }

    const updated = await db.query(
      `UPDATE messages
       SET content = $1
       WHERE id = $2
       RETURNING id, channel_id, user_id, content, created_at`,
      [content, messageId]
    );
    const user = await db.query('SELECT username, avatar_url FROM users WHERE id = $1', [currentUserId]);
    const message = {
      ...updated.rows[0],
      username: user.rows[0]?.username || 'Unknown',
      avatar_url: user.rows[0]?.avatar_url || ''
    };

    broadcastToChannel(message.channel_id, { type: 'message-updated', channelId: message.channel_id, message });
    return { ok: true, message };
  } catch (error) {
    return { ok: false, message: `Failed to update message: ${error.message}` };
  }
});

ipcMain.handle('chat:deleteMessage', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const messageId = Number(payload?.messageId);
  if (!messageId) {
    return { ok: false, message: 'Message id is required.' };
  }

  try {
    const access = await db.query(
      `SELECT m.id, m.channel_id, m.user_id
       FROM messages m
       JOIN channels c ON c.id = m.channel_id
       JOIN server_members sm ON sm.server_id = c.server_id
       WHERE m.id = $1 AND sm.user_id = $2`,
      [messageId, currentUserId]
    );
    if (access.rows.length === 0) {
      return { ok: false, message: 'Access denied.' };
    }
    if (access.rows[0].user_id !== currentUserId) {
      return { ok: false, message: 'You can only delete your own messages.' };
    }

    await db.query('DELETE FROM messages WHERE id = $1', [messageId]);
    const channelId = access.rows[0].channel_id;
    broadcastToChannel(channelId, { type: 'message-deleted', channelId, messageId });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to delete message: ${error.message}` };
  }
});

app.whenReady().then(async () => {
  try {
    await db.connect();
    await ensurePlatformAdminExists();
    setupRealtimeServer();
    configureDisplayCapture();
    createWindow();
  } catch (error) {
    console.error('Startup failed:', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    for (const ws of wsClients.keys()) {
      ws.close();
    }
    if (realtimeServer) {
      realtimeServer.close();
    }
    await db.close();
    app.quit();
  }
});
