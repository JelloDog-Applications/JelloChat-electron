# JelloDog Chat Flatpak

These files package the Electron Linux build as a Flatpak for Steam Deck and Linux desktops.

## Requirements

Run these commands on Linux, not Windows PowerShell:

```bash
sudo flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
sudo flatpak install flathub org.freedesktop.Platform//24.08 org.freedesktop.Sdk//24.08
sudo apt install flatpak-builder
```

On SteamOS/Arch, install `flatpak-builder` with your preferred package manager.

## Build

```bash
npm install
npm run build:flatpak
```

The command does three things:

1. Builds the Electron Linux unpacked app into `dist/linux-unpacked`.
2. Copies the Linux app, desktop file, metadata, and icons into `dist/flatpak-source`.
3. Builds and installs the Flatpak locally for the current user.

## Run

```bash
flatpak run com.jellodog.chat
```

## Export a bundle

```bash
flatpak-builder --repo=dist/flatpak-repo --force-clean dist/flatpak-build flatpak/com.jellodog.chat.yml
flatpak build-bundle dist/flatpak-repo dist/JelloDogChat.flatpak com.jellodog.chat
```

## Notes

- The Flatpak allows network, notifications, audio, X11/Wayland, GPU acceleration, and Downloads access.
- If screen sharing needs more portals later, add the required permission to `finish-args`.
