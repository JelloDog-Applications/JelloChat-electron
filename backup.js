const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ZipArchive } = require('archiver');
const yauzl = require('yauzl');
const db = require('./db');

const MANIFEST_MAGIC = 'jellochat-backup';
const MANIFEST_VERSION = 1;

// Every table gets an explicit, hardcoded column list. Restore NEVER trusts column
// names from the uploaded archive -- only values (which are always parameterized).
// Ordered so that a table only ever depends on tables earlier in this list (safe
// insert order); restore deletes in the reverse of this order (children first).
const TABLES = [
  {
    name: 'users',
    idColumn: 'id',
    columns: [
      'id', 'username', 'email', 'password_hash', 'avatar_url', 'is_platform_admin',
      'platform_banned_at', 'platform_ban_reason', 'date_of_birth', 'email_verified',
      'email_verification_token_hash', 'email_verification_expires_at',
      'password_reset_token_hash', 'password_reset_expires_at', 'created_at',
      'account_standing', 'standing_reason', 'tos_violation_count', 'standing_updated_at',
      'tos_notified_version', 'tos_email_notified_version', 'privacy_notified_version',
      'privacy_email_notified_version', 'ban_deletion_reminder_sent_at'
    ]
  },
  {
    name: 'servers',
    idColumn: 'id',
    columns: ['id', 'name', 'icon_url', 'owner_user_id', 'created_at', 'empty_since']
  },
  {
    name: 'app_settings',
    idColumn: null,
    columns: ['key', 'value', 'updated_at']
  },
  {
    name: 'server_members',
    idColumn: null,
    columns: ['user_id', 'server_id', 'joined_at']
  },
  {
    name: 'server_roles',
    idColumn: 'id',
    columns: ['id', 'server_id', 'name', 'color', 'position', 'permissions', 'is_default', 'created_at']
  },
  {
    name: 'server_member_roles',
    idColumn: null,
    columns: ['user_id', 'server_id', 'role_id', 'created_at']
  },
  {
    name: 'channel_categories',
    idColumn: 'id',
    columns: ['id', 'server_id', 'name', 'position', 'created_at']
  },
  {
    name: 'channels',
    idColumn: 'id',
    columns: [
      'id', 'server_id', 'type', 'name', 'topic', 'slowmode_seconds', 'category_id',
      'position', 'created_at'
    ]
  },
  {
    name: 'channel_permission_overrides',
    idColumn: 'id',
    columns: [
      'id', 'server_id', 'scope_type', 'category_id', 'channel_id', 'target_type',
      'role_id', 'user_id', 'allow', 'deny', 'created_at', 'updated_at'
    ]
  },
  {
    name: 'messages',
    idColumn: 'id',
    columns: ['id', 'channel_id', 'user_id', 'content', 'created_at']
  },
  {
    name: 'dm_messages',
    idColumn: 'id',
    columns: ['id', 'sender_user_id', 'receiver_user_id', 'content', 'created_at']
  },
  {
    name: 'message_attachments',
    idColumn: 'id',
    columns: [
      'id', 'message_id', 'dm_message_id', 'uploader_user_id', 'original_filename',
      'stored_filename', 'mime_type', 'file_size', 'original_file_size', 'stored_file_size',
      'compression_algorithm', 'compression_saved_bytes', 'compression_checked_at',
      'encryption_iv', 'encryption_auth_tag', 'expires_at', 'created_at'
    ]
  },
  {
    name: 'server_invites',
    idColumn: 'id',
    columns: [
      'id', 'server_id', 'code', 'created_by_user_id', 'uses_count', 'max_uses',
      'expires_at', 'is_active', 'created_at'
    ]
  },
  {
    name: 'friend_requests',
    idColumn: 'id',
    columns: ['id', 'sender_user_id', 'receiver_user_id', 'status', 'created_at', 'responded_at']
  },
  {
    name: 'friendships',
    idColumn: null,
    columns: ['user_id', 'friend_user_id', 'created_at']
  },
  {
    name: 'user_reports',
    idColumn: 'id',
    columns: [
      'id', 'reporter_user_id', 'target_user_id', 'server_id', 'reason', 'status',
      'reviewed_by_user_id', 'reviewed_at', 'review_note', 'created_at'
    ]
  },
  {
    name: 'ban_appeals',
    idColumn: 'id',
    columns: [
      'id', 'user_id', 'reason', 'status', 'reviewed_by_user_id', 'reviewed_at',
      'review_note', 'created_at'
    ]
  },
  {
    name: 'user_passkeys',
    idColumn: 'id',
    columns: [
      'id', 'user_id', 'credential_id', 'public_key_spki', 'counter', 'transports',
      'label', 'created_at', 'last_used_at'
    ]
  },
  {
    name: 'user_ip_events',
    idColumn: 'id',
    columns: ['id', 'user_id', 'ip_address', 'event_type', 'user_agent', 'metadata', 'created_at']
  },
  {
    name: 'server_automod_events',
    idColumn: 'id',
    columns: ['id', 'server_id', 'user_id', 'rule', 'content_preview', 'created_at']
  },
  {
    name: 'discord_migration_sessions',
    idColumn: 'id',
    columns: [
      'id', 'code', 'requested_by_user_id', 'status', 'discord_guild_id',
      'discord_guild_name', 'discord_user_id', 'discord_username', 'imported_server_id',
      'error_message', 'expires_at', 'paired_at', 'imported_at', 'created_at'
    ]
  },
  {
    name: 'user_notifications',
    idColumn: 'id',
    columns: ['id', 'user_id', 'type', 'title', 'body', 'data', 'read_at', 'created_at']
  },
  {
    name: 'notification_preferences',
    idColumn: null,
    columns: [
      'user_id', 'dm_messages', 'mentions', 'channel_messages', 'friend_requests',
      'calls', 'moderation', 'updated_at'
    ]
  },
  {
    name: 'notification_push_tokens',
    idColumn: 'id',
    columns: ['id', 'user_id', 'platform', 'token', 'device_label', 'created_at', 'updated_at', 'last_seen_at']
  },
  {
    name: 'channel_read_states',
    idColumn: null,
    columns: ['user_id', 'channel_id', 'last_read_message_id', 'updated_at']
  },
  {
    name: 'dm_read_states',
    idColumn: null,
    columns: ['user_id', 'partner_user_id', 'last_read_message_id', 'updated_at']
  },
  {
    name: 'server_bans',
    idColumn: null,
    columns: ['server_id', 'user_id', 'banned_by_user_id', 'reason', 'created_at']
  }
];
// Deliberately excluded: auth_sessions -- ephemeral/security-sensitive, never
// exported or restored. Every user re-authenticates after any restore.

function isSafeRelativePath(entryName) {
  if (!entryName || entryName.startsWith('/') || entryName.includes('\0')) {
    return false;
  }
  const normalized = path.posix.normalize(entryName);
  if (normalized.startsWith('../') || normalized === '..' || path.posix.isAbsolute(normalized)) {
    return false;
  }
  return true;
}

async function createBackupArchive(res, { attachmentsDir }) {
  const archive = new ZipArchive({ zlib: { level: 6 } });
  archive.on('warning', (err) => console.warn('Backup archive warning:', err.message));
  archive.on('error', (err) => { throw err; });
  archive.pipe(res);

  const manifest = {
    magic: MANIFEST_MAGIC,
    version: MANIFEST_VERSION,
    exportedAt: new Date().toISOString(),
    tables: TABLES.map((t) => t.name),
    attachments: []
  };

  for (const table of TABLES) {
    const columnList = table.columns.map((c) => `"${c}"`).join(', ');
    const orderBy = table.idColumn ? `ORDER BY "${table.idColumn}"` : '';
    const result = await db.query(`SELECT ${columnList} FROM "${table.name}" ${orderBy}`);
    archive.append(JSON.stringify(result.rows), { name: `data/${table.name}.json` });
  }

  if (fs.existsSync(attachmentsDir)) {
    const files = await fs.promises.readdir(attachmentsDir);
    for (const file of files) {
      const fullPath = path.join(attachmentsDir, file);
      const stat = await fs.promises.stat(fullPath);
      if (stat.isFile()) {
        manifest.attachments.push(file);
        archive.file(fullPath, { name: `attachments/${file}` });
      }
    }
  }

  archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });
  await archive.finalize();
}

async function readZipEntryToBuffer(zipfile, entry) {
  return new Promise((resolve, reject) => {
    zipfile.openReadStream(entry, (err, readStream) => {
      if (err) {
        reject(err);
        return;
      }
      const chunks = [];
      readStream.on('data', (chunk) => chunks.push(chunk));
      readStream.on('end', () => resolve(Buffer.concat(chunks)));
      readStream.on('error', reject);
    });
  });
}

async function extractArchive(zipPath, destDir) {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true, autoClose: true }, (err, zipfile) => {
      if (err) {
        reject(err);
        return;
      }
      const extractedFiles = new Map();
      zipfile.readEntry();
      zipfile.on('entry', (entry) => {
        const isDirectory = /\/$/.test(entry.fileName);
        // Reject symlinks outright -- the upper 16 bits of externalFileAttributes hold
        // Unix mode bits when the archive was created on a Unix-like system; 0o120000
        // is S_IFLNK. Fail the whole restore rather than silently skip, since a
        // symlink entry indicates a deliberately crafted malicious archive.
        const unixMode = (entry.externalFileAttributes >>> 16) & 0xffff;
        const isSymlink = (unixMode & 0xf000) === 0o120000;
        if (isSymlink) {
          zipfile.close();
          reject(new Error(`Backup archive contains a symlink entry ("${entry.fileName}") and was rejected.`));
          return;
        }
        if (!isSafeRelativePath(entry.fileName)) {
          zipfile.close();
          reject(new Error(`Backup archive contains an unsafe path ("${entry.fileName}") and was rejected.`));
          return;
        }
        const destPath = path.join(destDir, entry.fileName);
        const resolvedDest = path.resolve(destPath);
        const resolvedBase = path.resolve(destDir);
        if (resolvedDest !== resolvedBase && !resolvedDest.startsWith(resolvedBase + path.sep)) {
          zipfile.close();
          reject(new Error(`Backup archive entry ("${entry.fileName}") resolves outside the extraction directory.`));
          return;
        }
        if (isDirectory) {
          fs.mkdirSync(resolvedDest, { recursive: true });
          zipfile.readEntry();
          return;
        }
        fs.mkdirSync(path.dirname(resolvedDest), { recursive: true });
        readZipEntryToBuffer(zipfile, entry)
          .then((buffer) => {
            fs.writeFileSync(resolvedDest, buffer);
            extractedFiles.set(entry.fileName, resolvedDest);
            zipfile.readEntry();
          })
          .catch((error) => {
            zipfile.close();
            reject(error);
          });
      });
      zipfile.on('end', () => resolve(extractedFiles));
      zipfile.on('error', reject);
    });
  });
}

function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    throw new Error('Backup archive is missing a valid manifest.json.');
  }
  if (manifest.magic !== MANIFEST_MAGIC) {
    throw new Error('This file is not a JelloChat backup archive.');
  }
  if (manifest.version !== MANIFEST_VERSION) {
    throw new Error(`Unsupported backup format version: ${manifest.version}.`);
  }
  if (!Array.isArray(manifest.tables) || !Array.isArray(manifest.attachments)) {
    throw new Error('Backup archive manifest is malformed.');
  }
}

async function restoreFromBackupArchive(zipPath, { attachmentsDir }) {
  const tempDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'jellochat-restore-'));
  try {
    const extractedFiles = await extractArchive(zipPath, tempDir);

    const manifestPath = extractedFiles.get('manifest.json');
    if (!manifestPath) {
      throw new Error('Backup archive is missing manifest.json.');
    }
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    validateManifest(manifest);

    const knownAttachmentNames = new Set(manifest.attachments);
    for (const relativeName of extractedFiles.keys()) {
      if (relativeName.startsWith('attachments/')) {
        const fileName = relativeName.slice('attachments/'.length);
        if (!knownAttachmentNames.has(fileName)) {
          throw new Error(`Backup archive contains an attachment not listed in its manifest ("${fileName}").`);
        }
      }
    }

    const tableData = {};
    for (const table of TABLES) {
      const dataPath = extractedFiles.get(`data/${table.name}.json`);
      if (!dataPath) {
        tableData[table.name] = [];
        continue;
      }
      const rows = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      if (!Array.isArray(rows)) {
        throw new Error(`Backup archive's data for "${table.name}" is malformed.`);
      }
      tableData[table.name] = rows;
    }

    await db.withTransaction(async (client) => {
      for (const table of [...TABLES].reverse()) {
        await client.query(`DELETE FROM "${table.name}"`);
      }

      for (const table of TABLES) {
        const rows = tableData[table.name];
        if (!rows.length) {
          continue;
        }
        const columnList = table.columns.map((c) => `"${c}"`).join(', ');
        const placeholders = table.columns.map((_, i) => `$${i + 1}`).join(', ');
        const insertSql = `INSERT INTO "${table.name}" (${columnList}) VALUES (${placeholders})`;
        for (const row of rows) {
          // Only known, hardcoded columns are ever read from the untrusted row object --
          // extra/unexpected keys in the archive's JSON are silently ignored, never
          // used to build SQL.
          const values = table.columns.map((col) => (col in row ? row[col] : null));
          await client.query(insertSql, values);
        }

        if (table.idColumn) {
          await client.query(
            `SELECT setval(pg_get_serial_sequence($1, $2), COALESCE((SELECT MAX("${table.idColumn}") FROM "${table.name}"), 1), true)`,
            [table.name, table.idColumn]
          );
        }
      }
    });

    if (fs.existsSync(attachmentsDir)) {
      for (const fileName of knownAttachmentNames) {
        const src = extractedFiles.get(`attachments/${fileName}`);
        if (src) {
          fs.copyFileSync(src, path.join(attachmentsDir, fileName));
        }
      }
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

module.exports = { createBackupArchive, restoreFromBackupArchive, TABLES, isSafeRelativePath };
