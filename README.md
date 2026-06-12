# JelloChat (Electron + PostgreSQL)

A simple Discord-like desktop app built with Electron and PostgreSQL.

## Features

- Register / login (passwords hashed with bcrypt)
- Server list, channels, and messages UI
- Create servers and channels in-app
- Server creator becomes owner; only owner can create channels
- Server invite system (owner creates invite code, users join by code)
- Friends system (send requests, accept/reject, friend list)
- Right sidebar showing online users in the selected server
- Direct messages (DM) allowed only for friends or shared-server members
- Leave server option from server context menu (desktop right-click, mobile long-press)
- Kick and ban system (server owner only)
- Unban members (server owner only)
- Server options panel with tabs (General/Banned) and server rename
- Voice channels (LiveKit token-based join)
- Edit and delete your own messages
- Live updates over local WebSocket events
- Web mode for browser and phone access
- PostgreSQL storage for users, servers, channels, and messages
- IPC bridge between renderer and Electron main process

## Setup

For a full public-server setup guide, see [docs/SERVER_SETUP.md](./docs/SERVER_SETUP.md).

1. Install PostgreSQL and create a database named `jellochat`.
2. Run the schema script:

   ```powershell
   psql -U postgres -d jellochat -f .\sql\schema.sql
   ```

3. Copy `.env.example` to `.env` and set DB credentials.
4. Configure LiveKit in `.env` for voice channels:

   ```env
   LIVEKIT_URL=wss://your-livekit-host
   LIVEKIT_API_KEY=your_api_key
   LIVEKIT_API_SECRET=your_api_secret
   ```
5. Install dependencies:

   ```powershell
   npm install
   ```

6. Start the app:

   ```powershell
   npm start
   ```

## Run in Browser / Phone

1. Start web server mode:

   ```powershell
   npm run web
   ```

2. Open in browser: `http://localhost:3000`
3. On phone (same Wi-Fi), open: `http://YOUR_COMPUTER_IP:3000`

You can set `WEB_PORT` in `.env` if needed.

## Voice Channels

- Owner can create both `text` and `voice` channels.
- Clicking a voice channel requests a secure token from the backend and opens LiveKit Meet.

## Schema Update

If you already created the database before this update, re-run:

```powershell
psql -U postgres -d jellochat -f .\sql\schema.sql
```

## Important note

The seed data creates one server (`Jello HQ`) and three channels. Newly registered users are auto-added to `Jello HQ`.

## License

JelloChat is licensed under the GNU Affero General Public License v3.0 or later. See [LICENSE](./LICENSE).
