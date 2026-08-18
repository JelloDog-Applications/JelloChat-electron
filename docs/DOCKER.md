# Running JelloChat with Docker

This is an alternative to the manual Node/PostgreSQL install in [Server Setup Wiki](./SERVER_SETUP.md). It runs the web server (`server.js`) and PostgreSQL together via Docker Compose — no Node or PostgreSQL install needed on the host, just Docker.

## Requirements

- Docker Engine with the Compose plugin (`docker compose version`)
- A domain name and HTTPS reverse proxy for public hosting (same as bare-metal — see below)

## 1. Configure `.env`

```bash
cp .env.example .env
```

Edit `.env` and set at least `DB_PASSWORD` to a strong password. Leave `DB_HOST` as-is — Compose overrides it automatically to point at the `postgres` service, regardless of what's in the file. Everything else in `.env.example` works the same as the bare-metal guide: `APP_PUBLIC_URL`, `ATTACHMENT_ENCRYPTION_KEY`, and the optional SMTP/LiveKit/Discord variables. Generate a random attachment encryption key the same way:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Do not commit `.env`.

## 2. Start

```bash
docker compose up -d
```

This builds the app image, starts PostgreSQL first and waits for it to report healthy, then starts the app. Postgres data lives in the `postgres_data` volume and uploaded attachments live in `attachments_data` — both persist across restarts and rebuilds.

Watch the logs for the first-run setup token:

```bash
docker compose logs -f app
```

## 3. Finish setup

Open `http://<host>:3000/setup` and complete the wizard using the token printed in the logs — this creates the admin account and lets you configure (or skip) the default server, SMTP, LiveKit, and Discord bot. See the setup wizard's own guidance in-app; nothing Docker-specific here.

## Migrating an existing install to Docker

If you're moving data from an existing bare-metal/npm install (or any other JelloChat instance) into this Docker instance, use the built-in backup/restore feature instead of copying the database or `uploads/` folder by hand:

1. On the **old** instance, sign in as a platform admin, open the user menu → **Admin Console** → **Backup**, and click **Export Backup**. This downloads a single `.zip` containing the full database and all attachment files.
2. Copy the old instance's `ATTACHMENT_ENCRYPTION_KEY` value (from its `.env`) into the new Docker instance's `.env`, **unchanged**. Attachments are encrypted at rest with this key — if the new instance uses a different key, restored attachments won't decrypt.
3. Start the Docker instance (`docker compose up -d`) and open `http://<host>:3000/setup`. Enter the setup token from `docker compose logs -f app`, then on the next screen choose **Restore From Backup** instead of "Set Up Fresh," and upload the `.zip` from step 1.
4. Once the restore finishes, log in with your existing account credentials from the old instance — restoring rebuilds the original users, servers, messages, and attachments, so there's no new admin account to create.

The same Backup tab also supports restoring over an **already-running** instance (for rollback/disaster-recovery), not just fresh setup — see the Admin Console's Backup tab. That path replaces all current data and signs out every session, so it's meant for recovery, not routine migration. Keep exported archives private: they contain password hashes and any configured SMTP/LiveKit/Discord credentials.

## 4. Put it behind HTTPS

Same as the bare-metal guide's [reverse proxy section](./SERVER_SETUP.md#5-put-it-behind-https) — point Nginx/Caddy/Traefik at the container's mapped `WEB_PORT` (default `3000`) on the host. Docker doesn't change the TLS story at all.

## 5. Updating

```bash
git pull
docker compose up -d --build
```

The app applies `sql/schema.sql` automatically on boot (idempotent), so there's no separate migration step — same as bare-metal.

## 6. Stopping / resetting

```bash
docker compose down          # stop containers, keep data
docker compose down -v       # stop containers AND delete both volumes (destructive)
```

## Troubleshooting

Works on `localhost` from the host machine, but not from other devices on your network (e.g. testing the mobile app against a self-hosted Docker instance):

- On **Docker Desktop for Windows/Mac**, this is almost always Docker Desktop's own **Port binding behavior** setting, not a firewall or router issue. Open Docker Desktop → Settings → Resources → Network, and check **Port binding behavior**. If it's set to "Localhost by default" / "Localhost only", published ports (including this app's `3000:3000`) only bind to loopback and are never reachable from your LAN, regardless of what `docker-compose.yml` says. Change it to **"Open (Default)"** and click Apply. This does not require restarting WSL or changing any Windows networking mode — it's a straightforward Docker Desktop setting.
- This does not apply to a real Linux server (no Docker Desktop involved) — there, published ports are LAN-reachable by default with no extra configuration.

App container keeps restarting:

- `docker compose logs app` — if it's a database connection error, confirm the `postgres` service reports healthy (`docker compose ps`); the app has no internal retry logic, so it exits if Postgres isn't ready yet, and Compose's `restart: unless-stopped` + Postgres healthcheck exist specifically to handle that ordering.

Uploads not persisting / disappearing after a rebuild:

- Confirm you're not running `docker compose down -v`, which deletes the `attachments_data` volume along with `postgres_data`.

Everything else (SMTP, LiveKit, Discord, WebSocket/proxy issues) — see the [Troubleshooting section](./SERVER_SETUP.md#troubleshooting) in the main setup guide; it applies identically inside the container.
