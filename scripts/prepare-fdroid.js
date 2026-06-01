const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

const capacitorConfigPath = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'capacitor.config.json');
writeJson(capacitorConfigPath, {
  appId: 'com.jellochat.app',
  appName: 'JelloChat',
  webDir: 'src',
  bundledWebRuntime: false
});

const pluginsPath = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'capacitor.plugins.json');
writeJson(pluginsPath, []);

console.log('Prepared Android project for F-Droid build.');
