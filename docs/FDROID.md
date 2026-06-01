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
- removes generated native plugin registration from bundled assets
- strips local development server configuration from `capacitor.config.json`

Run this command after every `npx cap sync android`.

## Distribution choices

The F-Droid flavor intentionally does not include Firebase/FCM push
notifications or the Capacitor native push plugin. The app uses the existing
browser/PWA notification path instead.

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

## GitHub releases

The `Release` GitHub Actions workflow builds the F-Droid APK when a tag matching
`v*` is pushed, or when it is run manually from the Actions tab.

```powershell
git tag v1.1.0
git push origin v1.1.0
```

By default, the workflow uploads an unsigned APK and `SHA256SUMS.txt`. That is
useful for F-Droid/source-build review. For direct APK downloads from GitHub, add
these repository secrets so the workflow can also attach a signed APK:

- `ANDROID_RELEASE_KEYSTORE_BASE64`
- `ANDROID_RELEASE_KEY_ALIAS`
- `ANDROID_RELEASE_KEYSTORE_PASSWORD`
- `ANDROID_RELEASE_KEY_PASSWORD`
