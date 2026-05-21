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
  owner_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE servers
ADD COLUMN IF NOT EXISTS owner_user_id INT REFERENCES users(id) ON DELETE SET NULL;

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
  position INT NOT NULL DEFAULT 0,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE channels
ADD COLUMN IF NOT EXISTS type VARCHAR(10) NOT NULL DEFAULT 'text';

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
