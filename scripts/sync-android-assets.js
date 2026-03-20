const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const androidPublicDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'public');

const filesToCopy = ['api.js', 'index.html', 'renderer.js', 'styles.css'];

fs.mkdirSync(androidPublicDir, { recursive: true });

for (const file of filesToCopy) {
  const from = path.join(srcDir, file);
  const to = path.join(androidPublicDir, file);
  fs.copyFileSync(from, to);
  console.log(`Synced ${file}`);
}
