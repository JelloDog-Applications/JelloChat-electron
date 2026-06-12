# Server Setup Wiki

This guide explains how to run a JelloChat server for local testing or for a public deployment.

JelloChat has two main server modes:

- Desktop mode: `npm start` runs the Electron app and local backend.
- Web mode: `npm run web` runs `server.js` for browser, mobile, and hosted use.

For a public server, use web mode behind HTTPS.

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL 14 or newer
- A domain name for public hosting
- HTTPS reverse proxy, such as Nginx, Caddy, Traefik, or a cloud proxy
- Optional: LiveKit for voice channels
- Optional: SMTP account for email verification, password reset, policy updates, and admin mail
- Optional: Discord bot token for Discord server migration

## 1. Clone and Install

```bash
git clone https://github.com/JelloDog-Applications/JelloChat-electron.git
cd JelloChat-electron
npm ci
```

For a production Linux server, you can install only production dependencies:

```bash
npm ci --omit=dev
```

## 2. Create the Database

Create a PostgreSQL database and user. Example:

```sql
CREATE DATABASE jellochat;
CREATE USER jellochat WITH PASSWORD 'replace_with_a_strong_password';
GRANT ALL PRIVILEGES ON DATABASE jellochat TO jellochat;
```

Then apply the schema:

```bash
psql -U jellochat -d jellochat -f sql/schema.sql
```

The app also applies `sql/schema.sql` during startup through `db.js`, but running it once manually is useful because it catches database permission problems early.

## 3. Configure `.env`

Copy the example file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and set at least:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jellochat
DB_USER=jellochat
DB_PASSWORD=replace_with_a_strong_password
WEB_PORT=3000
WS_PORT=3131
APP_PUBLIC_URL=https://chat.example.com
APP_ALLOWED_ORIGINS=https://chat.example.com
ATTACHMENTS_DIR=uploads/attachments
ATTACHMENT_ENCRYPTION_KEY=replace_with_a_long_random_secret
```

Generate a random attachment encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Do not commit `.env`, database passwords, SMTP keys, LiveKit secrets, Discord bot tokens, signing keys, or generated encryption keys.

## 4. Start the Server

For local browser testing:

```bash
npm run web
```

Open:

```text
http://localhost:3000
```

For desktop development:

```bash
npm start
```

## 5. Put It Behind HTTPS

For public hosting, expose the app through HTTPS and proxy to `WEB_PORT`.

Example Nginx shape:

```nginx
server {
  server_name chat.example.com;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }

  location /ws {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }
}
```

Use your normal TLS tool, such as Certbot, Caddy automatic HTTPS, or your host's managed certificate.

## 6. Run as a Service

For Linux production, run `npm run web` under a service manager. This repo includes a systemd guide:

[Deploying JelloChat with systemd](./DEPLOYMENT.md)

Basic checks:

```bash
sudo systemctl status jellochat
journalctl -u jellochat -f
```

## 7. Configure Voice Channels

Voice channels require LiveKit. Add these to `.env`:

```env
LIVEKIT_URL=wss://your-livekit-host
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

If LiveKit is not configured, text chat can still run, but voice join will fail.

## 8. Configure Email

JelloChat uses SMTP for account and admin emails. The example file uses Brevo variable names, but any SMTP provider can work if the values match your provider:

```env
BREVO_SMTP_HOST=smtp.example.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_smtp_username
BREVO_SMTP_PASS=your_smtp_password
BREVO_FROM_EMAIL=no-reply@example.com
BREVO_FROM_NAME=JelloChat
```

For a public server, use a real sender domain with SPF, DKIM, and DMARC configured.

## 9. Configure Discord Migration Bot

Discord migration is optional. It imports server structure such as categories and channels. It does not need to migrate message history.

Create a Discord application and bot, then set:

```env
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_BOT_CLIENT_ID=your_discord_application_client_id
DISCORD_BOT_PERMISSIONS=274878024704
```

Restart the JelloChat server after changing these values. Users can start a migration from the New Server flow, invite the bot, link with the generated code, and approve the migration from Discord.

## 10. Attachments and Cleanup

Relevant `.env` values:

```env
ATTACHMENTS_DIR=uploads/attachments
ATTACHMENT_MAX_MB=10
ATTACHMENT_EXPIRE_DAYS=30
ATTACHMENT_MAX_UPLOADS_PER_DAY=50
ATTACHMENT_STORAGE_QUOTA_MB=0
CLEANUP_EMPTY_SERVER_DAYS=7
CLEANUP_BANNED_USER_DAYS=30
CLEANUP_INTERVAL_MINUTES=60
```

Make sure the service user can write to `ATTACHMENTS_DIR`.

Back up the database and attachment directory together. Database-only backups will lose uploaded file contents.

## 11. Updating a Server

```bash
git pull
npm ci --omit=dev
psql -U jellochat -d jellochat -f sql/schema.sql
sudo systemctl restart jellochat
```

If you are running manually instead of systemd, stop and restart `npm run web`.

## 12. Public Repo Safety Checklist

Before pushing changes:

- Do not commit `.env`.
- Do not commit `uploads/`.
- Do not commit database dumps with real users.
- Do not commit app signing keys or keystores.
- Rotate any token that was accidentally committed.
- Keep `.env.example` fake and safe for public viewing.

## Troubleshooting

Database login fails:

- Check `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`.
- Confirm the PostgreSQL user can connect and create tables.

Page loads but realtime updates do not work:

- Make sure `/ws` is proxied with WebSocket upgrade headers.
- Check `APP_PUBLIC_URL` and `APP_ALLOWED_ORIGINS`.

Voice does not connect:

- Check `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`.
- Confirm the LiveKit host is reachable from the user's browser.

Uploads fail:

- Check `ATTACHMENTS_DIR` exists and is writable.
- Check `ATTACHMENT_MAX_MB` and storage quota settings.

Discord migration does not link:

- Check `DISCORD_BOT_TOKEN` and `DISCORD_BOT_CLIENT_ID`.
- Confirm the bot is online.
- Confirm the bot was invited to the Discord server with the required permissions.
