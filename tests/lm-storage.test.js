'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Store } = require('../src/main/store');
const logic = require('../src/main/api');

test('sinkronisasi LM menyimpan identitas stabil dan mengarsipkan nama yang berubah', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rapor-lm-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const store = new Store(dir);
  logic.init(store, {});
  let result = logic.api({ aksi: 'simpanTP', data: { mapel_id: 'MP1', agama: '', list: [
    { kode: 'TP 1', lingkup_materi: ' Bilangan   Cacah ', tujuan: 'Tujuan A' },
    { kode: 'TP 2', lingkup_materi: 'BILANGAN CACAH', tujuan: 'Tujuan B' },
    { kode: 'TP 3', lingkup_materi: '', tujuan: 'Tujuan C' }
  ] } });
  assert.equal(result.ok, true, result.error);
  let groups = store.baca('LINGKUP_MATERI');
  assert.equal(groups.length, 1);
  assert.equal(groups[0].nama_normalisasi, 'bilangan cacah');
  const oldId = groups[0].id;

  result = logic.api({ aksi: 'simpanTP', data: { mapel_id: 'MP1', agama: '', list: [
    { kode: 'TP 1', lingkup_materi: 'Bilangan dan Operasi Hitung', tujuan: 'Tujuan A' }
  ] } });
  assert.equal(result.ok, true, result.error);
  groups = store.baca('LINGKUP_MATERI');
  assert.equal(groups.length, 2);
  assert.equal(groups.find(x => x.id === oldId).status, 'Arsip');
  assert.equal(groups.filter(x => x.status === 'Aktif').length, 1);
});

test('tabel nilai menerima nilai LM dan tiga versi deskripsi tanpa menghapus data lama', (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rapor-nilai-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const store = new Store(dir);
  logic.init(store, {});
  store.tulis('NILAI', [{ siswa_id: 'S1', mapel_id: 'MP1', nilai_tp: '{"TP1":80}', sas: '90', deskripsi_manual: 'Deskripsi lama' }]);
  const result = logic.api({ aksi: 'simpanNilai', data: { mapel_id: 'MP1', rows: [{
    siswa_id: 'S1', nilai_tp: { TP1: 80 }, nilai_lm: { LM1: 85 }, sas: 90,
    deskripsi_manual: 'Deskripsi lama', deskripsi_tp: 'Asli TP', deskripsi_ai: 'Saran AI', deskripsi_final: 'Disetujui guru'
  }] } });
  assert.equal(result.ok, true, result.error);
  const row = store.baca('NILAI')[0];
  assert.deepEqual(JSON.parse(row.nilai_lm), { LM1: 85 });
  assert.equal(row.deskripsi_manual, 'Deskripsi lama');
  assert.equal(row.deskripsi_tp, 'Asli TP');
  assert.equal(row.deskripsi_ai, 'Saran AI');
  assert.equal(row.deskripsi_final, 'Disetujui guru');
});
