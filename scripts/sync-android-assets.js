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
  copyDirectory(vendorSrcDir, vendorAndroidDir, 'vendor');
}

function copyDirectory(fromDir, toDir, label) {
  fs.mkdirSync(toDir, { recursive: true });
  for (const entry of fs.readdirSync(fromDir)) {
    const from = path.join(fromDir, entry);
    const to = path.join(toDir, entry);
    const nextLabel = `${label}/${entry}`;
    if (fs.statSync(from).isDirectory()) {
      copyDirectory(from, to, nextLabel);
    } else {
      fs.copyFileSync(from, to);
      console.log(`Synced ${nextLabel}`);
    }
  }
}
