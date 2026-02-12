const http = require('http');
const path = require('path');
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { WebSocketServer } = require('ws');
const db = require('./db');

const WEB_PORT = Number(process.env.WEB_PORT || 3000);

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src')));

const authTokens = new Map();
const wsClients = new Map();

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

function generateInviteCode() {
  return crypto
    .randomBytes(5)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, 8)
    .toUpperCase();
}

function getOnlineUserIds() {
  const ids = new Set();
  for (const [, meta] of wsClients) {
    ids.add(meta.userId);
  }
  return ids;
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const userId = token ? authTokens.get(token) : null;

  if (!userId) {
    res.status(401).json({ ok: false, message: 'Not authenticated.' });
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

async function isServerOwner(userId, serverId) {
  const result = await db.query('SELECT owner_user_id FROM servers WHERE id = $1', [serverId]);
  if (result.rows.length === 0) {
    return false;
  }
  return result.rows[0].owner_user_id === userId;
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
  const username = String(req.body?.username || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!username || !email || !password) {
    res.status(400).json({ ok: false, message: 'Username, email, and password are required.' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ ok: false, message: 'Password must be at least 6 characters.' });
    return;
  }

  try {
    const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      res.status(409).json({ ok: false, message: 'Email already in use.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, passwordHash]
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

    const realtimeToken = issueAuthToken(user.id);
    res.json({ ok: true, user, realtimeToken });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Registration failed: ${error.message}` });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!email || !password) {
    res.status(400).json({ ok: false, message: 'Email and password are required.' });
    return;
  }

  try {
    const result = await db.query('SELECT id, username, email, password_hash FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      res.status(401).json({ ok: false, message: 'Invalid email or password.' });
      return;
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ ok: false, message: 'Invalid email or password.' });
      return;
    }

    const realtimeToken = issueAuthToken(user.id);
    res.json({
      ok: true,
      user: { id: user.id, username: user.username, email: user.email },
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
    await db.query('INSERT INTO channels (server_id, name) VALUES ($1, $2)', [server.id, 'general']);

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
    const owner = await isServerOwner(req.userId, serverId);
    if (!owner) {
      res.status(403).json({ ok: false, message: 'Only the server owner can kick members.' });
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
    const owner = await isServerOwner(req.userId, serverId);
    if (!owner) {
      res.status(403).json({ ok: false, message: 'Only the server owner can ban members.' });
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
    const owner = await isServerOwner(req.userId, serverId);
    if (!owner) {
      res.status(403).json({ ok: false, message: 'Only the server owner can unban members.' });
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
    const owner = await isServerOwner(req.userId, serverId);
    if (!owner) {
      res.status(403).json({ ok: false, message: 'Only the server owner can view banned users.' });
      return;
    }

    const result = await db.query(
      `SELECT b.user_id, u.username, u.email, b.reason, b.created_at
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
    const owner = await isServerOwner(req.userId, serverId);
    if (!owner) {
      res.status(403).json({ ok: false, message: 'Only the server owner can rename the server.' });
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

    const owner = await db.query('SELECT owner_user_id FROM servers WHERE id = $1', [serverId]);
    const channels = await db.query('SELECT id, name, server_id FROM channels WHERE server_id = $1 ORDER BY name', [
      serverId
    ]);
    res.json({
      ok: true,
      channels: channels.rows,
      canCreateChannels: owner.rows[0]?.owner_user_id === req.userId
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load channels: ${error.message}` });
  }
});

app.post('/api/chat/channels', authMiddleware, async (req, res) => {
  const serverId = Number(req.body?.serverId);
  const name = String(req.body?.name || '').trim().toLowerCase();

  if (!serverId || name.length < 1 || name.length > 80) {
    res.status(400).json({ ok: false, message: 'Valid server and channel name are required.' });
    return;
  }

  try {
    const owner = await db.query('SELECT owner_user_id FROM servers WHERE id = $1', [serverId]);
    if (owner.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Server not found.' });
      return;
    }
    if (owner.rows[0].owner_user_id !== req.userId) {
      res.status(403).json({ ok: false, message: 'Only the server owner can create channels.' });
      return;
    }

    const created = await db.query(
      'INSERT INTO channels (server_id, name) VALUES ($1, $2) RETURNING id, name, server_id',
      [serverId, name]
    );
    const channel = created.rows[0];
    await broadcastToServerMembers(serverId, { type: 'channel-created', serverId, channel });
    res.json({ ok: true, channel });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to create channel: ${error.message}` });
  }
});

app.post('/api/chat/servers/:serverId/invites', authMiddleware, async (req, res) => {
  const serverId = Number(req.params.serverId);
  if (!serverId) {
    res.status(400).json({ ok: false, message: 'Valid server id is required.' });
    return;
  }

  try {
    const owner = await db.query('SELECT id, name, owner_user_id FROM servers WHERE id = $1', [serverId]);
    if (owner.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'Server not found.' });
      return;
    }
    if (owner.rows[0].owner_user_id !== req.userId) {
      res.status(403).json({ ok: false, message: 'Only the server owner can create invites.' });
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

    res.json({ ok: true, invite: { code, serverId, serverName: owner.rows[0].name } });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to create invite: ${error.message}` });
  }
});

app.post('/api/chat/invites/join', authMiddleware, async (req, res) => {
  const code = String(req.body?.code || '').trim().toUpperCase();
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
    res.json({ ok: true, users });
  } catch (error) {
    res.status(500).json({ ok: false, message: `Failed to load server presence: ${error.message}` });
  }
});

app.get('/api/friends', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.username, u.email
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

    const partner = await db.query('SELECT id, username FROM users WHERE id = $1', [partnerUserId]);
    if (partner.rows.length === 0) {
      res.status(404).json({ ok: false, message: 'User not found.' });
      return;
    }

    const messages = await db.query(
      `SELECT m.id, m.sender_user_id AS user_id, m.receiver_user_id, m.content, m.created_at, u.username
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

    const inserted = await db.query(
      `INSERT INTO dm_messages (sender_user_id, receiver_user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, sender_user_id, receiver_user_id, content, created_at`,
      [req.userId, partnerUserId, content]
    );
    const me = await db.query('SELECT username FROM users WHERE id = $1', [req.userId]);
    const message = {
      id: inserted.rows[0].id,
      user_id: inserted.rows[0].sender_user_id,
      receiver_user_id: inserted.rows[0].receiver_user_id,
      content: inserted.rows[0].content,
      created_at: inserted.rows[0].created_at,
      username: me.rows[0]?.username || 'Unknown'
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
      `SELECT fr.id, fr.sender_user_id, u.username, u.email, fr.created_at
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

app.get('/api/chat/channels/:channelId/messages', authMiddleware, async (req, res) => {
  const channelId = Number(req.params.channelId);
  if (!channelId) {
    res.status(400).json({ ok: false, message: 'Invalid channel id.' });
    return;
  }

  try {
    const access = await db.query(
      `SELECT 1
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
      `SELECT m.id, m.channel_id, m.user_id, m.content, m.created_at, u.username
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
      `SELECT 1
       FROM channels c
       JOIN server_members sm ON sm.server_id = c.server_id
       WHERE c.id = $1 AND sm.user_id = $2`,
      [channelId, req.userId]
    );
    if (access.rows.length === 0) {
      res.status(403).json({ ok: false, message: 'Access denied.' });
      return;
    }

    const inserted = await db.query(
      `INSERT INTO messages (channel_id, user_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, channel_id, user_id, content, created_at`,
      [channelId, req.userId, content]
    );
    const user = await db.query('SELECT username FROM users WHERE id = $1', [req.userId]);
    const message = { ...inserted.rows[0], username: user.rows[0]?.username || 'Unknown' };
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
    const user = await db.query('SELECT username FROM users WHERE id = $1', [req.userId]);
    const message = { ...updated.rows[0], username: user.rows[0]?.username || 'Unknown' };

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
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, request) => {
    const url = new URL(request.url || '/', `http://${request.headers.host}`);
    const token = url.searchParams.get('token');
    const userId = token ? authTokens.get(token) : null;

    if (!userId) {
      ws.close(4001, 'Unauthorized');
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
