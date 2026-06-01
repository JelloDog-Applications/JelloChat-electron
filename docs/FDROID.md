# F-Droid Build Notes

JelloChat's F-Droid build uses the checked-in Android project and bundled web
assets. It does not depend on Google Play Services, Firebase, or remote CDN
JavaScript at runtime.

## Build

From the repository root:

```powershell
npm ci
npm run prepare:fdroid
cd android
.\gradlew.bat assembleFdroidRelease
```

The APK is produced under:

```text
android/app/build/outputs/apk/fdroid/release/
```

## What the F-Droid preparation step does

`npm run prepare:fdroid`:

- copies local web vendor files into `src/vendor`
- syncs web assets into the Android project
- removes Capacitor's native push notification plugin from the Android build
- removes Capacitor's native push plugin registration from bundled assets
- strips local development server configuration from `capacitor.config.json`

Run this command after every `npx cap sync android`.

## Distribution choices

The F-Droid flavor intentionally does not include Firebase/FCM push
notifications. The app falls back to the existing browser/PWA notification path
when native push is unavailable.

The Android client defaults to `https://chat.jellodog.com`, but users can change
the server from the login screen with **Server URL**. This keeps the client usable
with self-hosted JelloChat servers.

## Before submitting to F-Droid

- Add a real project license file, such as `AGPL-3.0-or-later`, `GPL-3.0-or-later`,
  or `Apache-2.0`.
- Tag releases in Git, and make sure `versionCode` and `versionName` in
  `android/app/build.gradle` match the release.
- Keep generated Android source committed so F-Droid can build the app from
  source.
- Do not commit `google-services.json` or proprietary SDK binaries.
