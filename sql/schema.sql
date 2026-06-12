CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  is_platform_admin BOOLEAN NOT NULL DEFAULT FALSE,
  platform_banned_at TIMESTAMPTZ,
  platform_ban_reason TEXT,
  date_of_birth DATE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  email_verification_token_hash TEXT,
  email_verification_expires_at TIMESTAMPTZ,
  password_reset_token_hash TEXT,
  password_reset_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verification_token_hash TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMPTZ;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_token_hash TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_platform_admin BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS platform_banned_at TIMESTAMPTZ;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS platform_ban_reason TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS account_standing VARCHAR(20) NOT NULL DEFAULT 'good';

ALTER TABLE users
ADD COLUMN IF NOT EXISTS standing_reason TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS tos_violation_count INT NOT NULL DEFAULT 0;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS standing_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE users
ADD COLUMN IF NOT EXISTS tos_notified_version VARCHAR(40);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS tos_email_notified_version VARCHAR(40);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS privacy_notified_version VARCHAR(40);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS privacy_email_notified_version VARCHAR(40);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS ban_deletion_reminder_sent_at TIMESTAMPTZ;

DO $$
DECLARE
  rec RECORD;
  base_name TEXT;
  candidate TEXT;
BEGIN
  FOR rec IN
    SELECT id, username
    FROM users
    WHERE username !~ '#[0-9]{4}$'
  LOOP
    base_name := LEFT(REGEXP_REPLACE(TRIM(rec.username), '#[0-9]{4}$', '', 'i'), 45);
    IF LENGTH(base_name) < 2 THEN
      base_name := 'user';
    END IF;

    LOOP
      candidate := base_name || '#' || LPAD((FLOOR(RANDOM() * 10000))::INT::TEXT, 4, '0');
      EXIT WHEN NOT EXISTS (
        SELECT 1
        FROM users u
        WHERE LOWER(u.username) = LOWER(candidate)
      );
    END LOOP;

    UPDATE users
    SET username = candidate
    WHERE id = rec.id;
  END LOOP;
END $$;

CREATE TABLE IF NOT EXISTS servers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  icon_url TEXT,
  owner_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  empty_since TIMESTAMPTZ
);

ALTER TABLE servers
ADD COLUMN IF NOT EXISTS owner_user_id INT REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE servers
ADD COLUMN IF NOT EXISTS icon_url TEXT;

ALTER TABLE servers
ADD COLUMN IF NOT EXISTS empty_since TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS server_members (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  server_id INT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, server_id)
);

CREATE TABLE IF NOT EXISTS server_roles (
  id SERIAL PRIMARY KEY,
  server_id INT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL,
  color VARCHAR(7) NOT NULL DEFAULT '#99aab5',
  position INT NOT NULL DEFAULT 0,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE server_roles
ADD COLUMN IF NOT EXISTS color VARCHAR(7) NOT NULL DEFAULT '#99aab5';

CREATE TABLE IF NOT EXISTS server_member_roles (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  server_id INT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  role_id INT NOT NULL REFERENCES server_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, server_id, role_id)
);

CREATE TABLE IF NOT EXISTS user_reports (
  id BIGSERIAL PRIMARY KEY,
  reporter_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  server_id INT REFERENCES servers(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  reviewed_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_reports
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'open';

ALTER TABLE user_reports
ADD COLUMN IF NOT EXISTS reviewed_by_user_id INT REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE user_reports
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE user_reports
ADD COLUMN IF NOT EXISTS review_note TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_reports_status_check'
  ) THEN
    ALTER TABLE user_reports
    ADD CONSTRAINT user_reports_status_check
    CHECK (status IN ('open', 'reviewed', 'dismissed', 'actioned'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_reports_status_created_at
ON user_reports (status, created_at DESC);

CREATE TABLE IF NOT EXISTS ban_appeals (
  id BIGSERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  reviewed_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status IN ('open', 'reviewed', 'dismissed', 'approved'))
);

CREATE INDEX IF NOT EXISTS idx_ban_appeals_status_created_at
ON ban_appeals (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ban_appeals_user_created_at
ON ban_appeals (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS user_passkeys (
  id BIGSERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key_spki TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  transports TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  label VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_passkeys_user_id
ON user_passkeys (user_id);

CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id
ON auth_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at
ON auth_sessions (expires_at);

CREATE TABLE IF NOT EXISTS user_ip_events (
  id BIGSERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET NOT NULL,
  event_type VARCHAR(40) NOT NULL,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_ip_events_user_created_at
ON user_ip_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_ip_events_ip_created_at
ON user_ip_events (ip_address, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_ip_events_event_created_at
ON user_ip_events (event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS server_automod_events (
  id BIGSERIAL PRIMARY KEY,
  server_id INT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rule VARCHAR(40) NOT NULL,
  content_preview TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS channels (
  id SERIAL PRIMARY KEY,
  server_id INT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL DEFAULT 'text',
  name VARCHAR(80) NOT NULL,
  topic TEXT NOT NULL DEFAULT '',
  slowmode_seconds INT NOT NULL DEFAULT 0,
  category_id INT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE channels
ADD COLUMN IF NOT EXISTS type VARCHAR(10) NOT NULL DEFAULT 'text';

ALTER TABLE channels
ADD COLUMN IF NOT EXISTS topic TEXT NOT NULL DEFAULT '';

ALTER TABLE channels
ADD COLUMN IF NOT EXISTS slowmode_seconds INT NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS channel_categories (
  id SERIAL PRIMARY KEY,
  server_id INT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE channels
ADD COLUMN IF NOT EXISTS category_id INT REFERENCES channel_categories(id) ON DELETE SET NULL;

ALTER TABLE channels
ADD COLUMN IF NOT EXISTS position INT NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'channels_category_id_fkey'
  ) THEN
    ALTER TABLE channels
    ADD CONSTRAINT channels_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES channel_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_channel_categories_server_position
ON channel_categories (server_id, position, id);

CREATE TABLE IF NOT EXISTS channel_permission_overrides (
  id BIGSERIAL PRIMARY KEY,
  server_id INT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  scope_type VARCHAR(16) NOT NULL CHECK (scope_type IN ('category', 'channel')),
  category_id INT REFERENCES channel_categories(id) ON DELETE CASCADE,
  channel_id INT REFERENCES channels(id) ON DELETE CASCADE,
  target_type VARCHAR(16) NOT NULL CHECK (target_type IN ('role', 'member')),
  role_id INT REFERENCES server_roles(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  allow JSONB NOT NULL DEFAULT '{}'::jsonb,
  deny JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (scope_type = 'category' AND category_id IS NOT NULL AND channel_id IS NULL)
    OR (scope_type = 'channel' AND channel_id IS NOT NULL AND category_id IS NULL)
  ),
  CHECK (
    (target_type = 'role' AND role_id IS NOT NULL AND user_id IS NULL)
    OR (target_type = 'member' AND user_id IS NOT NULL AND role_id IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_channel_permission_overrides_scope_target
ON channel_permission_overrides (
  server_id,
  scope_type,
  COALESCE(category_id, 0),
  COALESCE(channel_id, 0),
  target_type,
  COALESCE(role_id, 0),
  COALESCE(user_id, 0)
);

CREATE INDEX IF NOT EXISTS idx_channel_permission_overrides_server_scope
ON channel_permission_overrides (server_id, scope_type, category_id, channel_id);

CREATE INDEX IF NOT EXISTS idx_channels_server_category_position
ON channels (server_id, category_id, position, id);

CREATE TABLE IF NOT EXISTS discord_migration_sessions (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(16) NOT NULL UNIQUE,
  requested_by_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(24) NOT NULL DEFAULT 'pending',
  discord_guild_id TEXT,
  discord_guild_name TEXT,
  discord_user_id TEXT,
  discord_username TEXT,
  imported_server_id INT REFERENCES servers(id) ON DELETE SET NULL,
  error_message TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  paired_at TIMESTAMPTZ,
  imported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status IN ('pending', 'paired', 'importing', 'imported', 'failed', 'expired'))
);

CREATE INDEX IF NOT EXISTS idx_discord_migration_sessions_user_created_at
ON discord_migration_sessions (requested_by_user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id BIGSERIAL PRIMARY KEY,
  channel_id INT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS server_invites (
  id SERIAL PRIMARY KEY,
  server_id INT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL UNIQUE,
  created_by_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  uses_count INT NOT NULL DEFAULT 0,
  max_uses INT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (max_uses IS NULL OR max_uses > 0),
  CHECK (uses_count >= 0)
);

CREATE TABLE IF NOT EXISTS friend_requests (
  id SERIAL PRIMARY KEY,
  sender_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  CHECK (sender_user_id <> receiver_user_id),
  CHECK (status IN ('pending', 'accepted', 'rejected'))
);

CREATE TABLE IF NOT EXISTS friendships (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, friend_user_id),
  CHECK (user_id <> friend_user_id)
);

CREATE TABLE IF NOT EXISTS dm_messages (
  id BIGSERIAL PRIMARY KEY,
  sender_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (sender_user_id <> receiver_user_id)
);

CREATE INDEX IF NOT EXISTS idx_dm_pair_created_at
ON dm_messages (
  LEAST(sender_user_id, receiver_user_id),
  GREATEST(sender_user_id, receiver_user_id),
  created_at
);

CREATE TABLE IF NOT EXISTS user_notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_created_at
ON user_notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user_read_at
ON user_notifications (user_id, read_at);

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  dm_messages BOOLEAN NOT NULL DEFAULT TRUE,
  mentions BOOLEAN NOT NULL DEFAULT TRUE,
  channel_messages BOOLEAN NOT NULL DEFAULT FALSE,
  friend_requests BOOLEAN NOT NULL DEFAULT TRUE,
  calls BOOLEAN NOT NULL DEFAULT TRUE,
  moderation BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_push_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(32) NOT NULL,
  token TEXT NOT NULL UNIQUE,
  device_label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_push_tokens_user_id
ON notification_push_tokens (user_id);

CREATE TABLE IF NOT EXISTS channel_read_states (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_id INT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  last_read_message_id BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, channel_id)
);

CREATE TABLE IF NOT EXISTS dm_read_states (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_message_id BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, partner_user_id),
  CHECK (user_id <> partner_user_id)
);

CREATE TABLE IF NOT EXISTS message_attachments (
  id BIGSERIAL PRIMARY KEY,
  message_id BIGINT REFERENCES messages(id) ON DELETE CASCADE,
  dm_message_id BIGINT REFERENCES dm_messages(id) ON DELETE CASCADE,
  uploader_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  file_size BIGINT NOT NULL,
  original_file_size BIGINT,
  stored_file_size BIGINT,
  compression_algorithm TEXT,
  compression_saved_bytes BIGINT NOT NULL DEFAULT 0,
  compression_checked_at TIMESTAMPTZ,
  encryption_iv TEXT,
  encryption_auth_tag TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (message_id IS NOT NULL AND dm_message_id IS NULL)
    OR (message_id IS NULL AND dm_message_id IS NOT NULL)
  ),
  CHECK (file_size > 0)
);

ALTER TABLE message_attachments
ADD COLUMN IF NOT EXISTS encryption_iv TEXT;

ALTER TABLE message_attachments
ADD COLUMN IF NOT EXISTS encryption_auth_tag TEXT;

ALTER TABLE message_attachments
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

ALTER TABLE message_attachments
ADD COLUMN IF NOT EXISTS original_file_size BIGINT;

ALTER TABLE message_attachments
ADD COLUMN IF NOT EXISTS stored_file_size BIGINT;

ALTER TABLE message_attachments
ADD COLUMN IF NOT EXISTS compression_algorithm TEXT;

ALTER TABLE message_attachments
ADD COLUMN IF NOT EXISTS compression_saved_bytes BIGINT NOT NULL DEFAULT 0;

ALTER TABLE message_attachments
ADD COLUMN IF NOT EXISTS compression_checked_at TIMESTAMPTZ;

UPDATE message_attachments
SET original_file_size = file_size
WHERE original_file_size IS NULL;

UPDATE message_attachments
SET stored_file_size = file_size
WHERE stored_file_size IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'message_attachments_compression_algorithm_check'
  ) THEN
    ALTER TABLE message_attachments
    ADD CONSTRAINT message_attachments_compression_algorithm_check
    CHECK (compression_algorithm IS NULL OR compression_algorithm IN ('brotli'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_message_attachments_message_id
ON message_attachments (message_id);

CREATE INDEX IF NOT EXISTS idx_message_attachments_dm_message_id
ON message_attachments (dm_message_id);

CREATE INDEX IF NOT EXISTS idx_message_attachments_uploader_created_at
ON message_attachments (uploader_user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_message_attachments_expires_at
ON message_attachments (expires_at);

CREATE TABLE IF NOT EXISTS server_bans (
  server_id INT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  banned_by_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (server_id, user_id),
  CHECK (server_id > 0)
);

UPDATE servers s
SET owner_user_id = members.user_id
FROM (
  SELECT server_id, MIN(user_id) AS user_id
  FROM server_members
  GROUP BY server_id
) members
WHERE s.id = members.server_id
  AND s.owner_user_id IS NULL;

INSERT INTO servers (name)
SELECT 'Jello HQ'
WHERE NOT EXISTS (SELECT 1 FROM servers WHERE name = 'Jello HQ');

INSERT INTO channels (server_id, type, name)
SELECT s.id, 'text', c.name
FROM servers s
CROSS JOIN (VALUES ('general'), ('dev-chat'), ('memes')) AS c(name)
WHERE s.name = 'Jello HQ'
  AND NOT EXISTS (
    SELECT 1
    FROM channels x
    WHERE x.server_id = s.id AND x.name = c.name
  );
