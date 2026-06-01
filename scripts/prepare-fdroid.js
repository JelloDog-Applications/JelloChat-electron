const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function replaceInFile(filePath, replacements) {
  let text = fs.readFileSync(filePath, 'utf8');
  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement);
  }
  fs.writeFileSync(filePath, text);
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

const settingsPath = path.join(rootDir, 'android', 'capacitor.settings.gradle');
replaceInFile(settingsPath, [
  [
    /\r?\ninclude ':capacitor-push-notifications'\r?\nproject\(':capacitor-push-notifications'\)\.projectDir = new File\('\.\.\/node_modules\/@capacitor\/push-notifications\/android'\)\r?\n?/g,
    '\n'
  ]
]);

const capacitorBuildPath = path.join(rootDir, 'android', 'app', 'capacitor.build.gradle');
replaceInFile(capacitorBuildPath, [
  [/\r?\n\s*implementation project\(':capacitor-push-notifications'\)\r?\n/g, '\n']
]);

console.log('Prepared Android project for F-Droid build.');
