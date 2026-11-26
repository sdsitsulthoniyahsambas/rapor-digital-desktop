'use strict';
const fs = require('node:fs');
const path = require('node:path');
const pkg = require('../package.json');
const root = path.resolve(__dirname, '..');
const required = [
  pkg.main,
  'src/main/preload.js',
  'src/main/store.js',
  'src/main/api.js',
  'src/main/gemini.js',
  'dist/index.html',
  'build/icon.ico',
  'electron-builder.yml'
];
let failed = false;
console.log('RAPOR DIGITAL — pemeriksaan sebelum build');
console.log(`Node.js: ${process.version}`);
console.log(`Electron target: ${pkg.devDependencies && pkg.devDependencies.electron || '(belum ditetapkan)'}`);
console.log(`Versi aplikasi: ${pkg.version}`);
for (const rel of required) {
  const ok = fs.existsSync(path.join(root, rel));
  console.log(`${ok ? 'OK  ' : 'MISS'} ${rel}`);
  if (!ok) failed = true;
}
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 20 || (major === 20 && minor < 19)) {
  console.error('Node.js minimal 20.19 diperlukan.');
  failed = true;
}
if (!pkg.devDependencies || pkg.devDependencies.electron !== '44.6.0') {
  console.error('Versi Electron harus dipatok ke 44.6.0 sesuai executable aplikasi asli.');
  failed = true;
}
if (!pkg.scripts || !pkg.scripts['dist:win']) {
  console.error('Skrip dist:win belum tersedia.');
  failed = true;
}
if (failed) process.exitCode = 1;
else console.log('Preflight struktur dan metadata berhasil. Ini belum menjalankan build Windows.');
