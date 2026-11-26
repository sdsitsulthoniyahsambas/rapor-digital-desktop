'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('cadangan manual memakai nama default berdasarkan kelas, rombel, semester, dan tahun ajaran', () => {
  const main = read('src/main/main.js');
  assert.match(main, /function namaFileCadanganAktif\(\)/);
  assert.match(main, /namaFileCadangan\(pengaturan\)/);
  const helper = require('../src/main/backup-name');
  assert.equal(helper.namaFileCadangan({ kelas: '2', rombel: 'A', semester: '1', tahun_pelajaran: '2026/2027' }), 'db_2.A_Ganjil_2026-2027.json');
  assert.equal(helper.namaFileCadangan({ kelas: '5', rombel: 'B', semester: '2', tahun_pelajaran: '2026/2027' }), 'db_5.B_Genap_2026-2027.json');
  assert.match(main, /showSaveDialog\(win, \{/);
  assert.match(main, /defaultPath: path\.join\(dir, nama\)/);
  assert.match(main, /fs\.writeFileSync\(filePath, JSON\.stringify\(store\.data, null, 1\)\)/);
});

test('cadangan otomatis menimpa satu file berdasarkan kelas, rombel, semester, dan tahun ajaran', () => {
  const store = read('src/main/store.js');
  assert.match(store, /namaFileCadangan\(pengaturan\)/);
  assert.match(store, /fs\.copyFileSync\(this\.file, f\)/);
  assert.doesNotMatch(store, /rapor-' \+ tgl/);
});

test('fitur pemulihan dan cadangan otomatis internal tetap tersedia', () => {
  const main = read('src/main/main.js');
  const store = read('src/main/store.js');
  const views = read('dist/js/views.js');
  assert.match(main, /ipcMain\.handle\('pulihkan'/);
  assert.match(main, /cadangan-pulihkan-otomatis/);
  assert.match(store, /cadanganHarian\(\)/);
  assert.match(views, /Cadangan otomatis internal/);
});

test('integrasi Google Drive telah dihapus dari kode dan tampilan', () => {
  const main = read('src/main/main.js');
  const preload = read('src/main/preload.js');
  const views = read('dist/js/views.js');
  assert.doesNotMatch(main + preload + views, /google.?drive|drive-aktifkan|driveBackup/i);
  assert.doesNotMatch(views, /Aktifkan cadangan online|Google Drive Sekolah/);
});
