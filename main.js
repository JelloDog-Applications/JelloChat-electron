const { app, BrowserWindow, desktopCapturer, ipcMain, screen: electronScreen, session } = require('electron');
const path = require('path');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const zlib = require('zlib');
const { WebSocketServer } = require('ws');
const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');
const fs = require('fs');
const db = require('./db');
const { sendMail } = require('./mailer');
const {
  createDiscordMigrationSession,
  getDiscordMigrationStatus
} = require('./discordMigration');

const WS_PORT = Number(process.env.WS_PORT || 3131);
const DEFAULT_PUBLIC_URL = 'https://chat.jellodog.com';
const ATTACHMENTS_DIR = path.resolve(__dirname, process.env.ATTACHMENTS_DIR || 'uploads/attachments');
const ATTACHMENT_MAX_MB = Math.max(1, Number(process.env.ATTACHMENT_MAX_MB || 10));
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
const ATTACHMENT_BROTLI_OPTIONS = {
  params: {
    [zlib.constants.BROTLI_PARAM_QUALITY]: 5
  }
};
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

fs.mkdirSync(ATTACHMENTS_DIR, { recursive: true });

const BLOCKED_ATTACHMENT_EXTENSIONS = new Set([
  '.apk', '.app', '.bat', '.bin', '.cmd', '.com', '.cpl', '.dll', '.dmg', '.exe',
  '.gadget', '.hta', '.htm', '.html', '.jar', '.js', '.jse', '.lnk', '.msi', '.msp',
  '.pif', '.ps1', '.py', '.rb', '.scr', '.sh', '.svg', '.sys', '.vb', '.vbe', '.vbs', '.wsf'
]);

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

function buildPublicUrl(pathname) {
  const base = String(process.env.APP_PUBLIC_URL || DEFAULT_PUBLIC_URL).trim().replace(/\/+$/, '');
  return `${base}${pathname}`;
}

function isBlockedAttachmentName(filename) {
  return BLOCKED_ATTACHMENT_EXTENSIONS.has(path.extname(String(filename || '')).toLowerCase());
}

function sanitizeAttachment(row) {
  if (!row?.id) {
    return null;
  }
  return {
    id: row.id,
    original_filename: row.original_filename,
    mime_type: row.mime_type || 'application/octet-stream',
    file_size: Number(row.original_file_size || row.file_size || 0),
    stored_file_size: Number(row.stored_file_size || row.file_size || 0),
    compression_algorithm: row.compression_algorithm || null,
    compression_saved_bytes: Number(row.compression_saved_bytes || 0),
    expires_at: row.expires_at || null,
    url: `/api/attachments/${row.id}`
  };
}

function normalizeAttachmentRow(row) {
  const {
    attachment_id,
    attachment_original_filename,
    attachment_mime_type,
    attachment_file_size,
    attachment_stored_file_size,
    attachment_compression_algorithm,
    attachment_compression_saved_bytes,
    attachment_expires_at,
    ...messageRow
  } = row;
  const message = sanitizeUserFacingMessage(messageRow);
  message.attachment = sanitizeAttachment({
    id: attachment_id,
    original_filename: attachment_original_filename,
    mime_type: attachment_mime_type,
    file_size: attachment_file_size,
    stored_file_size: attachment_stored_file_size,
    compression_algorithm: attachment_compression_algorithm,
    compression_saved_bytes: attachment_compression_saved_bytes,
    expires_at: attachment_expires_at
  });
  return message;
}

function encryptAttachmentBuffer(buffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', ATTACHMENT_ENCRYPTION_KEY, iv);
  return {
    data: Buffer.concat([cipher.update(buffer), cipher.final()]),
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64')
  };
}

function decryptAttachmentBuffer(buffer, attachment) {
  if (!attachment.encryption_iv || !attachment.encryption_auth_tag) {
    return buffer;
  }
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    ATTACHMENT_ENCRYPTION_KEY,
    Buffer.from(attachment.encryption_iv, 'base64')
  );
  decipher.setAuthTag(Buffer.from(attachment.encryption_auth_tag, 'base64'));
  return Buffer.concat([decipher.update(buffer), decipher.final()]);
}

function prepareAttachmentStorageBuffer(buffer) {
  const originalSize = buffer.length;
  const compressed = zlib.brotliCompressSync(buffer, ATTACHMENT_BROTLI_OPTIONS);
  if (compressed.length < originalSize) {
    return {
      buffer: compressed,
      algorithm: 'brotli',
      originalSize,
      storedPlainSize: compressed.length,
      savedBytes: originalSize - compressed.length
    };
  }
  return {
    buffer,
    algorithm: null,
    originalSize,
    storedPlainSize: originalSize,
    savedBytes: 0
  };
}

function decodeStoredAttachmentBuffer(buffer, attachment) {
  const decrypted = decryptAttachmentBuffer(buffer, attachment);
  if (attachment.compression_algorithm === 'brotli') {
    return zlib.brotliDecompressSync(decrypted);
  }
  return decrypted;
}

async function readAttachmentFile(attachment) {
  const data = await fs.promises.readFile(path.join(ATTACHMENTS_DIR, attachment.stored_filename));
  return decodeStoredAttachmentBuffer(data, attachment);
}

function getAttachmentExpiresAt(expireDays = ATTACHMENT_EXPIRE_DAYS) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expireDays);
  return expiresAt;
}

async function saveIpcAttachment({ attachment, uploaderUserId, messageId = null, dmMessageId = null }) {
  if (!attachment) {
    return null;
  }
  const storageSettings = await getStoragePolicySettings();
  const uploadCount = await db.query(
    `SELECT COUNT(*)::int AS count
     FROM message_attachments
     WHERE uploader_user_id = $1
       AND created_at >= NOW() - INTERVAL '1 day'`,
    [uploaderUserId]
  );
  if ((uploadCount.rows[0]?.count || 0) >= storageSettings.maxUploadsPerDay) {
    throw new Error(`You can upload up to ${storageSettings.maxUploadsPerDay} attachments per day.`);
  }

  const originalName = String(attachment.name || 'attachment');
  const size = Number(attachment.size || 0);
  const maxBytes = storageSettings.maxUploadMb * 1024 * 1024;
  if (!size || size > maxBytes) {
    throw new Error(`Attachments must be ${storageSettings.maxUploadMb} MB or smaller.`);
  }
  if (isBlockedAttachmentName(originalName)) {
    throw new Error('That file type is not allowed.');
  }

  const bytes = attachment.bytes;
  const buffer = Buffer.from(bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes);
  if (buffer.length !== size || buffer.length > maxBytes) {
    throw new Error(`Attachments must be ${storageSettings.maxUploadMb} MB or smaller.`);
  }
  const prepared = prepareAttachmentStorageBuffer(buffer);
  const encrypted = encryptAttachmentBuffer(prepared.buffer);
  if (storageSettings.storageQuotaMb > 0) {
    const usage = await db.query(
      `SELECT COALESCE(SUM(COALESCE(stored_file_size, file_size)), 0)::bigint AS active_bytes
       FROM message_attachments
       WHERE expires_at IS NULL OR expires_at > NOW()`
    );
    const quotaBytes = storageSettings.storageQuotaMb * 1024 * 1024;
    if (Number(usage.rows[0]?.active_bytes || 0) + encrypted.data.length > quotaBytes) {
      throw new Error('Attachment storage quota is full.');
    }
  }

  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, '');
  const storedFilename = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(ATTACHMENTS_DIR, storedFilename);
  await fs.promises.writeFile(filePath, encrypted.data);

  try {
    const result = await db.query(
      `INSERT INTO message_attachments (
         message_id,
         dm_message_id,
         uploader_user_id,
         original_filename,
         stored_filename,
         mime_type,
         file_size,
         original_file_size,
         stored_file_size,
         compression_algorithm,
         compression_saved_bytes,
         compression_checked_at,
         encryption_iv,
         encryption_auth_tag,
         expires_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12, $13, $14)
       RETURNING id, original_filename, mime_type, file_size, original_file_size, stored_file_size, compression_algorithm, compression_saved_bytes, expires_at`,
      [
        messageId,
        dmMessageId,
        uploaderUserId,
        originalName,
        storedFilename,
        attachment.type || 'application/octet-stream',
        prepared.originalSize,
        prepared.originalSize,
        encrypted.data.length,
        prepared.algorithm,
        prepared.savedBytes,
        encrypted.iv,
        encrypted.authTag,
        getAttachmentExpiresAt(storageSettings.expireDays)
      ]
    );
    return sanitizeAttachment(result.rows[0]);
  } catch (error) {
    await fs.promises.unlink(filePath).catch(() => {});
    throw error;
  }
}

async function deleteAttachmentsForMessage(messageId) {
  const attachments = await db.query('SELECT stored_filename FROM message_attachments WHERE message_id = $1', [messageId]);
  await db.query('DELETE FROM message_attachments WHERE message_id = $1', [messageId]);
  for (const attachment of attachments.rows) {
    await fs.promises.unlink(path.join(ATTACHMENTS_DIR, attachment.stored_filename)).catch(() => {});
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
    await fs.promises.unlink(path.join(ATTACHMENTS_DIR, attachment.stored_filename)).catch(() => {});
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
  const expired = await db.query(
    `SELECT id, username
     FROM users
     WHERE platform_banned_at IS NOT NULL
       AND is_platform_admin = FALSE
       AND platform_banned_at <= NOW() - ($1::int * INTERVAL '1 day')`,
    [settings.bannedUserCleanupDays]
  );
  for (const user of expired.rows) {
    await deleteAttachmentFilesForUser(user.id);
    await db.query('DELETE FROM users WHERE id = $1', [user.id]);
    clearAuthTokensForUser(user.id);
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
        COALESCE(SUM(COALESCE(original_file_size, file_size)), 0)::bigint AS total_original_bytes,
        COALESCE(SUM(COALESCE(stored_file_size, file_size)), 0)::bigint AS total_stored_bytes,
        COALESCE(SUM(COALESCE(compression_saved_bytes, 0)), 0)::bigint AS compression_saved_bytes,
        COUNT(*) FILTER (WHERE expires_at IS NULL OR expires_at > NOW())::int AS active_attachments,
        COALESCE(SUM(COALESCE(original_file_size, file_size)) FILTER (WHERE expires_at IS NULL OR expires_at > NOW()), 0)::bigint AS active_original_bytes,
        COALESCE(SUM(COALESCE(stored_file_size, file_size)) FILTER (WHERE expires_at IS NULL OR expires_at > NOW()), 0)::bigint AS active_bytes,
        COALESCE(SUM(COALESCE(compression_saved_bytes, 0)) FILTER (WHERE expires_at IS NULL OR expires_at > NOW()), 0)::bigint AS active_compression_saved_bytes,
        COUNT(*) FILTER (WHERE compression_algorithm = 'brotli')::int AS compressed_attachments,
        COUNT(*) FILTER (
          WHERE compression_checked_at IS NULL
            AND compression_algorithm IS NULL
            AND encryption_iv IS NOT NULL
            AND encryption_auth_tag IS NOT NULL
            AND (expires_at IS NULL OR expires_at > NOW())
        )::int AS compression_pending_attachments,
        COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at <= NOW())::int AS expired_attachments,
       COUNT(*) FILTER (WHERE expires_at IS NOT NULL AND expires_at > NOW() AND expires_at <= NOW() + INTERVAL '7 days')::int AS expiring_soon,
       COUNT(*) FILTER (WHERE encryption_iv IS NULL OR encryption_auth_tag IS NULL)::int AS legacy_unencrypted,
       MIN(created_at) AS oldest_attachment_at,
       MAX(created_at) AS newest_attachment_at
     FROM message_attachments`
  );
  return {
    config: {
      attachmentsDir: ATTACHMENTS_DIR,
      maxUploadMb: storageSettings.maxUploadMb,
      expireDays: storageSettings.expireDays,
      maxUploadsPerDay: storageSettings.maxUploadsPerDay,
      storageQuotaMb: storageSettings.storageQuotaMb,
      encryptionEnabled: true,
      compressionEnabled: true,
      compressionAlgorithm: 'brotli',
      encryptionKeyConfigured: Boolean(process.env.ATTACHMENT_ENCRYPTION_KEY),
      cleanupIntervalMinutes: storageSettings.cleanupIntervalMinutes,
      emptyServerCleanupDays: storageSettings.emptyServerCleanupDays,
      bannedUserCleanupDays: storageSettings.bannedUserCleanupDays,
      blockedExtensions: Array.from(BLOCKED_ATTACHMENT_EXTENSIONS).sort()
    },
    stats: stats.rows[0] || {}
  };
}

async function backfillAttachmentCompressionBatch(limit = 25) {
  const batchLimit = Math.max(1, Math.min(200, Number(limit) || 25));
  const result = await db.query(
    `SELECT id, stored_filename, file_size, original_file_size, stored_file_size, encryption_iv, encryption_auth_tag
     FROM message_attachments
     WHERE compression_checked_at IS NULL
       AND compression_algorithm IS NULL
       AND encryption_iv IS NOT NULL
       AND encryption_auth_tag IS NOT NULL
       AND (expires_at IS NULL OR expires_at > NOW())
     ORDER BY id
     LIMIT $1`,
    [batchLimit]
  );
  const summary = {
    scanned: result.rows.length,
    compressed: 0,
    skipped: 0,
    failed: 0,
    bytesSaved: 0
  };

  for (const attachment of result.rows) {
    const filePath = path.join(ATTACHMENTS_DIR, attachment.stored_filename);
    const nextStoredFilename = `${crypto.randomUUID()}${path.extname(attachment.stored_filename || '')}`;
    const nextFilePath = path.join(ATTACHMENTS_DIR, nextStoredFilename);
    try {
      const encryptedBytes = await fs.promises.readFile(filePath);
      const plaintext = decryptAttachmentBuffer(encryptedBytes, attachment);
      const prepared = prepareAttachmentStorageBuffer(plaintext);
      if (prepared.algorithm !== 'brotli') {
        await db.query(
          `UPDATE message_attachments
           SET original_file_size = $1,
               stored_file_size = $2,
               compression_saved_bytes = 0,
               compression_checked_at = NOW()
           WHERE id = $3`,
          [plaintext.length, encryptedBytes.length, attachment.id]
        );
        summary.skipped += 1;
        continue;
      }

      const encrypted = encryptAttachmentBuffer(prepared.buffer);
      await fs.promises.writeFile(nextFilePath, encrypted.data);
      await db.query(
        `UPDATE message_attachments
         SET original_file_size = $1,
             stored_file_size = $2,
             stored_filename = $3,
             compression_algorithm = 'brotli',
             compression_saved_bytes = $4,
             compression_checked_at = NOW(),
             encryption_iv = $5,
             encryption_auth_tag = $6
         WHERE id = $7`,
        [prepared.originalSize, encrypted.data.length, nextStoredFilename, prepared.savedBytes, encrypted.iv, encrypted.authTag, attachment.id]
      );
      await fs.promises.unlink(filePath).catch(() => {});
      summary.compressed += 1;
      summary.bytesSaved += prepared.savedBytes;
    } catch (_error) {
      await fs.promises.unlink(nextFilePath).catch(() => {});
      summary.failed += 1;
    }
  }

  return summary;
}

async function getAccessibleAttachment(userId, attachmentId) {
  const result = await db.query(
    `SELECT a.id,
            a.original_filename,
            a.stored_filename,
            a.mime_type,
            a.file_size,
            a.original_file_size,
            a.stored_file_size,
            a.compression_algorithm,
            a.compression_saved_bytes,
            a.encryption_iv,
            a.encryption_auth_tag,
            m.channel_id
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
    [attachmentId, userId]
  );
  const attachment = result.rows[0] || null;
  if (attachment?.channel_id) {
    const access = await getUserChannelPermissions(userId, attachment.channel_id);
    if (!access?.permissions.view_channels || !access.permissions.read_message_history) {
      return null;
    }
  }
  return attachment;
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
    const settings = await getCleanupSettings();
    sendTerminationEmail(updated.email, updated.username, updated.platform_ban_reason || updated.standing_reason || 'Your account was terminated for Terms of Service violations.', {
      bannedUserCleanupDays: settings.bannedUserCleanupDays
    }).catch(() => {});
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

const NOTIFICATION_DEFAULTS = {
  dm_messages: true,
  mentions: true,
  channel_messages: false,
  friend_requests: true,
  calls: true,
  moderation: true
};

function normalizeNotificationPreferences(row = {}) {
  return Object.fromEntries(
    Object.entries(NOTIFICATION_DEFAULTS).map(([key, fallback]) => [key, row[key] ?? fallback])
  );
}

async function getNotificationPreferences(userId) {
  const result = await db.query('SELECT * FROM notification_preferences WHERE user_id = $1', [userId]);
  return normalizeNotificationPreferences(result.rows[0] || {});
}

function notificationPreferenceKey(type) {
  if (type === 'dm_message') return 'dm_messages';
  if (type === 'mention' || type === 'role_mention') return 'mentions';
  if (type === 'channel_message') return 'channel_messages';
  if (type === 'friend_request') return 'friend_requests';
  if (type === 'dm_call') return 'calls';
  return 'moderation';
}

async function createUserNotification(userId, type, title, body = '', data = {}) {
  const preferences = await getNotificationPreferences(userId);
  if (preferences[notificationPreferenceKey(type)] === false) {
    return null;
  }
  const inserted = await db.query(
    `INSERT INTO user_notifications (user_id, type, title, body, data)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     RETURNING id, type, title, body, data, read_at, created_at`,
    [userId, type, title, body, JSON.stringify(data || {})]
  );
  const notification = inserted.rows[0];
  broadcastToUsers([userId], { type: 'notification-created', notification });
  return notification;
}

async function getUnreadSummary(userId) {
  const [channelUnread, channelMentions, dmUnread, notificationUnread] = await Promise.all([
    db.query(
      `SELECT m.channel_id, COUNT(*)::int AS count
       FROM messages m
       JOIN channels c ON c.id = m.channel_id
       JOIN server_members sm ON sm.server_id = c.server_id AND sm.user_id = $1
       LEFT JOIN channel_read_states crs ON crs.user_id = $1 AND crs.channel_id = m.channel_id
       WHERE m.user_id <> $1
         AND m.id > COALESCE(crs.last_read_message_id, 0)
       GROUP BY m.channel_id`,
      [userId]
    ),
    db.query(
      `SELECT (data->>'channelId')::int AS channel_id, COUNT(*)::int AS count
       FROM user_notifications
       WHERE user_id = $1
         AND read_at IS NULL
         AND type IN ('mention', 'role_mention')
         AND data ? 'channelId'
       GROUP BY data->>'channelId'`,
      [userId]
    ),
    db.query(
      `SELECT dm.sender_user_id AS partner_user_id, COUNT(*)::int AS count
       FROM dm_messages dm
       LEFT JOIN dm_read_states drs ON drs.user_id = $1 AND drs.partner_user_id = dm.sender_user_id
       WHERE dm.receiver_user_id = $1
         AND dm.id > COALESCE(drs.last_read_message_id, 0)
       GROUP BY dm.sender_user_id`,
      [userId]
    ),
    db.query('SELECT COUNT(*)::int AS count FROM user_notifications WHERE user_id = $1 AND read_at IS NULL', [userId])
  ]);
  const mentionCounts = new Map(channelMentions.rows.map((row) => [Number(row.channel_id), Number(row.count || 0)]));
  const channelRows = channelUnread.rows.map((row) => ({
    channel_id: row.channel_id,
    count: Number(row.count || 0),
    mentions: mentionCounts.get(Number(row.channel_id)) || 0
  }));
  const channelIds = new Set(channelRows.map((row) => Number(row.channel_id)));
  for (const [channelId, mentions] of mentionCounts.entries()) {
    if (!channelIds.has(channelId)) {
      channelRows.push({ channel_id: channelId, count: 0, mentions });
    }
  }
  return {
    channels: channelRows,
    dms: dmUnread.rows.map((row) => ({ partner_user_id: row.partner_user_id, count: Number(row.count || 0) })),
    notifications: Number(notificationUnread.rows[0]?.count || 0)
  };
}

async function markChannelRead(userId, channelId) {
  const result = await db.query('SELECT COALESCE(MAX(id), 0)::bigint AS last_id FROM messages WHERE channel_id = $1', [channelId]);
  await db.query(
    `INSERT INTO channel_read_states (user_id, channel_id, last_read_message_id, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id, channel_id)
     DO UPDATE SET last_read_message_id = GREATEST(channel_read_states.last_read_message_id, EXCLUDED.last_read_message_id),
                   updated_at = NOW()`,
    [userId, channelId, Number(result.rows[0]?.last_id || 0)]
  );
  await db.query(
    `UPDATE user_notifications
     SET read_at = COALESCE(read_at, NOW())
     WHERE user_id = $1
       AND read_at IS NULL
       AND type IN ('mention', 'role_mention', 'channel_message')
       AND data->>'channelId' = $2`,
    [userId, String(channelId)]
  );
}

async function markDmRead(userId, partnerUserId) {
  const result = await db.query(
    `SELECT COALESCE(MAX(id), 0)::bigint AS last_id
     FROM dm_messages
     WHERE (sender_user_id = $1 AND receiver_user_id = $2)
        OR (sender_user_id = $2 AND receiver_user_id = $1)`,
    [userId, partnerUserId]
  );
  await db.query(
    `INSERT INTO dm_read_states (user_id, partner_user_id, last_read_message_id, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id, partner_user_id)
     DO UPDATE SET last_read_message_id = GREATEST(dm_read_states.last_read_message_id, EXCLUDED.last_read_message_id),
                   updated_at = NOW()`,
    [userId, partnerUserId, Number(result.rows[0]?.last_id || 0)]
  );
  await db.query(
    `UPDATE user_notifications
     SET read_at = COALESCE(read_at, NOW())
     WHERE user_id = $1
       AND read_at IS NULL
       AND type = 'dm_message'
       AND data->>'partnerUserId' = $2`,
    [userId, String(partnerUserId)]
  );
}

function messageMentionsName(content, username) {
  const name = String(username || '').split('#')[0].trim().toLowerCase();
  if (!name) {
    return false;
  }
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|\\s)@${escaped}(?=$|\\s|[.,!?;:)\\]])`, 'i').test(String(content || ''));
}

async function notifyChannelMessageTargets({ channelId, senderUserId, content, message, channelName }) {
  const [memberResult, roleResult] = await Promise.all([
    db.query(
      `SELECT sm.user_id,
              u.username,
              COALESCE(array_agg(smr.role_id) FILTER (WHERE smr.role_id IS NOT NULL), '{}') AS role_ids
       FROM channels c
       JOIN server_members sm ON sm.server_id = c.server_id
       JOIN users u ON u.id = sm.user_id
       LEFT JOIN server_member_roles smr ON smr.server_id = sm.server_id AND smr.user_id = sm.user_id
       WHERE c.id = $1 AND sm.user_id <> $2
       GROUP BY sm.user_id, u.username`,
      [channelId, senderUserId]
    ),
    db.query(
      `SELECT r.id, r.name
       FROM channels c
       JOIN server_roles r ON r.server_id = c.server_id
       WHERE c.id = $1 AND r.is_default = FALSE`,
      [channelId]
    )
  ]);
  const mentionedRoleIds = roleResult.rows
    .filter((role) => messageMentionsName(content, role.name))
    .map((role) => Number(role.id));
  for (const member of memberResult.rows) {
    const directMention = messageMentionsName(content, member.username);
    const memberRoleIds = (member.role_ids || []).map(Number);
    const roleMention = mentionedRoleIds.some((roleId) => memberRoleIds.includes(roleId));
    const mentioned = directMention || roleMention;
    await createUserNotification(
      member.user_id,
      directMention ? 'mention' : (roleMention ? 'role_mention' : 'channel_message'),
      mentioned ? `Mention in #${channelName}` : `New message in #${channelName}`,
      `${message.username || 'Someone'}: ${String(content || 'Sent an attachment.').slice(0, 160)}`,
      { channelId, messageId: message.id, serverId: message.server_id || null, mentioned, roleMention }
    );
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
  'view_channels',
  'manage_server',
  'manage_roles',
  'manage_channels',
  'create_invites',
  'send_messages',
  'attach_files',
  'read_message_history',
  'manage_messages',
  'connect_voice',
  'speak_voice',
  'view_members',
  'kick_members',
  'ban_members',
  'view_bans'
];

const DEFAULT_MEMBER_PERMISSION_KEYS = [
  'view_channels',
  'send_messages',
  'attach_files',
  'read_message_history',
  'connect_voice',
  'speak_voice',
  'view_members'
];

function emptyServerPermissions() {
  return Object.fromEntries(SERVER_PERMISSION_KEYS.map((key) => [key, false]));
}

function defaultMemberPermissions() {
  const permissions = emptyServerPermissions();
  for (const key of DEFAULT_MEMBER_PERMISSION_KEYS) {
    permissions[key] = true;
  }
  return permissions;
}

function allServerPermissions() {
  return Object.fromEntries(SERVER_PERMISSION_KEYS.map((key) => [key, true]));
}

function normalizeServerPermissions(value, options = {}) {
  const normalized = options.defaultMember ? defaultMemberPermissions() : emptyServerPermissions();
  const raw = value && typeof value === 'object' ? value : {};
  for (const key of SERVER_PERMISSION_KEYS) {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      normalized[key] = Boolean(raw[key]);
    }
  }
  const hasLegacyPermissions = ['manage_server', 'manage_roles', 'manage_channels', 'create_invites', 'moderate_members']
    .some((key) => Object.prototype.hasOwnProperty.call(raw, key));
  if (hasLegacyPermissions) {
    const defaults = defaultMemberPermissions();
    for (const key of DEFAULT_MEMBER_PERMISSION_KEYS) {
      normalized[key] = normalized[key] || defaults[key];
    }
  }
  if (raw.moderate_members) {
    normalized.view_members = true;
    normalized.kick_members = true;
    normalized.ban_members = true;
    normalized.view_bans = true;
    normalized.manage_messages = true;
  }
  return normalized;
}

function normalizeRoleColor(value) {
  const color = String(value || '').trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toLowerCase() : '#99aab5';
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

function normalizePermissionOverrideSet(value) {
  const normalized = emptyServerPermissions();
  const raw = value && typeof value === 'object' ? value : {};
  for (const key of SERVER_PERMISSION_KEYS) {
    normalized[key] = Boolean(raw[key]);
  }
  return normalized;
}

function applyPermissionOverride(basePermissions, override) {
  const permissions = { ...normalizeServerPermissions(basePermissions) };
  const allow = normalizePermissionOverrideSet(override?.allow);
  const deny = normalizePermissionOverrideSet(override?.deny);
  for (const key of SERVER_PERMISSION_KEYS) {
    if (deny[key]) {
      permissions[key] = false;
    }
    if (allow[key]) {
      permissions[key] = true;
    }
  }
  return permissions;
}

async function ensureServerRoles(serverId) {
  const roles = await db.query('SELECT id, name, is_default FROM server_roles WHERE server_id = $1', [serverId]);
  const hasDefaultRole = roles.rows.some((role) => role.is_default);
  if (!hasDefaultRole) {
    await db.query(
      `INSERT INTO server_roles (server_id, name, position, permissions, is_default)
       VALUES ($1, '@everyone', 0, $2::jsonb, TRUE)`,
      [serverId, JSON.stringify(defaultMemberPermissions())]
    );
  }

  const hasAdminRole = roles.rows.some((role) => String(role.name || '').toLowerCase() === 'admin');
  if (!hasAdminRole) {
    await db.query(
      `INSERT INTO server_roles (server_id, name, position, permissions, is_default)
       VALUES ($1, 'Admin', 100, $2::jsonb, FALSE)`,
      [serverId, JSON.stringify(allServerPermissions())]
    );
  }
}

async function getServerRoles(serverId) {
  await ensureServerRoles(serverId);
  const result = await db.query(
    `SELECT id, server_id, name, color, position, permissions, is_default
     FROM server_roles
     WHERE server_id = $1
     ORDER BY is_default DESC, position DESC, name ASC`,
    [serverId]
  );
  return result.rows.map((role) => ({
    ...role,
    color: normalizeRoleColor(role.color),
    permissions: normalizeServerPermissions(role.permissions, { defaultMember: role.is_default })
  }));
}

async function getUserServerPermissions(userId, serverId) {
  if (await isServerOwner(userId, serverId)) {
    return allServerPermissions();
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

async function getUserAssignedRoleIds(userId, serverId) {
  const assigned = await db.query(
    'SELECT role_id FROM server_member_roles WHERE server_id = $1 AND user_id = $2',
    [serverId, userId]
  );
  return assigned.rows.map((row) => Number(row.role_id)).filter(Boolean);
}

async function getChannelPermissionRows(serverId, scopeType, scopeId) {
  const scopeColumn = scopeType === 'category' ? 'category_id' : 'channel_id';
  const result = await db.query(
    `SELECT id, server_id, scope_type, category_id, channel_id, target_type, role_id, user_id, allow, deny
     FROM channel_permission_overrides
     WHERE server_id = $1 AND scope_type = $2 AND ${scopeColumn} = $3
     ORDER BY id`,
    [serverId, scopeType, scopeId]
  );
  return result.rows;
}

function applyScopedPermissionOverrides(basePermissions, overrides, defaultRoleId, assignedRoleIds, userId) {
  let permissions = { ...normalizeServerPermissions(basePermissions) };
  const roleIdSet = new Set(assignedRoleIds.map(Number));
  const everyoneOverride = overrides.find((override) => override.target_type === 'role' && Number(override.role_id) === Number(defaultRoleId));
  if (everyoneOverride) {
    permissions = applyPermissionOverride(permissions, everyoneOverride);
  }
  for (const override of overrides) {
    if (override.target_type === 'role' && Number(override.role_id) !== Number(defaultRoleId) && roleIdSet.has(Number(override.role_id))) {
      permissions = applyPermissionOverride(permissions, override);
    }
  }
  const memberOverride = overrides.find((override) => override.target_type === 'member' && Number(override.user_id) === Number(userId));
  if (memberOverride) {
    permissions = applyPermissionOverride(permissions, memberOverride);
  }
  return permissions;
}

async function getUserChannelPermissions(userId, channelId) {
  const channelResult = await db.query(
    `SELECT c.id, c.server_id, c.category_id, c.type, c.name, c.topic, c.slowmode_seconds
     FROM channels c
     JOIN server_members sm ON sm.server_id = c.server_id
     WHERE c.id = $1 AND sm.user_id = $2`,
    [channelId, userId]
  );
  const channel = channelResult.rows[0];
  if (!channel) {
    return null;
  }
  if (await isServerOwner(userId, channel.server_id)) {
    return { channel, permissions: allServerPermissions() };
  }

  const [serverPermissions, roles, assignedRoleIds] = await Promise.all([
    getUserServerPermissions(userId, channel.server_id),
    getServerRoles(channel.server_id),
    getUserAssignedRoleIds(userId, channel.server_id)
  ]);
  const defaultRoleId = roles.find((role) => role.is_default)?.id || null;
  let permissions = { ...serverPermissions };

  if (channel.category_id) {
    const categoryOverrides = await getChannelPermissionRows(channel.server_id, 'category', channel.category_id);
    permissions = applyScopedPermissionOverrides(permissions, categoryOverrides, defaultRoleId, assignedRoleIds, userId);
  }

  const channelOverrides = await getChannelPermissionRows(channel.server_id, 'channel', channel.id);
  permissions = applyScopedPermissionOverrides(permissions, channelOverrides, defaultRoleId, assignedRoleIds, userId);

  return { channel, permissions };
}

async function filterVisibleChannels(userId, channels) {
  const visible = [];
  for (const channel of channels) {
    const access = await getUserChannelPermissions(userId, channel.id);
    if (access?.permissions.view_channels) {
      visible.push(channel);
    }
  }
  return visible;
}

function sanitizeOverridePermissions(value) {
  const sanitized = emptyServerPermissions();
  const raw = value && typeof value === 'object' ? value : {};
  for (const key of SERVER_PERMISSION_KEYS) {
    sanitized[key] = Boolean(raw[key]);
  }
  return sanitized;
}

async function getPermissionOverrideState(serverId) {
  const [roles, members, categories, channels, overrides] = await Promise.all([
    getServerRoles(serverId),
    db.query(
      `SELECT u.id, u.username, u.avatar_url
       FROM server_members sm
       JOIN users u ON u.id = sm.user_id
       WHERE sm.server_id = $1 AND u.platform_banned_at IS NULL
       ORDER BY u.username`,
      [serverId]
    ),
    db.query('SELECT id, server_id, name, position FROM channel_categories WHERE server_id = $1 ORDER BY position, id', [serverId]),
    db.query(
      `SELECT id, type, name, topic, slowmode_seconds, server_id, category_id, position
       FROM channels
       WHERE server_id = $1
       ORDER BY COALESCE(category_id, 0), position, id`,
      [serverId]
    ),
    db.query(
      `SELECT id, server_id, scope_type, category_id, channel_id, target_type, role_id, user_id, allow, deny
       FROM channel_permission_overrides
       WHERE server_id = $1
       ORDER BY scope_type, COALESCE(category_id, channel_id), target_type, id`,
      [serverId]
    )
  ]);
  return {
    permissionKeys: SERVER_PERMISSION_KEYS,
    roles,
    members: members.rows,
    categories: categories.rows,
    channels: channels.rows,
    overrides: overrides.rows.map((override) => ({
      ...override,
      allow: sanitizeOverridePermissions(override.allow),
      deny: sanitizeOverridePermissions(override.deny)
    }))
  };
}

async function validatePermissionOverridePayload(serverId, payload) {
  const scopeType = String(payload?.scopeType || payload?.scope_type || '').trim().toLowerCase();
  const scopeId = Number(payload?.scopeId || payload?.scope_id);
  const targetType = String(payload?.targetType || payload?.target_type || '').trim().toLowerCase();
  const targetId = Number(payload?.targetId || payload?.target_id);
  if (!['category', 'channel'].includes(scopeType) || !scopeId || !['role', 'member'].includes(targetType) || !targetId) {
    throw new Error('Valid scope and target are required.');
  }

  if (scopeType === 'category') {
    const category = await db.query('SELECT id FROM channel_categories WHERE id = $1 AND server_id = $2', [scopeId, serverId]);
    if (category.rows.length === 0) {
      throw new Error('Category not found.');
    }
  } else {
    const channel = await db.query('SELECT id FROM channels WHERE id = $1 AND server_id = $2', [scopeId, serverId]);
    if (channel.rows.length === 0) {
      throw new Error('Channel not found.');
    }
  }

  if (targetType === 'role') {
    const role = await db.query('SELECT id FROM server_roles WHERE id = $1 AND server_id = $2', [targetId, serverId]);
    if (role.rows.length === 0) {
      throw new Error('Role not found.');
    }
  } else {
    const member = await db.query('SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2', [serverId, targetId]);
    if (member.rows.length === 0) {
      throw new Error('Member not found.');
    }
  }

  return {
    scopeType,
    scopeId,
    targetType,
    targetId,
    allow: sanitizeOverridePermissions(payload?.allow),
    deny: sanitizeOverridePermissions(payload?.deny)
  };
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

          const access = await getUserChannelPermissions(meta.userId, channelId);
          if (access?.permissions.view_channels) {
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
      const settings = await getCleanupSettings();
      return {
        ok: false,
        banned: true,
        email,
        message: getBanDeletionMessage(settings),
        bannedUserCleanupDays: settings.bannedUserCleanupDays
      };
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

ipcMain.handle('appeals:submitBanAppeal', async (_event, payload) => {
  const email = String(payload?.email || '').trim().toLowerCase();
  const password = String(payload?.password || '');
  const reason = String(payload?.reason || '').trim();
  if (!email || !password || reason.length < 20 || reason.length > 2000) {
    return { ok: false, message: 'Appeal must include your email, password, and 20-2000 characters of explanation.' };
  }

  try {
    const result = await db.query('SELECT id, password_hash, platform_banned_at FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0 || !(await bcrypt.compare(password, result.rows[0].password_hash))) {
      return { ok: false, message: 'Email or password is incorrect.' };
    }
    const user = result.rows[0];
    if (!user.platform_banned_at) {
      return { ok: false, message: 'This account is not currently banned.' };
    }
    const existing = await db.query(
      `SELECT id FROM ban_appeals
       WHERE user_id = $1 AND status = 'open'
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );
    if (existing.rows.length > 0) {
      return { ok: false, message: 'You already have an open ban appeal.' };
    }
    await db.query('INSERT INTO ban_appeals (user_id, reason) VALUES ($1, $2)', [user.id, reason]);
    return { ok: true, message: 'Your ban appeal was submitted.' };
  } catch (error) {
    return { ok: false, message: `Failed to submit ban appeal: ${error.message}` };
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
      const settings = await getCleanupSettings();
      return {
        ok: false,
        banned: true,
        message: getBanDeletionMessage(settings),
        bannedUserCleanupDays: settings.bannedUserCleanupDays
      };
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
      `SELECT s.id, s.name, s.icon_url, s.owner_user_id
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
      'INSERT INTO servers (name, owner_user_id) VALUES ($1, $2) RETURNING id, name, icon_url, owner_user_id',
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

ipcMain.handle('chat:startDiscordMigration', async () => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  try {
    return await createDiscordMigrationSession(db, currentUserId);
  } catch (error) {
    return { ok: false, message: `Failed to start Discord migration: ${error.message}` };
  }
});

ipcMain.handle('chat:getDiscordMigrationStatus', async (_event, code) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  try {
    return await getDiscordMigrationStatus(db, code, currentUserId);
  } catch (error) {
    return { ok: false, message: `Failed to load Discord migration status: ${error.message}` };
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
    if (!permissions.kick_members) {
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
    const notification = await createUserNotification(
      targetUserId,
      'moderation',
      'Removed From Server',
      'You were removed from this server by a moderator.',
      { serverId }
    );
    broadcastToUsers([targetUserId], {
      type: 'server-banned',
      serverId,
      title: 'Removed From Server',
      message: 'You were removed from this server by a moderator.',
      notification: notification || { type: 'moderation', suppressed: true }
    });
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
    if (!permissions.ban_members) {
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

    const notification = await createUserNotification(
      targetUserId,
      'moderation',
      'Removed From Server',
      reason ? `You were banned from this server. Reason: ${reason}` : 'You were banned from this server.',
      { serverId, reason: reason || null }
    );
    broadcastToUsers([targetUserId], {
      type: 'server-banned',
      serverId,
      title: 'Removed From Server',
      message: reason ? `You were banned from this server. Reason: ${reason}` : 'You were banned from this server.',
      notification: notification || { type: 'moderation', suppressed: true }
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
    if (!permissions.ban_members) {
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
    if (!permissions.view_bans) {
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
  const iconUrl = String(payload?.iconUrl || payload?.icon_url || '').trim();
  if (!serverId || name.length < 2 || name.length > 80) {
    return { ok: false, message: 'Server name must be between 2 and 80 characters.' };
  }

  try {
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.manage_server) {
      return { ok: false, message: 'You do not have permission to rename the server.' };
    }

    const updated = await db.query(
      'UPDATE servers SET name = $1, icon_url = $2 WHERE id = $3 RETURNING id, name, icon_url, owner_user_id',
      [name, iconUrl || null, serverId]
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
    const categories = await db.query(
      'SELECT id, server_id, name, position FROM channel_categories WHERE server_id = $1 ORDER BY position, id',
      [serverId]
    );
    const channels = await db.query(
      `SELECT id, type, name, topic, slowmode_seconds, server_id, category_id, position
       FROM channels
       WHERE server_id = $1
       ORDER BY COALESCE(category_id, 0), position, id`,
      [serverId]
    );

    const visibleChannels = await filterVisibleChannels(currentUserId, channels.rows);
    const visibleCategoryIds = new Set(visibleChannels.map((channel) => channel.category_id).filter(Boolean));
    const visibleCategories = permissions.manage_channels
      ? categories.rows
      : categories.rows.filter((category) => visibleCategoryIds.has(category.id));
    return {
      ok: true,
      categories: visibleCategories,
      channels: visibleChannels,
      canCreateChannels: permissions.manage_channels,
      permissions
    };
  } catch (error) {
    return { ok: false, message: `Failed to load channels: ${error.message}` };
  }
});

ipcMain.handle('chat:createCategory', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const serverId = Number(payload?.serverId);
  const name = String(payload?.name || '').trim();
  if (!serverId || name.length < 1 || name.length > 80) {
    return { ok: false, message: 'Valid server and category name are required.' };
  }
  try {
    const membership = await db.query('SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2', [serverId, currentUserId]);
    if (membership.rows.length === 0) {
      return { ok: false, message: 'Access denied.' };
    }
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.manage_channels) {
      return { ok: false, message: 'You do not have permission to create categories.' };
    }
    const next = await db.query('SELECT COALESCE(MAX(position), -1) + 1 AS position FROM channel_categories WHERE server_id = $1', [serverId]);
    const created = await db.query(
      'INSERT INTO channel_categories (server_id, name, position) VALUES ($1, $2, $3) RETURNING id, server_id, name, position',
      [serverId, name, next.rows[0]?.position || 0]
    );
    await broadcastToServerMembers(serverId, { type: 'channel-layout-updated', serverId });
    return { ok: true, category: created.rows[0] };
  } catch (error) {
    return { ok: false, message: `Failed to create category: ${error.message}` };
  }
});

ipcMain.handle('chat:createChannel', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const serverId = Number(payload?.serverId);
  const type = String(payload?.type || 'text').trim().toLowerCase();
  const name = String(payload?.name || '').trim().toLowerCase();
  const categoryId = payload?.categoryId ? Number(payload.categoryId) : null;
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
    if (categoryId) {
      const category = await db.query('SELECT id FROM channel_categories WHERE id = $1 AND server_id = $2', [categoryId, serverId]);
      if (!category.rows.length) {
        return { ok: false, message: 'Category not found.' };
      }
    }
    const next = await db.query(
      `SELECT COALESCE(MAX(position), -1) + 1 AS position
       FROM channels
       WHERE server_id = $1 AND category_id IS NOT DISTINCT FROM $2`,
      [serverId, categoryId]
    );

    const created = await db.query(
      `INSERT INTO channels (server_id, type, name, category_id, position)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, type, name, topic, slowmode_seconds, server_id, category_id, position`,
      [serverId, type, name, categoryId, next.rows[0]?.position || 0]
    );
    const channel = created.rows[0];
    await broadcastToServerMembers(serverId, { type: 'channel-created', serverId, channel });
    return { ok: true, channel };
  } catch (error) {
    return { ok: false, message: `Failed to create channel: ${error.message}` };
  }
});

ipcMain.handle('chat:updateCategory', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const categoryId = Number(payload?.categoryId);
  const name = String(payload?.name || '').trim();
  if (!categoryId || name.length < 1 || name.length > 80) {
    return { ok: false, message: 'Valid category and name are required.' };
  }
  try {
    const existing = await db.query('SELECT id, server_id FROM channel_categories WHERE id = $1', [categoryId]);
    if (existing.rows.length === 0) {
      return { ok: false, message: 'Category not found.' };
    }
    const serverId = existing.rows[0].server_id;
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.manage_channels) {
      return { ok: false, message: 'You do not have permission to manage categories.' };
    }
    const updated = await db.query(
      'UPDATE channel_categories SET name = $1 WHERE id = $2 RETURNING id, server_id, name, position',
      [name, categoryId]
    );
    await broadcastToServerMembers(serverId, { type: 'channel-layout-updated', serverId });
    return { ok: true, category: updated.rows[0] };
  } catch (error) {
    return { ok: false, message: `Failed to update category: ${error.message}` };
  }
});

ipcMain.handle('chat:deleteCategory', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const categoryId = Number(payload?.categoryId);
  if (!categoryId) {
    return { ok: false, message: 'Valid category is required.' };
  }
  try {
    const existing = await db.query('SELECT id, server_id FROM channel_categories WHERE id = $1', [categoryId]);
    if (existing.rows.length === 0) {
      return { ok: false, message: 'Category not found.' };
    }
    const serverId = existing.rows[0].server_id;
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.manage_channels) {
      return { ok: false, message: 'You do not have permission to manage categories.' };
    }
    await db.query('UPDATE channels SET category_id = NULL WHERE category_id = $1', [categoryId]);
    await db.query('DELETE FROM channel_categories WHERE id = $1', [categoryId]);
    await broadcastToServerMembers(serverId, { type: 'channel-layout-updated', serverId });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to delete category: ${error.message}` };
  }
});

ipcMain.handle('chat:updateChannel', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const channelId = Number(payload?.channelId);
  const name = String(payload?.name || '').trim().toLowerCase();
  const topic = String(payload?.topic || '').trim().slice(0, 1024);
  const slowmodeSeconds = Math.max(0, Math.min(21600, Number(payload?.slowmodeSeconds || payload?.slowmode_seconds || 0) || 0));
  const categoryId = payload?.categoryId ? Number(payload.categoryId) : null;
  if (!channelId || name.length < 1 || name.length > 80) {
    return { ok: false, message: 'Valid channel and name are required.' };
  }
  try {
    const existing = await db.query('SELECT id, server_id, type FROM channels WHERE id = $1', [channelId]);
    if (existing.rows.length === 0) {
      return { ok: false, message: 'Channel not found.' };
    }
    const serverId = existing.rows[0].server_id;
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.manage_channels) {
      return { ok: false, message: 'You do not have permission to manage channels.' };
    }
    if (categoryId) {
      const category = await db.query('SELECT id FROM channel_categories WHERE id = $1 AND server_id = $2', [categoryId, serverId]);
      if (category.rows.length === 0) {
        return { ok: false, message: 'Category not found.' };
      }
    }
    const updated = await db.query(
      `UPDATE channels
       SET name = $1, topic = $2, slowmode_seconds = $3, category_id = $4
       WHERE id = $5
       RETURNING id, type, name, topic, slowmode_seconds, server_id, category_id, position`,
      [name, topic, slowmodeSeconds, categoryId, channelId]
    );
    await broadcastToServerMembers(serverId, { type: 'channel-layout-updated', serverId });
    return { ok: true, channel: updated.rows[0] };
  } catch (error) {
    return { ok: false, message: `Failed to update channel: ${error.message}` };
  }
});

ipcMain.handle('chat:deleteChannel', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const channelId = Number(payload?.channelId);
  if (!channelId) {
    return { ok: false, message: 'Valid channel is required.' };
  }
  try {
    const existing = await db.query('SELECT id, server_id FROM channels WHERE id = $1', [channelId]);
    if (existing.rows.length === 0) {
      return { ok: false, message: 'Channel not found.' };
    }
    const serverId = existing.rows[0].server_id;
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.manage_channels) {
      return { ok: false, message: 'You do not have permission to manage channels.' };
    }
    await db.query('DELETE FROM channels WHERE id = $1', [channelId]);
    await broadcastToServerMembers(serverId, { type: 'channel-layout-updated', serverId });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to delete channel: ${error.message}` };
  }
});

ipcMain.handle('chat:updateChannelLayout', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const serverId = Number(payload?.serverId);
  const categories = Array.isArray(payload?.categories) ? payload.categories : [];
  const channels = Array.isArray(payload?.channels) ? payload.channels : [];
  if (!serverId) {
    return { ok: false, message: 'Valid server id is required.' };
  }
  try {
    const membership = await db.query('SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2', [serverId, currentUserId]);
    if (membership.rows.length === 0) {
      return { ok: false, message: 'Access denied.' };
    }
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.manage_channels) {
      return { ok: false, message: 'You do not have permission to arrange channels.' };
    }
    await db.withTransaction(async (tx) => {
      for (const item of categories) {
        const id = Number(item.id);
        if (id) {
          await tx.query('UPDATE channel_categories SET position = $1 WHERE id = $2 AND server_id = $3', [Number(item.position) || 0, id, serverId]);
        }
      }
      for (const item of channels) {
        const id = Number(item.id);
        const categoryId = item.categoryId ? Number(item.categoryId) : null;
        if (id) {
          await tx.query(
            'UPDATE channels SET category_id = $1, position = $2 WHERE id = $3 AND server_id = $4',
            [categoryId, Number(item.position) || 0, id, serverId]
          );
        }
      }
    });
    await broadcastToServerMembers(serverId, { type: 'channel-layout-updated', serverId });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to arrange channels: ${error.message}` };
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
    const channelAccess = await getUserChannelPermissions(currentUserId, channelId);
    if (!channelAccess || Number(channelAccess.channel.server_id) !== serverId) {
      return { ok: false, message: 'Channel not found.' };
    }
    if (channelAccess.channel.type !== 'voice') {
      return { ok: false, message: 'This channel is not a voice channel.' };
    }
    if (!channelAccess.permissions.view_channels || !channelAccess.permissions.connect_voice) {
      return { ok: false, message: 'You do not have permission to join this voice channel.' };
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

ipcMain.handle('notifications:list', async () => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  try {
    const [notifications, preferences, unread] = await Promise.all([
      db.query(
        `SELECT id, type, title, body, data, read_at, created_at
         FROM user_notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 100`,
        [currentUserId]
      ),
      getNotificationPreferences(currentUserId),
      getUnreadSummary(currentUserId)
    ]);
    return { ok: true, notifications: notifications.rows, preferences, unread };
  } catch (error) {
    return { ok: false, message: `Failed to load notifications: ${error.message}` };
  }
});

ipcMain.handle('notifications:markAllRead', async () => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  try {
    await db.query('UPDATE user_notifications SET read_at = COALESCE(read_at, NOW()) WHERE user_id = $1 AND read_at IS NULL', [currentUserId]);
    return { ok: true, unread: await getUnreadSummary(currentUserId) };
  } catch (error) {
    return { ok: false, message: `Failed to clear notifications: ${error.message}` };
  }
});

ipcMain.handle('notifications:markRead', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const notificationId = Number(payload?.notificationId);
  if (!notificationId) {
    return { ok: false, message: 'Notification id is required.' };
  }
  try {
    await db.query('UPDATE user_notifications SET read_at = COALESCE(read_at, NOW()) WHERE id = $1 AND user_id = $2', [notificationId, currentUserId]);
    return { ok: true, unread: await getUnreadSummary(currentUserId) };
  } catch (error) {
    return { ok: false, message: `Failed to mark notification read: ${error.message}` };
  }
});

ipcMain.handle('notifications:getUnread', async () => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  try {
    return { ok: true, unread: await getUnreadSummary(currentUserId) };
  } catch (error) {
    return { ok: false, message: `Failed to load unread state: ${error.message}` };
  }
});

ipcMain.handle('notifications:markChannelRead', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const channelId = Number(payload?.channelId);
  if (!channelId) {
    return { ok: false, message: 'Channel id is required.' };
  }
  try {
    const access = await getUserChannelPermissions(currentUserId, channelId);
    if (!access?.permissions.view_channels) {
      return { ok: false, message: 'Access denied.' };
    }
    await markChannelRead(currentUserId, channelId);
    return { ok: true, unread: await getUnreadSummary(currentUserId) };
  } catch (error) {
    return { ok: false, message: `Failed to mark channel read: ${error.message}` };
  }
});

ipcMain.handle('notifications:markDmRead', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const partnerUserId = Number(payload?.partnerUserId);
  if (!partnerUserId) {
    return { ok: false, message: 'Partner user id is required.' };
  }
  try {
    if (!(await canUsersDm(currentUserId, partnerUserId))) {
      return { ok: false, message: 'Access denied.' };
    }
    await markDmRead(currentUserId, partnerUserId);
    return { ok: true, unread: await getUnreadSummary(currentUserId) };
  } catch (error) {
    return { ok: false, message: `Failed to mark DM read: ${error.message}` };
  }
});

ipcMain.handle('notifications:savePreferences', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const next = normalizeNotificationPreferences(payload || {});
  try {
    const result = await db.query(
      `INSERT INTO notification_preferences
       (user_id, dm_messages, mentions, channel_messages, friend_requests, calls, moderation, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET dm_messages = EXCLUDED.dm_messages,
                     mentions = EXCLUDED.mentions,
                     channel_messages = EXCLUDED.channel_messages,
                     friend_requests = EXCLUDED.friend_requests,
                     calls = EXCLUDED.calls,
                     moderation = EXCLUDED.moderation,
                     updated_at = NOW()
       RETURNING *`,
      [currentUserId, next.dm_messages, next.mentions, next.channel_messages, next.friend_requests, next.calls, next.moderation]
    );
    return { ok: true, preferences: normalizeNotificationPreferences(result.rows[0]) };
  } catch (error) {
    return { ok: false, message: `Failed to save notification preferences: ${error.message}` };
  }
});

ipcMain.handle('notifications:registerPushToken', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const token = String(payload?.token || '').trim();
  const platform = String(payload?.platform || 'android').trim().toLowerCase().slice(0, 32);
  const deviceLabel = String(payload?.deviceLabel || '').trim().slice(0, 120);
  if (!token) {
    return { ok: false, message: 'Push token is required.' };
  }
  try {
    await db.query(
      `INSERT INTO notification_push_tokens (user_id, platform, token, device_label, updated_at, last_seen_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       ON CONFLICT (token)
       DO UPDATE SET user_id = EXCLUDED.user_id,
                     platform = EXCLUDED.platform,
                     device_label = EXCLUDED.device_label,
                     updated_at = NOW(),
                     last_seen_at = NOW()`,
      [currentUserId, platform, token, deviceLabel || null]
    );
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to save push token: ${error.message}` };
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
    if (!permissions.view_members) {
      return { ok: false, message: 'You do not have permission to view members.' };
    }
    const members = await db.query(
      `SELECT u.id, u.username, u.avatar_url,
              COALESCE(
                ARRAY_AGG(r.name ORDER BY r.position DESC, r.name ASC) FILTER (WHERE r.id IS NOT NULL),
                '{}'::text[]
              ) AS role_names,
              COALESCE(
                JSONB_AGG(JSONB_BUILD_OBJECT('id', r.id, 'name', r.name, 'color', r.color) ORDER BY r.position DESC, r.name ASC) FILTER (WHERE r.id IS NOT NULL),
                '[]'::jsonb
              ) AS role_details
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

ipcMain.handle('permissions:getOverrides', async (_event, payload) => {
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
    if (!permissions.manage_roles && !permissions.manage_channels) {
      return { ok: false, message: 'You do not have permission to manage channel permissions.' };
    }
    const state = await getPermissionOverrideState(serverId);
    return { ok: true, permissions, ...state };
  } catch (error) {
    return { ok: false, message: `Failed to load permission overrides: ${error.message}` };
  }
});

ipcMain.handle('permissions:saveOverride', async (_event, payload) => {
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
    if (!permissions.manage_roles && !permissions.manage_channels) {
      return { ok: false, message: 'You do not have permission to manage channel permissions.' };
    }
    const next = await validatePermissionOverridePayload(serverId, payload);
    const scopeColumn = next.scopeType === 'category' ? 'category_id' : 'channel_id';
    const targetColumn = next.targetType === 'role' ? 'role_id' : 'user_id';
    const existing = await db.query(
      `SELECT id FROM channel_permission_overrides
       WHERE server_id = $1 AND scope_type = $2 AND ${scopeColumn} = $3 AND target_type = $4 AND ${targetColumn} = $5`,
      [serverId, next.scopeType, next.scopeId, next.targetType, next.targetId]
    );
    const saved = existing.rows[0]
      ? await db.query(
        `UPDATE channel_permission_overrides
         SET allow = $1::jsonb, deny = $2::jsonb, updated_at = NOW()
         WHERE id = $3
         RETURNING id, server_id, scope_type, category_id, channel_id, target_type, role_id, user_id, allow, deny`,
        [JSON.stringify(next.allow), JSON.stringify(next.deny), existing.rows[0].id]
      )
      : await db.query(
        `INSERT INTO channel_permission_overrides
          (server_id, scope_type, ${scopeColumn}, target_type, ${targetColumn}, allow, deny)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)
         RETURNING id, server_id, scope_type, category_id, channel_id, target_type, role_id, user_id, allow, deny`,
        [serverId, next.scopeType, next.scopeId, next.targetType, next.targetId, JSON.stringify(next.allow), JSON.stringify(next.deny)]
      );
    await broadcastToServerMembers(serverId, { type: 'channel-layout-updated', serverId });
    return { ok: true, override: saved.rows[0] };
  } catch (error) {
    return { ok: false, message: `Failed to save permission override: ${error.message}` };
  }
});

ipcMain.handle('permissions:deleteOverride', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const serverId = Number(payload?.serverId);
  const overrideId = Number(payload?.overrideId);
  if (!serverId || !overrideId) {
    return { ok: false, message: 'Valid server and override are required.' };
  }
  try {
    const membership = await db.query('SELECT 1 FROM server_members WHERE server_id = $1 AND user_id = $2', [serverId, currentUserId]);
    if (membership.rows.length === 0) {
      return { ok: false, message: 'Access denied.' };
    }
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.manage_roles && !permissions.manage_channels) {
      return { ok: false, message: 'You do not have permission to manage channel permissions.' };
    }
    const deleted = await db.query('DELETE FROM channel_permission_overrides WHERE id = $1 AND server_id = $2 RETURNING id', [overrideId, serverId]);
    if (deleted.rows.length === 0) {
      return { ok: false, message: 'Permission override not found.' };
    }
    await broadcastToServerMembers(serverId, { type: 'channel-layout-updated', serverId });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to delete permission override: ${error.message}` };
  }
});

ipcMain.handle('roles:create', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const serverId = Number(payload?.serverId);
  const name = String(payload?.name || '').trim();
  const color = normalizeRoleColor(payload?.color);
  if (!serverId || name.length < 2 || name.length > 80) {
    return { ok: false, message: 'Role name must be between 2 and 80 characters.' };
  }

  try {
    const permissions = await getUserServerPermissions(currentUserId, serverId);
    if (!permissions.manage_roles) {
      return { ok: false, message: 'You do not have permission to manage roles.' };
    }
    const created = await db.query(
      `INSERT INTO server_roles (server_id, name, color, position, permissions, is_default)
       VALUES ($1, $2, $3, 1, '{}'::jsonb, FALSE)
       RETURNING id, server_id, name, color, position, permissions, is_default`,
      [serverId, name, color]
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
  const color = normalizeRoleColor(payload?.color);
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
       SET name = $1, color = $2, permissions = $3::jsonb
       WHERE id = $4 AND server_id = $5
       RETURNING id, server_id, name, color, position, permissions, is_default`,
      [nextName, color, JSON.stringify(rolePermissions), roleId, serverId]
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

    return { ok: true, user, servers: memberships.rows, reports: reports.rows };
  } catch (error) {
    return { ok: false, message: `Failed to load user details: ${error.message}` };
  }
});

ipcMain.handle('admin:listReports', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  try {
    if (!(await requirePlatformAdmin(currentUserId))) {
      return { ok: false, message: 'Platform admin access required.' };
    }

    const allowedStatuses = new Set(['open', 'reviewed', 'dismissed', 'actioned', 'all']);
    const requestedStatus = String(payload?.status || 'open').trim().toLowerCase();
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

    return { ok: true, reports: reports.rows };
  } catch (error) {
    return { ok: false, message: `Failed to load reports: ${error.message}` };
  }
});

ipcMain.handle('admin:updateReport', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const reportId = Number(payload?.reportId);
  if (!reportId) {
    return { ok: false, message: 'Report id is required.' };
  }

  try {
    if (!(await requirePlatformAdmin(currentUserId))) {
      return { ok: false, message: 'Platform admin access required.' };
    }

    const status = String(payload?.status || '').trim().toLowerCase();
    if (!['open', 'reviewed', 'dismissed', 'actioned'].includes(status)) {
      return { ok: false, message: 'Report status is invalid.' };
    }
    const note = String(payload?.reviewNote || '').trim().slice(0, 500);
    const reviewedBy = status === 'open' ? null : currentUserId;
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
      return { ok: false, message: 'Report not found.' };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to update report: ${error.message}` };
  }
});

ipcMain.handle('admin:getStorageConfig', async () => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  try {
    if (!(await requirePlatformAdmin(currentUserId))) {
      return { ok: false, message: 'Platform admin access required.' };
    }
    const overview = await getAttachmentStorageOverview();
    return { ok: true, ...overview };
  } catch (error) {
    return { ok: false, message: `Failed to load storage config: ${error.message}` };
  }
});

ipcMain.handle('admin:updateCleanupSettings', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  try {
    if (!(await requirePlatformAdmin(currentUserId))) {
      return { ok: false, message: 'Platform admin access required.' };
    }
    const settings = await updateCleanupSettings({
      maxUploadMb: payload?.maxUploadMb,
      expireDays: payload?.expireDays,
      maxUploadsPerDay: payload?.maxUploadsPerDay,
      storageQuotaMb: payload?.storageQuotaMb,
      emptyServerCleanupDays: payload?.emptyServerCleanupDays,
      bannedUserCleanupDays: payload?.bannedUserCleanupDays,
      cleanupIntervalMinutes: payload?.cleanupIntervalMinutes
    });
    return { ok: true, config: settings };
  } catch (error) {
    return { ok: false, message: `Failed to update cleanup settings: ${error.message}` };
  }
});

ipcMain.handle('admin:runAttachmentCompressionBackfill', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  try {
    if (!(await requirePlatformAdmin(currentUserId))) {
      return { ok: false, message: 'Platform admin access required.' };
    }
    const summary = await backfillAttachmentCompressionBatch(payload?.limit);
    const overview = await getAttachmentStorageOverview();
    return { ok: true, summary, ...overview };
  } catch (error) {
    return { ok: false, message: `Failed to backfill attachment compression: ${error.message}` };
  }
});

ipcMain.handle('admin:listBanAppeals', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  try {
    if (!(await requirePlatformAdmin(currentUserId))) {
      return { ok: false, message: 'Platform admin access required.' };
    }
    const status = String(payload?.status || 'open').toLowerCase();
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
    return { ok: true, appeals: appeals.rows };
  } catch (error) {
    return { ok: false, message: `Failed to load ban appeals: ${error.message}` };
  }
});

ipcMain.handle('admin:updateBanAppeal', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }
  const appealId = Number(payload?.appealId);
  const status = String(payload?.status || '').toLowerCase();
  const allowed = new Set(['reviewed', 'dismissed', 'approved']);
  if (!appealId || !allowed.has(status)) {
    return { ok: false, message: 'Valid appeal and status are required.' };
  }
  try {
    if (!(await requirePlatformAdmin(currentUserId))) {
      return { ok: false, message: 'Platform admin access required.' };
    }
    const note = String(payload?.reviewNote || '').trim().slice(0, 1000) || null;
    const updated = await db.query(
      `UPDATE ban_appeals
       SET status = $1,
           reviewed_by_user_id = $2,
           reviewed_at = NOW(),
           review_note = $3
       WHERE id = $4
       RETURNING user_id`,
      [status, currentUserId, note, appealId]
    );
    if (updated.rows.length === 0) {
      return { ok: false, message: 'Appeal not found.' };
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
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to update ban appeal: ${error.message}` };
  }
});

ipcMain.handle('admin:listServers', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  try {
    if (!(await requirePlatformAdmin(currentUserId))) {
      return { ok: false, message: 'Platform admin access required.' };
    }

    const query = String(payload?.query || '').trim();
    const like = `%${query}%`;
    const servers = await db.query(
      `SELECT s.id,
              s.name,
              s.owner_user_id,
              s.created_at,
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
       GROUP BY s.id, s.name, s.owner_user_id, s.created_at, owner.username
       ORDER BY LOWER(s.name), s.id
       LIMIT 100`,
      [like, query]
    );

    return { ok: true, servers: servers.rows };
  } catch (error) {
    return { ok: false, message: `Failed to load servers: ${error.message}` };
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
    const admins = await db.query('SELECT id FROM users WHERE is_platform_admin = TRUE AND platform_banned_at IS NULL');
    for (const admin of admins.rows) {
      await createUserNotification(
        admin.id,
        'moderation',
        'New User Report',
        'A user report needs review.',
        { targetUserId, serverId, reporterUserId: currentUserId }
      );
    }
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

    const categories = await db.query(
      `SELECT id, server_id, name, position, created_at
       FROM channel_categories
       WHERE server_id = $1
       ORDER BY position, id`,
      [serverId]
    );
    const channels = await db.query(
      `SELECT id, name, type, category_id, position, created_at
       FROM channels
       WHERE server_id = $1
       ORDER BY COALESCE(category_id, 0), position, id`,
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
              COALESCE(a.original_file_size, a.file_size) AS attachment_file_size,
              COALESCE(a.stored_file_size, a.file_size) AS attachment_stored_file_size,
              a.compression_algorithm AS attachment_compression_algorithm,
              COALESCE(a.compression_saved_bytes, 0) AS attachment_compression_saved_bytes,
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

    return {
      ok: true,
      server: server.rows[0],
      categories: categories.rows,
      channels: channels.rows,
      members: members.rows,
      messages: messages.rows.map(normalizeAttachmentRow).reverse()
    };
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
      const settings = await getCleanupSettings();
      sendTerminationEmail(updated.rows[0].email, updated.rows[0].username, nextBanReason || nextStandingReason || 'Your account was terminated for Terms of Service violations.', {
        bannedUserCleanupDays: settings.bannedUserCleanupDays
      }).catch(() => {});
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
    await deleteAttachmentFilesForServer(serverId);
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

    await deleteAttachmentFilesForUser(targetUserId);
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
    const sender = await db.query('SELECT username FROM users WHERE id = $1', [currentUserId]);
    const notification = await createUserNotification(
      receiverId,
      'friend_request',
      'New Friend Request',
      `${sender.rows[0]?.username || 'Someone'} sent you a friend request.`,
      { senderUserId: currentUserId }
    );
    broadcastToUsers([receiverId], { type: 'friend-requests-changed', notification });
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
              u.username, u.avatar_url, u.platform_banned_at AS author_platform_banned_at,
              a.id AS attachment_id,
              a.original_filename AS attachment_original_filename,
              a.mime_type AS attachment_mime_type,
              COALESCE(a.original_file_size, a.file_size) AS attachment_file_size,
              COALESCE(a.stored_file_size, a.file_size) AS attachment_stored_file_size,
              a.compression_algorithm AS attachment_compression_algorithm,
              COALESCE(a.compression_saved_bytes, 0) AS attachment_compression_saved_bytes,
              a.expires_at AS attachment_expires_at
       FROM dm_messages m
       JOIN users u ON u.id = m.sender_user_id
       LEFT JOIN message_attachments a ON a.dm_message_id = m.id AND (a.expires_at IS NULL OR a.expires_at > NOW())
       WHERE (m.sender_user_id = $1 AND m.receiver_user_id = $2)
          OR (m.sender_user_id = $2 AND m.receiver_user_id = $1)
       ORDER BY m.created_at ASC
       LIMIT 300`,
      [currentUserId, partnerUserId]
    );

    return { ok: true, messages: messages.rows.map(normalizeAttachmentRow), currentUserId, partner: partner.rows[0] };
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
  const attachment = payload?.attachment || null;
  if (!partnerUserId || (!content && !attachment)) {
    return { ok: false, message: 'Partner and message content or an attachment are required.' };
  }

  try {
    const canDm = await canUsersDm(currentUserId, partnerUserId);
    if (!canDm) {
      return { ok: false, message: 'You can only DM friends or users in a shared server.' };
    }

    const moderationMessage = content ? await runMinimumAutoModeration({
      userId: currentUserId,
      partnerUserId,
      content
    }) : null;
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
    const savedAttachment = await saveIpcAttachment({ attachment, uploaderUserId: currentUserId, dmMessageId: inserted.rows[0].id });
    const message = {
      id: inserted.rows[0].id,
      user_id: inserted.rows[0].sender_user_id,
      receiver_user_id: inserted.rows[0].receiver_user_id,
      content: inserted.rows[0].content,
      created_at: inserted.rows[0].created_at,
      username: me.rows[0]?.username || 'Unknown',
      avatar_url: me.rows[0]?.avatar_url || '',
      attachment: savedAttachment
    };

    const notification = await createUserNotification(
      partnerUserId,
      'dm_message',
      `New DM from ${message.username}`,
      message.content || 'Sent an attachment.',
      { partnerUserId: currentUserId, messageId: message.id }
    );
    broadcastToUsers([currentUserId, partnerUserId], {
      type: 'dm-message-created',
      partnerUserId: currentUserId === partnerUserId ? null : currentUserId,
      fromUserId: currentUserId,
      notification
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

    const notification = await createUserNotification(
      partnerUserId,
      'dm_call',
      `${me?.username || 'Someone'} is calling you`,
      'Incoming personal call.',
      { partnerUserId: currentUserId, roomName }
    );
    broadcastToUsers([partnerUserId], {
      type: 'dm-call-started',
      fromUserId: currentUserId,
      fromUsername: me?.username || 'Unknown',
      partnerUserId,
      roomName,
      notification
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
    const access = await getUserChannelPermissions(currentUserId, channelId);
    if (!access) {
      return { ok: false, message: 'Access denied.' };
    }
    if (!access.permissions.view_channels || !access.permissions.read_message_history) {
      return { ok: false, message: 'You do not have permission to read this channel.' };
    }

    const messages = await db.query(
      `SELECT m.id, m.channel_id, m.user_id, m.content, m.created_at,
              u.username, u.avatar_url, u.platform_banned_at AS author_platform_banned_at,
              a.id AS attachment_id,
              a.original_filename AS attachment_original_filename,
              a.mime_type AS attachment_mime_type,
              COALESCE(a.original_file_size, a.file_size) AS attachment_file_size,
              COALESCE(a.stored_file_size, a.file_size) AS attachment_stored_file_size,
              a.compression_algorithm AS attachment_compression_algorithm,
              COALESCE(a.compression_saved_bytes, 0) AS attachment_compression_saved_bytes,
              a.expires_at AS attachment_expires_at
       FROM messages m
       JOIN users u ON u.id = m.user_id
       LEFT JOIN message_attachments a ON a.message_id = m.id AND (a.expires_at IS NULL OR a.expires_at > NOW())
       WHERE m.channel_id = $1
       ORDER BY m.created_at ASC
       LIMIT 200`,
      [channelId]
    );

    return { ok: true, messages: messages.rows.map(normalizeAttachmentRow), currentUserId };
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
  const attachment = payload?.attachment || null;

  if (!channelId || (!content && !attachment)) {
    return { ok: false, message: 'Channel and message content or an attachment are required.' };
  }

  try {
    const access = await getUserChannelPermissions(currentUserId, channelId);
    if (!access) {
      return { ok: false, message: 'Access denied.' };
    }
    if (!access.permissions.view_channels || !access.permissions.send_messages) {
      return { ok: false, message: 'You do not have permission to send messages in this channel.' };
    }
    if (attachment && !access.permissions.attach_files) {
      return { ok: false, message: 'You do not have permission to attach files in this channel.' };
    }
    const slowmodeSeconds = Number(access.channel.slowmode_seconds || 0);
    if (slowmodeSeconds > 0 && !access.permissions.manage_messages) {
      const recent = await db.query(
        `SELECT created_at
         FROM messages
         WHERE channel_id = $1 AND user_id = $2 AND created_at > NOW() - ($3::int * INTERVAL '1 second')
         ORDER BY created_at DESC
         LIMIT 1`,
        [channelId, currentUserId, slowmodeSeconds]
      );
      if (recent.rows.length > 0) {
        return { ok: false, message: `Slowmode is enabled. Wait ${slowmodeSeconds} seconds between messages.` };
      }
    }

    const moderationResult = content ? await handleServerAutoModeration(access.channel.server_id, channelId, currentUserId, content) : null;
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
    const savedAttachment = await saveIpcAttachment({ attachment, uploaderUserId: currentUserId, messageId: inserted.rows[0].id });
    const message = {
      ...inserted.rows[0],
      server_id: access.channel.server_id,
      username: user.rows[0]?.username || 'Unknown',
      avatar_url: user.rows[0]?.avatar_url || '',
      attachment: savedAttachment
    };

    broadcastToChannel(channelId, { type: 'message-created', channelId, message });
    await notifyChannelMessageTargets({
      channelId,
      senderUserId: currentUserId,
      content,
      message,
      channelName: access.channel.name
    });
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
    const channelAccess = await getUserChannelPermissions(currentUserId, access.rows[0].channel_id);
    if (!channelAccess?.permissions.view_channels || !channelAccess.permissions.send_messages) {
      return { ok: false, message: 'You do not have permission to edit messages in this channel.' };
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
    const channelAccess = await getUserChannelPermissions(currentUserId, access.rows[0].channel_id);
    if (!channelAccess?.permissions.view_channels) {
      return { ok: false, message: 'You do not have permission to view this channel.' };
    }
    if (access.rows[0].user_id !== currentUserId && !channelAccess.permissions.manage_messages) {
      return { ok: false, message: 'You can only delete your own messages.' };
    }

    await deleteAttachmentsForMessage(messageId);
    await db.query('DELETE FROM messages WHERE id = $1', [messageId]);
    const channelId = access.rows[0].channel_id;
    broadcastToChannel(channelId, { type: 'message-deleted', channelId, messageId });
    return { ok: true };
  } catch (error) {
    return { ok: false, message: `Failed to delete message: ${error.message}` };
  }
});

ipcMain.handle('attachments:getObjectUrl', async (_event, payload) => {
  if (!currentUserId) {
    return { ok: false, message: 'Not authenticated.' };
  }

  const rawUrl = String(payload?.url || '');
  const attachmentId = Number(rawUrl.split('/').pop());
  if (!attachmentId) {
    return { ok: false, message: 'Attachment id is required.' };
  }

  try {
    const attachment = await getAccessibleAttachment(currentUserId, attachmentId);
    if (!attachment) {
      return { ok: false, message: 'Attachment not found.' };
    }
    const data = await readAttachmentFile(attachment);
    return {
      ok: true,
      objectUrl: `data:${attachment.mime_type || 'application/octet-stream'};base64,${data.toString('base64')}`
    };
  } catch (error) {
    return { ok: false, message: `Failed to load attachment: ${error.message}` };
  }
});

app.whenReady().then(async () => {
  try {
    await db.connect();
    await runCleanupJobs();
    await scheduleCleanupJobs();
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
