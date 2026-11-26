'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../dist/js/core.js'), 'utf8');
function appContext() {
  const context = vm.createContext({ console, setTimeout, clearTimeout, window: { addEventListener() {}, scrollTo() {} }, document: { addEventListener() {} } });
  vm.runInContext(source + `\n;globalThis.__calc = { hitung: hitung, nilaiAkhir: nilaiAkhir, deskripsi: deskripsi, setData: setData, reindex: reindex };`, context);
  return context;
}
test('perhitungan aplikasi memakai rata-rata setiap LM dan SAS, bukan TP mentah atau STS', () => {
  const c = appContext();
  c.S.d = {
    pengaturan: { bobot_lm: '60', bobot_sas: '40', kktp: '75' },
    murid: [{ id: 'S1', agama: 'Islam' }], mapel: [{ id: 'M1' }],
    tp: [
      { id: 'T1', mapel_id: 'M1', lingkup_materi: 'Bilangan' },
      { id: 'T2', mapel_id: 'M1', lingkup_materi: ' bilangan ' },
      { id: 'T3', mapel_id: 'M1', lingkup_materi: 'Pecahan' }
    ],
    lingkupMateri: [
      { id: 'L1', mapel_id: 'M1', agama: '', nama: 'Bilangan', nama_normalisasi: 'bilangan', status: 'Aktif' },
      { id: 'L2', mapel_id: 'M1', agama: '', nama: 'Pecahan', nama_normalisasi: 'pecahan', status: 'Aktif' }
    ], nilai: [{ siswa_id: 'S1', mapel_id: 'M1', nilai_tp: JSON.stringify({ T1: 10, T2: 20, T3: 30 }), nilai_lm: JSON.stringify({ L1: 90, L2: 60 }), sts: '10', sas: '90' }],
    ekskul: [], kegiatanKoko: [], nilaiKoko: [], nilaiEkskul: [], kehadiran: []
  };
  c.__calc.reindex();
  const h = c.__calc.hitung(c.S.d.murid[0], c.S.d.mapel[0]);
  // Nilai LM diinput langsung: Bilangan=90, Pecahan=60; rata-rata LM=75; NA=75*60% + 90*40%=81. Nilai TP yang berbeda tidak memengaruhi LM.
  assert.equal(h.rataLM, 75);
  assert.equal(h.na, 81);
  assert.equal(h.sts, 10);
  assert.deepEqual(JSON.parse(JSON.stringify(h.nilaiLM)), { L1: 90, L2: 60 });
  assert.equal(h.rt, 20, 'rata-rata TP tetap dihitung terpisah untuk deskripsi, bukan LM');
});
test('nilai akhir dinormalisasi saat hanya LM atau SAS terisi dan kosong bila keduanya kosong', () => {
  const c = appContext();
  assert.equal(c.__calc.nilaiAkhir(82, null, { lm: 60, sas: 40 }), 82);
  assert.equal(c.__calc.nilaiAkhir(null, 91, { lm: 60, sas: 40 }), 91);
  assert.equal(c.__calc.nilaiAkhir(null, null, { lm: 60, sas: 40 }), null);
  assert.equal(c.__calc.nilaiAkhir(82, 91, { lm: 0, sas: 100 }), 91);
});


test('rapor memprioritaskan deskripsi final yang disetujui guru dan tetap kompatibel dengan data lama', () => {
  const c = appContext();
  const murid = { id: 'S1', agama: 'Islam' };
  const mapel = { id: 'M1' };
  const final = c.__calc.deskripsi(murid, mapel, { row: { deskripsi_final: 'Deskripsi disetujui', deskripsi_manual: 'Deskripsi lama' }, skor: [] });
  assert.equal(final, 'Deskripsi disetujui');
  const legacy = c.__calc.deskripsi(murid, mapel, { row: { deskripsi_manual: 'Deskripsi versi lama' }, skor: [] });
  assert.equal(legacy, 'Deskripsi versi lama');
});
