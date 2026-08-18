# JelloDog Chat

A self-hostable, Discord-like chat platform. One codebase runs as a web server, an Electron desktop app, and an Android app.

## Features

- Servers, channels (text and voice), and channel categories with per-channel permission overrides
- Roles and role-based permissions per server
- Friends (requests, accept/reject) and direct messages
- Voice channels with LiveKit — audio and screen sharing
- Attachments with size/quota limits and automatic expiry cleanup
- Passkey (WebAuthn) sign-in, in addition to email/password
- Email verification, password reset, and account notifications (optional SMTP)
- Discord migration tool — import a Discord server's channel structure via a bot
- Platform admin console: user/report/ban-appeal management, server oversight, storage policy
- Live updates over WebSocket
- Guided first-run setup wizard (`/setup`) — create the admin account and configure the default server, SMTP, LiveKit, and the Discord bot from the browser, no manual `.env` editing required for any of it
- Runs as a web server (browser + mobile), an Electron desktop app, or an Android app

## Quick start (Docker)

The fastest way to run your own server:

```bash
cp .env.example .env
# edit .env, set at least DB_PASSWORD
docker compose up -d
```

Then open `http://localhost:3000/setup` and follow the wizard. See [docs/DOCKER.md](./docs/DOCKER.md) for details, reverse-proxy/HTTPS notes, and troubleshooting.

## Quick start (manual)

For a bare-metal install (Node + PostgreSQL directly on the host), or for running as a systemd service, see the full guides:

- [docs/SERVER_SETUP.md](./docs/SERVER_SETUP.md) — install, configure `.env`, run in web mode, HTTPS
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) — systemd service setup

In short:

```bash
npm ci
cp .env.example .env   # edit DB credentials and other settings
npm run web
```

Then open `http://localhost:3000/setup` to finish configuration.

## Desktop app

```bash
npm start
```

Runs the Electron app with its own embedded backend, connecting directly to PostgreSQL using the same `.env`.

## Mobile app

The Android app is built with Capacitor and points at any JelloChat server (default or self-hosted, changeable from the login screen's Server URL option). See [docs/FDROID.md](./docs/FDROID.md) for the F-Droid build, or grab a release from the [GitHub Releases page](https://github.com/JelloDog-Applications/JelloChat-electron/releases).

## Configuring the server

Everything below is optional and can be set either in `.env` before first boot, or through the setup wizard at `/setup` on first run:

- **SMTP** (email verification, password reset, admin mail) — without it, new accounts are auto-verified instead of requiring email confirmation.
- **LiveKit** (voice channels and screen sharing) — without it, text chat still works but voice join fails cleanly.
- **Discord bot token** (Discord server migration) — optional; requires a restart after being set via the wizard.

Most other settings (attachment limits, cleanup policy, storage quota) are managed post-login from the Admin Console rather than `.env`.

## License

JelloDog Chat is licensed under the GNU Affero General Public License v3.0 or later. See [LICENSE](./LICENSE).
