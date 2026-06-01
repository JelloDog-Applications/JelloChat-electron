const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const androidPublicDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'public');

const filesToCopy = ['api.js', 'index.html', 'renderer.js', 'styles.css', 'manifest.webmanifest', 'service-worker.js'];

fs.mkdirSync(androidPublicDir, { recursive: true });

for (const file of filesToCopy) {
  const from = path.join(srcDir, file);
  const to = path.join(androidPublicDir, file);
  fs.copyFileSync(from, to);
  console.log(`Synced ${file}`);
}

const vendorSrcDir = path.join(srcDir, 'vendor');
const vendorAndroidDir = path.join(androidPublicDir, 'vendor');
if (fs.existsSync(vendorSrcDir)) {
  fs.mkdirSync(vendorAndroidDir, { recursive: true });
  for (const file of fs.readdirSync(vendorSrcDir)) {
    const from = path.join(vendorSrcDir, file);
    const to = path.join(vendorAndroidDir, file);
    if (fs.statSync(from).isFile()) {
      fs.copyFileSync(from, to);
      console.log(`Synced vendor/${file}`);
    }
  }
}
