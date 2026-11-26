'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { Store } = require('../src/main/store');
const logic = require('../src/main/api');

// Hanya membuat database bersih di folder pengembangan proyek ini.
// Tidak membaca, menghapus, atau menimpa folder data aplikasi Windows.
const target = path.resolve(__dirname, '..', 'dev-data-clean');
if (fs.existsSync(target)) {
  throw new Error('Folder dev-data-clean sudah ada. Pindahkan atau hapus folder pengembangan tersebut secara manual jika ingin membuat ulang.');
}
fs.mkdirSync(target, { recursive: true });
const store = new Store(target);
logic.init(store, { desktop: true, development: true });
const result = logic.api({ aksi: 'muat' });
if (!result.ok) throw new Error(result.error || 'Gagal memuat database awal.');
const data = result.data;
const counts = {
  MURID: data.murid.length,
  TP: data.tp.length,
  LINGKUP_MATERI: data.lingkupMateri.length,
  NILAI: data.nilai.length,
  MAPEL: data.mapel.length,
  EKSKUL: data.ekskul.length
};
if (counts.MURID || counts.TP || counts.LINGKUP_MATERI || counts.NILAI) {
  throw new Error('Database awal tidak bersih: ' + JSON.stringify(counts));
}
console.log(JSON.stringify({ file: store.file, counts, bobot: { lm: data.pengaturan.bobot_lm, sas: data.pengaturan.bobot_sas } }, null, 2));
