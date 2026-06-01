const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const vendorDir = path.join(rootDir, 'src', 'vendor');

const vendorFiles = [
  {
    from: path.join(rootDir, 'node_modules', 'livekit-client', 'dist', 'livekit-client.umd.js'),
    to: path.join(vendorDir, 'livekit-client.umd.min.js')
  },
  {
    from: path.join(rootDir, 'node_modules', 'marked', 'marked.min.js'),
    to: path.join(vendorDir, 'marked.min.js')
  },
  {
    from: path.join(rootDir, 'node_modules', '@fortawesome', 'fontawesome-free', 'css', 'all.min.css'),
    to: path.join(vendorDir, 'fontawesome', 'css', 'all.min.css')
  }
];

fs.mkdirSync(vendorDir, { recursive: true });

for (const file of vendorFiles) {
  if (!fs.existsSync(file.from)) {
    throw new Error(`Missing vendor source: ${file.from}`);
  }
  fs.mkdirSync(path.dirname(file.to), { recursive: true });
  fs.copyFileSync(file.from, file.to);
  console.log(`Synced ${path.relative(rootDir, file.to)}`);
}

const fontawesomeWebfontsSrc = path.join(rootDir, 'node_modules', '@fortawesome', 'fontawesome-free', 'webfonts');
const fontawesomeWebfontsDest = path.join(vendorDir, 'fontawesome', 'webfonts');
fs.mkdirSync(fontawesomeWebfontsDest, { recursive: true });
for (const file of fs.readdirSync(fontawesomeWebfontsSrc)) {
  const from = path.join(fontawesomeWebfontsSrc, file);
  const to = path.join(fontawesomeWebfontsDest, file);
  if (fs.statSync(from).isFile()) {
    fs.copyFileSync(from, to);
    console.log(`Synced ${path.relative(rootDir, to)}`);
  }
}
