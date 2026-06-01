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
  }
];

fs.mkdirSync(vendorDir, { recursive: true });

for (const file of vendorFiles) {
  if (!fs.existsSync(file.from)) {
    throw new Error(`Missing vendor source: ${file.from}`);
  }
  fs.copyFileSync(file.from, file.to);
  console.log(`Synced ${path.relative(rootDir, file.to)}`);
}
