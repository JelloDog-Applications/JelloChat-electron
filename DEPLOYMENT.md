# Deploying JelloChat with systemd

This setup replaces running the web server in `screen`. The service runs `npm run web`, which starts `node server.js`.

## 1. Put the repo on the server

Your current server directory is:

```bash
cd /home/ubuntu/JelloChat-electron
npm ci --omit=dev
cp .env.example .env
```

Edit `/home/ubuntu/JelloChat-electron/.env` with the real database, mail, LiveKit, and `WEB_PORT` settings.

## 2. Install the systemd service

Copy `deploy/jellochat.service.example` to the systemd directory:

```bash
sudo cp /home/ubuntu/JelloChat-electron/deploy/jellochat.service.example /etc/systemd/system/jellochat.service
```

Then start it:

```bash
sudo systemctl daemon-reload
sudo systemctl enable jellochat
sudo systemctl start jellochat
sudo systemctl status jellochat
```

Logs:

```bash
journalctl -u jellochat -f
```

## 3. Allow deploy restarts from GitHub Actions

The GitHub Actions SSH session runs as `ubuntu`, so `ubuntu` needs permission to restart this one service without an interactive password:

```bash
sudo visudo
```

Add this line:

```text
ubuntu ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart jellochat, /usr/bin/systemctl --no-pager --full status jellochat
```

If your server's `systemctl` path is different, check it with:

```bash
command -v systemctl
```

Then use that path in both `.github/workflows/deploy.yml` and the sudoers line.

## 4. Add GitHub Secrets

In GitHub, open the repo settings and add these Actions secrets:

- `DEPLOY_HOST`: server IP or hostname
- `DEPLOY_SSH_KEY`: private key that can SSH into the server
- `DEPLOY_PORT`: SSH port, usually `22`

The workflow is already configured to SSH as `ubuntu`, deploy from `/home/ubuntu/JelloChat-electron`, and restart `jellochat`.
