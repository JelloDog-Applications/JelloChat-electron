#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const androidRoot = path.join(repoRoot, 'android');
const appGradlePath = path.join(androidRoot, 'app', 'build.gradle');
const stringsPath = path.join(androidRoot, 'app', 'src', 'main', 'res', 'values', 'strings.xml');
const packageJsonPath = path.join(repoRoot, 'package.json');

function parseArgs(argv) {
  const options = { variant: 'release' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--variant' && argv[i + 1]) {
      options.variant = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--variant=')) {
      options.variant = arg.split('=')[1];
    } else if (arg === '--channel' && argv[i + 1]) {
      options.channel = argv[i + 1];
      i += 1;
    } else if (arg.startsWith('--channel=')) {
      options.channel = arg.split('=')[1];
    }
  }
  return options;
}

function pickValue(envName, fallback) {
  return process.env[envName] ?? fallback;
}

function ensureFileExists(filePath, description) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${description} was not found at ${filePath}`);
  }
}

function applyAndroidMetadata(options) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const channel = options.channel || pickValue('CHANNEL_NAME', pickValue('CHANNEL', 'default'));
  const appName = pickValue('CHANNEL_APP_NAME', channel === 'ptb'
    ? 'JelloDog Chat PTB'
    : channel === 'canary'
      ? 'JelloDog Chat Canary'
      : 'JelloDog Chat');
  const appId = pickValue('CHANNEL_APP_ID', channel === 'ptb'
    ? 'com.jellodog.chat.ptb'
    : channel === 'canary'
      ? 'com.jellodog.chat.canary'
      : 'com.jellodog.chat');
  const versionOffset = Number(pickValue('VERSION_OFFSET', channel === 'ptb' ? 120000 : channel === 'canary' ? 130000 : 0));
  const runNumber = Number(pickValue('GITHUB_RUN_NUMBER', pickValue('RUN_NUMBER', 0)) || 0);
  const versionCode = versionOffset + runNumber;
  const versionName = `${packageJson.version}-${channel}.${runNumber}`;

  ensureFileExists(appGradlePath, 'Android Gradle build file');
  ensureFileExists(stringsPath, 'Android strings resource file');

  let gradle = fs.readFileSync(appGradlePath, 'utf8');
  gradle = gradle
    .replace(/applicationId "com\.jellodog\.chat"/, `applicationId "${appId}"`)
    .replace(/versionCode \d+/, `versionCode ${versionCode}`)
    .replace(/versionName "[^"]+"/, `versionName "${versionName}"`);
  fs.writeFileSync(appGradlePath, gradle);

  let strings = fs.readFileSync(stringsPath, 'utf8');
  strings = strings
    .replace(/<string name="app_name">[^<]+<\/string>/, `<string name="app_name">${appName}</string>`)
    .replace(/<string name="title_activity_main">[^<]+<\/string>/, `<string name="title_activity_main">${appName}</string>`)
    .replace(/<string name="package_name">[^<]+<\/string>/, `<string name="package_name">${appId}</string>`)
    .replace(/<string name="custom_url_scheme">[^<]+<\/string>/, `<string name="custom_url_scheme">${appId}</string>`);
  fs.writeFileSync(stringsPath, strings);
}

function runGradle(variant) {
  const task = variant === 'debug' ? 'assembleStandardDebug' : 'assembleStandardRelease';
  const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
  const result = spawnSync(gradlew, [task], {
    cwd: androidRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const variant = (options.variant || 'release').toLowerCase();
  applyAndroidMetadata(options);
  runGradle(variant);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
