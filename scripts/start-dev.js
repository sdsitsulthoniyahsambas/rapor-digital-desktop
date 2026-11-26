'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'dev-data-clean');
const userDataDir = path.join(dataDir, 'electron-user-data');
if (!fs.existsSync(path.join(dataDir, 'rapor.json'))) {
  console.error('Database pengembangan bersih belum tersedia. Jalankan npm run prepare:clean-dev-data.');
  process.exit(1);
}
fs.mkdirSync(userDataDir, { recursive: true });
let electron;
try { electron = require('electron'); }
catch (e) {
  console.error('Electron belum terpasang. Jalankan npm install terlebih dahulu.');
  process.exit(1);
}
if (!electron || typeof electron !== 'string') {
  console.error('Binary Electron tidak ditemukan. Periksa instalasi dependensi Electron.');
  process.exit(1);
}
const child = spawn(electron, ['.'], {
  cwd: root,
  stdio: 'inherit',
  env: {
    ...process.env,
    RAPOR_DATA_DIR: dataDir,
    RAPOR_USER_DATA_DIR: userDataDir,
    ELECTRON_DISABLE_SECURITY_WARNINGS: 'true'
  }
});
child.on('error', (e) => { console.error('Gagal menjalankan Electron:', e.message); process.exitCode = 1; });
child.on('exit', (code, signal) => { process.exitCode = signal ? 1 : (code ?? 0); });
