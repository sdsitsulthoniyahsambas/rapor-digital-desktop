const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const cetak = fs.readFileSync(path.join(__dirname, '..', 'dist', 'js', 'cetak.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'dist', 'assets', 'index-CGesgjJn.css'), 'utf8');

test('sampul memakai susunan dan teks sesuai PDF acuan sekolah', () => {
  for (const text of [
    'LAPORAN',
    'HASIL CAPAIAN KOMPETENSI MURID',
    'SDS ISLAM TERPADU SULTHONIYAH',
    'NAMA MURID',
    'NISN / NIS',
    "YAYASAN RUMAH BINA DA\'I INDONESIA"
  ]) assert.ok(cetak.includes(text), `Teks sampul tidak ditemukan: ${text}`);
  assert.ok(cetak.includes('cover-logo'));
  assert.ok(css.includes('.page.identity-cover .cover-title'));
});

test('identitas siswa sampul dibaca dari record murid yang dipilih', () => {
  assert.ok(cetak.includes('m && m.nama'));
  assert.ok(cetak.includes('m && m.nisn'));
  assert.ok(cetak.includes('m && m.nis'));
  assert.ok(cetak.includes("addEventListener('change'"));
  assert.ok(cetak.includes('var muridTerpilih = muridById(this.value)'));
});

test('lembar identitas sekolah dan murid tanpa logo dengan ukuran font sedikit lebih besar', () => {
  const school = cetak.slice(cetak.indexOf('function halamanIdentitasSekolah'), cetak.indexOf('function halamanIdentitasMurid'));
  const student = cetak.slice(cetak.indexOf('function halamanIdentitasMurid'), cetak.indexOf('function kepalaRapor'));
  assert.doesNotMatch(school, /<img/);
  assert.doesNotMatch(student, /<img/);
  assert.match(cetak, /sekolah:\{font:'Arial',size:12/);
  assert.match(cetak, /identitas:\{font:'Arial',size:11/);
});
