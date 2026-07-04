const crypto = require('crypto');

function cleanText(value, fallback = '') {
  return String(value || '').trim() || fallback;
}

function clampText(value, maxLength, fallback = '') {
  const text = cleanText(value, fallback);
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function slugChannelName(value, fallback = 'channel') {
  const text = cleanText(value, fallback)
    .toLowerCase()
    .replace(/^#/, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clampText(text, 80, fallback);
}

function makePairingCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(8);
  let code = '';
  for (let index = 0; index < bytes.length; index += 1) {
    code += alphabet[bytes[index] % alphabet.length];
  }
  return code;
}

function getDiscordBotInviteUrl() {
  const clientId = cleanText(process.env.DISCORD_BOT_CLIENT_ID || process.env.DISCORD_CLIENT_ID, '');
  if (!clientId) {
    return '';
  }
  const permissions = cleanText(process.env.DISCORD_BOT_PERMISSIONS, '274878024704');
  const params = new URLSearchParams({
    client_id: clientId,
    permissions,
    scope: 'bot applications.commands'
  });
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

function normalizeChannelType(channel) {
  const raw = String(channel?.type || '').toLowerCase();
  if (raw === '4' || raw.includes('category') || channel?.type === 4) {
    return 'category';
  }
  if (raw === '2' || raw.includes('voice') || channel?.type === 2) {
    return 'voice';
  }
  return 'text';
}

function normalizeDiscordSkeleton(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Discord migration source must be an object.');
  }
  const guild = input.guild || input.server || {};
  const rawChannels = Array.isArray(input.channels) ? input.channels : [];
  const categories = [];
  const channels = [];

  rawChannels.forEach((raw, index) => {
    const type = normalizeChannelType(raw);
    const item = {
      sourceId: cleanText(raw.id || raw.channelId, `${type}-${index + 1}`),
      name: type === 'category'
        ? clampText(raw.name || raw.channelName, 80, `Category ${index + 1}`)
        : slugChannelName(raw.name || raw.channelName, `channel-${index + 1}`),
      type,
      parentId: cleanText(raw.parentId || raw.parent_id || raw.categoryId || raw.category_id || raw.parent?.id, ''),
      position: Number(raw.rawPosition ?? raw.position ?? index) || index
    };
    if (type === 'category') {
      categories.push(item);
    } else {
      channels.push(item);
    }
  });

  if (!channels.length) {
    channels.push({
      sourceId: 'general',
      name: 'general',
      type: 'text',
      parentId: '',
      position: 0
    });
  }

  categories.sort((a, b) => a.position - b.position);
  channels.sort((a, b) => a.position - b.position);

  return {
    guild: {
      id: cleanText(input.guildId || input.serverId || guild.id || guild.guildId, ''),
      name: clampText(input.serverName || input.guildName || guild.name || input.name, 80, 'Imported Discord Server')
    },
    categories,
    channels
  };
}

function buildDiscordSkeletonFromGuild(guild, channels) {
  return {
    guild: {
      id: cleanText(guild?.id, ''),
      name: cleanText(guild?.name, 'Imported Discord Server')
    },
    channels: channels.map((channel, index) => ({
      id: cleanText(channel.id, `channel-${index + 1}`),
      name: cleanText(channel.name, `channel-${index + 1}`),
      type: normalizeChannelType(channel),
      parentId: cleanText(channel.parentId || channel.parent_id || channel.parent?.id, ''),
      position: Number(channel.rawPosition ?? channel.position ?? index) || index
    }))
  };
}

function buildSkeletonPreview(input) {
  const normalized = normalizeDiscordSkeleton(input);
  return {
    ok: true,
    preview: {
      serverName: normalized.guild.name,
      sourceGuildId: normalized.guild.id || null,
      categories: normalized.categories.length,
      channels: normalized.channels.length,
      textChannels: normalized.channels.filter((channel) => channel.type === 'text').length,
      voiceChannels: normalized.channels.filter((channel) => channel.type === 'voice').length,
      messages: 0,
      members: 0
    }
  };
}

async function createDiscordMigrationSession(db, userId) {
  const requestedBy = Number(userId);
  if (!requestedBy) {
    throw new Error('A signed-in JelloChat user is required.');
  }
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = makePairingCode();
    try {
      const created = await db.query(
        `INSERT INTO discord_migration_sessions (code, requested_by_user_id, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '30 minutes')
         RETURNING id, code, status, expires_at, created_at`,
        [code, requestedBy]
      );
      const inviteUrl = getDiscordBotInviteUrl();
      return { ok: true, session: created.rows[0], inviteUrl, botConfigured: Boolean(inviteUrl) };
    } catch (error) {
      if (!String(error.message || '').includes('duplicate key')) {
        throw error;
      }
    }
  }
  throw new Error('Could not generate a unique pairing code.');
}

async function getMigrationSession(db, code) {
  const normalized = cleanText(code, '').toUpperCase();
  if (!normalized) {
    return null;
  }
  const result = await db.query('SELECT * FROM discord_migration_sessions WHERE code = $1 LIMIT 1', [normalized]);
  return result.rows[0] || null;
}

function serializeMigrationSession(session) {
  if (!session) {
    return null;
  }
  return {
    id: session.id,
    code: session.code,
    status: session.status,
    discordGuildId: session.discord_guild_id || null,
    discordGuildName: session.discord_guild_name || null,
    discordUsername: session.discord_username || null,
    importedServerId: session.imported_server_id || null,
    errorMessage: session.error_message || null,
    expiresAt: session.expires_at,
    pairedAt: session.paired_at || null,
    importedAt: session.imported_at || null,
    createdAt: session.created_at
  };
}

async function getDiscordMigrationStatus(db, code, userId) {
  const session = await getMigrationSession(db, code);
  if (!session || Number(session.requested_by_user_id) !== Number(userId)) {
    return { ok: false, message: 'Migration session was not found.' };
  }
  if (session.status === 'pending' && new Date(session.expires_at).getTime() < Date.now()) {
    const expired = await db.query(
      "UPDATE discord_migration_sessions SET status = 'expired' WHERE id = $1 RETURNING *",
      [session.id]
    );
    return { ok: true, session: serializeMigrationSession(expired.rows[0]) };
  }
  return { ok: true, session: serializeMigrationSession(session) };
}

async function claimDiscordMigrationSession(db, code, guild, user) {
  const normalized = cleanText(code, '').toUpperCase();
  const session = await getMigrationSession(db, normalized);
  if (!session) {
    throw new Error('Pairing code was not found.');
  }
  if (session.status !== 'pending') {
    throw new Error('Pairing code has already been used.');
  }
  if (new Date(session.expires_at).getTime() < Date.now()) {
    await db.query("UPDATE discord_migration_sessions SET status = 'expired' WHERE id = $1", [session.id]);
    throw new Error('Pairing code expired. Start a new migration in JelloChat.');
  }
  const updated = await db.query(
    `UPDATE discord_migration_sessions
     SET status = 'paired',
         discord_guild_id = $1,
         discord_guild_name = $2,
         discord_user_id = $3,
         discord_username = $4,
         paired_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [
      cleanText(guild?.id, ''),
      clampText(guild?.name, 120, 'Discord Server'),
      cleanText(user?.id, ''),
      clampText(user?.username || user?.tag || user?.globalName, 120, 'Discord User'),
      session.id
    ]
  );
  return updated.rows[0];
}

async function importDiscordSkeleton(db, input, ownerUserId) {
  const normalized = normalizeDiscordSkeleton(input);
  const ownerId = Number(ownerUserId);
  if (!ownerId) {
    throw new Error('A JelloChat owner user is required.');
  }
  return db.withTransaction(async (tx) => {
    const createdServer = await tx.query(
        'INSERT INTO servers (name, owner_user_id) VALUES ($1, $2) RETURNING id, name, icon_url, owner_user_id',
      [normalized.guild.name, ownerId]
    );
    const server = createdServer.rows[0];
    await tx.query('INSERT INTO server_members (user_id, server_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [ownerId, server.id]);

    const categoryMap = new Map();
    for (const [index, category] of normalized.categories.entries()) {
      const created = await tx.query(
        'INSERT INTO channel_categories (server_id, name, position) VALUES ($1, $2, $3) RETURNING id',
        [server.id, category.name, index]
      );
      categoryMap.set(category.sourceId, created.rows[0].id);
    }

    for (const [index, channel] of normalized.channels.entries()) {
      await tx.query(
        `INSERT INTO channels (server_id, type, name, category_id, position)
         VALUES ($1, $2, $3, $4, $5)`,
        [server.id, channel.type, channel.name, categoryMap.get(channel.parentId) || null, index]
      );
    }

    return {
      ok: true,
      server,
      stats: {
        categories: normalized.categories.length,
        channels: normalized.channels.length,
        messages: 0,
        members: 0
      }
    };
  });
}

async function importClaimedDiscordMigration(db, code, guild, channels) {
  const session = await getMigrationSession(db, code);
  if (!session) {
    throw new Error('Pairing code was not found.');
  }
  if (session.status !== 'paired') {
    throw new Error('Migration is not paired yet.');
  }
  if (cleanText(session.discord_guild_id, '') !== cleanText(guild?.id, '')) {
    throw new Error('This pairing code belongs to a different Discord server.');
  }

  await db.query("UPDATE discord_migration_sessions SET status = 'importing', error_message = NULL WHERE id = $1", [session.id]);
  try {
    const result = await importDiscordSkeleton(db, buildDiscordSkeletonFromGuild(guild, channels), session.requested_by_user_id);
    await db.query(
      `UPDATE discord_migration_sessions
       SET status = 'imported', imported_server_id = $1, imported_at = NOW()
       WHERE id = $2`,
      [result.server.id, session.id]
    );
    return result;
  } catch (error) {
    await db.query(
      "UPDATE discord_migration_sessions SET status = 'failed', error_message = $1 WHERE id = $2",
      [String(error.message || 'Migration failed.'), session.id]
    );
    throw error;
  }
}

module.exports = {
  buildDiscordSkeletonFromGuild,
  buildSkeletonPreview,
  claimDiscordMigrationSession,
  createDiscordMigrationSession,
  getDiscordMigrationStatus,
  importClaimedDiscordMigration,
  importDiscordSkeleton,
  normalizeDiscordSkeleton
};
