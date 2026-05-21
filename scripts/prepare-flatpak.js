const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const sourceDir = path.join(distDir, 'flatpak-source');
const linuxUnpackedDir = path.join(distDir, 'linux-unpacked');
const flatpakDir = path.join(root, 'flatpak');

function copyRecursive(source, target) {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
    return;
  }
  fs.copyFileSync(source, target);
}

function removeIfExists(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true });
  }
}

if (!fs.existsSync(linuxUnpackedDir)) {
  console.error('Missing dist/linux-unpacked. Run npm run build:linux:dir first.');
  process.exit(1);
}

removeIfExists(sourceDir);
fs.mkdirSync(sourceDir, { recursive: true });
fs.mkdirSync(path.join(sourceDir, 'app'), { recursive: true });
fs.mkdirSync(path.join(sourceDir, 'metadata'), { recursive: true });
fs.mkdirSync(path.join(sourceDir, 'icons', 'hicolor', '256x256', 'apps'), { recursive: true });
fs.mkdirSync(path.join(sourceDir, 'icons', 'hicolor', '1024x1024', 'apps'), { recursive: true });

copyRecursive(linuxUnpackedDir, path.join(sourceDir, 'app', 'jellochat'));
fs.copyFileSync(path.join(flatpakDir, 'com.jellochat.app.desktop'), path.join(sourceDir, 'metadata', 'com.jellochat.app.desktop'));
fs.copyFileSync(path.join(flatpakDir, 'com.jellochat.app.metainfo.xml'), path.join(sourceDir, 'metadata', 'com.jellochat.app.metainfo.xml'));
fs.copyFileSync(path.join(flatpakDir, 'jellochat-flatpak'), path.join(sourceDir, 'metadata', 'jellochat-flatpak'));
fs.copyFileSync(path.join(root, 'assets', 'app-icon-256.png'), path.join(sourceDir, 'icons', 'hicolor', '256x256', 'apps', 'com.jellochat.app.png'));
fs.copyFileSync(path.join(root, 'assets', 'app-icon-1024.png'), path.join(sourceDir, 'icons', 'hicolor', '1024x1024', 'apps', 'com.jellochat.app.png'));

console.log(`Prepared ${path.relative(root, sourceDir)} for Flatpak packaging.`);
