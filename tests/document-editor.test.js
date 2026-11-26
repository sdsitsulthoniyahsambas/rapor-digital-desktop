const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

test('Editor Dokumen menyediakan tiga jenis template dan placeholder data', () => {
  const js = fs.readFileSync(path.join(root, 'dist/js/document-editor.js'), 'utf8');
  for (const key of ['sampul', 'sekolah', 'murid']) assert.match(js, new RegExp(key));
  for (const key of ['nama_sekolah', 'nama_murid', 'nisn', 'nis', 'kelas', 'semester', 'tahun_pelajaran']) assert.ok(js.includes(key));
  assert.match(js, /localStorage\.setItem\(DE_KEY/);
});

test('template editor dipisahkan dari data rapor dan dipakai pada fungsi cetak', () => {
  const js = fs.readFileSync(path.join(root, 'dist/js/document-editor.js'), 'utf8');
  assert.match(js, /halamanSampul=function/);
  assert.match(js, /halamanIdentitasSekolah=function/);
  assert.match(js, /halamanIdentitasMurid=function/);
  assert.match(js, /mode==='manual'/);
  assert.match(js, /deClean/);
});

test('Splash screen menampilkan identitas pengembang dan durasi transisi 5 detik', () => {
  const html = fs.readFileSync(path.join(root, 'dist/splash.html'), 'utf8');
  const main = fs.readFileSync(path.join(root, 'src/main/main.js'), 'utf8');
  assert.match(html, /Dikembangkan oleh Asyari/);
  assert.match(html, /Copyright © 2026/);
  assert.match(main, /splashSelesai = true/);
  assert.match(main, /berandaSiap = true/);
  assert.match(main, /if \(!splashSelesai \|\| !berandaSiap/);
  assert.match(main, /\}, 5000\)/);
});

test('Editor menyediakan pengaturan ukuran, posisi gambar, dan zoom 20/50/75/100 persen', () => {
  const js = fs.readFileSync(path.join(root, 'dist/js/document-editor.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
  for (const key of ['deImgWidth', 'deImgTop', 'deImgLeft', 'deImgCenter', 'deImgRight', 'deZoom']) assert.ok(js.includes(key));
  for (const zoom of ['value=\"20\"', 'value=\"50\"', 'value=\"75\"', 'value=\"100\"']) assert.ok(js.includes(zoom));
  assert.match(js, /style\.width=n\+'mm'/);
  assert.match(js, /style\.marginTop=n\+'mm'/);
  assert.match(html, /de-img-selected/);
});
