'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Store } = require('../src/main/store');
const logic = require('../src/main/api');

test('default sekolah dan kop hanya melengkapi instalasi baru tanpa menimpa data lama', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rapor-school-defaults-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const store = new Store(dir);
  store.tulis('PENGATURAN', [{ kunci: 'nama_sekolah', nilai: 'Sekolah Pengguna', keterangan: '' }, { kunci: 'logo', nilai: 'data:image/png;base64,custom', keterangan: '' }]);
  logic.init(store, { desktop: true, development: true });
  const result = logic.api({ aksi: 'muat' });
  assert.equal(result.ok, true, result.error);
  assert.equal(result.data.pengaturan.nama_sekolah, 'Sekolah Pengguna');
  assert.equal(result.data.pengaturan.logo, 'data:image/png;base64,custom');
  assert.ok(result.data.pengaturan.leger_logo_kiri.startsWith('data:image/'));
  assert.equal(result.data.murid.length, 0);
  assert.equal(result.data.nilai.length, 0);
});
