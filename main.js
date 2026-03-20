const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');
const fs = require('fs');
const db = require('./db');
const { sendMail } = require('./mailer');

const WS_PORT = Number(process.env.WS_PORT || 3131);

let mainWindow;
let currentUserId = null;
const authTokens = new Map();
const wsClients = new Map();
let realtimeServer;

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function buildPublicUrl(pathname) {
  const base = String(process.env.APP_PUBLIC_URL || 'http://localhost:3000').trim().replace(/\/+$/, '');
  return `${base}${pathname}`;
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
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 850,
    minWidth: 1000,
    minHeight: 650,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));
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

  if (!requestedUsername || !email || !password) {
    return { ok: false, message: 'Username, email, and password are required.' };
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
      'INSERT INTO users (username, email, password_hash, date_of_birth, email_verified) VALUES ($1, $2, $3, $4, FALSE) RETURNING id, username, email, date_of_birth',
      [allocated.username, email, passwordHash, dateOfBirth]
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

  if (!email || !password) {
    return { ok: false, message: 'Email and password are required.' };
  }

  try {
    const result = await db.query('SELECT id, username, email, password_hash, email_verified, date_of_birth FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return { ok: false, message: 'Invalid email or password.' };
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return { ok: false, message: 'Invalid email or password.' };
    }
    if (!user.email_verified) {
      return {
        ok: false,
        verificationRequired: true,
        message: 'Please verify your email before logging in.'
      };
    }

    currentUserId = user.id;
    const realtimeToken = issueAuthToken(user.id);
    return {
      ok: true,
      user: { id: user.id, username: user.username, email: user.email, date_of_birth: user.date_of_birth },
      realtimeToken
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
    const result = await db.query('SELECT id, username, email, date_of_birth FROM users WHERE id = $1', [currentUserId]);
    if (result.rows.length === 0) {
      currentUserId = null;
      return { ok: false, message: 'Session not found.' };
    }
    const user = result.rows[0];
    const realtimeToken = issueAuthToken(user.id);
    return { ok: true, user, realtimeToken };
  } catch (error) {
    return { ok: false, message: `Failed to restore session: ${error.message}` };
  }
});

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
    const existing = await db.query('SELECT id, username, email, password_hash, date_of_birth FROM users WHERE id = $1', [currentUserId]);
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
      'UPDATE users SET username = $1, email = $2, password_hash = $3, date_of_birth = $4 WHERE id = $5 RETURNING id, username, email, date_of_birth',
      [allocated.username, email, passwordHash, nextDateOfBirth, currentUserId]
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
    currentUserId = null;
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
    const owner = await isServerOwner(currentUserId, serverId);
    if (!owner) {
      return { ok: false, message: 'Only the server owner can kick members.' };
    }

    const targetMembership = await db.query(
      'SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2',
      [serverId, targetUserId]
    );
    if (targetMembership.rows.length === 0) {
      return { ok: false, message: 'User is not in this server.' };
    }

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
    const owner = await isServerOwner(currentUserId, serverId);
    if (!owner) {
      return { ok: false, message: 'Only the server owner can ban members.' };
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
    await db.query('DELETE FROM server_members WHERE server_id = $1 AND user_id = $2', [serverId, targetUserId]);

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
    const owner = await isServerOwner(currentUserId, serverId);
    if (!owner) {
      return { ok: false, message: 'Only the server owner can unban members.' };
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
    const owner = await isServerOwner(currentUserId, serverId);
    if (!owner) {
      return { ok: false, message: 'Only the server owner can view banned users.' };
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
    const owner = await isServerOwner(currentUserId, serverId);
    if (!owner) {
      return { ok: false, message: 'Only the server owner can rename the server.' };
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

    const owner = await db.query('SELECT owner_user_id FROM servers WHERE id = $1', [serverId]);
    const channels = await db.query(
      'SELECT id, type, name, server_id FROM channels WHERE server_id = $1 ORDER BY name',
      [serverId]
    );

    return {
      ok: true,
      channels: channels.rows,
      canCreateChannels: owner.rows[0]?.owner_user_id === currentUserId
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
    const owner = await db.query(
      'SELECT owner_user_id FROM servers WHERE id = $1',
      [serverId]
    );
    if (owner.rows.length === 0) {
      return { ok: false, message: 'Server not found.' };
    }
    if (owner.rows[0].owner_user_id !== currentUserId) {
      return { ok: false, message: 'Only the server owner can create channels.' };
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
    const owner = await db.query('SELECT id, name, owner_user_id FROM servers WHERE id = $1', [serverId]);
    if (owner.rows.length === 0) {
      return { ok: false, message: 'Server not found.' };
    }
    if (owner.rows[0].owner_user_id !== currentUserId) {
      return { ok: false, message: 'Only the server owner can create invites.' };
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

    return { ok: true, invite: { code, serverId, serverName: owner.rows[0].name } };
  } catch (error) {
    return { ok: false, message: `Failed to create invite: ${error.message}` };
  }
});

ipcMain.handle('chat:joinByInvite', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const code = String(payload?.code || '').trim().toUpperCase();
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

    const members = await db.query(
      `SELECT u.id, u.username
       FROM server_members sm
       JOIN users u ON u.id = sm.user_id
       WHERE sm.server_id = $1
       ORDER BY u.username`,
      [serverId]
    );
    const onlineIds = getOnlineUserIds();
    const users = members.rows.map((row) => ({ ...row, online: onlineIds.has(row.id) }));
    return { ok: true, users };
  } catch (error) {
    return { ok: false, message: `Failed to load server presence: ${error.message}` };
  }
});

ipcMain.handle('friends:list', async () => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  try {
    const result = await db.query(
      `SELECT u.id, u.username
       FROM friendships f
       JOIN users u ON u.id = f.friend_user_id
       WHERE f.user_id = $1
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
      `SELECT fr.id, fr.sender_user_id, u.username, fr.created_at
       FROM friend_requests fr
       JOIN users u ON u.id = fr.sender_user_id
       WHERE fr.receiver_user_id = $1 AND fr.status = 'pending'
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

    const partner = await db.query('SELECT id, username FROM users WHERE id = $1', [partnerUserId]);
    if (partner.rows.length === 0) {
      return { ok: false, message: 'User not found.' };
    }

    const messages = await db.query(
      `SELECT m.id, m.sender_user_id AS user_id, m.receiver_user_id, m.content, m.created_at, u.username
       FROM dm_messages m
       JOIN users u ON u.id = m.sender_user_id
       WHERE (m.sender_user_id = $1 AND m.receiver_user_id = $2)
          OR (m.sender_user_id = $2 AND m.receiver_user_id = $1)
       ORDER BY m.created_at ASC
       LIMIT 300`,
      [currentUserId, partnerUserId]
    );

    return { ok: true, messages: messages.rows, currentUserId, partner: partner.rows[0] };
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

    const inserted = await db.query(
      `INSERT INTO dm_messages (sender_user_id, receiver_user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, sender_user_id, receiver_user_id, content, created_at`,
      [currentUserId, partnerUserId, content]
    );
    const me = await db.query('SELECT username FROM users WHERE id = $1', [currentUserId]);
    const message = {
      id: inserted.rows[0].id,
      user_id: inserted.rows[0].sender_user_id,
      receiver_user_id: inserted.rows[0].receiver_user_id,
      content: inserted.rows[0].content,
      created_at: inserted.rows[0].created_at,
      username: me.rows[0]?.username || 'Unknown'
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

ipcMain.handle('chat:getMessages', async (_event, channelId) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  try {
    const access = await db.query(
      `SELECT 1
       FROM channels c
       JOIN server_members sm ON sm.server_id = c.server_id
       WHERE c.id = $1 AND sm.user_id = $2`,
      [channelId, currentUserId]
    );

    if (access.rows.length === 0) {
      return { ok: false, message: 'Access denied.' };
    }

    const messages = await db.query(
      `SELECT m.id, m.channel_id, m.user_id, m.content, m.created_at, u.username
       FROM messages m
       JOIN users u ON u.id = m.user_id
       WHERE m.channel_id = $1
       ORDER BY m.created_at ASC
       LIMIT 200`,
      [channelId]
    );

    return { ok: true, messages: messages.rows, currentUserId };
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
      `SELECT 1
       FROM channels c
       JOIN server_members sm ON sm.server_id = c.server_id
       WHERE c.id = $1 AND sm.user_id = $2`,
      [channelId, currentUserId]
    );

    if (access.rows.length === 0) {
      return { ok: false, message: 'Access denied.' };
    }

    const inserted = await db.query(
      `INSERT INTO messages (channel_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, channel_id, user_id, content, created_at`,
      [channelId, currentUserId, content]
    );

    const user = await db.query('SELECT username FROM users WHERE id = $1', [currentUserId]);
    const message = {
      ...inserted.rows[0],
      username: user.rows[0]?.username || 'Unknown'
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
    const user = await db.query('SELECT username FROM users WHERE id = $1', [currentUserId]);
    const message = {
      ...updated.rows[0],
      username: user.rows[0]?.username || 'Unknown'
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
    setupRealtimeServer();
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
