const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const cetak = fs.readFileSync(path.join(__dirname, '../dist/js/cetak.js'), 'utf8');
const core = fs.readFileSync(path.join(__dirname, '../dist/js/core.js'), 'utf8');
const html = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');

test('tiga bagian identitas memiliki pengaturan tampilan terpisah dan tersimpan lokal', () => {
  for (const key of ['sampul', 'sekolah', 'identitas']) {
    assert.ok(cetak.includes(key + ':{font:'));
    assert.ok(cetak.includes('data-ident-font="${k}"'));
  }
  assert.ok(cetak.includes("raporDigital.identitasCetak.v1"));
  assert.ok(cetak.includes('localStorage.setItem(KUNCI_IDENTITAS_CETAK'));
});

test('tanggal lembar identitas murid memiliki penyimpanan terpisah dari tanggal rapor', () => {
  assert.ok(cetak.includes('id="tanggalIdentitas"'));
  assert.ok(cetak.includes('tanggalIdentitasMurid()'));
  assert.ok(cetak.includes('cfg.tanggal=x.value'));
  assert.ok(cetak.includes('tempatTanggal()'));
});

test('pilihan cetak memisahkan kelompok identitas dan hasil belajar', () => {
  assert.ok(cetak.includes('IDENTITAS RAPOR'));
  assert.ok(cetak.includes('HASIL BELAJAR'));
  for (const key of ['sampul', 'sekolah', 'identitas', 'rapor', 'grafik']) {
    assert.ok(cetak.includes('data-bag="${x[0]}"'));
  }
});

test('sidebar dapat diperkecil, diperluas, dan preferensinya disimpan', () => {
  assert.ok(html.includes('id="sidebarCollapse"'));
  assert.ok(core.includes('raporDigital.sidebarRingkas'));
  assert.ok(core.includes('function toggleSidebarRingkas'));
  assert.ok(core.includes('sidebar-collapsed'));
});

test('pengaturan dan pratinjau cetak rapor memiliki panel scroll terpisah', () => {
  assert.ok(cetak.includes('id="cetakSettingsPane"'));
  assert.ok(cetak.includes('id="cetakPreviewPane"'));
  const styles = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
  assert.ok(styles.includes('id="cetak-independent-scroll"'));
  assert.ok(styles.includes('#cetakSettingsPane'));
  assert.ok(styles.includes('#cetakPreviewPane .preview-sheet'));
  assert.ok(styles.includes('overscroll-behavior: contain'));
});
